"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/features/Header";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/components/features/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-8">
          <Skeleton variant="card" count={3} />
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="font-heading text-2xl font-bold text-text-primary">
            Sign in to view settings
          </h1>
        </main>
      </div>
    );
  }

  const isPro = profile?.subscription_tier === "pro";
  const dailyLimit = isPro ? 50 : 5;
  const used = profile?.screenings_today ?? 0;
  const usagePercent = Math.min((used / dailyLimit) * 100, 100);

  async function handleDeleteAccount() {
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const supabase = createClient();
      // Delete screenings first, then profile
      await supabase.from("allclear_screenings").delete().eq("user_id", user!.id);
      await supabase.from("allclear_profiles").delete().eq("id", user!.id);
      await signOut();
      toast("success", "Account deleted.");
      router.push("/");
    } catch {
      toast("error", "Failed to delete account. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-heading text-2xl font-bold text-text-primary mb-6">
          Account Settings
        </h1>

        <div className="space-y-6">
          {/* Profile */}
          <Card>
            <h2 className="font-heading text-base font-semibold text-text-primary mb-3">
              Profile
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Email</span>
                <span className="text-text-primary">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Account ID</span>
                <span className="text-text-primary font-mono text-xs">{user.id.slice(0, 8)}\u2026</span>
              </div>
            </div>
          </Card>

          {/* Plan */}
          <Card>
            <h2 className="font-heading text-base font-semibold text-text-primary mb-3">
              Plan
            </h2>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant={isPro ? "info" : "neutral"}>
                {isPro ? "Pro" : "Free"}
              </Badge>
              <span className="text-sm text-text-secondary">
                {isPro ? "$19/month" : "$0/month"}
              </span>
            </div>

            {/* Usage bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-text-secondary mb-1">
                <span>Screenings today</span>
                <span>{used}/{dailyLimit}</span>
              </div>
              <div className="h-2 rounded-full bg-border-col">
                <div
                  className="h-2 rounded-full bg-accent transition-all duration-normal"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>

            {!isPro && (
              <div className="rounded-md border border-accent/20 bg-accent/5 p-3">
                <p className="text-sm font-heading font-semibold text-text-primary">
                  Upgrade to Pro
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  50 screenings/day, unlimited history, PDF reports, VAT validation.
                </p>
                <Button size="sm" className="mt-3">
                  Upgrade to Pro — $19/mo
                </Button>
              </div>
            )}
          </Card>

          {/* Danger Zone */}
          <Card className="border-error/20">
            <h2 className="font-heading text-base font-semibold text-error mb-3">
              Danger Zone
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Button variant="secondary" onClick={signOut}>
                  Sign out
                </Button>
              </div>
              <Button
                variant="danger"
                size="sm"
                loading={deleting}
                onClick={handleDeleteAccount}
              >
                Delete account
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
