"use client"

import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { companies, funds } from "@/lib/mock-data"
import { Download, Search } from "lucide-react"

type Section = "metrics" | "cashflows" | "capital-calls"

const SECTIONS: { id: Section; label: string; title: string; subtitle: string }[] = [
  { id: "metrics", label: "Metrics", title: "Metrics", subtitle: "Raw metric data" },
  { id: "cashflows", label: "Cashflows", title: "Cashflows", subtitle: "Investments, distributions and fund-level cash movements" },
  { id: "capital-calls", label: "Capital calls", title: "Capital calls", subtitle: "Drawdown notices per fund and their payment status" },
]

// Deterministic pseudo-random (so server and client render the same demo data)
function hash(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967296
}

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
const fmtNum = (n: number, dec = 0) =>
  n.toLocaleString("en-GB", { minimumFractionDigits: dec, maximumFractionDigits: dec })

/* ------------------------------------------------------------------ Metrics */

const METRIC_TYPES = [
  { code: "1000000", name: "Revenue (Total)", level: "Level 1", pct: false },
  { code: "1001020", name: "Recurring revenue - own IP", level: "Level 2", pct: false },
  { code: "1010000", name: "Cost of goods sold (COGS)", level: "Level 2", pct: false },
  { code: "1100000", name: "Gross profit", level: "Level 1", pct: false },
  { code: "1100010", name: "Gross profit margin %", level: "Level 2", pct: true },
  { code: "1200000", name: "Operating expenses", level: "Level 1", pct: false },
  { code: "1250000", name: "EBITDA", level: "Level 1", pct: false },
  { code: "1250010", name: "EBITDA margin %", level: "Level 2", pct: true },
  { code: "1300000", name: "Depreciation", level: "Level 2", pct: false },
  { code: "1350000", name: "EBIT", level: "Level 1", pct: false },
  { code: "1450000", name: "Net income", level: "Level 1", pct: false },
  { code: "2000000", name: "Total assets", level: "Level 1", pct: false },
  { code: "3000000", name: "Total liabilities", level: "Level 1", pct: false },
  { code: "3200000", name: "Long-term debt", level: "Level 2", pct: false },
  { code: "4000000", name: "Net debt", level: "Level 1", pct: false },
  { code: "5000000", name: "Free cash flow", level: "Level 1", pct: false },
]
const DIMENSIONS = ["Actual", "Budget", "Forecast", "LY"]
const YEARS = [2025, 2024, 2023, 2022, 2021]
const PERIOD_TYPES = ["Year", "Quarter"] as const

type MetricRow = {
  id: string
  company: string
  code: string
  metric: string
  level: string
  periodEnd: string
  year: number
  periodType: string
  dimension: string
  value: string
  currency: string
  version: number
}

function buildMetrics(): MetricRow[] {
  const rows: MetricRow[] = []
  for (const c of companies) {
    const scale = 5 + hash(c.id) * 60 // company size, EUR m
    for (const y of YEARS) {
      const periods: { end: Date; type: string }[] = [
        { end: new Date(y, 11, 31), type: "Year" },
        ...[2, 5, 8, 11].map((m) => ({ end: new Date(y, m + 1, 0), type: "Quarter" })),
      ]
      for (const p of periods) {
        for (const m of METRIC_TYPES) {
          for (const dim of DIMENSIONS) {
            const seed = `${c.id}|${m.code}|${p.end.getTime()}|${dim}`
            const r = hash(seed)
            const frac = p.type === "Year" ? 1 : 0.25
            const growth = 1 + (y - 2021) * 0.08
            const dimAdj = dim === "Budget" ? 1.03 : dim === "Forecast" ? 1.01 : dim === "LY" ? 0.93 : 1
            let value: string
            if (m.pct) value = fmtNum((8 + r * 40) * dimAdj, 1) + " %"
            else {
              const base = m.code === "1000000" || m.code === "2000000" || m.code === "3000000" ? 1 : 0.28 + r * 0.2
              const sign = m.code === "1010000" || m.code === "1200000" || m.code === "1300000" ? -1 : 1
              value = fmtNum(sign * scale * 1000 * base * frac * growth * dimAdj * (0.9 + r * 0.2))
            }
            rows.push({
              id: seed,
              company: c.name,
              code: m.code,
              metric: m.name,
              level: m.level,
              periodEnd: fmtDate(p.end),
              year: y,
              periodType: p.type,
              dimension: dim,
              value,
              currency: "EUR",
              version: 1 + Math.floor(r * 3 * (dim === "Actual" ? 1 : 0.3)),
            })
          }
        }
      }
    }
  }
  return rows
}

