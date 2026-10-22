"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  Check,
} from "lucide-react"

interface ReviewFile {
  id: string
  name: string
  company: string
  period: string
}

type RecordType = "P&L" | "Balance sheet" | "Cash flow" | "KPIs"

interface DataRecord {
  code: string
  metric: string
  type: RecordType
  calc: "Reported" | "Calculated"
  current: string
  previous: string
  delta: number // percentage
}

const records: DataRecord[] = [
  { code: "PL-100", metric: "Revenue (Total)", type: "P&L", calc: "Reported", current: "4,820", previous: "4,510", delta: 6.9 },
  { code: "PL-110", metric: "Revenue — Product", type: "P&L", calc: "Reported", current: "3,180", previous: "3,020", delta: 5.3 },
  { code: "PL-120", metric: "Revenue — Services", type: "P&L", calc: "Reported", current: "1,640", previous: "1,490", delta: 10.1 },
  { code: "PL-200", metric: "COGS", type: "P&L", calc: "Reported", current: "2,510", previous: "2,420", delta: 3.7 },
  { code: "PL-300", metric: "Gross profit", type: "P&L", calc: "Calculated", current: "2,310", previous: "2,090", delta: 10.5 },
  { code: "PL-400", metric: "EBITDA", type: "P&L", calc: "Reported", current: "915", previous: "812", delta: 12.7 },
  { code: "PL-410", metric: "Normalized EBITDA", type: "P&L", calc: "Reported", current: "964", previous: "868", delta: 11.1 },
  { code: "PL-500", metric: "EBIT", type: "P&L", calc: "Calculated", current: "688", previous: "612", delta: 12.4 },
  { code: "BS-100", metric: "Cash & equivalents", type: "Balance sheet", calc: "Reported", current: "1,240", previous: "1,090", delta: 13.8 },
  { code: "BS-200", metric: "Trade receivables", type: "Balance sheet", calc: "Reported", current: "2,010", previous: "1,640", delta: 22.6 },
  { code: "BS-300", metric: "Inventory", type: "Balance sheet", calc: "Reported", current: "1,420", previous: "1,380", delta: 2.9 },
  { code: "BS-400", metric: "Total debt", type: "Balance sheet", calc: "Reported", current: "6,200", previous: "6,450", delta: -3.9 },
  { code: "BS-410", metric: "Net Debt", type: "Balance sheet", calc: "Calculated", current: "4,960", previous: "5,360", delta: -7.5 },
  { code: "CF-100", metric: "Operating cash flow", type: "Cash flow", calc: "Reported", current: "742", previous: "690", delta: 7.5 },
  { code: "CF-200", metric: "Capex", type: "Cash flow", calc: "Reported", current: "-310", previous: "-180", delta: 72.2 },
  { code: "CF-300", metric: "Free cash flow", type: "Cash flow", calc: "Calculated", current: "432", previous: "510", delta: -15.3 },
  { code: "KPI-100", metric: "Gross margin %", type: "KPIs", calc: "Calculated", current: "47.9", previous: "46.3", delta: 3.5 },
  { code: "KPI-200", metric: "EBITDA margin %", type: "KPIs", calc: "Calculated", current: "19.0", previous: "18.0", delta: 5.6 },
  { code: "KPI-300", metric: "Headcount", type: "KPIs", calc: "Reported", current: "284", previous: "271", delta: 4.8 },
]

const recordCounts = {
  total: 72,
  pl: 22,
  bs: 28,
  cf: 14,
  kpis: 8,
}

const filterOptions: Array<"All" | RecordType> = ["All", "P&L", "Balance sheet", "Cash flow", "KPIs"]

function deltaColor(delta: number) {
  const abs = Math.abs(delta)
  if (abs > 15) return "text-alert"
  if (abs > 8) return "text-ai"
  return "text-ok"
}

