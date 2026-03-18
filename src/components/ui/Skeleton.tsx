import { cn } from "@/lib/utils/cn";

interface SkeletonProps {
  variant?: "text" | "card" | "row";
  count?: number;
  className?: string;
}

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-border-col/60", className)}
    />
  );
}

export function Skeleton({ variant = "text", count = 1, className }: SkeletonProps) {
  const items = Array.from({ length: count });

  if (variant === "card") {
    return (
      <div className={cn("space-y-3", className)}>
        {items.map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border-col p-4 space-y-3"
          >
            <SkeletonPulse className="h-5 w-3/4" />
            <SkeletonPulse className="h-4 w-1/2" />
            <div className="flex gap-2">
              <SkeletonPulse className="h-6 w-16 rounded-full" />
              <SkeletonPulse className="h-6 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "row") {
    return (
      <div className={cn("space-y-2", className)}>
        {items.map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3">
            <SkeletonPulse className="h-4 w-1/4" />
            <SkeletonPulse className="h-6 w-16 rounded-full" />
            <SkeletonPulse className="h-4 w-1/6" />
            <SkeletonPulse className="h-4 w-1/6 ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((_, i) => (
        <SkeletonPulse key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}
