"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/features/Header";
import { ResultCard } from "@/components/features/ResultCard";
import { ResultDetail } from "@/components/features/ResultDetail";
import { VATVerifier } from "@/components/features/VATVerifier";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/components/features/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { fetchCountries } from "@/lib/api/countries";
import { generateScreeningPDF } from "@/lib/utils/pdf";
import type { Screening, Country } from "@/types/screening";
import type { OpenSanctionsEntity } from "@/types/opensanctions";

export default function ScreeningDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [screening, setScreening] = useState<Screening | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countries, setCountries] = useState<Map<string, Country>>(new Map());
  const [selectedResult, setSelectedResult] = useState<OpenSanctionsEntity | null>(null);
  const [rescreening, setRescreening] = useState(false);

  useEffect(() => {
    fetchCountries().then(setCountries);
  }, []);

  useEffect(() => {
    async function load() {
      if (!user) {
        setLoading(false);
        setError("Please sign in to view screening details.");
        return;
      }
      try {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from("screenings")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (fetchError || !data) throw new Error("Screening not found");
        setScreening(data as unknown as Screening);
      } catch {
        setError("Screening not found or you don\u2019t have access.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, user]);

  async function handleRescreen() {
    if (!screening || !user) return;
    setRescreening(true);
    try {
      const res = await fetch("/api/screen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: screening.query }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Re-screening failed");
      }

      const newStatus = data.results.length === 0 ? "clear" : "flagged";

      // Save new screening
      const supabase = createClient();
      const { data: newScreening, error: insertError } = await supabase
        .from("screenings")
        .insert({
          user_id: user.id,
          query: screening.query,
          result_snapshot: {
            results: data.results,
            total: data.total,
            datasets: data.datasets,
            cached: data.cached,
            cachedAt: data.cachedAt,
          },
          status: newStatus,
          datasets_checked: (data.datasets || []).map((d: { name: string }) => d.name),
          match_count: data.results.length,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (newStatus !== screening.status) {
        toast("warning", `Status changed: ${screening.status} \u2192 ${newStatus}. Review the new results.`);
      } else {
        toast("success", `Still ${newStatus} as of today.`);
      }

      router.push(`/screen/${newScreening.id}`);
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Re-screening failed. Please try again.");
    } finally {
      setRescreening(false);
    }
  }

  async function handleDownloadPDF() {
    if (!screening) return;
    const doc = await generateScreeningPDF(screening, user?.email ?? undefined);
    doc.save(`screening-${screening.id}.pdf`);
    toast("success", "Report downloaded.");
  }

  const euCountryCode =
    screening?.result_snapshot.results
      ?.flatMap((r) => r.properties.country || [])
      .find((c) => countries.get(c.toUpperCase())?.region === "Europe")
      ?.toUpperCase() ?? "";
  const hasEUCountry = euCountryCode !== "";

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
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
        <main className="mx-auto max-w-3xl px-4 py-8 text-center">
          <p className="text-text-secondary">{error || "Screening not found."}</p>
          <Button variant="secondary" className="mt-4" onClick={() => router.push("/history")}>
            Back to history
          </Button>
        </main>
      </div>
    );
  }

  const results = screening.result_snapshot.results || [];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Header section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-primary">
              {screening.query}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={screening.status === "clear" ? "clear" : "flagged"}>
                {screening.status === "clear" ? "All Clear" : `${screening.match_count} Match${screening.match_count !== 1 ? "es" : ""}`}
              </Badge>
              <span className="text-xs text-text-secondary">
                {new Date(screening.created_at).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" loading={rescreening} onClick={handleRescreen}>
              Re-screen
            </Button>
            <Button variant="secondary" size="sm" onClick={handleDownloadPDF}>
              Download PDF
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/reports/${screening.id}`)}
            >
              View Report
            </Button>
          </div>
        </div>

        {/* Results */}
        {results.length === 0 ? (
          <div className="rounded-lg border border-success/30 bg-success/5 p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <p className="mt-3 font-heading font-semibold text-text-primary">No matches found</p>
            <p className="mt-1 text-sm text-text-secondary">
              Checked against {screening.datasets_checked.length} datasets.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result) => (
              <ResultCard
                key={result.id}
                result={result}
                countries={countries}
                onClick={() => setSelectedResult(result)}
              />
            ))}
          </div>
        )}

        {/* VAT Verifier for EU results */}
        {hasEUCountry && (
          <div className="mt-6">
            <VATVerifier countryCode={euCountryCode} />
          </div>
        )}

        {/* Datasets checked */}
        {screening.result_snapshot.datasets && screening.result_snapshot.datasets.length > 0 && (
          <div className="mt-8 border-t border-border-col pt-4">
            <details>
              <summary className="cursor-pointer text-xs font-semibold uppercase text-text-secondary hover:text-text-primary transition-colors duration-fast">
                Datasets checked ({screening.result_snapshot.datasets.length})
              </summary>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                {screening.result_snapshot.datasets.map((ds) => (
                  <span key={ds.name} className="text-xs text-text-secondary">
                    {ds.title || ds.name}
                  </span>
                ))}
              </div>
            </details>
          </div>
        )}
      </main>

      {/* Detail panel */}
      {selectedResult && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/20 animate-in fade-in duration-fast"
            onClick={() => setSelectedResult(null)}
          />
          <ResultDetail
            result={selectedResult}
            countries={countries}
            onClose={() => setSelectedResult(null)}
          />
        </>
      )}
    </div>
  );
}
