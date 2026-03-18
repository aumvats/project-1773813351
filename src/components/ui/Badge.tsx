import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  variant: "clear" | "flagged" | "warning" | "neutral" | "info";
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  clear: "bg-success/10 text-success border-success/20",
  flagged: "bg-error/10 text-error border-error/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  neutral: "bg-surface text-text-secondary border-border-col",
  info: "bg-accent/10 text-accent border-accent/20",
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold font-heading",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
