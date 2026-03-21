"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

const navLinks = [
  { href: "/screen", label: "Screen" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" },
];

export function Header() {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b border-border-col bg-white sticky top-0 z-20">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-heading text-lg font-bold text-primary">
            AllClear
          </Link>
          {user && (
            <nav className="hidden items-center gap-1 sm:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors duration-fast",
                    pathname.startsWith(link.href)
                      ? "text-accent font-medium bg-accent/5"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-border-col/60" />
          ) : user ? (
            <>
              <span className="hidden text-sm text-text-secondary sm:inline">
                {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={signOut} className="hidden sm:inline-flex">
                Sign out
              </Button>
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="inline-flex items-center justify-center rounded-md p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface transition-colors duration-fast sm:hidden"
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                )}
              </button>
            </>
          ) : (
            <Link href="/screen">
              <Button size="sm">Start Screening</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile nav drawer */}
      {user && mobileOpen && (
        <div className="border-t border-border-col bg-white px-4 py-3 sm:hidden animate-in slide-in-from-top-2 fade-in duration-fast">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm transition-colors duration-fast",
                  pathname.startsWith(link.href)
                    ? "text-accent font-medium bg-accent/5"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-border-col pt-2">
              <p className="px-3 text-xs text-text-secondary truncate">{user.email}</p>
              <button
                onClick={() => { setMobileOpen(false); signOut(); }}
                className="mt-1 w-full rounded-md px-3 py-2.5 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors duration-fast"
              >
                Sign out
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
