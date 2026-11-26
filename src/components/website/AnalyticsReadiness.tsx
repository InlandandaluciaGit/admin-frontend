import type { UnavailableMetric, WebsiteData } from "@/types/analytics";

/** GA4-dependent metrics, shown as locked rows. Everything else in `unavailable` is "not tracked at all". */
const GA_METRICS: { id: string; label: string }[] = [
  { id: "uniqueVisitors", label: "Visitors" },
  { id: "sessions", label: "Sessions & duration" },
  { id: "engagement", label: "Engagement rate" },
  { id: "pageViews", label: "Page views" },
];

function StatusRow({ ok, label, value }: { ok: boolean; label: string; value: string }) {
  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      <span className="flex items-center gap-2.5 text-[13px] font-medium text-fg">
        <span
          aria-hidden="true"
          className={ok ? "flex size-5 items-center justify-center rounded-full bg-success-50 text-success-700" : "flex size-5 items-center justify-center rounded-full bg-warning-50 text-warning-700"}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d={ok ? "M20 6 9 17l-5-5" : "M12 8v5M12 16.5v.01"} />
          </svg>
        </span>
        {label}
      </span>
      <span className={ok ? "text-xs font-semibold text-success-700" : "text-xs font-semibold text-warning-700"}>{value}</span>
    </li>
  );
}

/**
 * Google Analytics readiness: what is installed, what is missing, which
 * figures that blocks, and what access would unlock them. No numbers are shown.
 */
export function AnalyticsReadiness({ ga4, unavailable }: { ga4: WebsiteData["ga4"]; unavailable: UnavailableMetric[] }) {
  const gaIds = new Set(GA_METRICS.map((m) => m.id));
  const notTracked = unavailable.filter((item) => !gaIds.has(item.id));

  return (
    <div className="flex flex-1 flex-col">
      <ul className="divide-y divide-border" aria-label="Google Analytics status">
        <StatusRow ok={ga4.trackingInstalled} label="GA4 tracking on the website" value={ga4.trackingInstalled ? "Installed" : "Not installed"} />
        <StatusRow ok={ga4.configured} label="GA4 reporting (Data API) access" value={ga4.configured ? "Connected" : "Not configured"} />
      </ul>

      <div className="mt-4 grid grid-cols-2 gap-2" aria-label="Metrics that need Google Analytics access">
        {GA_METRICS.map((metric) => (
          <div key={metric.id} className="rounded-xl border border-dashed border-border-strong bg-surface-muted/50 px-3 py-2.5">
            <p className="truncate text-[11px] font-medium text-fg-muted">{metric.label}</p>
            <p className="mt-0.5 text-sm font-semibold text-fg-subtle">Unavailable</p>
          </div>
        ))}
      </div>

      <p className="mt-4 rounded-xl bg-brand-50 px-3.5 py-3 text-xs leading-relaxed text-brand-800">
        <span className="font-semibold">Needed to enable:</span> the GA4 property ID and a Google Cloud service account added to that property
        with Viewer access, so this system can read reports through the Google Analytics Data API.
      </p>

      {notTracked.length ? (
        <details className="group mt-3">
          <summary className="cursor-pointer list-none text-xs font-medium text-fg-muted select-none hover:text-fg">
            <span className="inline-block transition-transform group-open:rotate-90" aria-hidden="true">
              ›
            </span>{" "}
            Not tracked by any system ({notTracked.length})
          </summary>
          <ul className="mt-2 space-y-2">
            {notTracked.map((item) => (
              <li key={item.id} className="text-xs text-fg-muted">
                <span className="font-semibold text-fg">{item.label}:</span> {item.reason}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
