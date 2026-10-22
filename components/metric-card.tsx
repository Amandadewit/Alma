import { cn } from "@/lib/utils"

interface MetricCardProps {
  label: string
  value: string | number
  /** Smaller unit shown after the value, e.g. "m", "%", "x". */
  unit?: string
  subtitle?: string
  delta?: number | string
  deltaLabel?: string
  deltaDirection?: "up" | "down" | "neutral"
  /** The one full-colour KPI per screen: brand fill, 64px value. */
  hero?: boolean
  className?: string
}

const arrows = { up: "▲", down: "▼", neutral: "" }

export function MetricCard({
  label,
  value,
  unit,
  subtitle,
  delta,
  deltaLabel,
  deltaDirection = "neutral",
  hero = false,
  className,
}: MetricCardProps) {
  const deltaColorClasses = {
    up: "text-ok",
    down: "text-alert",
    neutral: "text-ink-2",
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border px-5 pb-5 pt-4",
        hero
          ? "border-brand bg-brand text-on-brand shadow-[var(--shadow-glow)]"
          : "border-line bg-surface text-ink shadow-[var(--shadow-card)]",
        className
      )}
    >
      {hero && (
        // The 60° motif from the A-mark
        <div aria-hidden className="absolute right-6 top-5 flex h-11 gap-2.5">
          <i className="block h-[64%] w-3.5 origin-bottom-left skew-x-[30deg] self-end bg-on-brand opacity-55" />
          <i className="block h-full w-3.5 origin-bottom-left skew-x-[30deg] bg-on-brand" />
        </div>
      )}
      <div className={cn("eyebrow", hero ? "text-on-brand" : "text-ink-2")}>{label}</div>
      <div
        className={cn(
          "font-display tabular-nums whitespace-nowrap",
          hero
            ? "mt-4 text-[64px] font-bold leading-[64px] tracking-[-0.035em]"
            : "mt-3 text-[30px] font-semibold leading-[34px] tracking-[-0.02em]"
        )}
      >
        {value}
        {unit && (
          <small className={cn("ml-0.5 font-medium tracking-normal", hero ? "text-[28px] text-on-brand" : "text-[0.55em] text-ink-2")}>
            {unit}
          </small>
        )}
      </div>
      {(subtitle || delta !== undefined) && (
        <div className={cn("mt-2 flex items-center gap-2 text-xs", hero ? "text-on-brand" : "text-ink-2")}>
          {delta !== undefined && (
            <span className={cn("inline-flex items-center gap-[3px] font-semibold tabular-nums", hero ? "text-on-brand" : deltaColorClasses[deltaDirection])}>
              {arrows[deltaDirection] && <span className="text-[8px] leading-none">{arrows[deltaDirection]}</span>}
              {typeof delta === "number" ? (delta > 0 ? `+${delta}` : String(delta).replace("-", "−")) : delta}
              {deltaLabel && ` ${deltaLabel}`}
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  )
}
