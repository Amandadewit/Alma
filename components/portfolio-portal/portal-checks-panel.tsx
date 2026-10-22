import { cn } from "@/lib/utils"
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from "lucide-react"
import { portalSections } from "@/lib/portfolio-portal-config"
import type { SectionResult, CheckLevel } from "@/lib/portfolio-portal-validation"

function StatusIcon({ level, className }: { level: CheckLevel; className?: string }) {
  if (level === "error") return <XCircle className={cn("text-alert", className)} />
  if (level === "warning") return <AlertTriangle className={cn("text-watch", className)} />
  return <CheckCircle2 className={cn("text-ok", className)} />
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
    <div className="rounded-[10px] border border-line bg-white">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
        <ShieldCheck className="h-4 w-4 text-brand" />
        <div>
          <h2 className="text-[13px] font-semibold text-ink">Checks &amp; Balances</h2>
          <p className="text-[11px] text-ink-3">Live validation as you type</p>
        </div>
      </div>

      {/* Overall status */}
      <div
        className={cn(
          "mx-4 mt-4 flex items-center gap-2.5 rounded-lg px-3 py-2.5",
          overall === "error" && "bg-alert-soft",
          overall === "warning" && "bg-watch-soft",
          overall === "ok" && "bg-ok-soft",
        )}
      >
        <StatusIcon level={overall} className="h-4 w-4 shrink-0" />
        <span
          className={cn(
            "text-[12px] font-medium",
            overall === "error" && "text-alert",
            overall === "warning" && "text-watch",
            overall === "ok" && "text-ok",
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
                  <span className="text-[12px] font-medium text-ink">{section.title}</span>
                </div>
                <span className="text-[11px] tabular-nums text-ink-3">
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
                        item.level === "error" && "text-alert",
                        item.level === "warning" && "text-watch",
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
