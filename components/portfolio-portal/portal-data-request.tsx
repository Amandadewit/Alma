"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ArrowLeft, Send, CheckCircle2, Plus, TrendingUp, Leaf, Target, Wallet, FileText } from "lucide-react"
import { portfolioReportingStatus } from "@/lib/portfolio-portal-config"

const cadences = ["Monthly", "Quarterly", "Annual", "One-off"] as const
const formats = ["Excel / CSV", "PDF", "Free-form note", "File upload"] as const

/** Standard, pre-configured reports the fund can request in one click. */
const standardReports = [
  {
    id: "performance",
    title: "Performance Sheet",
    icon: TrendingUp,
    description: "P&L, balance sheet, cash flow and operating KPIs.",
    defaultCadence: "Monthly" as (typeof cadences)[number],
    format: "Excel / CSV" as (typeof formats)[number],
  },
  {
    id: "esg",
    title: "ESG Questionnaire",
    icon: Leaf,
    description: "SFDR PAI-aligned environmental, social & governance metrics.",
    defaultCadence: "Annual" as (typeof cadences)[number],
    format: "Excel / CSV" as (typeof formats)[number],
  },
  {
    id: "budget",
    title: "Budget Performance Sheet",
    icon: Target,
    description: "Full-year budget: monthly P&L, cash flow and headcount plan.",
    defaultCadence: "Annual" as (typeof cadences)[number],
    format: "Excel / CSV" as (typeof formats)[number],
  },
  {
    id: "working-capital",
    title: "Working Capital Bridge",
    icon: Wallet,
    description: "Movement in receivables, payables and inventory.",
    defaultCadence: "Quarterly" as (typeof cadences)[number],
    format: "Excel / CSV" as (typeof formats)[number],
  },
  {
    id: "audited-accounts",
    title: "Audited Annual Accounts",
    icon: FileText,
    description: "Signed statutory financial statements incl. auditor's report.",
    defaultCadence: "Annual" as (typeof cadences)[number],
    format: "PDF" as (typeof formats)[number],
  },
] as const

