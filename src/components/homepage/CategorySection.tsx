import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { FeaturedEntry, HomepageItem } from "@/types/analytics";
import { CATEGORIES, type CategoryId } from "./categories";

const fullFmt = new Intl.NumberFormat("en-GB");
const euro = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
export const formatDay = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "—";

/** Headline card for one category: what is eligible right now. */
export function CategorySummary({ id, value, caption, extra }: { id: CategoryId; value: number; caption: string; extra?: ReactNode }) {
  const c = CATEGORIES[id];
  return (
    <div className="flex h-full items-start gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card">
      <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", c.tile)}>{c.icon}</span>
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-fg-muted">{c.title}</p>
        <p className="mt-0.5 text-3xl font-bold tracking-tight text-fg tabular-nums">{fullFmt.format(value)}</p>
        <p className="mt-1 text-xs text-fg-muted">{caption}</p>
        {extra ? <div className="mt-2">{extra}</div> : null}
      </div>
    </div>
  );
}

function Pill({ children, tone }: { children: ReactNode; tone: "warning" | "success" | "neutral" | "brand" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap",
        tone === "warning" && "bg-warning-50 text-warning-700",
        tone === "success" && "bg-success-50 text-success-700",
        tone === "neutral" && "bg-surface-muted text-fg-muted",
        tone === "brand" && "bg-brand-50 text-brand-700",
      )}
    >
      {children}
    </span>
  );
}

interface CategorySectionProps {
  id: CategoryId;
  items: HomepageItem[];
  /** Featured entries by ref, for expiry details in Exclusive Featured. */
  featuredByRef?: Map<string, FeaturedEntry>;
  notice?: ReactNode;
}

/**
 * The properties the website shows in one homepage section right now, in
 * display order, with the category's own evidence for each one.
 */
export function CategorySection({ id, items, featuredByRef, notice }: CategorySectionProps) {
  const c = CATEGORIES[id];

  return (
    <section aria-labelledby={`section-${id}`} className="flex min-w-0 flex-col rounded-2xl border border-border bg-surface shadow-card">
      <header className="flex items-center gap-3 px-5 pt-5 sm:px-6">
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", c.tile)}>{c.icon}</span>
        <div className="min-w-0">
          <h2 id={`section-${id}`} className="text-[1rem] font-semibold text-fg">
            {c.title}
          </h2>
          <p className="text-xs text-fg-muted">
            Shown now · “{c.siteName}” · {fullFmt.format(items.length)} {items.length === 1 ? "property" : "properties"}
          </p>
        </div>
      </header>

      {notice ? <div className="mx-5 mt-4 sm:mx-6">{notice}</div> : null}

      {items.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-fg-muted sm:px-6">No property currently qualifies for this section.</p>
      ) : (
        <ol className="mt-4 flex-1 divide-y divide-border border-t border-border">
          {items.map((item) => {
            const reduced = item.originalPrice && item.price && item.originalPrice > item.price ? (item.originalPrice - item.price) / item.originalPrice : null;
            const featured = featuredByRef?.get(item.ref);
            return (
              <li key={item.propertyId} className="flex gap-3 px-5 py-3 sm:px-6">
                <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold tabular-nums", c.chip)} aria-label={`Position ${item.position}`}>
                  {item.position}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-fg">{item.ref}</p>
                      <p className="truncate text-xs text-fg-muted">
                        {item.type} · {item.area}
                        {item.price !== null ? ` · ${euro.format(item.price)}` : ""}
                      </p>
                    </div>
                    {id === "popular" ? (
                      <div className="shrink-0 text-right">
                        <p className="text-base font-bold text-fg tabular-nums">{fullFmt.format(item.enquiries)}</p>
                        <p className="text-[10px] font-medium text-fg-subtle uppercase">7-day enq.</p>
                      </div>
                    ) : id === "exclusives" ? (
                      <div className="shrink-0 text-right">
                        <p className="text-base font-bold text-fg tabular-nums">{fullFmt.format(item.enquiries)}</p>
                        <p className="text-[10px] font-medium text-fg-subtle uppercase">30-day enq.</p>
                      </div>
                    ) : (
                      <div className="shrink-0 text-right">
                        <p className="text-xs font-semibold text-fg">{formatDay(item.createdAt)}</p>
                        <p className="text-[10px] font-medium text-fg-subtle uppercase">Listed</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {id === "newListings" && reduced !== null ? <Pill tone="success">Price reduced {(reduced * 100).toFixed(1)}%</Pill> : null}
                    {id === "exclusives" && featured ? (
                      featured.expired ? (
                        <Pill tone="warning">Expired {formatDay(featured.expiryDate)}</Pill>
                      ) : (
                        <Pill tone="success">{featured.expiryDate ? `Active until ${formatDay(featured.expiryDate)}` : "Active · no expiry set"}</Pill>
                      )
                    ) : null}
                    {item.alsoIn.map((section) => (
                      <Pill key={section} tone="neutral">
                        Also in {section}
                      </Pill>
                    ))}
                  </div>

                  {item.reasons.length ? <p className="mt-1 text-[11px] leading-snug text-fg-subtle">{item.reasons.join(" · ")}</p> : null}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
