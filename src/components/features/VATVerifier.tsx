"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { VATResult } from "@/types/screening";

interface VATVerifierProps {
  countryCode: string;
  onResult?: (result: VATResult) => void;
}

export function VATVerifier({ countryCode, onResult }: VATVerifierProps) {
  const [vatNumber, setVatNumber] = useState(countryCode);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VATResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleValidate() {
    if (!vatNumber.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/vat?number=${encodeURIComponent(vatNumber.trim())}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "VAT validation unavailable");
      }
      const data: VATResult = await res.json();
      setResult(data);
      onResult?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "VAT validation unavailable");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-border-col p-4">
      <h4 className="font-heading text-sm font-semibold text-text-primary mb-3">
        EU VAT Verification
      </h4>

      <div className="flex gap-2">
        <Input
          value={vatNumber}
          onChange={(e) => setVatNumber(e.target.value)}
          placeholder="e.g., DE123456789"
          className="flex-1"
        />
        <Button
          size="sm"
          loading={loading}
          onClick={handleValidate}
          disabled={!vatNumber.trim()}
        >
          Verify
        </Button>
      </div>

      {error && (
        <p className="mt-2 text-xs text-error">{error}</p>
      )}

      {result && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={result.valid ? "clear" : "warning"}>
              {result.valid ? "VAT Verified" : "VAT Invalid"}
            </Badge>
            <span className="text-xs text-text-secondary">
              {result.country_name}
            </span>
          </div>
          {result.company_name && (
            <p className="text-sm text-text-primary">{result.company_name}</p>
          )}
          {result.company_address && (
            <p className="text-xs text-text-secondary">{result.company_address}</p>
          )}
          {!result.valid && (
            <p className="text-xs text-warning">
              This VAT number could not be validated. Investigate further before proceeding.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