/* ---------------------------------------------------------------- Cashflows */

const CF_TYPES = ["Investment", "Follow-on investment", "Dividend", "Interest received", "Loan repayment", "Exit proceeds", "Management fee"]

type CashflowRow = {
  id: string
  fund: string
  company: string
  date: Date
  type: string
  amount: number
  currency: string
}

function buildCashflows(): CashflowRow[] {
  const rows: CashflowRow[] = []
  for (const c of companies) {
    const fund = funds.find((f) => f.id === c.fundId)?.name ?? "-"
    const [mm, yy] = c.entryDate.split("-").map(Number)
    const entry = new Date(yy, mm - 1, 15)
    const inv = 4000 + hash(c.id + "inv") * 14000 // EUR k
    rows.push({ id: `${c.id}-0`, fund, company: c.name, date: entry, type: "Investment", amount: -Math.round(inv), currency: "EUR" })
    const follow = new Date(entry.getFullYear() + 2, entry.getMonth(), 15)
    if (follow < new Date(2026, 6, 1) && hash(c.id + "fo") > 0.45)
      rows.push({ id: `${c.id}-1`, fund, company: c.name, date: follow, type: "Follow-on investment", amount: -Math.round(inv * 0.25), currency: "EUR" })
    for (let k = 1; k <= 6; k++) {
      const d = new Date(entry.getFullYear() + Math.floor((k + 1) / 2), entry.getMonth() + (k % 2) * 6, 28)
      if (d > new Date(2026, 6, 1)) break
      const t = k % 3 === 0 ? "Dividend" : k % 3 === 1 ? "Interest received" : "Loan repayment"
      rows.push({ id: `${c.id}-d${k}`, fund, company: c.name, date: d, type: t, amount: Math.round(inv * (0.03 + hash(c.id + k) * 0.08)), currency: "EUR" })
    }
    if (c.status && String(c.status) !== "") {
      // companies that have been exited get exit proceeds
      const exited = hash(c.id + "ex") > 0.82
      if (exited)
        rows.push({ id: `${c.id}-x`, fund, company: c.name, date: new Date(2025, 8, 30), type: "Exit proceeds", amount: Math.round(inv * (1.6 + hash(c.id + "m") * 1.6)), currency: "EUR" })
    }
  }
  for (const f of funds) {
    for (let y = f.vintageYear; y <= 2026; y++)
      for (const q of [2, 5, 8, 11]) {
        const d = new Date(y, q, 30)
        if (d > new Date(2026, 6, 1)) break
        rows.push({ id: `${f.id}-fee-${y}-${q}`, fund: f.name, company: "-", date: d, type: "Management fee", amount: -Math.round((f.committedCapital * 1000 * 0.02) / 4), currency: "EUR" })
      }
  }
  return rows.sort((a, b) => b.date.getTime() - a.date.getTime())
}

/* ------------------------------------------------------------ Capital calls */

type CallRow = {
  id: string
  fund: string
  no: number
  noticeDate: Date
  dueDate: Date
  purpose: string
  called: number
  pctOfCommitment: number
  paid: number
  status: "Paid" | "Partially paid" | "Outstanding"
  currency: string
}

const CALL_PURPOSES = ["Investment", "Investment + fees", "Management fee", "Follow-on investment", "Fund expenses"]

