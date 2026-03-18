"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/features/Header";
import { SearchBar } from "@/components/features/SearchBar";
import { ResultsList } from "@/components/features/ResultsList";
import { PricingCards } from "@/components/features/PricingCards";
import { SignupModal } from "@/components/features/SignupModal";
import { useAuth } from "@/components/features/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { getAnonCount, incrementAnonCount } from "@/lib/utils/anon-limit";
import { fetchCountries } from "@/lib/api/countries";
import type { OpenSanctionsEntity, OpenSanctionsDataset } from "@/types/opensanctions";
import type { Country } from "@/types/screening";

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [results, setResults] = useState<OpenSanctionsEntity[] | null>(null);
  const [datasets, setDatasets] = useState<OpenSanctionsDataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [countries, setCountries] = useState<Map<string, Country>>(new Map());

  useEffect(() => {
    fetchCountries().then(setCountries);
  }, []);

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
          toast("info", `${remaining} free screening${remaining !== 1 ? "s" : ""} remaining. Sign up for more.`);
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

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
      {/* Hero */}
      <section className="border-b border-border-col bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:py-24">
          <h1 className="font-heading text-[2rem] font-bold leading-tight text-text-primary sm:text-[2.5rem] animate-fade-in-up stagger-1">
            Screen names against 40+ global sanctions lists
          </h1>
          <p className="mt-4 text-base text-text-secondary max-w-xl mx-auto animate-fade-in-up stagger-2">
            Instant due diligence screening for small businesses. Know who you&apos;re doing business with.
          </p>

          <div className="mt-10 animate-fade-in-up stagger-3">
            <SearchBar
              onSearch={handleSearch}
              loading={loading}
              placeholder="e.g., Viktor Bout"
            />
          </div>

          {/* Results inline */}
          <div className="text-left">
            <ResultsList
              results={results}
              datasets={datasets}
              loading={loading}
              error={error}
              query={query}
              countries={countries}
              onRetry={() => handleSearch(query)}
            />
          </div>

          {!results && !loading && !error && (
            <p className="mt-4 text-xs text-text-secondary animate-fade-in-up stagger-4">
              First 3 screenings free — no account required
            </p>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-border-col">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <h2 className="text-center font-heading text-2xl font-semibold text-text-primary">
            How it works
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
            {[
              {
                step: "1",
                title: "Enter a name",
                desc: "Type a person or company name into the search bar.",
              },
              {
                step: "2",
                title: "Instant screening",
                desc: "We check against OFAC, EU, UN, and 40+ other sanctions databases in under 2 seconds.",
              },
              {
                step: "3",
                title: "Get your result",
                desc: "See match details, download a timestamped PDF report for your compliance files.",
              },
            ].map((item, i) => (
              <div key={item.step} className={`text-center animate-fade-in-up stagger-${i + 1}`}>
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white font-heading font-bold text-sm">
                  {item.step}
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-text-primary">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="border-b border-border-col bg-surface">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="flex flex-wrap items-center justify-center gap-8 text-center text-sm text-text-secondary">
            <div>
              <p className="font-heading text-2xl font-bold text-text-primary">40+</p>
              <p>Sanctions datasets</p>
            </div>
            <div className="h-8 w-px bg-border-col" />
            <div>
              <p className="font-heading text-2xl font-bold text-text-primary">&lt;2s</p>
              <p>Screening time</p>
            </div>
            <div className="h-8 w-px bg-border-col" />
            <div>
              <p className="font-heading text-2xl font-bold text-text-primary">OFAC</p>
              <p>EU, UN, UK + more</p>
            </div>
            <div className="h-8 w-px bg-border-col" />
            <div>
              <p className="font-heading text-2xl font-bold text-text-primary">$19</p>
              <p>/mo for Pro</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <h2 className="text-center font-heading text-2xl font-semibold text-text-primary">
            Simple, transparent pricing
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Start screening for free. Upgrade when you need more.
          </p>
          <div className="mt-10">
            <PricingCards />
          </div>
          <p className="mt-6 text-center text-xs text-text-secondary">
            Annual billing available — save 2 months.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border-col bg-primary">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <h2 className="font-heading text-2xl font-bold text-white">
            Start screening in seconds
          </h2>
          <p className="mt-2 text-sm text-white/70">
            No credit card required. 3 free screenings to try it out.
          </p>
          <button
            onClick={() => router.push("/screen")}
            className="mt-6 rounded-md bg-white px-6 py-2.5 font-heading font-semibold text-primary hover:bg-white/90 active:scale-[0.97] transition-all duration-fast"
          >
            Start screening free
          </button>
        </div>
      </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border-col">
        <div className="mx-auto max-w-4xl px-4 py-8 text-center text-xs text-text-secondary">
          <p>AllClear — Sanctions screening for small businesses</p>
          <p className="mt-1">Data sourced from OpenSanctions. Not legal advice.</p>
        </div>
      </footer>

      <SignupModal open={showSignup} onClose={() => setShowSignup(false)} />
    </div>
  );
}
