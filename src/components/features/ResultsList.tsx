"use client";

import { useState } from "react";
import type { OpenSanctionsEntity, OpenSanctionsDataset } from "@/types/opensanctions";
import type { Country } from "@/types/screening";
import { ResultCard } from "./ResultCard";
import { ResultDetail } from "./ResultDetail";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

interface ResultsListProps {
  results: OpenSanctionsEntity[] | null;
  datasets: OpenSanctionsDataset[];
  loading: boolean;
  error: string | null;
  query: string;
  countries: Map<string, Country>;
  onRetry?: () => void;
}

export function ResultsList({
  results,
  datasets,
  loading,
  error,
  query,
  countries,
  onRetry,
}: ResultsListProps) {
  const [selectedResult, setSelectedResult] = useState<OpenSanctionsEntity | null>(null);

  // Loading state
  if (loading) {
    return (
      <div className="mt-6">
        <Skeleton variant="card" count={3} />
      </div>
    );
  }

  // Error state — NEVER show false "all clear"
  if (error) {
    return (
      <div className="mt-6 rounded-lg border border-error/30 bg-error/5 p-6 text-center animate-fade-in-up">
        <svg className="mx-auto h-10 w-10 text-error" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
        <p className="mt-3 font-heading font-semibold text-error">
          Screening service temporarily unavailable
        </p>
        <p className="mt-1 text-sm text-text-secondary">
          {error}
        </p>
        {onRetry && (
          <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
            Retry screening
          </Button>
        )}
      </div>
    );
  }

  // No results yet (initial state)
  if (results === null) return null;

  // Empty state — all clear
  if (results.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-success/30 bg-success/5 p-6 text-center animate-fade-in-up">
        <svg className="mx-auto h-12 w-12 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <div className="mt-3">
          <Badge variant="clear" className="text-sm px-3 py-1">All Clear</Badge>
        </div>
        <p className="mt-3 font-heading font-semibold text-text-primary">
          No matches found for &ldquo;{query}&rdquo;
        </p>
        <p className="mt-1 text-sm text-text-secondary">
          This name was checked against {datasets.length} sanctions datasets.
        </p>
        {datasets.length > 0 && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-xs text-text-secondary hover:text-text-primary transition-colors duration-fast">
              View all {datasets.length} datasets checked
            </summary>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
              {datasets.map((ds) => (
                <span key={ds.name} className="text-xs text-text-secondary">
                  • {ds.title || ds.name}
                </span>
              ))}
            </div>
          </details>
        )}
      </div>
    );
  }

  // Results found
  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center gap-2 animate-fade-in">
        <Badge variant="flagged">{results.length} potential match{results.length !== 1 ? "es" : ""} found</Badge>
        <span className="text-xs text-text-secondary">for &ldquo;{query}&rdquo;</span>
      </div>
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
