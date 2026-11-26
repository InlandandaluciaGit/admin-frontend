import { cn } from "@/lib/cn";

type Variant = "inline" | "content" | "fullscreen";

const RING_SIZE: Record<Variant, string> = {
  inline: "size-4",
  content: "size-9",
  fullscreen: "size-11",
};

interface GlobalLoaderProps {
  /**
   * - `inline`: small ring for buttons, chips and tight spaces.
   * - `content`: centred in the available area while a page, card or module loads.
   * - `fullscreen`: covers the viewport; reserve for app/session initialisation.
   */
  variant?: Variant;
  /** Screen-reader text. Never shown visually. */
  label?: string;
  /**
   * `brand` (default) draws the Inland purple ring; `current` follows the text
   * colour, e.g. white inside a primary button.
   */
  tone?: "brand" | "current";
  /**
   * Hide from assistive tech when the parent already announces the busy state
   * (e.g. a button with `aria-busy`).
   */
  decorative?: boolean;
  className?: string;
}

/** The one loading indicator used across the admin panel. */
function Ring({ variant, tone }: { variant: Variant; tone: "brand" | "current" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn(
        "shrink-0 animate-spin [animation-duration:0.8s] motion-reduce:[animation-duration:2.4s]",
        RING_SIZE[variant],
        tone === "brand" ? "text-brand-600" : "text-current",
      )}
    >
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeOpacity={tone === "brand" ? 0.14 : 0.3} strokeWidth="2.5" />
      <path d="M21.5 12A9.5 9.5 0 0 0 12 2.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function GlobalLoader({ variant = "content", label = "Loading", tone = "brand", decorative = false, className }: GlobalLoaderProps) {
  const status = decorative ? { "aria-hidden": true as const } : { role: "status", "aria-live": "polite" as const };
  const srText = decorative ? null : <span className="sr-only">{label}</span>;

  if (variant === "inline") {
    return (
      <span {...status} className={cn("inline-flex items-center justify-center", className)}>
        <Ring variant="inline" tone={tone} />
        {srText}
      </span>
    );
  }

  if (variant === "fullscreen") {
    return (
      <div {...status} className={cn("fixed inset-0 z-[100] flex items-center justify-center bg-canvas/80 backdrop-blur-[2px]", className)}>
        <Ring variant="fullscreen" tone={tone} />
        {srText}
      </div>
    );
  }

  return (
    <div {...status} className={cn("flex w-full flex-1 items-center justify-center py-16", className)}>
      <Ring variant="content" tone={tone} />
      {srText}
    </div>
  );
}
