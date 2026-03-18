import { NextResponse } from "next/server";
import { validateVat } from "@/lib/api/vatcomply";
import { TTLCache } from "@/lib/utils/cache";
import type { VATResult } from "@/types/screening";

const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
const vatCache = new TTLCache<VATResult>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const number = searchParams.get("number");

  if (!number) {
    return NextResponse.json(
      { error: "VAT number is required" },
      { status: 400 }
    );
  }

  const cacheKey = number.replace(/\s/g, "").toUpperCase();

  // Check cache
  const cached = vatCache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const result = await validateVat(number);
    vatCache.set(cacheKey, result, CACHE_TTL);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        error: "vat_unavailable",
        message: "VAT validation is currently unavailable. Please try again later.",
      },
      { status: 503 }
    );
  }
}