function StatusBadge({ status }: { status: "Mapped" | "Verify" | "Not found" | "Pass" | "Fail" }) {
  const styles: Record<string, string> = {
    Mapped: "bg-brand-soft text-ok",
    Pass: "bg-brand-soft text-ok",
    Verify: "bg-ai-soft text-ai",
    "Not found": "bg-alert-soft text-alert",
    Fail: "bg-alert-soft text-alert",
  }
  return (
    <span className={cn("rounded px-2 py-0.5 text-[11px] font-medium", styles[status])}>
      {status}
    </span>
  )
}

interface MappingRow {
  field: string
  mappedTo: string
  value: string
  status: "Mapped" | "Verify" | "Not found"
}

const mappingRows: MappingRow[] = [
  { field: "Revenue (Total)", mappedTo: "Revenue", value: "4,820", status: "Mapped" },
  { field: "EBITDA", mappedTo: "EBITDA", value: "915", status: "Verify" },
  { field: "Normalized EBITDA", mappedTo: "EBITDA adj.", value: "964", status: "Mapped" },
  { field: "Net Debt", mappedTo: "Net Debt", value: "4,960", status: "Mapped" },
]

interface SumCheck {
  description: string
  detail: string
  status: "Pass" | "Verify" | "Fail"
}

const sumChecks: SumCheck[] = [
  {
    description: "Revenue total = sum of sub-lines",
    detail: "Jan 1,580 + Feb 1,610 + Mar 1,630 = 4,820 (matches reported total)",
    status: "Pass",
  },
  {
    description: "EBITDA margin within expected range",
    detail: "EBITDA margin 19.0% — within 5–45% range",
    status: "Pass",
  },
  {
    description: "Balance sheet check field present and filled",
    detail: "Total assets = Total liabilities + equity (12,840 = 12,840)",
    status: "Pass",
  },
  {
    description: "Cash flow check field present and filled",
    detail: "Closing cash field is empty — could not reconcile movement",
    status: "Verify",
  },
]

interface Anomaly {
  metric: string
  period: string
  from: string
  to: string
  delta: number
}

const anomalies: Anomaly[] = [
  { metric: "Capex", period: "Feb → Mar 2026", from: "-180", to: "-310", delta: 72.2 },
  { metric: "Trade receivables", period: "Feb → Mar 2026", from: "1,640", to: "2,010", delta: 22.6 },
  { metric: "Free cash flow", period: "Feb → Mar 2026", from: "510", to: "432", delta: -15.3 },
]

