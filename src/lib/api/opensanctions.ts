import type { OpenSanctionsResponse } from "@/types/opensanctions";

const BASE_URL = "https://api.opensanctions.org";

export async function searchEntities(
  query: string
): Promise<OpenSanctionsResponse> {
  const url = `${BASE_URL}/search/default?q=${encodeURIComponent(query)}&limit=20`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`OpenSanctions API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
