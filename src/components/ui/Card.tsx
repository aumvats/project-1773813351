import { cn } from "@/lib/utils/cn";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ className, children, hover, onClick }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border-col bg-white p-4",
        hover && "cursor-pointer transition-all duration-fast hover:bg-surface hover:shadow-sm hover:-translate-y-px",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
    >
      {children}
    </div>
  );
}
