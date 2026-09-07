"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Building2,
  LayoutDashboard,
  TrendingUp,
  Target,
  Leaf,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Upload,
  Download,
} from "lucide-react"
import { PortalReportUpload } from "@/components/portfolio-portal/portal-report-upload"
import { PortalConfirmation } from "@/components/portfolio-portal/portal-confirmation"
import { submissionPeriod, pendingReports, type PendingReport } from "@/lib/portfolio-portal-config"

const COMPANY = "FreshBox Logistics"

const kindIcon = {
  performance: TrendingUp,
  budget: Target,
  esg: Leaf,
}

function DeadlinePill({ report }: { report: PendingReport }) {
  if (report.status === "overdue") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FBEAEA] px-3 py-1 text-[11px] font-medium text-[#A32D2D]">
        <AlertTriangle className="h-3 w-3" />
        {Math.abs(report.daysLeft)} days overdue
      </span>
    )
  }
  const urgent = report.daysLeft <= 7
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium",
        urgent ? "bg-[#FBF1E3] text-[#854F0B]" : "bg-[#EAF1EF] text-[#1B4D45]",
      )}
    >
      <Clock className="h-3 w-3" />
      Due in {report.daysLeft} days
    </span>
  )
}

export default function PortfolioPortalPage() {
  const [activeReport, setActiveReport] = useState<PendingReport | null>(null)
  const [submitted, setSubmitted] = useState<PendingReport | null>(null)
  const [submittedAt, setSubmittedAt] = useState("")
  const [completed, setCompleted] = useState<string[]>([])

  const downloadTemplate = (report: PendingReport) => {
    // Mock template download — generates a small CSV placeholder so the browser
    // actually saves a file named after the report's template.
    const header = `${COMPANY} — ${report.title} template (${report.cadence})`
    const blob = new Blob([`${header}\nMetric,Value,Notes\n`], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = report.template
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSubmit = () => {
    if (!activeReport) return
    const now = new Date()
    setSubmittedAt(
      now.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    )
    setCompleted((prev) => [...prev, activeReport.id])
    setSubmitted(activeReport)
    setActiveReport(null)
  }

  // Confirmation state
  if (submitted) {
    return (
      <PortalConfirmation
        company={COMPANY}
        timestamp={submittedAt}
        reference={`ALM-${submitted.id.toUpperCase().slice(0, 10)}-014`}
      />
    )
  }

  // Upload / submit detail view
  if (activeReport) {
    return (
      <PortalReportUpload
        report={activeReport}
        onBack={() => setActiveReport(null)}
        onSubmit={handleSubmit}
      />
    )
  }

  const openReports = pendingReports.filter((r) => !completed.includes(r.id))
  const doneReports = pendingReports.filter((r) => completed.includes(r.id))
  const monthlyOpen = openReports.filter((r) => r.group === "monthly")
  const annualOpen = openReports.filter((r) => r.group === "annual")

  const renderCard = (report: PendingReport) => {
    const Icon = kindIcon[report.kind]
    return (
      <div
        key={report.id}
        className="group flex items-center gap-4 rounded-[10px] border border-[#E8E6E0] bg-white p-5 transition-all hover:border-[#1B4D45]/30 hover:shadow-sm"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#F2F1ED] group-hover:bg-[#EAF1EF]">
          <Icon className="h-5 w-5 text-[#1B4D45]" />
        </div>
        <button onClick={() => setActiveReport(report)} className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-medium text-[#2C2C2A]">{report.title}</span>
          </div>
          <p className="mt-0.5 text-[12px] text-[#6B6963]">{report.description}</p>
          <p className="mt-1 text-[11px] text-[#9A988F]">
            {report.cadence} · Deadline {report.deadline}
          </p>
        </button>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <DeadlinePill report={report} />
          <div className="flex items-center gap-3">
            {report.template && (
              <button
                onClick={() => downloadTemplate(report)}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#6B6963] transition-colors hover:text-[#1B4D45]"
              >
                <Download className="h-3.5 w-3.5" />
                Template
              </button>
            )}
            <button
              onClick={() => setActiveReport(report)}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#1B4D45]"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload &amp; submit
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen font-sans">
      {/* Admin preview bar */}
      <div className="flex items-center justify-between gap-3 bg-[#123B34] px-8 py-2">
        <span className="text-[12px] text-white/70">
          Previewing the CFO experience for <span className="font-medium text-white">{COMPANY}</span>
        </span>
        <Link
          href="/data-entry/lp-reporting/portfolio-portal"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/80 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to administration
        </Link>
      </div>

      {/* Header */}
      <header className="border-b border-[#E8E6E0] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1B4D45]">
              <span className="text-sm font-semibold text-[#B8975A]">A</span>
            </div>
            <div>
              <h1 className="text-[16px] font-semibold text-[#2C2C2A]">Portfolio Portal</h1>
              <p className="text-[12px] text-[#6B6963]">Alma Capital Fund IV · Monthly reporting</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="hidden items-center gap-2 sm:flex">
              <Building2 className="h-4 w-4 text-[#9A988F]" />
              <span className="text-[13px] font-medium text-[#2C2C2A]">{COMPANY}</span>
            </div>
            <div className="rounded-lg bg-[#F2F1ED] px-3 py-1.5">
              <span className="text-[11px] text-[#9A988F]">Period</span>{" "}
              <span className="text-[13px] font-semibold text-[#1B4D45]">{submissionPeriod}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-8 py-6">
        {/* Top actions: Playbook + Dashboard */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/data-entry/lp-reporting/portfolio-portal/playbook"
            className="flex items-center justify-between rounded-[10px] border border-[#1B4D45]/20 bg-[#EAF1EF] px-5 py-4 transition-colors hover:bg-[#E0EBE8]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1B4D45]">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[#1B4D45]">View Reporting Playbook</div>
                <div className="text-[12px] text-[#6B6963]">Definitions, deadlines, and guidance</div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-[#1B4D45]" />
          </Link>

          <Link
            href="/portfolio?view=cfo"
            className="flex items-center justify-between rounded-[10px] border border-[#E8E6E0] bg-white px-5 py-4 transition-colors hover:bg-[#F7F6F3]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#B8975A]">
                <LayoutDashboard className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[#2C2C2A]">View Dashboard</div>
                <div className="text-[12px] text-[#6B6963]">See your data as Alma Capital sees it</div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-[#6B6963]" />
          </Link>
        </div>

        {/* Pending reportings */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-[#2C2C2A]">Pending reportings</h2>
            <span className="text-[12px] text-[#6B6963]">
              {openReports.length} due · {doneReports.length} submitted
            </span>
          </div>

          {monthlyOpen.length > 0 && (
            <div className="mt-4">
              <h3 className="text-[12px] font-medium uppercase tracking-wide text-[#9A988F]">Monthly</h3>
              <div className="mt-2 flex flex-col gap-3">{monthlyOpen.map(renderCard)}</div>
            </div>
          )}

          {annualOpen.length > 0 && (
            <div className="mt-6">
              <h3 className="text-[12px] font-medium uppercase tracking-wide text-[#9A988F]">Annual</h3>
              <div className="mt-2 flex flex-col gap-3">{annualOpen.map(renderCard)}</div>
            </div>
          )}

          {/* Submitted this period */}
          {doneReports.length > 0 && (
            <div className="mt-6">
              <h3 className="text-[12px] font-medium uppercase tracking-wide text-[#9A988F]">Submitted this period</h3>
              <div className="mt-2 flex flex-col gap-2">
                {doneReports.map((report) => {
                  const Icon = kindIcon[report.kind]
                  return (
                    <div
                      key={report.id}
                      className="flex items-center gap-4 rounded-[10px] border border-[#E8E6E0] bg-[#FAFAF8] p-4"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
                        <Icon className="h-4 w-4 text-[#9A988F]" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[13px] font-medium text-[#2C2C2A]">{report.title}</span>
                        <span className="ml-2 text-[11px] text-[#9A988F]">{report.cadence}</span>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF3DE] px-3 py-1 text-[11px] font-medium text-[#3B6D11]">
                        <CheckCircle2 className="h-3 w-3" />
                        Submitted
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
