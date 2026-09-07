import { cn } from "@/lib/utils"
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from "lucide-react"
import { portalSections } from "@/lib/portfolio-portal-config"
import type { SectionResult, CheckLevel } from "@/lib/portfolio-portal-validation"

function StatusIcon({ level, className }: { level: CheckLevel; className?: string }) {
  if (level === "error") return <XCircle className={cn("text-[#A32D2D]", className)} />
  if (level === "warning") return <AlertTriangle className={cn("text-[#854F0B]", className)} />
  return <CheckCircle2 className={cn("text-[#3B6D11]", className)} />
}

const levelLabel: Record<CheckLevel, string> = {
  ok: "All checks passed",
  warning: "Review warnings",
  error: "Action required",
}

export function PortalChecksPanel({
  results,
  warnings,
  hasErrors,
}: {
  results: Record<string, SectionResult>
  warnings: number
  hasErrors: boolean
}) {
  const overall: CheckLevel = hasErrors ? "error" : warnings > 0 ? "warning" : "ok"

  return (
    <div className="rounded-[10px] border border-[#E8E6E0] bg-white">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-[#E8E6E0] px-5 py-4">
        <ShieldCheck className="h-4 w-4 text-[#1B4D45]" />
        <div>
          <h2 className="text-[13px] font-semibold text-[#2C2C2A]">Checks &amp; Balances</h2>
          <p className="text-[11px] text-[#9A988F]">Live validation as you type</p>
        </div>
      </div>

      {/* Overall status */}
      <div
        className={cn(
          "mx-4 mt-4 flex items-center gap-2.5 rounded-lg px-3 py-2.5",
          overall === "error" && "bg-[#FCEBEB]",
          overall === "warning" && "bg-[#FAEEDA]",
          overall === "ok" && "bg-[#EAF3DE]",
        )}
      >
        <StatusIcon level={overall} className="h-4 w-4 shrink-0" />
        <span
          className={cn(
            "text-[12px] font-medium",
            overall === "error" && "text-[#A32D2D]",
            overall === "warning" && "text-[#854F0B]",
            overall === "ok" && "text-[#3B6D11]",
          )}
        >
          {levelLabel[overall]}
        </span>
      </div>

      {/* Per-section */}
      <div className="flex flex-col gap-1 p-4">
        {portalSections.map((section) => {
          const r = results[section.id]
          return (
            <div key={section.id} className="rounded-lg px-1 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusIcon level={r.level} className="h-4 w-4 shrink-0" />
                  <span className="text-[12px] font-medium text-[#2C2C2A]">{section.title}</span>
                </div>
                <span className="text-[11px] tabular-nums text-[#9A988F]">
                  {r.filled}/{r.total}
                </span>
              </div>
              {r.items.length > 0 && (
                <ul className="mt-1.5 flex flex-col gap-1 pl-6">
                  {r.items.map((item, idx) => (
                    <li
                      key={idx}
                      className={cn(
                        "text-[11px] leading-snug",
                        item.level === "error" && "text-[#A32D2D]",
                        item.level === "warning" && "text-[#854F0B]",
                      )}
                    >
                      {item.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