export function PortalDataRequest({ onBack }: { onBack: () => void }) {
  const companies = portfolioReportingStatus.map((c) => c.company)

  const [selectedReport, setSelectedReport] = useState<string>("custom")
  const [title, setTitle] = useState("")
  const [cadence, setCadence] = useState<(typeof cadences)[number]>("Monthly")
  const [format, setFormat] = useState<(typeof formats)[number]>("Excel / CSV")
  const [deadline, setDeadline] = useState("")
  const [instructions, setInstructions] = useState("")
  const [recipients, setRecipients] = useState<string[]>([companies[0]])
  const [sent, setSent] = useState(false)

  const selectReport = (id: string) => {
    setSelectedReport(id)
    if (id === "custom") {
      setTitle("")
      return
    }
    const report = standardReports.find((r) => r.id === id)
    if (report) {
      setTitle(report.title)
      setCadence(report.defaultCadence)
      setFormat(report.format)
    }
  }

  const toggleRecipient = (company: string) =>
    setRecipients((prev) =>
      prev.includes(company) ? prev.filter((c) => c !== company) : [...prev, company],
    )

  const allSelected = recipients.length === companies.length
  const canSend = title.trim() && deadline && recipients.length > 0

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-6 font-sans">
        <div className="w-full max-w-md rounded-[14px] border border-line bg-white p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ok-soft">
            <CheckCircle2 className="h-7 w-7 text-ok" />
          </div>
          <h2 className="mt-5 text-[18px] font-semibold text-ink">Data request sent</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
            &ldquo;{title}&rdquo; has been sent to {recipients.length}{" "}
            {recipients.length === 1 ? "company" : "companies"}. They&apos;ll see it as an outstanding
            reporting in their Portfolio Portal.
          </p>
          <button
            onClick={onBack}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-action-hover"
          >
            Back to administration
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg font-sans">
      <header className="border-b border-line bg-white px-8 py-5">
        <button
          onClick={onBack}
          className="mb-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-2 transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to administration
        </button>
        <h1 className="text-[18px] font-semibold text-ink">Create data request</h1>
        <p className="text-[13px] text-ink-2">Ask portfolio companies for an ad-hoc or recurring data submission</p>
      </header>

      <main className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-8 py-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="rounded-[10px] border border-line bg-white p-6">
            {/* Standard reports */}
            <span className="text-[13px] font-medium text-ink">Standard reports</span>
            <p className="text-[12px] text-ink-2">Pick a pre-configured report or build a custom one.</p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {standardReports.map((report) => {
                const Icon = report.icon
                const active = selectedReport === report.id
                return (
                  <button
                    key={report.id}
                    onClick={() => selectReport(report.id)}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                      active
                        ? "border-brand/40 bg-brand-soft"
                        : "border-line bg-white hover:bg-bg",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        active ? "bg-brand text-white" : "bg-surface-2 text-brand",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-medium text-ink">{report.title}</span>
                        <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-ink-2">
                          {report.defaultCadence}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] leading-snug text-ink-2">{report.description}</p>
                    </div>
                  </button>
                )
              })}
              <button
                onClick={() => selectReport("custom")}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                  selectedReport === "custom"
                    ? "border-brand/40 bg-brand-soft"
                    : "border-dashed border-line-strong bg-white hover:bg-bg",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    selectedReport === "custom" ? "bg-brand text-white" : "bg-surface-2 text-brand",
                  )}
                >
                  <Plus className="h-4 w-4" />
                </div>
                <span className="text-[13px] font-medium text-ink">Custom request</span>
              </button>
            </div>

            <div className="my-5 h-px bg-line" />

            <label className="block">
              <span className="text-[13px] font-medium text-ink">Request title</span>
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  setSelectedReport("custom")
                }}
                placeholder="e.g. Q2 working capital bridge"
                className="mt-1.5 w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] text-ink outline-none transition-colors focus:border-brand"
              />
            </label>

            {/* Frequency */}
            <div className="mt-4">
              <span className="text-[13px] font-medium text-ink">Frequency</span>
              <div className="mt-1.5 inline-flex rounded-lg border border-line bg-bg p-1">
                {cadences.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCadence(c)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
                      cadence === c ? "bg-white text-brand shadow-sm" : "text-ink-2 hover:text-ink",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <label className="mt-4 block">
              <span className="text-[13px] font-medium text-ink">Expected format</span>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as (typeof formats)[number])}
                className="mt-1.5 w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-brand"
              >
                {formats.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </label>

            <label className="mt-4 block">
              <span className="text-[13px] font-medium text-ink">
                {cadence === "One-off" ? "Deadline" : "First deadline"}
              </span>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] text-ink outline-none transition-colors focus:border-brand"
              />
              {cadence !== "One-off" && (
                <span className="mt-1 block text-[11px] text-ink-3">
                  Recurs {cadence.toLowerCase()} — a new submission is requested each period from this date.
                </span>
              )}
            </label>

            <label className="mt-4 block">
              <span className="text-[13px] font-medium text-ink">Instructions</span>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
                placeholder="Describe exactly what you need and any definitions the CFO should follow…"
                className="mt-1.5 w-full resize-none rounded-lg border border-line bg-white px-3 py-2 text-[13px] leading-relaxed text-ink outline-none transition-colors focus:border-brand"
              />
            </label>
          </div>
        </div>

        {/* Recipients */}
        <div>
          <div className="rounded-[10px] border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-ink">Recipients</h2>
              <button
                onClick={() => setRecipients(allSelected ? [] : [...companies])}
                className="text-[12px] font-medium text-brand hover:underline"
              >
                {allSelected ? "Clear all" : "Select all"}
              </button>
            </div>
            <div className="mt-3 flex flex-col gap-1.5">
              {companies.map((company) => {
                const checked = recipients.includes(company)
                return (
                  <button
                    key={company}
                    onClick={() => toggleRecipient(company)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-3 py-2 text-left text-[13px] transition-colors",
                      checked
                        ? "border-brand/30 bg-brand-soft text-brand"
                        : "border-line bg-white text-ink-2 hover:bg-bg",
                    )}
                  >
                    <span className="font-medium">{company}</span>
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border",
                        checked ? "border-brand bg-brand text-white" : "border-line-strong text-transparent",
                      )}
                    >
                      {checked ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Plus className="h-3 w-3" />}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <button
            disabled={!canSend}
            onClick={() => setSent(true)}
            className={cn(
              "mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium transition-colors",
              canSend
                ? "bg-brand text-white hover:bg-action-hover"
                : "cursor-not-allowed bg-line text-ink-3",
            )}
          >
            <Send className="h-4 w-4" />
            Send request to {recipients.length || 0}{" "}
            {recipients.length === 1 ? "company" : "companies"}
          </button>
        </div>
      </main>
    </div>
  )
}
