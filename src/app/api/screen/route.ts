import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { searchEntities } from "@/lib/api/opensanctions";
import { TTLCache } from "@/lib/utils/cache";
import type { OpenSanctionsResponse } from "@/types/opensanctions";

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const screeningCache = new TTLCache<OpenSanctionsResponse>();

function normalizeQuery(q: string): string {
  return q.toLowerCase().trim().replace(/\s+/g, " ");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawQuery = body.query;

    if (!rawQuery || typeof rawQuery !== "string" || rawQuery.trim().length === 0) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const query = rawQuery.trim();
    const cacheKey = normalizeQuery(query);

    // Check auth (optional — anon users can screen too)
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key",
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Cookie setting may fail in read-only contexts (e.g. after headers are sent)
            }
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Rate limit check for authenticated users
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        const resetAt = new Date(profile.screenings_reset_at);
        const now = new Date();
        const isNewDay =
          now.toDateString() !== resetAt.toDateString();

        let screeningsToday = profile.screenings_today;
        if (isNewDay) {
          screeningsToday = 0;
          await supabase
            .from("profiles")
            .update({
              screenings_today: 0,
              screenings_reset_at: now.toISOString(),
            })
            .eq("id", user.id);
        }

        const limit = profile.subscription_tier === "pro" ? 50 : 5;
        if (screeningsToday >= limit) {
          return NextResponse.json(
            {
              error: "rate_limit",
              message: `You've reached your daily limit of ${limit} screenings.`,
            },
            { status: 429 }
          );
        }
      }
    }

    // Check cache
    const cached = screeningCache.get(cacheKey);
    if (cached) {
      // Increment counter for auth users even on cache hit
      if (user) {
        const { data: p } = await supabase
          .from("profiles")
          .select("screenings_today")
          .eq("id", user.id)
          .single();
        await supabase
          .from("profiles")
          .update({ screenings_today: (p?.screenings_today ?? 0) + 1 })
          .eq("id", user.id);
      }
      return NextResponse.json({
        results: cached.results,
        total: cached.total.value,
        datasets: cached.datasets,
        cached: true,
        cachedAt: new Date().toISOString(),
      });
    }

    // Fetch from OpenSanctions
    let data: OpenSanctionsResponse;
    try {
      data = await searchEntities(query);
    } catch {
      return NextResponse.json(
        {
          error: "service_unavailable",
          message:
            "Screening service temporarily unavailable. Please retry in a few minutes.",
          cached: null,
        },
        { status: 503 }
      );
    }

    // Store in cache
    screeningCache.set(cacheKey, data, CACHE_TTL);

    // Increment screening counter for auth users
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("screenings_today")
        .eq("id", user.id)
        .single();

      await supabase
        .from("profiles")
        .update({
          screenings_today: (profile?.screenings_today ?? 0) + 1,
        })
        .eq("id", user.id);
    }

    return NextResponse.json({
      results: data.results,
      total: data.total.value,
      datasets: data.datasets,
      cached: false,
      cachedAt: null,
    });
  } catch {
    return NextResponse.json(
      {
        error: "internal_error",
        message: "An unexpected error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}
