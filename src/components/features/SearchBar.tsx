"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
}

export function SearchBar({
  onSearch,
  loading = false,
  disabled = false,
  placeholder = "Enter a person or company name\u2026",
  className,
  defaultValue,
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed && !disabled && !loading) {
      onSearch(trimmed);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <div className="relative flex items-center group rounded-lg transition-shadow duration-fast focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]">
        <svg
          className="absolute left-4 h-5 w-5 text-text-secondary"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full rounded-lg border border-border-col bg-white py-3 pl-12 pr-28 text-base font-body text-text-primary",
            "placeholder:text-text-secondary/60",
            "focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent",
            "transition-all duration-fast",
            loading && "animate-pulse",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          autoFocus
        />
        <button
          type="submit"
          disabled={!value.trim() || disabled || loading}
          className={cn(
            "absolute right-2 rounded-md bg-accent px-4 py-1.5 text-sm font-heading font-semibold text-white",
            "hover:bg-accent/90 active:scale-[0.97] transition-all duration-fast",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          )}
        >
          {loading ? "Screening\u2026" : "Screen"}
        </button>
      </div>
    </form>
  );
}
