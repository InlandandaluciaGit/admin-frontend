import { cn } from "@/lib/cn";
import { CATEGORIES, type CategoryId } from "./categories";

/**
 * Plain-language summary of the website's selection code
 * (BackEnd homepageDiscovery.ts and getHomepageDiscoveryCandidates). The API's
 * own `rules` text carries the technical wording in the tooltips.
 */
const RULES: { id: CategoryId; eligible: string; order: string }[] = [
  {
    id: "popular",
    eligible: "Live properties with at least one enquiry record in the rolling last 7 days.",
    order:
      "Most 7-day enquiries first, then lifetime enquiries. Ranked by enquiries, not views. If no property qualifies, it falls back to lifetime enquiries (view count only breaks ties).",
  },
  {
    id: "newListings",
    eligible: "Live properties listed in the last 30 days, or whose current price is below the original price.",
    order: "Newest listing first. The two most recently listed price-reduced properties take positions 1–2.",
  },
  {
    id: "exclusives",
    eligible: "Live properties on the staff-maintained featured list. The expiry date is not checked.",
    order: "Most enquiries in the last 30 days first, then the featured list's sort order.",
  },
];

export function RotationRules({ limit }: { limit: number }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {RULES.map((rule) => {
          const c = CATEGORIES[rule.id];
          return (
            <div key={rule.id} className="rounded-xl border border-border bg-surface-muted/40 p-4">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-fg">
                <span className={cn("flex size-7 items-center justify-center rounded-lg [&_svg]:size-4", c.tile)}>{c.icon}</span>
                {c.title}
              </p>
              <dl className="mt-3 space-y-2 text-xs leading-relaxed">
                <div>
                  <dt className="font-semibold text-fg">Eligible</dt>
                  <dd className="text-fg-muted">{rule.eligible}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-fg">Order</dt>
                  <dd className="text-fg-muted">{rule.order}</dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>

      <ul className="grid grid-cols-1 gap-x-6 gap-y-2 text-xs text-fg-muted sm:grid-cols-2">
        <li>
          <span className="font-semibold text-fg">Up to {limit} per section.</span> “Live” means displayed and For Sale or Under Offer.
        </li>
        <li>
          <span className="font-semibold text-fg">Priority Popular → New → Exclusive.</span> Positions 1–2 may repeat a property shown in a
          higher-priority section; from position 3 each property appears once.
        </li>
        <li>
          <span className="font-semibold text-fg">No random rotation or schedule.</span> Sections change only when listings, prices,
          enquiries or the featured list change.
        </li>
        <li>
          <span className="font-semibold text-fg">Refresh.</span> Results are cached for up to 5 minutes by the API and 5 by the website.
        </li>
      </ul>
    </div>
  );
}

/** Why there is no history or impact chart on this page. */
export function HistoryLimitation() {
  return (
    <div className="flex gap-3 rounded-2xl border border-dashed border-border-strong bg-surface p-5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-fg-muted" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v5h5M3.05 13A9 9 0 1 0 6 5.3L3 8M12 7v5l4 2" />
        </svg>
      </span>
      <div className="min-w-0 text-sm">
        <p className="font-semibold text-fg">No homepage history is recorded</p>
        <p className="mt-1 text-fg-muted">
          The database does not store past homepage selections, impressions or clicks, so this page shows the current selection only. It cannot
          show which properties appeared before, or whether being on the homepage led to enquiries or sales. Measuring that would need
          impression and click tracking on the homepage from now on.
        </p>
      </div>
    </div>
  );
}
