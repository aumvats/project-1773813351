"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, prefix, suffix, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-text-secondary">{prefix}</span>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full rounded-md border bg-white px-3 py-2 text-sm font-body text-text-primary",
              "placeholder:text-text-secondary/60",
              "hover:border-text-secondary/40",
              "focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent",
              "transition-all duration-fast",
              error ? "border-error" : "border-border-col",
              prefix && "pl-10",
              suffix && "pr-10",
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 text-text-secondary">{suffix}</span>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-error">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
