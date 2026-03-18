import type { ScreeningStatus } from "@/types/screening";

export interface Profile {
  id: string;
  email: string | null;
  subscription_tier: "free" | "pro";
  screenings_today: number;
  screenings_reset_at: string;
  created_at: string;
}

export interface ScreeningRow {
  id: string;
  user_id: string;
  query: string;
  result_snapshot: Record<string, unknown>;
  status: ScreeningStatus;
  datasets_checked: string[];
  match_count: number;
  created_at: string;
}
