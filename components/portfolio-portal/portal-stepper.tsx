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
                  isDone && "bg-[#1B4D45] text-white",
                  isActive && "bg-[#1B4D45] text-white ring-4 ring-[#1B4D45]/12",
                  !isDone && !isActive && "bg-[#E8E6E0] text-[#9A988F]",
                )}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={cn(
                  "hidden text-[13px] font-medium sm:inline",
                  isDone && "text-[#2C2C2A]",
                  isActive && "text-[#1B4D45]",
                  !isDone && !isActive && "text-[#9A988F]",
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "mx-3 h-px w-8 lg:w-14",
                  i < current ? "bg-[#1B4D45]" : "bg-[#E8E6E0]",
                )}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
