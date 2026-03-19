"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

interface SignupModalProps {
  open: boolean;
  onClose: () => void;
}

export function SignupModal({ open, onClose }: SignupModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    if (mode === "signup") {
      const { error: err } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
      if (err) {
        setError(err.message);
      } else {
        onClose();
      }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) {
        setError(err.message);
      } else {
        onClose();
      }
    }

    setLoading(false);
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
          <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>

        <h2 className="mt-4 text-center font-heading text-xl font-bold text-text-primary">
          {mode === "signup" ? "Create a free account" : "Sign in"}
        </h2>
        {mode === "signup" && (
          <p className="mt-2 text-center text-sm text-text-secondary">
            You&apos;ve used your 3 free screenings. Sign up to continue screening with 5 free screenings per day.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            error={error ?? undefined}
          />
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Please wait…" : mode === "signup" ? "Sign up" : "Sign in"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-text-secondary">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="text-accent underline"
                onClick={() => { setMode("signin"); setError(null); }}
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="text-accent underline"
                onClick={() => { setMode("signup"); setError(null); }}
              >
                Sign up
              </button>
            </>
          )}
        </p>
      </div>
    </Modal>
  );
}
