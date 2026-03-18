import type { OpenSanctionsEntity, OpenSanctionsDataset } from "./opensanctions";

export type ScreeningStatus = "clear" | "flagged" | "error";

export interface ScreeningResultSnapshot {
  results: OpenSanctionsEntity[];
  total: number;
  datasets: OpenSanctionsDataset[];
  cached: boolean;
  cachedAt: string | null;
  vatResult?: VATResult | null;
}

export interface Screening {
  id: string;
  user_id: string;
  query: string;
  result_snapshot: ScreeningResultSnapshot;
  status: ScreeningStatus;
  datasets_checked: string[];
  match_count: number;
  created_at: string;
}

export interface Country {
  name: { common: string; official: string };
  flags: { svg: string; png: string };
  cca2: string;
  cca3: string;
  region: string;
}

export interface VATResult {
  valid: boolean;
  country_code: string;
  country_name: string;
  company_name: string | null;
  company_address: string | null;
}
