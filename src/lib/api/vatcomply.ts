import type { VATResult } from "@/types/screening";

const BASE_URL = "https://api.vatcomply.com";

export async function validateVat(vatNumber: string): Promise<VATResult> {
  const normalized = vatNumber.replace(/\s/g, "").toUpperCase();
  const res = await fetch(`${BASE_URL}/vat?vat_number=${encodeURIComponent(normalized)}`);

  if (!res.ok) {
    throw new Error(`VATComply API error: ${res.status}`);
  }

  return res.json();
}
