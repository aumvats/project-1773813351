"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/features/Header";
import { HistoryTable } from "@/components/features/HistoryTable";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/components/features/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { generateScreeningPDF } from "@/lib/utils/pdf";
import type { Screening } from "@/types/screening";

export default function HistoryPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);

  const isPro = profile?.subscription_tier === "pro";

  useEffect(() => {
    async function loadScreenings() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        let query = supabase
          .from("screenings")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        // Free tier: only last 7 days
        if (!isPro) {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          query = query.gte("created_at", sevenDaysAgo.toISOString());
        }

        const { data, error } = await query;
        if (error) throw error;
        setScreenings((data || []) as unknown as Screening[]);
      } catch {
        toast("error", "Failed to load screening history.");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadScreenings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, isPro]);

  function handleRescreen(query: string) {
    router.push(`/screen?q=${encodeURIComponent(query)}`);
  }

  async function handleDownload(screening: Screening) {
    const doc = await generateScreeningPDF(screening, user?.email ?? undefined);
    doc.save(`screening-${screening.id}.pdf`);
    toast("success", "Report downloaded.");
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <Skeleton variant="row" count={5} />
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="font-heading text-2xl font-bold text-text-primary">
            Sign in to view your history
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Your screening history is saved to your account.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="font-heading text-2xl font-bold text-text-primary mb-6">
          Screening History
        </h1>

        <HistoryTable
          screenings={screenings}
          loading={loading}
          isPro={isPro}
          onRescreen={handleRescreen}
          onDownload={handleDownload}
        />
      </main>
    </div>
  );
}
