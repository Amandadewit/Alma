"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  Users,
  BookOpen,
  FilePlus2,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Circle,
  LayoutGrid,
} from "lucide-react"
import { PortalAccessRights } from "@/components/portfolio-portal/portal-access-rights"
import { PortalDataRequest } from "@/components/portfolio-portal/portal-data-request"
import {
  submissionPeriod,
  portfolioReportingStatus,
  type CompanyReportingState,
} from "@/lib/portfolio-portal-config"

type AdminView = "hub" | "access" | "request"

const stateMeta: Record<
  CompanyReportingState,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  complete: { label: "Complete", className: "bg-[#EAF3DE] text-[#3B6D11]", icon: CheckCircle2 },
  "in-progress": { label: "In progress", className: "bg-[#EAF1EF] text-[#1B4D45]", icon: Clock },
  overdue: { label: "Overdue", className: "bg-[#FBEAEA] text-[#A32D2D]", icon: AlertTriangle },
  "not-started": { label: "Not started", className: "bg-[#F2F1ED] text-[#6B6963]", icon: Circle },
}

export default function PortfolioPortalAdminPage() {
  const [view, setView] = useState<AdminView>("hub")

  if (view === "access") return <PortalAccessRights onBack={() => setView("hub")} />
  if (view === "request") return <PortalDataRequest onBack={() => setView("hub")} />

  const total = portfolioReportingStatus.length
  const complete = portfolioReportingStatus.filter((c) => c.state === "complete").length
  const overdue = portfolioReportingStatus.filter((c) => c.state === "overdue").length
  const outstanding = portfolioReportingStatus.reduce((sum, c) => sum + (c.required - c.submitted), 0)

  return (
    <div className="min-h-screen bg-[#F7F6F3] font-sans">
      {/* Header */}
      <header className="border-b border-[#E8E6E0] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1B4D45]">
              <span className="text-sm font-semibold text-[#B8975A]">A</span>
            </div>
            <div>
              <h1 className="text-[16px] font-semibold text-[#2C2C2A]">Portfolio Portal · Administration</h1>
              <p className="text-[12px] text-[#6B6963]">Alma Capital Fund IV · Manage reporting across the portfolio</p>
            </div>
          </div>
          <div className="rounded-lg bg-[#F2F1ED] px-3 py-1.5">
            <span className="text-[11px] text-[#9A988F]">Period</span>{" "}
            <span className="text-[13px] font-semibold text-[#1B4D45]">{submissionPeriod}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-8 py-6">
        {/* Primary action */}
        <Link
          href="/data-entry/lp-reporting/portfolio-portal/company"
          className="flex items-center justify-between gap-4 rounded-[12px] bg-gradient-to-br from-[#1B4D45] to-[#123B34] px-6 py-5 transition-transform hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
              <ExternalLink className="h-5 w-5 text-[#D9B978]" />
            </div>
            <div>
              <div className="text-[15px] font-semibold text-white">View Portfolio Portal</div>
              <div className="text-[13px] text-white/70">Open the portal exactly as a portfolio-company CFO sees it</div>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-white/80" />
        </Link>

        {/* Management actions */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button
            onClick={() => setView("access")}
            className="group flex flex-col items-start rounded-[10px] border border-[#E8E6E0] bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-[#1B4D45]/30 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF1EF]">
              <Users className="h-5 w-5 text-[#1B4D45]" />
            </div>
            <h3 className="mt-3 text-[14px] font-semibold text-[#2C2C2A]">Access rights</h3>
            <p className="mt-1 flex-1 text-[12px] leading-relaxed text-[#6B6963]">
              Invite CFOs, assign roles, and control who can submit data.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-[#1B4D45]">
              Administrate <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>

          <Link
            href="/data-entry/lp-reporting/portfolio-portal/playbook"
            className="group flex flex-col items-start rounded-[10px] border border-[#E8E6E0] bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-[#1B4D45]/30 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF1EF]">
              <BookOpen className="h-5 w-5 text-[#1B4D45]" />
            </div>
            <h3 className="mt-3 text-[14px] font-semibold text-[#2C2C2A]">Reporting playbook</h3>
            <p className="mt-1 flex-1 text-[12px] leading-relaxed text-[#6B6963]">
              Maintain definitions, deadlines, and the Reporting Playbook chapters.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-[#1B4D45]">
              Maintain <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

          <button
            onClick={() => setView("request")}
            className="group flex flex-col items-start rounded-[10px] border border-[#E8E6E0] bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-[#1B4D45]/30 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF1EF]">
              <FilePlus2 className="h-5 w-5 text-[#1B4D45]" />
            </div>
            <h3 className="mt-3 text-[14px] font-semibold text-[#2C2C2A]">Data request</h3>
            <p className="mt-1 flex-1 text-[12px] leading-relaxed text-[#6B6963]">
              Ask companies for an ad-hoc or recurring data submission.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-[#1B4D45]">
              Create <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>
        </div>

        {/* Portfolio status */}
        <div className="mt-8">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-[#6B6963]" />
            <h2 className="text-[14px] font-semibold text-[#2C2C2A]">Reporting status across the portfolio</h2>
          </div>

          {/* Summary stats */}
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Companies" value={`${total}`} />
            <StatCard label="Complete" value={`${complete}/${total}`} tone="green" />
            <StatCard label="Outstanding reports" value={`${outstanding}`} tone="amber" />
            <StatCard label="Overdue" value={`${overdue}`} tone={overdue > 0 ? "red" : "default"} />
          </div>

          {/* Table */}
          <div className="mt-4 overflow-hidden rounded-[10px] border border-[#E8E6E0] bg-white">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E8E6E0] bg-[#FAFAF8] text-[11px] uppercase tracking-wide text-[#9A988F]">
                  <th className="px-5 py-3 font-medium">Company</th>
                  <th className="px-5 py-3 font-medium">CFO</th>
                  <th className="px-5 py-3 font-medium">Progress</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Last upload</th>
                  <th className="px-5 py-3 font-medium">Next deadline</th>
                </tr>
              </thead>
              <tbody>
                {portfolioReportingStatus.map((c) => {
                  const meta = stateMeta[c.state]
                  const Icon = meta.icon
                  const pct = Math.round((c.submitted / c.required) * 100)
                  return (
                    <tr key={c.company} className="border-b border-[#F0EEE9] last:border-0">
                      <td className="px-5 py-3 text-[13px] font-medium text-[#2C2C2A]">{c.company}</td>
                      <td className="px-5 py-3 text-[13px] text-[#6B6963]">{c.cfo}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#F0EEE9]">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                c.state === "overdue" ? "bg-[#A32D2D]" : "bg-[#1B4D45]",
                              )}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[11px] tabular-nums text-[#9A988F]">
                            {c.submitted}/{c.required}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                            meta.className,
                          )}
                        >
                          <Icon className="h-3 w-3" />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[12px] text-[#6B6963]">{c.lastUpload}</td>
                      <td className="px-5 py-3 text-[12px] text-[#6B6963]">{c.nextDeadline}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: string
  tone?: "default" | "green" | "amber" | "red"
}) {
  const toneClass = {
    default: "text-[#2C2C2A]",
    green: "text-[#3B6D11]",
    amber: "text-[#854F0B]",
    red: "text-[#A32D2D]",
  }[tone]
  return (
    <div className="rounded-[10px] border border-[#E8E6E0] bg-white px-4 py-3">
      <div className={cn("text-[20px] font-semibold tabular-nums", toneClass)}>{value}</div>
      <div className="text-[11px] text-[#9A988F]">{label}</div>
    </div>
  )
}
