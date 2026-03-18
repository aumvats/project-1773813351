"use client";

import { useEffect } from "react";
import type { OpenSanctionsEntity } from "@/types/opensanctions";
import type { Country } from "@/types/screening";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ResultDetailProps {
  result: OpenSanctionsEntity;
  countries: Map<string, Country>;
  onClose: () => void;
}

export function ResultDetail({ result, countries, onClose }: ResultDetailProps) {
  const countryCodes = result.properties.country || [];

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div role="dialog" aria-label={`Details for ${result.caption}`} className="fixed inset-y-0 right-0 z-40 w-full max-w-lg bg-white border-l border-border-col shadow-lg overflow-y-auto animate-in slide-in-from-right duration-normal">
      <div className="sticky top-0 flex items-center justify-between border-b border-border-col bg-white px-6 py-4">
        <h2 className="font-heading text-lg font-semibold text-text-primary">
          Entity Details
        </h2>
        <button
          onClick={onClose}
          aria-label="Close detail panel"
          className="rounded-md p-1 text-text-secondary hover:text-text-primary hover:bg-surface transition-all duration-fast"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Name & Type */}
        <div>
          <h3 className="font-heading text-xl font-bold text-text-primary">
            {result.caption}
          </h3>
          <Badge variant="neutral" className="mt-2">
            {result.schema}
          </Badge>
        </div>

        {/* Score */}
        <div>
          <p className="text-xs font-semibold uppercase text-text-secondary mb-1">Match Score</p>
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 rounded-full bg-border-col">
              <div
                className="h-2 rounded-full bg-accent transition-all duration-slow"
                style={{ width: `${Math.round(result.score * 100)}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-accent">
              {Math.round(result.score * 100)}%
            </span>
          </div>
        </div>

        {/* Aliases */}
        {result.properties.alias && result.properties.alias.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase text-text-secondary mb-2">Aliases</p>
            <div className="flex flex-wrap gap-1.5">
              {result.properties.alias.map((alias, i) => (
                <Badge key={i} variant="neutral">
                  {alias}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Birth Date */}
        {result.properties.birthDate && result.properties.birthDate.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase text-text-secondary mb-1">Date of Birth</p>
            <p className="text-sm text-text-primary">
              {result.properties.birthDate.join(", ")}
            </p>
          </div>
        )}

        {/* Countries */}
        {countryCodes.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase text-text-secondary mb-2">Countries</p>
            <div className="flex flex-wrap gap-2">
              {countryCodes.map((code) => {
                const country = countries.get(code.toUpperCase());
                return (
                  <span key={code} className="inline-flex items-center gap-1.5 rounded-md border border-border-col px-2 py-1 text-sm">
                    {country?.flags?.svg && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={country.flags.svg}
                        alt={country.name.common}
                        className="h-3.5 w-5 object-cover rounded-[1px]"
                      />
                    )}
                    {country?.name?.common || code}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Topics */}
        {result.properties.topics && result.properties.topics.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase text-text-secondary mb-2">Topics</p>
            <div className="flex flex-wrap gap-1.5">
              {result.properties.topics.map((topic, i) => (
                <Badge key={i} variant="warning">
                  {topic.replace(/\./g, " ")}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Sanctions Datasets */}
        <div>
          <p className="text-xs font-semibold uppercase text-text-secondary mb-2">
            Sanctioning Datasets ({result.datasets.length})
          </p>
          <div className="space-y-1.5">
            {result.datasets.map((ds) => (
              <div
                key={ds}
                className="flex items-center gap-2 rounded-md border border-border-col px-3 py-2 text-sm hover:bg-surface transition-colors duration-fast"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-error shrink-0" />
                <span className="text-text-primary">{ds}</span>
                <a
                  href={`https://www.opensanctions.org/datasets/${ds}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-xs text-accent hover:underline shrink-0"
                >
                  View source
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* OpenSanctions Link */}
        <div className="pt-2 border-t border-border-col">
          <a
            href={`https://www.opensanctions.org/entities/${result.id}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent hover:underline"
          >
            View full entity on OpenSanctions →
          </a>
        </div>

        <Button variant="secondary" className="w-full" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