export function UploadReview({ file, onBack }: { file: ReviewFile; onBack: () => void }) {
  const [recordsExpanded, setRecordsExpanded] = useState(false)
  const [activeFilter, setActiveFilter] = useState<"All" | RecordType>("All")
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [editingNote, setEditingNote] = useState<number | null>(null)
  const [imported, setImported] = useState(false)
  const [showBanner, setShowBanner] = useState(false)

  const warnings = mappingRows.filter((m) => m.status !== "Mapped").length + sumChecks.filter((c) => c.status !== "Pass").length
  const checksPassed = mappingRows.filter((m) => m.status === "Mapped").length + sumChecks.filter((c) => c.status === "Pass").length

  const filteredRecords = activeFilter === "All" ? records : records.filter((r) => r.type === activeFilter)

  const currency = "EUR"

  return (
    <div className="flex min-h-screen flex-col font-sans">
      {/* Topbar */}
      <div className="border-b border-line px-6 py-4">
        <button
          onClick={onBack}
          className="mb-3 flex items-center gap-1.5 text-[12px] font-medium text-brand hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Upload Data
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-medium text-ink">{file.name}</h1>
            <p className="text-[13px] text-ink-2">
              {file.company} · {file.period} · {currency}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-md bg-ai-soft px-2.5 py-1 text-[12px] font-medium text-ai">
              <AlertTriangle className="h-3.5 w-3.5" />
              {warnings} warnings
            </span>
            <span className="flex items-center gap-1.5 rounded-md bg-brand-soft px-2.5 py-1 text-[12px] font-medium text-ok">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {checksPassed} checks passed
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        {showBanner && (
          <div className="mb-4 flex items-center gap-2 rounded-[10px] border border-ok/30 bg-brand-soft px-4 py-3 text-[13px] text-ok">
            <CheckCircle2 className="h-4 w-4" />
            Data imported — portfolio overview will update within 30 seconds.
          </div>
        )}

        <div className="rounded-[10px] border border-line bg-white">
          {/* SECTION 0 — Records loaded */}
          <div className="border-b border-line">
            <button
              onClick={() => setRecordsExpanded((v) => !v)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-semibold text-ink">{recordCounts.total}</span>
                <div>
                  <div className="text-[13px] text-ink">
                    records loaded · {file.company} · {file.period}
                  </div>
                  <div className="text-[11px] text-ink-2">
                    P&L {recordCounts.pl} · Balance sheet {recordCounts.bs} · Cash flow {recordCounts.cf} · KPIs {recordCounts.kpis}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-brand">
                Click to inspect
                {recordsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </div>
            </button>

            {recordsExpanded && (
              <div className="px-5 pb-5">
                {/* Filter bar */}
                <div className="mb-3 flex flex-wrap gap-2">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setActiveFilter(opt)}
                      className={cn(
                        "rounded-md px-3 py-1 text-[12px] font-medium transition-colors",
                        activeFilter === opt
                          ? "bg-brand text-white"
                          : "bg-bg text-ink-2 hover:bg-line"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {/* Table */}
                <div className="max-h-[280px] overflow-y-auto rounded-lg border border-line">
                  <table className="w-full border-collapse text-[12px]">
                    <thead className="sticky top-0 bg-bg">
                      <tr className="text-left text-[11px] uppercase tracking-wide text-ink-2">
                        <th className="px-3 py-2 font-medium">Code</th>
                        <th className="px-3 py-2 font-medium">Metric</th>
                        <th className="px-3 py-2 font-medium">Type</th>
                        <th className="px-3 py-2 text-right font-medium">Current</th>
                        <th className="px-3 py-2 text-right font-medium">Previous</th>
                        <th className="px-3 py-2 text-right font-medium">Δ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map((r) => (
                        <tr key={r.code} className="border-t border-line">
                          <td className="px-3 py-2 font-mono text-[11px] text-ink-2">{r.code}</td>
                          <td className="px-3 py-2 text-ink">{r.metric}</td>
                          <td className="px-3 py-2">
                            <span
                              className={cn(
                                "rounded px-1.5 py-0.5 text-[10px] font-medium",
                                r.calc === "Reported" ? "bg-brand-soft text-ok" : "bg-ai-soft text-ai-text"
                              )}
                            >
                              {r.calc}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-ink">{r.current}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-ink-2">{r.previous}</td>
                          <td className={cn("px-3 py-2 text-right tabular-nums font-medium", deltaColor(r.delta))}>
                            {r.delta > 0 ? "+" : ""}
                            {r.delta.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 1 — Mapping check */}
          <div className="border-b border-line px-5 py-4">
            <div className="mb-3 text-[11px] font-medium uppercase tracking-wide text-ink-2">
              1 · Mapping check
            </div>
            <div className="overflow-hidden rounded-lg border border-line">
              <table className="w-full border-collapse text-[12px]">
                <thead className="bg-bg">
                  <tr className="text-left text-[11px] uppercase tracking-wide text-ink-2">
                    <th className="px-3 py-2 font-medium">Field in file</th>
                    <th className="px-3 py-2 font-medium">Mapped to</th>
                    <th className="px-3 py-2 text-right font-medium">Latest value</th>
                    <th className="px-3 py-2 text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mappingRows.map((m) => (
                    <tr key={m.field} className="border-t border-line">
                      <td className="px-3 py-2.5 text-ink">{m.field}</td>
                      <td className="px-3 py-2.5 text-ink">{m.mappedTo}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-ink">{m.value}</td>
                      <td className="px-3 py-2.5 text-right">
                        <StatusBadge status={m.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 2 — Sum checks */}
          <div className="border-b border-line px-5 py-4">
            <div className="mb-3 text-[11px] font-medium uppercase tracking-wide text-ink-2">
              2 · Sum checks
            </div>
            <div className="divide-y divide-line rounded-lg border border-line">
              {sumChecks.map((c) => (
                <div key={c.description} className="flex items-center justify-between gap-4 px-3 py-3">
                  <div>
                    <div className="text-[12px] text-ink">{c.description}</div>
                    <div className="text-[11px] text-ink-2">{c.detail}</div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3 — Anomalies */}
          <div className="border-b border-line px-5 py-4">
            <div className="mb-3 text-[11px] font-medium uppercase tracking-wide text-ink-2">
              3 · Anomalies ( &gt;15% month-over-month )
            </div>
            <div className="overflow-hidden rounded-lg border border-line">
              <table className="w-full border-collapse text-[12px]">
                <thead className="bg-bg">
                  <tr className="text-left text-[11px] uppercase tracking-wide text-ink-2">
                    <th className="px-3 py-2 font-medium">Metric</th>
                    <th className="px-3 py-2 font-medium">Period</th>
                    <th className="px-3 py-2 text-right font-medium">From</th>
                    <th className="px-3 py-2 text-right font-medium">To</th>
                    <th className="px-3 py-2 text-right font-medium">Δ</th>
                    <th className="px-3 py-2 font-medium">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {anomalies.map((a, idx) => (
                    <tr key={a.metric} className="border-t border-line">
                      <td className="px-3 py-2.5 text-ink">{a.metric}</td>
                      <td className="px-3 py-2.5 text-ink-2">{a.period}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-ink-2">{a.from}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-ink">{a.to}</td>
                      <td
                        className={cn(
                          "px-3 py-2.5 text-right tabular-nums font-medium",
                          Math.abs(a.delta) > 25 ? "text-alert" : "text-ai"
                        )}
                      >
                        {a.delta > 0 ? "+" : ""}
                        {a.delta.toFixed(1)}%
                      </td>
                      <td className="px-3 py-2.5">
                        {notes[idx] !== undefined && editingNote !== idx ? (
                          <span className="flex items-center gap-1 text-[11px] text-ok">
                            <Check className="h-3 w-3" /> Noted
                          </span>
                        ) : editingNote === idx ? (
                          <input
                            autoFocus
                            defaultValue={notes[idx] ?? ""}
                            placeholder="Add a note…"
                            onBlur={(e) => {
                              setNotes((prev) => ({ ...prev, [idx]: e.target.value }))
                              setEditingNote(null)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                setNotes((prev) => ({ ...prev, [idx]: (e.target as HTMLInputElement).value }))
                                setEditingNote(null)
                              }
                            }}
                            className="w-40 rounded border border-brand px-2 py-1 text-[11px] outline-none"
                          />
                        ) : (
                          <button
                            onClick={() => setEditingNote(idx)}
                            className="flex items-center gap-1 rounded border border-dashed border-ai-soft px-2 py-1 text-[11px] text-ink-2 hover:border-brand hover:text-brand"
                          >
                            <Pencil className="h-3 w-3" /> Add note
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* APPROVE BAR */}
          <div className="sticky bottom-0 flex items-center justify-between gap-4 rounded-b-[10px] border-t border-line bg-white px-5 py-4">
            <span className="text-[12px] text-ink-2">
              Resolve warnings or add notes before importing
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="border-line text-ink" disabled={imported}>
                Flag for review
              </Button>
              <Button
                onClick={() => {
                  setImported(true)
                  setShowBanner(true)
                }}
                disabled={imported}
                className={cn(
                  imported
                    ? "bg-ok text-white hover:bg-ok"
                    : "bg-brand text-white hover:bg-action-hover"
                )}
              >
                {imported ? (
                  <span className="flex items-center gap-1.5">
                    <Check className="h-4 w-4" /> Imported
                  </span>
                ) : (
                  "Approve & import →"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
