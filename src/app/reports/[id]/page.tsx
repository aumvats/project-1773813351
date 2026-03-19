"use client";

import { useEffect, useState, use } from "react";
import { Header } from "@/components/features/Header";
import { ScreeningReport } from "@/components/features/ScreeningReport";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/components/features/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { fetchCountries } from "@/lib/api/countries";
import type { Screening, Country } from "@/types/screening";

export default function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();
  const [screening, setScreening] = useState<Screening | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countries, setCountries] = useState<Map<string, Country>>(new Map());

  useEffect(() => {
    fetchCountries().then(setCountries);
  }, []);

  useEffect(() => {
    async function load() {
      if (!user) {
        setLoading(false);
        setError("Please sign in to view reports.");
        return;
      }
      try {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from("allclear_screenings")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (fetchError || !data) throw new Error("Report not found");
        setScreening(data as unknown as Screening);
      } catch {
        setError("Report not found or you don\u2019t have access.");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) load();
  }, [id, user, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="print:hidden">
          <Header />
        </div>
        <main className="mx-auto max-w-3xl px-4 py-8">
          <Skeleton variant="card" count={2} />
        </main>
      </div>
    );
  }

  if (error || !screening) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="text-text-secondary">{error || "Report not found."}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="print:hidden">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-4 flex justify-end">
          <Button size="sm" onClick={() => window.print()}>
            Print / Save as PDF
          </Button>
        </div>
      </div>

      <ScreeningReport
        screening={screening}
        userEmail={user?.email ?? undefined}
        countries={countries}
      />
    </div>
  );
}
