"use client";

import type { OpenSanctionsEntity } from "@/types/opensanctions";
import type { Country } from "@/types/screening";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

interface ResultCardProps {
  result: OpenSanctionsEntity;
  countries: Map<string, Country>;
  onClick: () => void;
}

function getTypeLabel(schema: string): string {
  const labels: Record<string, string> = {
    Person: "Person",
    Company: "Company",
    Vessel: "Vessel",
    Aircraft: "Aircraft",
    LegalEntity: "Entity",
    Organization: "Organization",
  };
  return labels[schema] || "Entity";
}

export function ResultCard({ result, countries, onClick }: ResultCardProps) {
  const countryCodes = result.properties.country || [];

  return (
    <Card hover onClick={onClick} className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-base font-semibold text-text-primary truncate">
            {result.caption}
          </h3>
          {result.properties.alias && result.properties.alias.length > 0 && (
            <p className="text-xs text-text-secondary mt-0.5 truncate">
              Also known as: {result.properties.alias.slice(0, 3).join(", ")}
              {result.properties.alias.length > 3 && ` +${result.properties.alias.length - 3} more`}
            </p>
          )}
        </div>
        <Badge variant="neutral" className="shrink-0">
          {getTypeLabel(result.schema)}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {countryCodes.map((code) => {
          const country = countries.get(code.toUpperCase());
          return (
            <span key={code} className="inline-flex items-center gap-1 text-xs text-text-secondary">
              {country?.flags?.svg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={country.flags.svg}
                  alt={country.name.common}
                  className="h-3.5 w-5 object-cover rounded-[1px]"
                />
              ) : null}
              {country?.name?.common || code}
            </span>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-border-col">
        <span className="text-xs text-text-secondary">
          Listed on {result.datasets.length} dataset{result.datasets.length !== 1 ? "s" : ""}
        </span>
        <span className="text-xs font-semibold text-accent">
          {Math.round(result.score * 100)}% match
        </span>
      </div>
    </Card>
  );
}
