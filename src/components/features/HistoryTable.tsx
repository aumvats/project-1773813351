"use client";

import { useState } from "react";
import Link from "next/link";
import type { Screening } from "@/types/screening";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";

interface HistoryTableProps {
  screenings: Screening[];
  loading: boolean;
  isPro: boolean;
  onRescreen: (query: string) => void;
  onDownload: (screening: Screening) => void;
}

export function HistoryTable({
  screenings,
  loading,
  isPro,
  onRescreen,
  onDownload,
}: HistoryTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "clear" | "flagged">("all");

  const filtered = screenings.filter((s) => {
    const matchesSearch = s.query.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <Skeleton variant="row" count={5} />;
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search screenings\u2026"
          className="max-w-xs"
          prefix={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          }
        />
        <div className="flex gap-1.5">
          {(["all", "clear", "flagged"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize transition-all duration-fast ${
                statusFilter === status
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border-col text-text-secondary hover:bg-surface hover:border-text-secondary/30"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-lg border border-border-col bg-surface p-8 text-center">
          <svg className="mx-auto h-10 w-10 text-text-secondary/40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
          <p className="mt-3 text-sm text-text-secondary">
            {search || statusFilter !== "all"
              ? "No screenings match your filters."
              : "No screenings yet. Start by screening a name."}
          </p>
          {!search && statusFilter === "all" && (
            <Link href="/screen">
              <Button variant="primary" size="sm" className="mt-3">
                Screen a name
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-col text-left">
                <th className="py-2 pr-4 font-heading font-semibold text-text-secondary text-xs uppercase">Name</th>
                <th className="py-2 pr-4 font-heading font-semibold text-text-secondary text-xs uppercase">Status</th>
                <th className="py-2 pr-4 font-heading font-semibold text-text-secondary text-xs uppercase">Matches</th>
                <th className="py-2 pr-4 font-heading font-semibold text-text-secondary text-xs uppercase">Date</th>
                <th className="py-2 font-heading font-semibold text-text-secondary text-xs uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-border-col last:border-0 hover:bg-surface transition-colors duration-fast">
                  <td className="py-3 pr-4">
                    <Link href={`/screen/${s.id}`} className="text-text-primary hover:text-accent font-medium transition-colors duration-fast">
                      {s.query}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant={s.status === "clear" ? "clear" : s.status === "flagged" ? "flagged" : "warning"}>
                      {s.status === "clear" ? "Clear" : s.status === "flagged" ? "Flagged" : "Error"}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4 text-text-secondary">{s.match_count}</td>
                  <td className="py-3 pr-4 text-text-secondary">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <Link href={`/screen/${s.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => onRescreen(s.query)}>
                        Re-screen
                      </Button>
                      {isPro && (
                        <Button variant="ghost" size="sm" onClick={() => onDownload(s)}>
                          PDF
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upgrade banner for free users */}
      {!isPro && screenings.length > 0 && (
        <div className="mt-4 rounded-lg border border-accent/20 bg-accent/5 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-heading font-semibold text-text-primary">
              Upgrade to Pro for unlimited history
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              Free accounts only keep the last 7 days of screenings.
            </p>
          </div>
          <Link href="/settings">
            <Button size="sm">Upgrade</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
