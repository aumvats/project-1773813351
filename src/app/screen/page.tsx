"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/features/Header";
import { SearchBar } from "@/components/features/SearchBar";
import { ResultsList } from "@/components/features/ResultsList";
import { SignupModal } from "@/components/features/SignupModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/features/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { getAnonCount, incrementAnonCount } from "@/lib/utils/anon-limit";
import { fetchCountries } from "@/lib/api/countries";
import { createClient } from "@/lib/supabase/client";
import type { OpenSanctionsEntity, OpenSanctionsDataset } from "@/types/opensanctions";
import type { Country, ScreeningResultSnapshot } from "@/types/screening";

function ScreenPageContent() {
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const qParam = searchParams.get("q");
  const autoSearchedRef = useRef(false);
  const [results, setResults] = useState<OpenSanctionsEntity[] | null>(null);
  const [datasets, setDatasets] = useState<OpenSanctionsDataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [countries, setCountries] = useState<Map<string, Country>>(new Map());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCountries().then(setCountries);
  }, []);

  useEffect(() => {
    if (!autoSearchedRef.current && !authLoading && qParam) {
      autoSearchedRef.current = true;
      handleSearch(qParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  async function handleSearch(q: string) {
    if (!user) {
      const count = getAnonCount();
      if (count >= 3) {
        setShowSignup(true);
        return;
      }
    }

    const prevResults = results;
    const prevDatasets = datasets;
    setQuery(q);
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch("/api/screen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "rate_limit") {
          setResults(prevResults);
          setDatasets(prevDatasets);
          toast("warning", data.message);
          return;
        }
        throw new Error(data.message || "Screening failed");
      }

      setResults(data.results);
      setDatasets(data.datasets || []);

      if (!user) {
        incrementAnonCount();
        const remaining = 3 - getAnonCount();
        if (remaining > 0) {
          toast("info", `${remaining} free screening${remaining !== 1 ? "s" : ""} remaining.`);
        } else {
          setShowSignup(true);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Screening service temporarily unavailable. Please retry in a few minutes."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!user || !results) return;
    setSaving(true);

    try {
      const supabase = createClient();
      const snapshot: ScreeningResultSnapshot = {
        results,
        total: results.length,
        datasets,
        cached: false,
        cachedAt: null,
      };

      const status = results.length === 0 ? "clear" : "flagged";

      const { error: insertError } = await supabase.from("allclear_screenings").insert({
        user_id: user.id,
        query,
        result_snapshot: snapshot,
        status,
        datasets_checked: datasets.map((d) => d.name),
        match_count: results.length,
      });

      if (insertError) throw insertError;
      toast("success", "Screening saved to your history.");
    } catch {
      toast("error", "Failed to save screening. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const dailyLimit = profile?.subscription_tier === "pro" ? 50 : 5;
  const screeningsToday = profile?.screenings_today ?? 0;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-2xl font-bold text-text-primary">
            Screen a name
          </h1>
          {user && profile && (
            <Badge variant="neutral">
              {screeningsToday}/{dailyLimit} today
            </Badge>
          )}
        </div>

        <SearchBar onSearch={handleSearch} loading={loading} defaultValue={qParam ?? undefined} />

        <ResultsList
          results={results}
          datasets={datasets}
          loading={loading}
          error={error}
          query={query}
          countries={countries}
          onRetry={() => handleSearch(query)}
        />

        {/* Save button for authenticated users with results */}
        {user && results !== null && !loading && !error && (
          <div className="mt-4 flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              loading={saving}
              onClick={handleSave}
            >
              Save screening
            </Button>
          </div>
        )}
      </main>

      <SignupModal open={showSignup} onClose={() => setShowSignup(false)} />
    </div>
  );
}

export default function ScreenPage() {
  return (
    <Suspense fallback={null}>
      <ScreenPageContent />
    </Suspense>
  );
}