function buildCalls(): CallRow[] {
  const rows: CallRow[] = []
  for (const f of funds) {
    const commitment = f.committedCapital * 1000 // EUR k
    const target = Math.min(0.95, f.invested / f.committedCapital + 0.08)
    const n = 6 + Math.round(hash(f.id) * 4)
    let remaining = commitment * target
    for (let i = 1; i <= n; i++) {
      const notice = new Date(f.vintageYear + Math.floor(((i - 1) * 4.5) / n), ((i - 1) * 5) % 12, 5)
      if (notice > new Date(2026, 6, 20)) break
      const share = i === n ? remaining : remaining * (0.18 + hash(f.id + i) * 0.14)
      const called = Math.round(share)
      remaining -= called
      const due = new Date(notice.getTime() + 10 * 86400000)
      const status: CallRow["status"] = hash(f.id + "s" + i) > 0.9 ? "Partially paid" : "Paid"
      rows.push({
        id: `${f.id}-${i}`,
        fund: f.name,
        no: i,
        noticeDate: notice,
        dueDate: due,
        purpose: CALL_PURPOSES[Math.floor(hash(f.id + "p" + i) * CALL_PURPOSES.length)],
        called,
        pctOfCommitment: (called / commitment) * 100,
        paid: status === "Paid" ? called : status === "Partially paid" ? Math.round(called * 0.8) : 0,
        status,
        currency: "EUR",
      })
    }
  }
  // The latest call of each fund that is still deploying capital is not yet paid
  for (const f of funds) {
    if (f.vintageYear < 2020) continue
    const last = rows.filter((r) => r.fund === f.name).sort((a, b) => b.noticeDate.getTime() - a.noticeDate.getTime())[0]
    if (last) {
      last.status = "Outstanding"
      last.paid = 0
      last.noticeDate = new Date(2026, 5, 5)
      last.dueDate = new Date(2026, 5, 15)
    }
  }
  return rows.sort((a, b) => b.noticeDate.getTime() - a.noticeDate.getTime())
}

/* --------------------------------------------------------------------- UI */

const ROWS_PER_PAGE = 50

function FilterSelect({
  label, value, onChange, options, width = "w-44",
}: { label: string; value: string; onChange: (v: string) => void; options: string[]; width?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium text-ink-2">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={cn("h-9 border-line bg-white text-[12px]", width)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>{o}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function SearchBox({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium text-ink-2">{label}</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-2" />
        <Input
          type="text"
          placeholder="Search..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-48 border-line pl-9 text-[12px] placeholder:text-ink-2"
        />
      </div>
    </div>
  )
}

function ResultsHeader({
  total, page, pages, setPage, onExport,
}: { total: number; page: number; pages: number; setPage: (p: number) => void; onExport: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
      <div className="flex items-baseline gap-2">
        <span className="text-[14px] font-semibold text-ink">Results</span>
        <span className="text-[12px] text-ink-2">{total.toLocaleString("en-GB")} rows</span>
      </div>
      <div className="flex items-center gap-2 text-[12px] text-ink-2">
        <span>Page {page} of {pages}</span>
        <Button variant="outline" size="sm" className="h-8 border-line px-3 text-[12px]" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
          Previous
        </Button>
        <Button variant="outline" size="sm" className="h-8 border-line px-3 text-[12px]" onClick={() => setPage(Math.min(pages, page + 1))} disabled={page === pages}>
          Next
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 border-line px-3 text-[12px] text-ink" onClick={onExport}>
          <Download className="h-3.5 w-3.5" />
          Export to Excel
        </Button>
      </div>
    </div>
  )
}

const th = "px-5 py-2.5 text-left text-[11px] font-medium text-ink-2"
const thR = th.replace("text-left", "text-right")
const td = "px-5 py-2.5"

