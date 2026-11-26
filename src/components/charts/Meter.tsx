import { formatNumber, formatPercent } from "@/utils/format";

interface MeterProps {
  value: number;
  max: number;
  label: string;
}

/** Progress toward a target. Track is a lighter step of the fill's ramp. */
export function Meter({ value, max, label }: MeterProps) {
  const ratio = Math.min(value / (max || 1), 1);
  return (
    <div>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${formatNumber(value)} of ${formatNumber(max)} (${formatPercent(ratio)})`}
        className="h-2 overflow-hidden rounded-full bg-brand-100"
      >
        <div className="h-full rounded-full bg-chart-1" style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  );
}
