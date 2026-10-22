import { cn } from "@/lib/utils"
import type { StatusType } from "@/lib/mock-data"

interface StatusDotProps {
  status: StatusType
  size?: "sm" | "md" | "lg"
  className?: string
}

/** Status marker with a shape per status (■ on track, ▲ watch, ◆ alert), so status never relies on colour alone. */
export function StatusDot({ status, size = "md", className }: StatusDotProps) {
  const sizeClasses = {
    sm: "h-[7px] w-[7px]",
    md: "h-2 w-2",
    lg: "h-2.5 w-2.5",
  }

  const colorClasses = {
    "on-track": "bg-ok",
    watch: "bg-watch",
    alert: "bg-alert",
  }

  const shapes = {
    "on-track": undefined,
    watch: "polygon(50% 0, 100% 100%, 0 100%)",
    alert: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)",
  }

  return (
    <span
      className={cn("inline-block shrink-0", sizeClasses[size], colorClasses[status], className)}
      style={{ clipPath: shapes[status] }}
    />
  )
}

interface StatusBadgeProps {
  status: StatusType
  label?: string
  count?: number
  className?: string
}

export function StatusBadge({ status, label, count, className }: StatusBadgeProps) {
  const bgClasses = {
    "on-track": "bg-ok-soft text-ok",
    watch: "bg-watch-soft text-watch",
    alert: "bg-alert-soft text-alert",
  }

  const defaultLabels = {
    "on-track": "On track",
    watch: "Watch",
    alert: "Alert",
  }

  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center gap-1.5 rounded-[2px] px-2 text-xs font-medium",
        bgClasses[status],
        className
      )}
    >
      <StatusDot status={status} size="sm" />
      {count !== undefined ? `${count} ${label || defaultLabels[status].toLowerCase()}` : (label || defaultLabels[status])}
    </span>
  )
}