function downloadCsv(name: string, header: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const csv = [header, ...rows].map((r) => r.map(esc).join(";")).join("\n")
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }))
  const a = document.createElement("a")
  a.href = url
  a.download = `${name}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function StatusPill({ status }: { status: CallRow["status"] }) {
  const cls =
    status === "Paid"
      ? "bg-emerald-50 text-emerald-700"
      : status === "Partially paid"
        ? "bg-amber-50 text-amber-700"
        : "bg-rose-50 text-rose-700"
  return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", cls)}>{status}</span>
}

export default function DataViewerPage() {
  const [section, setSection] = useState<Section>("metrics")
  const [page, setPage] = useState(1)

  // Metrics filters
  const [mCompany, setMCompany] = useState("All companies")
  const [mYear, setMYear] = useState("All years")
  const [mPeriod, setMPeriod] = useState("All periods")
  const [mDimension, setMDimension] = useState("All dimensions")
  const [mLevel, setMLevel] = useState("All levels")
  const [mSearch, setMSearch] = useState("")

  // Cashflow filters
  const [cFund, setCFund] = useState("All funds")
  const [cCompany, setCCompany] = useState("All companies")
  const [cYear, setCYear] = useState("All years")
  const [cType, setCType] = useState("All types")

  // Capital call filters
  const [kFund, setKFund] = useState("All funds")
  const [kStatus, setKStatus] = useState("All statuses")
  const [kYear, setKYear] = useState("All years")

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const metrics = useMemo(() => (mounted ? buildMetrics() : []), [mounted])
  const cashflows = useMemo(() => (mounted ? buildCashflows() : []), [mounted])
  const calls = useMemo(() => (mounted ? buildCalls() : []), [mounted])

  const changeSection = (s: Section) => {
    setSection(s)
    setPage(1)
  }

  const metricsF = useMemo(() => {
    const q = mSearch.trim().toLowerCase()
    return metrics.filter(
      (r) =>
        (mCompany === "All companies" || r.company === mCompany) &&
        (mYear === "All years" || String(r.year) === mYear) &&
        (mPeriod === "All periods" || r.periodType === mPeriod) &&
        (mDimension === "All dimensions" || r.dimension === mDimension) &&
        (mLevel === "All levels" || r.level === mLevel) &&
        (!q || r.metric.toLowerCase().includes(q) || r.code.includes(q)),
    )
  }, [metrics, mCompany, mYear, mPeriod, mDimension, mLevel, mSearch])

  const cashflowsF = useMemo(
    () =>
      cashflows.filter(
        (r) =>
          (cFund === "All funds" || r.fund === cFund) &&
          (cCompany === "All companies" || r.company === cCompany) &&
          (cYear === "All years" || String(r.date.getFullYear()) === cYear) &&
          (cType === "All types" || r.type === cType),
      ),
    [cashflows, cFund, cCompany, cYear, cType],
  )

  const callsF = useMemo(
    () =>
      calls.filter(
        (r) =>
          (kFund === "All funds" || r.fund === kFund) &&
          (kStatus === "All statuses" || r.status === kStatus) &&
          (kYear === "All years" || String(r.noticeDate.getFullYear()) === kYear),
      ),
    [calls, kFund, kStatus, kYear],
  )

  const total = section === "metrics" ? metricsF.length : section === "cashflows" ? cashflowsF.length : callsF.length
  const pages = Math.max(1, Math.ceil(total / ROWS_PER_PAGE))
  const safePage = Math.min(page, pages)
  const slice = <T,>(arr: T[]) => arr.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE)

  // Reset to page 1 whenever a filter changes
  const f = <T,>(set: (v: T) => void) => (v: T) => {
    set(v)
    setPage(1)
  }

  const meta = SECTIONS.find((s) => s.id === section)!
  const companyNames = ["All companies", ...companies.map((c) => c.name)]
  const fundNames = ["All funds", ...funds.map((x) => x.name)]
  const yearOpts = ["All years", ...YEARS.map(String)]

  const callTotals = useMemo(() => {
    const sel = funds.filter((x) => kFund === "All funds" || x.name === kFund)
    const commitment = sel.reduce((s, x) => s + x.committedCapital * 1000, 0)
    const rel = calls.filter((c) => sel.some((x) => x.name === c.fund))
    const called = rel.reduce((s, c) => s + c.called, 0)
    const outstanding = rel.reduce((s, c) => s + (c.called - c.paid), 0)
    return { commitment, called, outstanding, pct: commitment ? (called / commitment) * 100 : 0 }
  }, [calls, kFund])

  const exportCurrent = () => {
    if (section === "metrics")
      downloadCsv("metrics", ["Company", "Code", "Metric", "Period end", "Dimension", "Value", "Cur.", "Ver."], metricsF.map((r) => [r.company, r.code, r.metric, r.periodEnd, r.dimension, r.value, r.currency, r.version]))
    else if (section === "cashflows")
      downloadCsv("cashflows", ["Fund", "Company", "Date", "Type", "Amount (EUR k)", "Cur."], cashflowsF.map((r) => [r.fund, r.company, fmtDate(r.date), r.type, r.amount, r.currency]))
    else
      downloadCsv("capital-calls", ["Fund", "Call no.", "Notice date", "Due date", "Purpose", "Called (EUR k)", "% of commitment", "Paid (EUR k)", "Status"], callsF.map((r) => [r.fund, r.no, fmtDate(r.noticeDate), fmtDate(r.dueDate), r.purpose, r.called, r.pctOfCommitment.toFixed(1), r.paid, r.status]))
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg font-sans">
      {/* Header */}
      <div className="border-b border-line bg-white px-8 pb-5 pt-6">
        <h1 className="text-[22px] font-semibold tracking-tight text-ink">{meta.title}</h1>
        <p className="mt-0.5 text-[13px] text-ink-2">{meta.subtitle}</p>
      </div>

      {/* Section switch */}
      <div className="flex justify-end border-b border-line bg-white px-8 py-3">
        <div className="inline-flex rounded-lg border border-line bg-white p-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => changeSection(s.id)}
              className={cn(
                "rounded-md px-4 py-1.5 text-[13px] font-medium transition-colors",
                section === s.id ? "bg-ink text-white" : "text-ink-2 hover:text-ink",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-5 p-8">
        {/* Capital call summary */}
        {section === "capital-calls" && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ["Total commitment", `€ ${fmtNum(callTotals.commitment / 1000, 1)}M`],
              ["Called to date", `€ ${fmtNum(callTotals.called / 1000, 1)}M`],
              ["% of commitment called", `${fmtNum(callTotals.pct, 1)} %`],
              ["Outstanding (not yet paid)", `€ ${fmtNum(callTotals.outstanding / 1000, 1)}M`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-[10px] border border-line bg-white px-5 py-4">
                <div className="text-[11px] font-medium text-ink-2">{k}</div>
                <div className="mt-1 text-[20px] font-semibold tabular-nums text-ink">{v}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="rounded-[10px] border border-line bg-white px-5 py-4">
          <div className="flex flex-wrap items-end gap-4">
            {section === "metrics" && (
              <>
                <FilterSelect label="Company" value={mCompany} onChange={f(setMCompany)} options={companyNames} />
                <FilterSelect label="Year" value={mYear} onChange={f(setMYear)} options={yearOpts} width="w-32" />
                <FilterSelect label="Period" value={mPeriod} onChange={f(setMPeriod)} options={["All periods", ...PERIOD_TYPES]} width="w-36" />
                <FilterSelect label="Dimension" value={mDimension} onChange={f(setMDimension)} options={["All dimensions", ...DIMENSIONS]} width="w-40" />
                <FilterSelect label="Level" value={mLevel} onChange={f(setMLevel)} options={["All levels", "Level 1", "Level 2"]} width="w-32" />
                <SearchBox label="Metric code / name" value={mSearch} onChange={f(setMSearch)} />
              </>
            )}
            {section === "cashflows" && (
              <>
                <FilterSelect label="Fund" value={cFund} onChange={f(setCFund)} options={fundNames} width="w-52" />
                <FilterSelect label="Company" value={cCompany} onChange={f(setCCompany)} options={[...companyNames, "-"]} />
                <FilterSelect label="Year" value={cYear} onChange={f(setCYear)} options={yearOpts} width="w-32" />
                <FilterSelect label="Type" value={cType} onChange={f(setCType)} options={["All types", ...CF_TYPES]} width="w-48" />
              </>
            )}
            {section === "capital-calls" && (
              <>
                <FilterSelect label="Fund" value={kFund} onChange={f(setKFund)} options={fundNames} width="w-52" />
                <FilterSelect label="Notice year" value={kYear} onChange={f(setKYear)} options={yearOpts} width="w-36" />
                <FilterSelect label="Status" value={kStatus} onChange={f(setKStatus)} options={["All statuses", "Paid", "Partially paid", "Outstanding"]} width="w-44" />
              </>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="rounded-[10px] border border-line bg-white">
          <ResultsHeader total={total} page={safePage} pages={pages} setPage={setPage} onExport={exportCurrent} />
          <div className="overflow-x-auto">
            {section === "metrics" && (
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-line bg-bg">
                    <th className={th}>Company</th>
                    <th className={th}>Code</th>
                    <th className={th}>Metric</th>
                    <th className={th}>Period end</th>
                    <th className={th}>Dimension</th>
                    <th className={thR}>Value</th>
                    <th className={cn(th, "text-center")}>Cur.</th>
                    <th className={cn(th, "text-center")}>Ver.</th>
                  </tr>
                </thead>
                <tbody>
                  {slice(metricsF).map((r) => (
                    <tr key={r.id} className="border-b border-line hover:bg-surface-2">
                      <td className={cn(td, "text-ink")}>{r.company}</td>
                      <td className={cn(td, "font-mono text-[11px] text-ink-2")}>{r.code}</td>
                      <td className={cn(td, "text-ink")}>{r.metric}</td>
                      <td className={cn(td, "text-ink-2")}>{r.periodEnd}</td>
                      <td className={cn(td, "text-ink-2")}>{r.dimension}</td>
                      <td className={cn(td, "text-right tabular-nums text-ink")}>{r.value}</td>
                      <td className={cn(td, "text-center text-ink-2")}>{r.currency}</td>
                      <td className={cn(td, "text-center text-ink-2")}>{r.version}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {section === "cashflows" && (
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-line bg-bg">
                    <th className={th}>Fund</th>
                    <th className={th}>Company</th>
                    <th className={th}>Date</th>
                    <th className={th}>Type</th>
                    <th className={thR}>Amount (EUR k)</th>
                    <th className={cn(th, "text-center")}>Cur.</th>
                  </tr>
                </thead>
                <tbody>
                  {slice(cashflowsF).map((r) => (
                    <tr key={r.id} className="border-b border-line hover:bg-surface-2">
                      <td className={cn(td, "text-ink")}>{r.fund}</td>
                      <td className={cn(td, "text-ink")}>{r.company}</td>
                      <td className={cn(td, "text-ink-2")}>{fmtDate(r.date)}</td>
                      <td className={cn(td, "text-ink-2")}>{r.type}</td>
                      <td className={cn(td, "text-right tabular-nums", r.amount < 0 ? "text-ink" : "text-emerald-700")}>
                        {r.amount < 0 ? `(${fmtNum(-r.amount)})` : fmtNum(r.amount)}
                      </td>
                      <td className={cn(td, "text-center text-ink-2")}>{r.currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {section === "capital-calls" && (
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-line bg-bg">
                    <th className={th}>Fund</th>
                    <th className={th}>Call</th>
                    <th className={th}>Notice date</th>
                    <th className={th}>Due date</th>
                    <th className={th}>Purpose</th>
                    <th className={thR}>Called (EUR k)</th>
                    <th className={thR}>% of commitment</th>
                    <th className={thR}>Paid (EUR k)</th>
                    <th className={th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {slice(callsF).map((r) => (
                    <tr key={r.id} className="border-b border-line hover:bg-surface-2">
                      <td className={cn(td, "text-ink")}>{r.fund}</td>
                      <td className={cn(td, "text-ink-2")}>#{r.no}</td>
                      <td className={cn(td, "text-ink-2")}>{fmtDate(r.noticeDate)}</td>
                      <td className={cn(td, "text-ink-2")}>{fmtDate(r.dueDate)}</td>
                      <td className={cn(td, "text-ink")}>{r.purpose}</td>
                      <td className={cn(td, "text-right tabular-nums text-ink")}>{fmtNum(r.called)}</td>
                      <td className={cn(td, "text-right tabular-nums text-ink-2")}>{fmtNum(r.pctOfCommitment, 1)} %</td>
                      <td className={cn(td, "text-right tabular-nums text-ink")}>{fmtNum(r.paid)}</td>
                      <td className={td}><StatusPill status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!mounted && <div className="px-5 py-10 text-center text-[12px] text-ink-2">Loading data…</div>}
            {mounted && total === 0 && <div className="px-5 py-10 text-center text-[12px] text-ink-2">No rows match these filters.</div>}
          </div>

          <div className="flex items-center justify-between border-t border-line px-5 py-3">
            <span className="text-[11px] text-ink-2">
              {total === 0 ? "No results" : `Showing ${(safePage - 1) * ROWS_PER_PAGE + 1} - ${Math.min(safePage * ROWS_PER_PAGE, total)} of ${total.toLocaleString("en-GB")} results`}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
