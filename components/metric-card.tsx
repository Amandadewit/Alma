import { cn } from "@/lib/utils"

interface MetricCardProps {
  label: string
  value: string | number
  subtitle?: string
  delta?: number | string
  deltaLabel?: string
  deltaDirection?: "up" | "down" | "neutral"
  className?: string
}

export function MetricCard({
  label,
  value,
  subtitle,
  delta,
  deltaLabel,
  deltaDirection = "neutral",
  className,
}: MetricCardProps) {
  const deltaColorClasses = {
    up: "text-[#3B6D11]",
    down: "text-[#A32D2D]",
    neutral: "text-[#6B6963]",
  }

  return (
    <div
      className={cn(
        "rounded-[10px] border border-[#E8E6E0] bg-white px-4 py-3.5",
        className
      )}
    >
      <div className="text-[10px] font-medium uppercase tracking-wide text-[#6B6963]">
        {label}
      </div>
      <div className="mt-1 text-2xl font-medium tabular-nums text-[#2C2C2A]">
        {value}
      </div>
      {(subtitle || delta !== undefined) && (
        <div className="mt-0.5 flex items-center gap-2 text-[11px]">
          {subtitle && <span className="text-[#6B6963]">{subtitle}</span>}
          {delta !== undefined && (
            <span className={deltaColorClasses[deltaDirection]}>
              {typeof delta === "number" ? (delta > 0 ? `+${delta}` : delta) : delta}
              {deltaLabel && ` ${deltaLabel}`}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
