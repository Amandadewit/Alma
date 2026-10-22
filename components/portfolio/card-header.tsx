import { cn } from "@/lib/utils"

/**
 * Standard header of a white card on the Portfolio Performance pages: title and subtitle at the top
 * left, a small status or count at the top right, and the controls (period, view, toggles) always in
 * the left corner directly underneath.
 */
export function CardHeader({
  title,
  subtitle,
  aside,
  controls,
  className,
}: {
  title: string
  subtitle?: React.ReactNode
  aside?: React.ReactNode
  controls?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("px-3 pb-1.5 pt-3", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[14px] font-semibold leading-tight text-ink">{title}</div>
          {subtitle && <div className="mt-0.5 text-[10.5px] leading-snug text-ink-3">{subtitle}</div>}
        </div>
        {aside && <div className="shrink-0 text-[10.5px] text-ink-3">{aside}</div>}
      </div>
      {controls && <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">{controls}</div>}
    </div>
  )
}
