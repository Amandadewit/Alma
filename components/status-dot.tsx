import { cn } from "@/lib/utils"
import type { StatusType } from "@/lib/mock-data"

interface StatusDotProps {
  status: StatusType
  size?: "sm" | "md" | "lg"
  className?: string
}

export function StatusDot({ status, size = "md", className }: StatusDotProps) {
  const sizeClasses = {
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-2.5 w-2.5",
  }

  const colorClasses = {
    "on-track": "bg-[#3B6D11]",
    watch: "bg-[#EF9F27]",
    alert: "bg-[#A32D2D]",
  }

  return (
    <span
      className={cn(
        "inline-block shrink-0 rounded-full",
        sizeClasses[size],
        colorClasses[status],
        className
      )}
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
    "on-track": "bg-[#EAF3DE] text-[#3B6D11]",
    watch: "bg-[#FAEEDA] text-[#854F0B]",
    alert: "bg-[#FCEBEB] text-[#A32D2D]",
  }

  const defaultLabels = {
    "on-track": "On track",
    watch: "Watch",
    alert: "Alert",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
        bgClasses[status],
        className
      )}
    >
      <StatusDot status={status} size="sm" />
      {count !== undefined ? `${count} ${label || defaultLabels[status].toLowerCase()}` : (label || defaultLabels[status])}
    </span>
  )
}
