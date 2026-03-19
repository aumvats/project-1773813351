import type { OpenSanctionsResponse } from "@/types/opensanctions";

const BASE_URL = "https://api.opensanctions.org";

export async function searchEntities(
  query: string
): Promise<OpenSanctionsResponse> {
  const apiKey = process.env.OPENSANCTIONS_API_KEY;
  if (!apiKey) {
    throw new Error("OPENSANCTIONS_API_KEY is not configured");
  }

  const url = `${BASE_URL}/search/default?q=${encodeURIComponent(query)}&limit=20`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `ApiKey ${apiKey}`,
    },
  });

  if (!res.ok) {
    throw new Error(`OpenSanctions API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
