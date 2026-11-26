import { Badge } from "@/components/ui/Badge";
import type { MetricDefinition } from "@/types/analytics";

const KIND = {
  dated: { tone: "brand", text: "Selected period" },
  snapshot: { tone: "neutral", text: "Current" },
  cumulative: { tone: "warning", text: "All-time total" },
} as const;

/** Says how a figure relates to the date filter, plus "Inferred" where the value or its date is derived. */
export function MetricBadges({ definition, className }: { definition?: MetricDefinition; className?: string }) {
  if (!definition) return null;
  const kind = definition.allHistory ? { tone: "neutral" as const, text: "All history" } : KIND[definition.kind];
  return (
    <span className={className}>
      <span className="inline-flex flex-wrap gap-1.5">
        <Badge tone={kind.tone}>{kind.text}</Badge>
        {definition.inferred ? <Badge tone="accent">Inferred</Badge> : null}
      </span>
    </span>
  );
}
