import type { Country } from "@/types/screening";

const STORAGE_KEY = "allclear_countries_v1";
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface CachedCountries {
  data: Country[];
  expires: number;
}

export async function fetchCountries(): Promise<Map<string, Country>> {
  if (typeof window === "undefined") return new Map();

  // Check localStorage cache
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    try {
      const parsed: CachedCountries = JSON.parse(cached);
      if (Date.now() < parsed.expires) {
        return toMap(parsed.data);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // Fetch fresh data
  try {
    const res = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,flags,cca2,cca3,region"
    );
    if (!res.ok) throw new Error("Failed to fetch countries");
    const data: Country[] = await res.json();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ data, expires: Date.now() + TTL_MS })
    );
    return toMap(data);
  } catch {
    return new Map();
  }
}

function toMap(countries: Country[]): Map<string, Country> {
  const map = new Map<string, Country>();
  for (const c of countries) {
    map.set(c.cca2, c);
  }
  return map;
}
