const STORAGE_KEY = "allclear_anon_count";

export function getAnonCount(): number {
  if (typeof window === "undefined") return 0;
  const val = localStorage.getItem(STORAGE_KEY);
  if (!val) return 0;
  try {
    const parsed = JSON.parse(val);
    // Reset if from a different day
    const today = new Date().toDateString();
    if (parsed.date !== today) {
      localStorage.removeItem(STORAGE_KEY);
      return 0;
    }
    return parsed.count ?? 0;
  } catch {
    return 0;
  }
}

export function incrementAnonCount(): void {
  if (typeof window === "undefined") return;
  const count = getAnonCount();
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ count: count + 1, date: new Date().toDateString() })
    );
  } catch { /* storage unavailable — anon limit tracking disabled */ }
}

export function resetAnonCount(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
