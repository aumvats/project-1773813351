import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    description: "Get started with basic screening",
    features: [
      "5 screenings per day",
      "Basic match results",
      "7-day screening history",
    ],
    cta: "Start free",
    variant: "secondary" as const,
    badge: null,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mo",
    description: "Full screening for small businesses",
    features: [
      "50 screenings per day",
      "Full match details + aliases",
      "Unlimited screening history",
      "PDF screening reports",
      "EU VAT validation",
      "Email support (48h)",
    ],
    cta: "Start Pro trial",
    variant: "primary" as const,
    badge: "Most Popular",
  },
  {
    name: "Business",
    price: "$49",
    period: "/mo",
    description: "For teams and consultants",
    features: [
      "200 screenings per day",
      "Everything in Pro",
      "Bulk CSV screening (coming soon)",
      "Team accounts (coming soon)",
      "Branded reports (coming soon)",
      "Priority support (4h)",
    ],
    cta: "Contact sales",
    variant: "secondary" as const,
    badge: null,
  },
];

export function PricingCards() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {tiers.map((tier) => (
        <Card
          key={tier.name}
          className={
            tier.badge
              ? "border-accent ring-1 ring-accent relative hover:shadow-md transition-shadow duration-normal"
              : "relative hover:shadow-sm transition-shadow duration-normal"
          }
        >
          {tier.badge && (
            <Badge variant="info" className="absolute -top-2.5 left-4">
              {tier.badge}
            </Badge>
          )}
          <div className="pt-2">
            <h3 className="font-heading text-lg font-semibold text-text-primary">
              {tier.name}
            </h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-heading text-3xl font-bold text-text-primary">
                {tier.price}
              </span>
              <span className="text-sm text-text-secondary">{tier.period}</span>
            </div>
            <p className="mt-1 text-sm text-text-secondary">
              {tier.description}
            </p>
          </div>
          <ul className="mt-4 space-y-2">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-text-primary">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-success"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <Link href="/screen">
              <Button variant={tier.variant} className="w-full">
                {tier.cta}
              </Button>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}
