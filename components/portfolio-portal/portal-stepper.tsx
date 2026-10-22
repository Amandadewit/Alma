import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const steps = ["Reporting Playbook", "Data Submission", "Verification", "Confirmed"] as const

export function PortalStepper({ current }: { current: number }) {
  return (
    <nav aria-label="Submission progress" className="flex items-center">
      {steps.map((label, i) => {
        const isDone = i < current
        const isActive = i === current
        return (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold transition-colors",
                  isDone && "bg-brand text-white",
                  isActive && "bg-brand text-white ring-4 ring-brand/12",
                  !isDone && !isActive && "bg-line text-ink-3",
                )}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={cn(
                  "hidden text-[13px] font-medium sm:inline",
                  isDone && "text-ink",
                  isActive && "text-brand",
                  !isDone && !isActive && "text-ink-3",
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "mx-3 h-px w-8 lg:w-14",
                  i < current ? "bg-brand" : "bg-line",
                )}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
