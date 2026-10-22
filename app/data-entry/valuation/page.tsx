"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { companies, funds, currentUser, type Company } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Plus, Pencil, AlertCircle } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

type Basis = "NORM_EBITDA" | "LTM_EBITDA" | "LTM_REVENUE" | "LE_EBITDA"
const BASIS_LABEL: Record<Basis, string> = {
  NORM_EBITDA: "Norm. EBITDA",
  LTM_EBITDA: "LTM EBITDA",
  LTM_REVENUE: "LTM Revenue",
  LE_EBITDA: "LE EBITDA",
}

interface SavedValuation {
  id: string
  companyId: string
  companyName: string
  date: string
  basis: Basis
  metric: number
  adjustments: number
  adjustmentNote: string
  multiple: number
  multipleLabel: string
  ev: number
  deductions: number
  equity: number
  fmv: number
  prevFV: number
  savedAt: string
  by: string
}

interface ExitProjection {
  year: string
  revenue: number
  ebitda: number
  netDebt: number
}

interface SavedExit {
  id: string
  companyId: string
  companyName: string
  exitYear: string
  multiple: number
  shareholding: number
  ebitdaK: number
  netDebtK: number
  evK: number
  equityK: number
  projections: ExitProjection[]
  note: string
  ebitdaChanged: boolean
  savedAt: string
  by: string
}

const DEFAULT_PROJECTIONS: ExitProjection[] = [
  { year: "2025", revenue: 45000, ebitda: 6500, netDebt: 25000 },
  { year: "2026", revenue: 52000, ebitda: 7800, netDebt: 22000 },
  { year: "2027", revenue: 58000, ebitda: 9200, netDebt: 18000 },
  { year: "2028", revenue: 65000, ebitda: 10500, netDebt: 14000 },
  { year: "2029", revenue: 72000, ebitda: 12000, netDebt: 10000 },
  { year: "2030", revenue: 80000, ebitda: 14000, netDebt: 5000 },
]

const VAL_KEY = "alma-valuations"
const EXIT_KEY = "alma-exit-scenarios"

function loadList<T>(key: string): T[] {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}
function saveList(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable: the demo keeps working without persistence */
  }
}

const fmtStamp = (iso: string) => new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })
const fmtMk = (k: number) => `€ ${(k / 1000).toFixed(1)}M`

// Earnings measure the valuation is based on, in €m, from the company's reported figures
function metricFor(c: Company, b: Basis): number {
  const f = c.financials
  if (b === "NORM_EBITDA") return f.normalizedEbitda.fy.ltm
  if (b === "LTM_EBITDA") return f.ebitda.fy.ltm
  if (b === "LE_EBITDA") return f.ebitda.fy.le
  return f.revenue.fy.ltm
}
// Default multiple: the company's current EV/EBITDA; for a revenue basis the implied EV/Revenue
function multipleFor(c: Company, b: Basis): number {
  const ev = c.valuation.current.evEbitda
  if (b !== "LTM_REVENUE") return ev
  const rev = c.financials.revenue.fy.ltm
  return rev ? Math.round(((ev * c.financials.normalizedEbitda.fy.ltm) / rev) * 100) / 100 : 0
}

// Number field that accepts negatives and decimals while typing ("-", "0.", "0,5")
function NumInput({ value, onChange, className, placeholder }: { value: number; onChange: (n: number) => void; className?: string; placeholder?: string }) {
  const [text, setText] = useState(value ? String(value) : "")
  return (
    <Input
      type="text"
      inputMode="decimal"
      value={text}
      placeholder={placeholder}
      className={className}
      onChange={(e) => {
        const raw = e.target.value
        if (!/^-?\d*[.,]?\d*$/.test(raw)) return
        setText(raw)
        const n = parseFloat(raw.replace(",", "."))
        onChange(Number.isFinite(n) ? n : 0)
      }}
    />
  )
}

export default function ValuationEntryPage() {
  const [selectedFund, setSelectedFund] = useState(funds[0])
  const [showNewValuation, setShowNewValuation] = useState(false)
  const [showExitScenario, setShowExitScenario] = useState(false)
  const [selectedQuarter, setSelectedQuarter] = useState("Q4")
  const [savedValuations, setSavedValuations] = useState<SavedValuation[]>([])
  const [savedExits, setSavedExits] = useState<SavedExit[]>([])
  const [banner, setBanner] = useState("")

  useEffect(() => {
    setSavedValuations(loadList<SavedValuation>(VAL_KEY))
    setSavedExits(loadList<SavedExit>(EXIT_KEY))
  }, [])

  const fundCompanies = companies.filter((c) => c.fundId === selectedFund.id)

  // Latest saved valuation / exit scenario per company (lists are newest first)
  const latestVal: Record<string, SavedValuation> = {}
  for (const v of savedValuations) if (!latestVal[v.companyId]) latestVal[v.companyId] = v
  const latestExit: Record<string, SavedExit> = {}
  for (const x of savedExits) if (!latestExit[x.companyId]) latestExit[x.companyId] = x

  // Valuation form state - New Valuation Entry (all values in €m)
  const [valuationForm, setValuationForm] = useState({
    // 1. Company
    company: "",
    quarterDate: "30-Jun-2026",
    // 2. Enterprise Value (Multiple method)
    earningsBasis: "NORM_EBITDA", // dropdown: Norm. EBITDA, LTM EBITDA, LTM Revenue, LE EBITDA
    ltmMetricValue: 0, // loaded from the company's figures (€m)
    adjustments: 0, // Input field (€m)
    evEbitdaBasis: "Current", // dropdown: Entry, Current, Peer
    multiple: 7.0, // EV/EBITDA multiple
    // 3. Bridge to Equity (all €m)
    netDebt: 0, // loaded from the company's figures
    netDebtAdjustments: 0, // Input field
    earnOutExitBonus: 0, // Input field
    transactionCosts: 0, // Input field
    otherAdjustments: 0, // Input field
    // 4. Capital structure (waterfall) - face value & hurdle in €m
    capitalStructure: [
      { instrument: "Super prefs", faceValue: 0, hurdle: 0, priority: 1, notes: "" },
      { instrument: "Cumprefs", faceValue: 0, hurdle: 0, priority: 2, notes: "" },
      { instrument: "Junior prefs", faceValue: 0, hurdle: 0, priority: 3, notes: "" },
      { instrument: "Hurdle shares", faceValue: 0, hurdle: 0, priority: 4, notes: "" },
      { instrument: "Ordinary equity", faceValue: 0, hurdle: 0, priority: 5, notes: "" },
    ],
    // 5. Your positions
    positions: [
      { instrument: "Super prefs", ownPct: 0, adj: 0, commentary: "" },
      { instrument: "Cumprefs", ownPct: 0, adj: 0, commentary: "" },
      { instrument: "Ordinary equity", ownPct: 0, adj: 0, commentary: "" },
    ],
    // notes per line of the valuation, by key
    notes: {} as Record<string, string>,
  })

  const valuationCompany = companies.find((c) => c.id === valuationForm.company)
  const basis = valuationForm.earningsBasis as Basis
  const multipleLabel = basis === "LTM_REVENUE" ? "EV/Revenue" : "EV/EBITDA"
  const setNote = (k: string, v: string) => setValuationForm((f) => ({ ...f, notes: { ...f.notes, [k]: v } }))

  const selectCompany = (id: string) => {
    const c = companies.find((x) => x.id === id)
    if (!c) return
    const b = valuationForm.earningsBasis as Basis
    const own = c.valuation.current.shareOrdinaryEquity ?? c.valuation.exit.shareOrdinaryEquity ?? 0
    setValuationForm((f) => ({
      ...f,
      company: id,
      ltmMetricValue: metricFor(c, b),
      adjustments: 0,
      multiple: multipleFor(c, b),
      netDebt: c.kpis.netDebt,
      netDebtAdjustments: 0,
      earnOutExitBonus: 0,
      transactionCosts: 0,
      otherAdjustments: 0,
      capitalStructure: f.capitalStructure.map((x) => ({ ...x, faceValue: 0, hurdle: 0, notes: "" })),
      positions: f.positions.map((p) => ({ ...p, ownPct: p.instrument === "Ordinary equity" ? own : 0, adj: 0, commentary: "" })),
      notes: {},
    }))
  }
  const changeBasis = (b: Basis) => {
    setValuationForm((f) => ({
      ...f,
      earningsBasis: b,
      ltmMetricValue: valuationCompany ? metricFor(valuationCompany, b) : f.ltmMetricValue,
      multiple: valuationCompany ? multipleFor(valuationCompany, b) : f.multiple,
      adjustments: 0,
      notes: { ...f.notes, adjustments: "" },
    }))
  }
  const changeEvBasis = (v: string) => {
    setValuationForm((f) => ({
      ...f,
      evEbitdaBasis: v,
      // Entry and Current start from the company's multiple; Peer keeps the value you type
      multiple: v !== "Peer" && valuationCompany ? multipleFor(valuationCompany, f.earningsBasis as Basis) : f.multiple,
    }))
  }
  const openValuationFor = (companyId: string) => {
    selectCompany(companyId)
    setShowNewValuation(true)
  }

  // Currency formatter (€m, one decimal)
  const fmtEur = (v: number) => `€${v.toFixed(1)}`

  // Calculated values (all €m)
  const ltmValuationValue = valuationForm.ltmMetricValue + valuationForm.adjustments
  const enterpriseValue = ltmValuationValue * valuationForm.multiple
  const totalDeductions =
    valuationForm.netDebt +
    valuationForm.netDebtAdjustments +
    valuationForm.earnOutExitBonus +
    valuationForm.transactionCosts +
    valuationForm.otherAdjustments
  const equityValue = enterpriseValue - totalDeductions

  // Waterfall allocation by priority: prefs absorb up to face value, ordinary equity takes the remainder
  let remainingEquity = equityValue
  const waterfallAllocations = valuationForm.capitalStructure.map((item) => {
    const allocatedValue =
      item.instrument === "Ordinary equity"
        ? Math.max(remainingEquity, 0)
        : Math.min(Math.max(remainingEquity, 0), item.faceValue)
    remainingEquity -= allocatedValue
    return allocatedValue
  })
  const totalAllocated = waterfallAllocations.reduce((sum, v) => sum + v, 0)
  const checkEquityAllocated = equityValue - totalAllocated

  // Position FMV = allocated value of matching instrument × own % + adjustments
  const positionRows = valuationForm.positions.map((pos) => {
    const csIndex = valuationForm.capitalStructure.findIndex((c) => c.instrument === pos.instrument)
    const allocatedValue = csIndex >= 0 ? waterfallAllocations[csIndex] : 0
    const fmv = allocatedValue * (pos.ownPct / 100) + pos.adj
    return { ...pos, allocatedValue, fmv }
  })
  const totalFMV = positionRows.reduce((sum, pos) => sum + pos.fmv, 0)

  // Adjusting the earnings figure always needs a note explaining why
  const adjNoteMissing = valuationForm.adjustments !== 0 && !(valuationForm.notes.adjustments ?? "").trim()
  const canSaveValuation = !!valuationCompany && !adjNoteMissing

  const saveValuation = () => {
    if (!valuationCompany || adjNoteMissing) return
    const c = valuationCompany
    const rec: SavedValuation = {
      id: `${Date.now()}`,
      companyId: c.id,
      companyName: c.name,
      date: valuationForm.quarterDate,
      basis,
      metric: valuationForm.ltmMetricValue,
      adjustments: valuationForm.adjustments,
      adjustmentNote: (valuationForm.notes.adjustments ?? "").trim(),
      multiple: valuationForm.multiple,
      multipleLabel,
      ev: enterpriseValue,
      deductions: totalDeductions,
      equity: equityValue,
      fmv: totalFMV,
      prevFV: latestVal[c.id]?.fmv ?? c.valuation.current.fairValue,
      savedAt: new Date().toISOString(),
      by: currentUser.name,
    }
    const next = [rec, ...savedValuations]
    setSavedValuations(next)
    saveList(VAL_KEY, next)
    setShowNewValuation(false)
    setBanner(`Valuation saved for ${c.name}: fair value ${fmtEur(totalFMV)}m.`)
    setTimeout(() => setBanner(""), 6000)
  }

  // Exit scenario form state
  const [exitForm, setExitForm] = useState({
    company: "",
    exitYear: "2027",
    projections: DEFAULT_PROJECTIONS.map((p) => ({ ...p })),
    exitMultiple: 8,
    exitShareholding: 75,
    exitCumpref: "",
    note: "",
  })
  // EBITDA values the projections started from; any difference needs a note
  const [exitBaseline, setExitBaseline] = useState<number[]>(DEFAULT_PROJECTIONS.map((p) => p.ebitda))

  const exitCompany = companies.find((c) => c.id === exitForm.company)
  const exitRow = exitForm.projections.find((p) => p.year === exitForm.exitYear)
  const exitEbitdaK = exitRow?.ebitda ?? 0
  const exitNetDebtK = exitRow?.netDebt ?? 0
  const exitEvK = exitEbitdaK * exitForm.exitMultiple
  const exitCumprefK = parseFloat(exitForm.exitCumpref.replace(",", ".")) || 0
  const exitEquityK = exitEvK - exitNetDebtK - exitCumprefK
  const exitFundShareK = (exitEquityK * exitForm.exitShareholding) / 100
  const exitEbitdaChanged = exitForm.projections.some((p, i) => p.ebitda !== exitBaseline[i])
  const exitNoteMissing = exitEbitdaChanged && !exitForm.note.trim()
  const canSaveExit = !!exitCompany && !exitNoteMissing

  const selectExitCompany = (id: string) => {
    const c = companies.find((x) => x.id === id)
    if (!c) return
    const saved = latestExit[id]
    const projections = saved ? saved.projections.map((p) => ({ ...p })) : DEFAULT_PROJECTIONS.map((p) => ({ ...p }))
    setExitBaseline(projections.map((p) => p.ebitda))
    setExitForm((f) => ({
      ...f,
      company: id,
      exitYear: saved?.exitYear ?? f.exitYear,
      projections,
      exitMultiple: saved?.multiple ?? c.valuation.exit.evEbitda,
      exitShareholding: saved?.shareholding ?? c.valuation.exit.shareOrdinaryEquity ?? 75,
      exitCumpref: "",
      note: "",
    }))
  }
  const saveExit = () => {
    if (!exitCompany || exitNoteMissing) return
    const rec: SavedExit = {
      id: `${Date.now()}`,
      companyId: exitCompany.id,
      companyName: exitCompany.name,
      exitYear: exitForm.exitYear,
      multiple: exitForm.exitMultiple,
      shareholding: exitForm.exitShareholding,
      ebitdaK: exitEbitdaK,
      netDebtK: exitNetDebtK,
      evK: exitEvK,
      equityK: exitEquityK,
      projections: exitForm.projections.map((p) => ({ ...p })),
      note: exitForm.note.trim(),
      ebitdaChanged: exitEbitdaChanged,
      savedAt: new Date().toISOString(),
      by: currentUser.name,
    }
    const next = [rec, ...savedExits]
    setSavedExits(next)
    saveList(EXIT_KEY, next)
    setShowExitScenario(false)
    setBanner(`EXIT scenario saved for ${exitCompany.name}: total proceeds ${fmtMk(exitEquityK)}.`)
    setTimeout(() => setBanner(""), 6000)
  }

  // Chart data for portfolio valuation
  const portfolioChartData = fundCompanies.slice(0, 6).map((c) => ({
    name: c.name.split(" ")[0],
    Investment: c.valuation.current.investedValue,
    "Fair Value": c.valuation.current.fairValue,
    "Total Exit": c.valuation.exit.fairValue,
  }))

  // Chart data for quarterly valuation trend
  const quarterlyChartData = [
    { quarter: "2022 Q4", "Fair + Realised Value": 42, "Exit Valuation": 85 },
    { quarter: "2023 Q4", "Fair + Realised Value": 68, "Exit Valuation": 120 },
    { quarter: "2024 Q4", "Fair + Realised Value": 95, "Exit Valuation": 145 },
  ]

  // Mock data for quarter comparison
  const quarterComparisonData = fundCompanies.map((c, i) => {
    // Deterministic per-company factors (0-1) so SSR and client render identically
    const seedFV = ((i * 37) % 20) / 100 // 0.00 - 0.19
    const seedMOI = ((i * 53) % 15) / 100 // 0.00 - 0.14
    const ov = latestVal[c.id]
    const inv = c.valuation.current.investedValue || 1
    const real = c.valuation.current.realisedProceeds
    const q4FV = (ov ? ov.fmv : c.valuation.current.fairValue) * 1000
    const q3FV = ov ? ov.prevFV * 1000 : q4FV * (0.85 + seedFV)
    const deltaFV = q4FV - q3FV
    const q4MOI = ov ? (ov.fmv + real) / inv : c.valuation.current.moi
    const q3MOI = ov ? (ov.prevFV + real) / inv : q4MOI * (0.9 + seedMOI)
    return {
      company: c.name,
      q4FV,
      q3FV,
      deltaFV,
      q4MOI,
      q3MOI,
      deltaMOI: q4MOI - q3MOI,
    }
  })

  // Totals for comparison
  const comparisonTotals = {
    q4FV: quarterComparisonData.reduce((sum, c) => sum + c.q4FV, 0),
    q3FV: quarterComparisonData.reduce((sum, c) => sum + c.q3FV, 0),
    deltaFV: quarterComparisonData.reduce((sum, c) => sum + c.deltaFV, 0),
    q4MOI: quarterComparisonData.reduce((sum, c) => sum + c.q4MOI, 0) / quarterComparisonData.length,
    q3MOI: quarterComparisonData.reduce((sum, c) => sum + c.q3MOI, 0) / quarterComparisonData.length,
    deltaMOI: quarterComparisonData.reduce((sum, c) => sum + c.deltaMOI, 0) / quarterComparisonData.length,
  }

  // EXIT scenario data
  const exitScenarioData = fundCompanies.map((c, i) => {
    const ex = latestExit[c.id]
    const investment = c.valuation.exit.investedValue
    const proceeds = ex ? ex.equityK / 1000 : c.valuation.exit.fairValue
    return {
      company: c.name,
      status: c.status === "on-track" ? "P" : c.status === "watch" ? "W" : "X",
      exitYear: ex ? Number(ex.exitYear) : 2026 + (i % 3),
      investment,
      totalProceeds: proceeds,
      moi: ex ? (investment ? proceeds / investment : 0) : c.valuation.exit.moi,
      lastUpdated: ex ? fmtStamp(ex.savedAt) : `${15 + i} apr 2026`,
      note: ex?.note ?? "",
      adjusted: !!ex?.ebitdaChanged,
    }
  })

  const exitTotals = {
    investment: exitScenarioData.reduce((sum, c) => sum + c.investment, 0),
    totalProceeds: exitScenarioData.reduce((sum, c) => sum + c.totalProceeds, 0),
    avgMoi: exitScenarioData.reduce((sum, c) => sum + c.moi, 0) / exitScenarioData.length,
  }

  return (
    <div className="flex min-h-screen flex-col font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <div>
          <h1 className="text-xl font-medium text-ink">Valuation Entry</h1>
          <p className="text-[13px] text-ink-2">Manage portfolio valuations and scenarios</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-line bg-white text-ink hover:bg-bg"
            onClick={() => setShowExitScenario(true)}
          >
            <TrendingUp className="h-4 w-4" />
            Update EXIT Scenario
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-brand text-white hover:bg-action-hover"
            onClick={() => setShowNewValuation(true)}
          >
            <Plus className="h-4 w-4" />
            New Valuation
          </Button>
        </div>
      </div>

      {/* Fund Tabs */}
      <div className="flex items-center gap-2 border-b border-line px-6 py-3">
        <span className="text-[13px] text-ink-2">Fund:</span>
        {funds.map((fund) => (
          <button
            key={fund.id}
            onClick={() => setSelectedFund(fund)}
            className={cn(
              "rounded-lg px-4 py-2 text-[13px] font-medium transition-colors",
              selectedFund.id === fund.id
                ? "bg-brand text-white"
                : "bg-bg text-ink-2 hover:bg-line"
            )}
          >
            {fund.shortName}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        {banner && <div className="rounded-lg bg-[#E1F5EE] px-4 py-2.5 text-[13px] text-[#1B4D45]">{banner}</div>}
        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Portfolio Valuation Chart */}
          <div className="rounded-[10px] border border-line bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[13px] font-medium text-ink">Portfolio Valuation</h2>
              <div className="flex items-center gap-4 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm bg-ink-3" />
                  <span className="text-ink-2">Investment</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm bg-brand" />
                  <span className="text-ink-2">Fair Value</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm bg-ai" />
                  <span className="text-ink-2">Total (expected) proceeds</span>
                </div>
              </div>
            </div>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={portfolioChartData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--ink-2)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--ink-2)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}M`} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid var(--line)" }} />
                  <Bar dataKey="Investment" fill="var(--ink-3)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Fair Value" fill="var(--brand)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Total Exit" fill="var(--ai)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fund Valuation Chart */}
          <div className="rounded-[10px] border border-line bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[13px] font-medium text-ink">Fund Valuation</h2>
              <div className="flex items-center gap-4 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm bg-brand" />
                  <span className="text-ink-2">Fair + Realised Value</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm bg-ai" />
                  <span className="text-ink-2">Exit Valuation</span>
                </div>
              </div>
            </div>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quarterlyChartData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                  <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: "var(--ink-2)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--ink-2)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}M`} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid var(--line)" }} />
                  <Bar dataKey="Fair + Realised Value" fill="var(--brand)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Exit Valuation" fill="var(--ai)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Table 1: Current valuations */}
        <div className="rounded-[10px] border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div className="flex items-center gap-3">
              <h2 className="text-[13px] font-medium text-ink">Current valuations</h2>
              <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                <SelectTrigger className="h-8 w-28 border-line text-[11px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q4">Q4 2025</SelectItem>
                  <SelectItem value="Q3">Q3 2025</SelectItem>
                  <SelectItem value="Q2">Q2 2025</SelectItem>
                  <SelectItem value="Q1">Q1 2025</SelectItem>
                </SelectContent>
              </Select>
              <span className="rounded bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand">Current</span>
            </div>
            <span className="text-[10px] text-ink-2">Click row to edit</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-line bg-bg">
                  <th className="px-4 py-2.5 text-left font-medium text-ink-2">Company</th>
                  <th className="px-4 py-2.5 text-center font-medium text-ink-2">Status</th>
                  <th className="px-4 py-2.5 text-right font-medium text-ink-2">Investment</th>
                  <th className="px-4 py-2.5 text-right font-medium text-ink-2">Fair Value</th>
                  <th className="px-4 py-2.5 text-right font-medium text-ink-2">Realised</th>
                  <th className="px-4 py-2.5 text-right font-medium text-ink-2">MOI</th>
                  <th className="w-10 px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {fundCompanies.map((company) => {
                  const ov = latestVal[company.id]
                  const fv = ov ? ov.fmv : company.valuation.current.fairValue
                  const moi = ov
                    ? (ov.fmv + company.valuation.current.realisedProceeds) / (company.valuation.current.investedValue || 1)
                    : company.valuation.current.moi
                  return (
                    <tr key={company.id} onClick={() => openValuationFor(company.id)} className="cursor-pointer border-b border-line hover:bg-bg">
                      <td className="px-4 py-2.5 font-medium text-ink">
                        {company.name}
                        {ov && <span title={ov.adjustmentNote || "New valuation saved"} className="ml-2 rounded bg-[#E1F5EE] px-1.5 py-0.5 text-[9px] font-medium text-[#1B4D45]">Updated {fmtStamp(ov.savedAt)}</span>}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={cn(
                          "inline-block w-5 text-[10px] font-medium",
                          company.status === "on-track" ? "text-brand" :
                          company.status === "watch" ? "text-ai" : "text-alert"
                        )}>
                          {company.status === "on-track" ? "P" : company.status === "watch" ? "W" : "X"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-ink">
                        {(company.valuation.current.investedValue * 1000).toFixed(0)}K
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-ink">
                        {(fv * 1000).toFixed(0)}K
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-ink">
                        {company.valuation.exit.fairValue > company.valuation.current.fairValue * 1.5 ? "100K" : "0"}
                      </td>
                      <td className={cn(
                        "px-4 py-2.5 text-right tabular-nums font-medium",
                        moi >= 1 ? "text-ink" : "text-alert"
                      )}>
                        {moi.toFixed(2)}x
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Pencil className="h-3.5 w-3.5 text-ink-2" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Saved valuations */}
        {savedValuations.length > 0 && (
          <div className="rounded-[10px] border border-line bg-white">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="text-[13px] font-medium text-ink">Saved valuations</h2>
              <span className="text-[10px] text-ink-2">{savedValuations.length} saved, newest first</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-line bg-bg">
                    <th className="px-4 py-2.5 text-left font-medium text-ink-2">Company</th>
                    <th className="px-4 py-2.5 text-left font-medium text-ink-2">Date</th>
                    <th className="px-4 py-2.5 text-left font-medium text-ink-2">Basis</th>
                    <th className="px-4 py-2.5 text-right font-medium text-ink-2">Adjustment</th>
                    <th className="px-4 py-2.5 text-left font-medium text-ink-2">Note</th>
                    <th className="px-4 py-2.5 text-right font-medium text-ink-2">Multiple</th>
                    <th className="px-4 py-2.5 text-right font-medium text-ink-2">EV</th>
                    <th className="px-4 py-2.5 text-right font-medium text-ink-2">Equity</th>
                    <th className="px-4 py-2.5 text-right font-medium text-ink-2">FMV</th>
                    <th className="px-4 py-2.5 text-left font-medium text-ink-2">Saved by</th>
                  </tr>
                </thead>
                <tbody>
                  {savedValuations.map((v) => (
                    <tr key={v.id} className="border-b border-line hover:bg-bg">
                      <td className="px-4 py-2.5 font-medium text-ink">{v.companyName}</td>
                      <td className="px-4 py-2.5 text-ink-2">{v.date}</td>
                      <td className="px-4 py-2.5 text-ink-2">{BASIS_LABEL[v.basis]} {fmtEur(v.metric)}</td>
                      <td className={cn("px-4 py-2.5 text-right tabular-nums", v.adjustments !== 0 ? "font-medium text-[#854F0B]" : "text-ink-2")}>
                        {v.adjustments !== 0 ? `${v.adjustments > 0 ? "+" : ""}${v.adjustments.toFixed(1)}` : "—"}
                      </td>
                      <td className="max-w-[240px] truncate px-4 py-2.5 text-ink-2" title={v.adjustmentNote}>{v.adjustmentNote || "—"}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-ink">{v.multiple.toFixed(1)}x</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-ink">{fmtEur(v.ev)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-ink">{fmtEur(v.equity)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-medium text-ink">{fmtEur(v.fmv)}</td>
                      <td className="px-4 py-2.5 text-ink-2">{v.by}, {fmtStamp(v.savedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Table 2: Current vs previous version (quarter comparison) */}
        <div className="rounded-[10px] border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-[13px] font-medium text-ink">Current vs previous version (Q4 2025 vs Q3 2025)</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-line bg-bg">
                  <th className="px-4 py-2.5 text-left font-medium text-ink-2">Company</th>
                  <th className="px-4 py-2.5 text-right font-medium text-ink-2">Q4 FV</th>
                  <th className="px-4 py-2.5 text-right font-medium text-ink-2">Q3 FV</th>
                  <th className="px-4 py-2.5 text-right font-medium text-ink-2">Δ FV</th>
                  <th className="px-4 py-2.5 text-right font-medium text-ink-2">Q4 MOI</th>
                  <th className="px-4 py-2.5 text-right font-medium text-ink-2">Q3 MOI</th>
                  <th className="px-4 py-2.5 text-right font-medium text-ink-2">Δ MOI</th>
                </tr>
              </thead>
              <tbody>
                {quarterComparisonData.map((row, i) => (
                  <tr key={i} className="border-b border-line hover:bg-bg">
                    <td className="px-4 py-2.5 font-medium text-ink">{row.company}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink">
                      {row.q4FV >= 1000 ? `${(row.q4FV / 1000).toFixed(0)}K` : row.q4FV.toFixed(0)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink">
                      {row.q3FV >= 1000 ? `${(row.q3FV / 1000).toFixed(0)}K` : row.q3FV.toFixed(0)}
                    </td>
                    <td className={cn(
                      "px-4 py-2.5 text-right tabular-nums font-medium",
                      row.deltaFV >= 0 ? "text-ok" : "text-alert"
                    )}>
                      {row.deltaFV >= 0 ? "+" : ""}{row.deltaFV >= 1000 ? `${(row.deltaFV / 1000).toFixed(0)}K` : row.deltaFV.toFixed(0)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink">{row.q4MOI.toFixed(2)}x</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink">{row.q3MOI.toFixed(2)}x</td>
                    <td className={cn(
                      "px-4 py-2.5 text-right tabular-nums font-medium",
                      row.deltaMOI >= 0 ? "text-ok" : "text-alert"
                    )}>
                      {row.deltaMOI >= 0 ? "+" : ""}{row.deltaMOI.toFixed(2)}x
                    </td>
                  </tr>
                ))}
                {/* Total row */}
                <tr className="border-t-2 border-line bg-bg">
                  <td className="px-4 py-2.5 font-medium text-ai">Total</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-ai">
                    {(comparisonTotals.q4FV / 1000).toFixed(0)}K
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-ai">
                    {(comparisonTotals.q3FV / 1000).toFixed(0)}K
                  </td>
                  <td className={cn(
                    "px-4 py-2.5 text-right tabular-nums font-medium",
                    comparisonTotals.deltaFV >= 0 ? "text-ok" : "text-alert"
                  )}>
                    {comparisonTotals.deltaFV >= 0 ? "+" : ""}{(comparisonTotals.deltaFV / 1000).toFixed(0)}K
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-ai">{comparisonTotals.q4MOI.toFixed(2)}x</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-ai">{comparisonTotals.q3MOI.toFixed(2)}x</td>
                  <td className={cn(
                    "px-4 py-2.5 text-right tabular-nums font-medium",
                    comparisonTotals.deltaMOI >= 0 ? "text-ok" : "text-alert"
                  )}>
                    {comparisonTotals.deltaMOI >= 0 ? "+" : ""}{comparisonTotals.deltaMOI.toFixed(2)}x
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 3: EXIT Outlooks */}
        <div className="rounded-[10px] border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div className="flex items-center gap-3">
              <h2 className="text-[13px] font-medium text-ink">EXIT Outlooks</h2>
              <span className="rounded bg-ai/10 px-2 py-0.5 text-[10px] font-medium text-ai">Projected</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-line bg-bg">
                  <th className="px-4 py-2.5 text-left font-medium text-ink-2">Company</th>
                  <th className="px-4 py-2.5 text-center font-medium text-ink-2">Status</th>
                  <th className="px-4 py-2.5 text-center font-medium text-ink-2">Exit Year</th>
                  <th className="px-4 py-2.5 text-right font-medium text-ink-2">Investment</th>
                  <th className="px-4 py-2.5 text-right font-medium text-ink-2">Total Proceeds</th>
                  <th className="px-4 py-2.5 text-right font-medium text-ink-2">MOI</th>
                  <th className="px-4 py-2.5 text-right font-medium text-ink-2">Last Updated</th>
                  <th className="px-4 py-2.5 text-left font-medium text-ink-2">Note</th>
                </tr>
              </thead>
              <tbody>
                {exitScenarioData.map((row, i) => (
                  <tr key={i} className="border-b border-line hover:bg-bg">
                    <td className="px-4 py-2.5 font-medium text-ink">{row.company}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={cn(
                        "inline-block w-5 text-[10px] font-medium",
                        row.status === "P" ? "text-brand" :
                        row.status === "W" ? "text-ai" : "text-alert"
                      )}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center tabular-nums text-ai">{row.exitYear}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink">{row.investment.toFixed(1)}M</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink">{row.totalProceeds.toFixed(1)}M</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-medium text-ink">{row.moi.toFixed(2)}x</td>
                    <td className="px-4 py-2.5 text-right text-ink-2">{row.lastUpdated}</td>
                    <td className="max-w-[260px] truncate px-4 py-2.5 text-ink-2" title={row.note}>
                      {row.adjusted && <span className="mr-1.5 rounded bg-[#FAEEDA] px-1.5 py-0.5 text-[9px] font-medium text-[#854F0B]">EBITDA adjusted</span>}
                      {row.note}
                    </td>
                  </tr>
                ))}
                {/* Total row */}
                <tr className="border-t-2 border-line bg-bg">
                  <td className="px-4 py-2.5 font-medium text-ai">Total</td>
                  <td className="px-4 py-2.5"></td>
                  <td className="px-4 py-2.5 text-center tabular-nums text-ai">2028</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-ai">{exitTotals.investment.toFixed(1)}M</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-ai">{exitTotals.totalProceeds.toFixed(1)}M</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-ai">{exitTotals.avgMoi.toFixed(2)}x</td>
                  <td className="px-4 py-2.5"></td>
                  <td className="px-4 py-2.5"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create New Valuation Dialog - Quick Valuation */}
      <Dialog open={showNewValuation} onOpenChange={setShowNewValuation}>
        <DialogContent className="!max-w-[1000px] w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="border-b border-line px-8 py-5 bg-brand">
            <DialogTitle className="text-xl font-medium text-white">New Valuation Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-0">
            {/* Section 1: Company */}
            <div className="border-b border-line bg-brand px-8 py-2.5">
              <span className="text-[13px] font-semibold text-white">1. Company</span>
            </div>
            <div className="grid grid-cols-2 gap-6 px-8 py-5 text-[13px]">
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] text-ink-2">Company name</span>
                <Select value={valuationForm.company} onValueChange={selectCompany}>
                  <SelectTrigger className="h-9 w-full border-brand text-[13px]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {fundCompanies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] text-ink-2">Valuation date</span>
                <Select value={valuationForm.quarterDate} onValueChange={(v) => setValuationForm({ ...valuationForm, quarterDate: v })}>
                  <SelectTrigger className="h-9 w-full border-brand text-[13px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="31-Mar-2026">31-Mar-2026 (Q1 2026)</SelectItem>
                    <SelectItem value="30-Jun-2026">30-Jun-2026 (Q2 2026)</SelectItem>
                    <SelectItem value="30-Sep-2026">30-Sep-2026 (Q3 2026)</SelectItem>
                    <SelectItem value="31-Dec-2026">31-Dec-2026 (Q4 2026)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Section 2: Enterprise Value */}
            <div className="border-b border-line bg-brand px-8 py-2.5">
              <span className="text-[13px] font-semibold text-white">2. Enterprise Value (Multiple method)</span>
            </div>
            <div className="px-8 py-4 text-[13px]">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="text-[12px] text-ink-2">
                    <th className="text-left font-medium pb-3 w-[230px]">Measure</th>
                    <th className="text-right font-medium pb-3 w-[190px]">Value (€m)</th>
                    <th className="text-left font-medium pb-3 pl-6">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 text-ink-2">Earnings basis</td>
                    <td className="py-2 text-right">
                      <Select value={valuationForm.earningsBasis} onValueChange={(v) => changeBasis(v as Basis)}>
                        <SelectTrigger className="h-9 w-40 border-brand text-[13px] ml-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NORM_EBITDA">Norm. EBITDA</SelectItem>
                          <SelectItem value="LTM_EBITDA">LTM EBITDA</SelectItem>
                          <SelectItem value="LTM_REVENUE">LTM Revenue</SelectItem>
                          <SelectItem value="LE_EBITDA">LE EBITDA</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-2 pl-6">
                      <Input type="text" value={valuationForm.notes.basis ?? ""} onChange={(e) => setNote("basis", e.target.value)} className="h-8 w-full border-line text-[13px]" placeholder="" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-ink-2">LTM metric value</td>
                    <td className="py-2 text-right">
                      <span className="tabular-nums font-medium text-ink bg-ai-soft border border-ai px-3 py-1 rounded">
                        {fmtEur(valuationForm.ltmMetricValue)}
                      </span>
                    </td>
                    <td className="py-2 pl-6">
                      <Input type="text" value={valuationForm.notes.ltm ?? ""} onChange={(e) => setNote("ltm", e.target.value)} className="h-8 w-full border-line text-[13px]" placeholder="Given from data" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-ink-2">Adjustments to {BASIS_LABEL[basis]}</td>
                    <td className="py-2 text-right">
                      <NumInput key={valuationForm.company + basis} value={valuationForm.adjustments} onChange={(n) => setValuationForm((f) => ({ ...f, adjustments: n }))} className="h-9 w-28 border-brand text-[13px] text-right text-brand font-medium ml-auto" placeholder="0.0" />
                    </td>
                    <td className="py-2 pl-6">
                      <Input type="text" value={valuationForm.notes.adjustments ?? ""} onChange={(e) => setNote("adjustments", e.target.value)} className={cn("h-8 w-full text-[13px]", adjNoteMissing ? "border-alert bg-[#FDF3F2]" : "border-line")} placeholder="Required: why is the earnings figure adjusted?" />
                      {adjNoteMissing && (
                        <p className="mt-1 flex items-center gap-1 text-[11px] text-alert"><AlertCircle className="h-3 w-3" />A note is required when you adjust the earnings figure.</p>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-ink-2">Adjusted LTM Valuation Value</td>
                    <td className="py-2 text-right tabular-nums font-medium text-ink">{fmtEur(ltmValuationValue)}</td>
                    <td className="py-2 pl-6">
                      <Input type="text" value={valuationForm.notes.adjusted ?? ""} onChange={(e) => setNote("adjusted", e.target.value)} className="h-8 w-full border-line text-[13px]" placeholder="Calculation" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-ink-2">{multipleLabel}</td>
                    <td className="py-2">
                      <div className="flex items-center justify-end gap-2">
                        <Select value={valuationForm.evEbitdaBasis} onValueChange={changeEvBasis}>
                          <SelectTrigger className="h-9 w-[88px] border-brand text-[13px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Entry">Entry</SelectItem>
                            <SelectItem value="Current">Current</SelectItem>
                            <SelectItem value="Peer">Peer</SelectItem>
                          </SelectContent>
                        </Select>
                        <NumInput
                          key={`${valuationForm.company}-${basis}-${valuationForm.evEbitdaBasis}`}
                          value={valuationForm.multiple}
                          onChange={(n) => setValuationForm((f) => ({ ...f, multiple: n }))}
                          className="h-9 w-16 border-brand text-[13px] text-right text-brand font-medium"
                          placeholder="0.0"
                        />
                        <span className="text-ink-2">x</span>
                      </div>
                    </td>
                    <td className="py-2 pl-6">
                      <Input type="text" value={valuationForm.notes.multiple ?? ""} onChange={(e) => setNote("multiple", e.target.value)} className="h-8 w-full border-line text-[13px]" placeholder="" />
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="flex items-center justify-between border-t border-line pt-3 mt-3">
                <span className="font-semibold text-ink text-[14px]">Enterprise Value</span>
                <span className="tabular-nums font-bold text-ink text-[14px]">{fmtEur(enterpriseValue)}</span>
              </div>
            </div>

            {/* Section 3: Bridge to Equity */}
            <div className="border-b border-line bg-brand px-8 py-2.5">
              <span className="text-[13px] font-semibold text-white">3. Bridge to Equity</span>
            </div>
            <div className="px-8 py-4 text-[13px]">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="text-[12px] text-ink-2">
                    <th className="text-left font-medium pb-3 w-[230px]">Measure</th>
                    <th className="text-right font-medium pb-3 w-[190px]">Value (€m)</th>
                    <th className="text-left font-medium pb-3 pl-6">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 text-ink-2">(–) Net debt</td>
                    <td className="py-2 text-right">
                      <span className="tabular-nums font-medium text-ink bg-ai-soft border border-ai px-3 py-1 rounded">
                        {fmtEur(valuationForm.netDebt)}
                      </span>
                    </td>
                    <td className="py-2 pl-6">
                      <Input type="text" value={valuationForm.notes.netDebt ?? ""} onChange={(e) => setNote("netDebt", e.target.value)} className="h-8 w-full border-line text-[13px]" placeholder="Given from data" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-ink-2">(–) Net debt adjustments</td>
                    <td className="py-2 text-right">
                      <NumInput key={valuationForm.company + basis} value={valuationForm.netDebtAdjustments} onChange={(n) => setValuationForm((f) => ({ ...f, netDebtAdjustments: n }))} className="h-9 w-28 border-brand text-[13px] text-right text-brand font-medium ml-auto" placeholder="0.0" />
                    </td>
                    <td className="py-2 pl-6">
                      <Input type="text" value={valuationForm.notes.netDebtAdj ?? ""} onChange={(e) => setNote("netDebtAdj", e.target.value)} className="h-8 w-full border-line text-[13px]" placeholder="" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-ink-2">(–) Earn-out / Exit bonus</td>
                    <td className="py-2 text-right">
                      <NumInput key={valuationForm.company + basis} value={valuationForm.earnOutExitBonus} onChange={(n) => setValuationForm((f) => ({ ...f, earnOutExitBonus: n }))} className="h-9 w-28 border-brand text-[13px] text-right text-brand font-medium ml-auto" placeholder="0.0" />
                    </td>
                    <td className="py-2 pl-6">
                      <Input type="text" value={valuationForm.notes.earnout ?? ""} onChange={(e) => setNote("earnout", e.target.value)} className="h-8 w-full border-line text-[13px]" placeholder="" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-ink-2">(–) Transaction costs</td>
                    <td className="py-2 text-right">
                      <NumInput key={valuationForm.company + basis} value={valuationForm.transactionCosts} onChange={(n) => setValuationForm((f) => ({ ...f, transactionCosts: n }))} className="h-9 w-28 border-brand text-[13px] text-right text-brand font-medium ml-auto" placeholder="0.0" />
                    </td>
                    <td className="py-2 pl-6">
                      <Input type="text" value={valuationForm.notes.txn ?? ""} onChange={(e) => setNote("txn", e.target.value)} className="h-8 w-full border-line text-[13px]" placeholder="" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-ink-2">(+/–) Other adjustments</td>
                    <td className="py-2 text-right">
                      <NumInput key={valuationForm.company + basis} value={valuationForm.otherAdjustments} onChange={(n) => setValuationForm((f) => ({ ...f, otherAdjustments: n }))} className="h-9 w-28 border-brand text-[13px] text-right text-brand font-medium ml-auto" placeholder="0.0" />
                    </td>
                    <td className="py-2 pl-6">
                      <Input type="text" value={valuationForm.notes.other ?? ""} onChange={(e) => setNote("other", e.target.value)} className="h-8 w-full border-line text-[13px]" placeholder="" />
                    </td>
                  </tr>
                  <tr className="border-t border-line">
                    <td className="py-2 text-ink">Total deductions</td>
                    <td className="py-2 text-right tabular-nums font-medium text-ink">{fmtEur(totalDeductions)}</td>
                    <td className="py-2 pl-6">
                      <Input type="text" value={valuationForm.notes.totalDed ?? ""} onChange={(e) => setNote("totalDed", e.target.value)} className="h-8 w-full border-line text-[13px]" placeholder="Calculation" />
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="flex items-center justify-between border-t border-line pt-3 mt-3 bg-bg -mx-2 px-3 py-2 rounded">
                <span className="font-semibold text-ink text-[14px]">Equity Value</span>
                <span className="tabular-nums font-bold text-ink text-[14px]">{fmtEur(equityValue)}</span>
              </div>
            </div>

            {/* Section 4: Capital structure (waterfall) */}
            <div className="border-b border-line bg-brand px-8 py-2.5">
              <span className="text-[13px] font-semibold text-white">4. Capital structure (waterfall)</span>
            </div>
            <div className="px-8 py-4 text-[13px]">
              <table className="w-full">
                <thead>
                  <tr className="text-[12px] text-ink-2">
                    <th className="text-left font-medium pb-3">Instrument</th>
                    <th className="text-right font-medium pb-3">Face value (€m)</th>
                    <th className="text-right font-medium pb-3">Hurdle (€m)</th>
                    <th className="text-center font-medium pb-3">Priority</th>
                    <th className="text-right font-medium pb-3">Allocated value (€m)</th>
                    <th className="text-left font-medium pb-3 pl-6">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {valuationForm.capitalStructure.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 text-ink">{item.instrument}</td>
                      <td className="py-1.5 text-right">
                        <NumInput key={valuationForm.company} value={item.faceValue} onChange={(n) => setValuationForm((f) => ({ ...f, capitalStructure: f.capitalStructure.map((x, i) => (i === idx ? { ...x, faceValue: n } : x)) }))} className={cn("h-8 w-24 text-[13px] text-right font-medium ml-auto", item.faceValue > 0 ? "border-brand text-brand" : "border-line")} placeholder="—" />
                      </td>
                      <td className="py-1.5 text-right">
                        <NumInput key={valuationForm.company} value={item.hurdle} onChange={(n) => setValuationForm((f) => ({ ...f, capitalStructure: f.capitalStructure.map((x, i) => (i === idx ? { ...x, hurdle: n } : x)) }))} className={cn("h-8 w-24 text-[13px] text-right font-medium ml-auto", item.hurdle > 0 ? "border-brand text-brand" : "border-line")} placeholder="0.0" />
                      </td>
                      <td className="py-1.5 text-center text-ink-2">{item.priority}</td>
                      <td className="py-1.5 text-right tabular-nums text-ink">{fmtEur(waterfallAllocations[idx])}</td>
                      <td className="py-1.5 pl-6">
                        <Input
                          type="text"
                          value={item.notes}
                          onChange={(e) => {
                            const newStructure = [...valuationForm.capitalStructure]
                            newStructure[idx].notes = e.target.value
                            setValuationForm({ ...valuationForm, capitalStructure: newStructure })
                          }}
                          className="h-8 w-full border-line text-[13px]"
                          placeholder=""
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t border-line mt-3 pt-3 space-y-2">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-medium text-ink">Total allocated</span>
                  <span className="tabular-nums font-medium text-ink">{fmtEur(totalAllocated)}</span>
                </div>
                <div className="flex items-center justify-between italic text-ink-2 text-[13px]">
                  <span>Check (Equity Value – Allocated)</span>
                  <span className="tabular-nums text-ai">{fmtEur(checkEquityAllocated)}</span>
                </div>
              </div>
            </div>

            {/* Section 5: Your positions */}
            <div className="border-b border-line bg-brand px-8 py-2.5">
              <span className="text-[13px] font-semibold text-white">5. Your positions</span>
            </div>
            <div className="px-8 py-4 text-[13px]">
              <table className="w-full">
                <thead>
                  <tr className="text-[12px] text-ink-2">
                    <th className="text-left font-medium pb-3">Instrument held</th>
                    <th className="text-left font-medium pb-3">Fund</th>
                    <th className="text-right font-medium pb-3">Own %</th>
                    <th className="text-right font-medium pb-3">Adj. (€m)</th>
                    <th className="text-right font-medium pb-3">Allocated value (€m)</th>
                    <th className="text-right font-medium pb-3">FMV (€m)</th>
                    <th className="text-left font-medium pb-3 pl-6">Commentary</th>
                  </tr>
                </thead>
                <tbody>
                  {positionRows.map((pos, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 text-ink">{pos.instrument}</td>
                      <td className="py-1.5 text-ink">{selectedFund.shortName}</td>
                      <td className="py-1.5 text-right">
                        <NumInput key={valuationForm.company} value={pos.ownPct} onChange={(n) => setValuationForm((f) => ({ ...f, positions: f.positions.map((x, i) => (i === idx ? { ...x, ownPct: n } : x)) }))} className={cn("h-8 w-20 text-[13px] text-right font-medium ml-auto", pos.ownPct > 0 ? "border-brand text-brand" : "border-line")} placeholder="—" />
                      </td>
                      <td className="py-1.5 text-right">
                        <NumInput key={valuationForm.company} value={pos.adj} onChange={(n) => setValuationForm((f) => ({ ...f, positions: f.positions.map((x, i) => (i === idx ? { ...x, adj: n } : x)) }))} className={cn("h-8 w-20 text-[13px] text-right font-medium ml-auto", pos.adj !== 0 ? "border-brand text-brand" : "border-line")} placeholder="—" />
                      </td>
                      <td className="py-1.5 text-right tabular-nums text-ink">{fmtEur(pos.allocatedValue)}</td>
                      <td className="py-1.5 text-right tabular-nums font-medium text-ink">{pos.fmv > 0 ? fmtEur(pos.fmv) : "—"}</td>
                      <td className="py-1.5 pl-6">
                        <Input
                          type="text"
                          value={pos.commentary}
                          onChange={(e) => {
                            const newPositions = [...valuationForm.positions]
                            newPositions[idx].commentary = e.target.value
                            setValuationForm({ ...valuationForm, positions: newPositions })
                          }}
                          className="h-8 w-full border-line text-[13px]"
                          placeholder=""
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t-2 border-ink mt-4 pt-3 flex items-center justify-between font-semibold text-[14px]">
                <span className="text-ink">Total FMV (your positions)</span>
                <span className="tabular-nums text-ink">{fmtEur(totalFMV)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 border-t border-line px-8 py-5 bg-bg">
              {!valuationCompany ? (
                <span className="mr-auto text-[12px] text-ink-2">Select a company to load its figures.</span>
              ) : adjNoteMissing ? (
                <span className="mr-auto text-[12px] text-alert">Add a note for the adjustment to save.</span>
              ) : null}
              <Button
                variant="outline"
                className="border-line text-ink hover:bg-white h-10 px-6"
                onClick={() => setShowNewValuation(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-brand text-white hover:bg-action-hover h-10 px-6 disabled:opacity-40"
                onClick={saveValuation}
                disabled={!canSaveValuation}
              >
                Save Valuation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update EXIT Scenario Dialog */}
      <Dialog open={showExitScenario} onOpenChange={setShowExitScenario}>
        <DialogContent className="max-w-[600px] p-0">
          <DialogHeader className="border-b border-line px-6 py-4">
            <DialogTitle className="text-lg font-medium text-ink">Update EXIT Scenario</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto p-6">
            {/* Company & Exit Year */}
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-ink-2">Company</label>
                <Select value={exitForm.company} onValueChange={selectExitCompany}>
                  <SelectTrigger className="h-9 border-line text-[12px]">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {fundCompanies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-ink-2">Expected Exit Year</label>
                <Select value={exitForm.exitYear} onValueChange={(v) => setExitForm({ ...exitForm, exitYear: v })}>
                  <SelectTrigger className="h-9 border-line text-[12px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["2025", "2026", "2027", "2028", "2029", "2030"].map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Yearly Projections Table */}
            <div className="mb-4 rounded-lg border border-line">
              <div className="border-b border-line bg-bg px-4 py-2">
                <span className="text-[12px] font-medium text-ink">Yearly Projections (€k)</span>
              </div>
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-line bg-surface-2">
                    <th className="px-4 py-2 text-left font-medium text-ink-2">Year</th>
                    <th className="px-4 py-2 text-center font-medium text-ink-2">Revenue</th>
                    <th className="px-4 py-2 text-center font-medium text-ink-2">EBITDA</th>
                    <th className="px-4 py-2 text-center font-medium text-ink-2">Net Debt</th>
                  </tr>
                </thead>
                <tbody>
                  {exitForm.projections.map((row, idx) => (
                    <tr key={idx} className="border-b border-line last:border-b-0">
                      <td className="px-4 py-2">
                        <span className={cn("font-medium", row.year === exitForm.exitYear ? "text-ai" : "text-ink")}>
                          {row.year}{row.year === exitForm.exitYear ? " (EXIT)" : ""}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          type="number"
                          value={row.revenue}
                          onChange={(e) => {
                            const newProjections = [...exitForm.projections]
                            newProjections[idx].revenue = parseFloat(e.target.value) || 0
                            setExitForm({ ...exitForm, projections: newProjections })
                          }}
                          className="h-8 border-line text-center text-[11px]"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          type="number"
                          value={row.ebitda}
                          onChange={(e) => {
                            const newProjections = [...exitForm.projections]
                            newProjections[idx].ebitda = parseFloat(e.target.value) || 0
                            setExitForm({ ...exitForm, projections: newProjections })
                          }}
                          className={cn("h-8 text-center text-[11px]", row.ebitda !== exitBaseline[idx] ? "border-[#B8975A] bg-[#FFFDF8]" : "border-line")}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          type="number"
                          value={row.netDebt}
                          onChange={(e) => {
                            const newProjections = [...exitForm.projections]
                            newProjections[idx].netDebt = parseFloat(e.target.value) || 0
                            setExitForm({ ...exitForm, projections: newProjections })
                          }}
                          className="h-8 border-line text-center text-[11px]"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {exitEbitdaChanged && (
              <div className="mb-4 rounded-lg border border-[#EBD9B5] bg-[#FFFDF8] p-3">
                <label className="mb-1.5 block text-[11px] font-medium text-ink">Note for the EBITDA change (required)</label>
                <Input
                  type="text"
                  value={exitForm.note}
                  onChange={(e) => setExitForm({ ...exitForm, note: e.target.value })}
                  className={cn("h-9 text-[12px]", exitNoteMissing ? "border-alert bg-[#FDF3F2]" : "border-line")}
                  placeholder="Why are the EBITDA projections changed?"
                />
                {exitNoteMissing && <p className="mt-1 flex items-center gap-1 text-[11px] text-alert"><AlertCircle className="h-3 w-3" />A note is required when you change the EBITDA.</p>}
              </div>
            )}

            {/* EXIT Valuation Parameters */}
            <div className="rounded-lg border border-line p-4">
              <div className="mb-3 text-[12px] font-medium text-ink">EXIT Valuation Parameters</div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-ink-2">EXIT EV/EBITDA Multiple</label>
                  <Input
                    type="number"
                    value={exitForm.exitMultiple}
                    onChange={(e) => setExitForm({ ...exitForm, exitMultiple: parseFloat(e.target.value) || 0 })}
                    className="h-9 border-line text-[12px]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-ink-2">Shareholding %</label>
                  <Input
                    type="number"
                    value={exitForm.exitShareholding}
                    onChange={(e) => setExitForm({ ...exitForm, exitShareholding: parseFloat(e.target.value) || 0 })}
                    className="h-9 border-line text-[12px]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-ink-2">Cumpref Value (€k)</label>
                  <Input
                    type="text"
                    placeholder="Leave empty if none"
                    value={exitForm.exitCumpref}
                    onChange={(e) => setExitForm({ ...exitForm, exitCumpref: e.target.value })}
                    className="h-9 border-line text-[12px]"
                  />
                </div>
              </div>

              {/* Calculated EXIT values */}
              <div className="mt-4 space-y-2 border-t border-line pt-3">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-ink-2">EXIT EBITDA ({exitForm.exitYear})</span>
                  <span className="font-medium text-ink">{fmtMk(exitEbitdaK)}</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-ink-2">EXIT Enterprise Value ({exitForm.exitMultiple.toFixed(1)}x)</span>
                  <span className="font-medium text-ink">{fmtMk(exitEvK)}</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-ink-2">EXIT Net Debt ({exitForm.exitYear})</span>
                  <span className="font-medium text-ink">{fmtMk(exitNetDebtK)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-line pt-2 text-[12px]">
                  <span className="font-medium text-ink">Total proceeds (equity value)</span>
                  <span className="font-semibold text-ink">{fmtMk(exitEquityK)}</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-ink-2">Fund share ({exitForm.exitShareholding}%)</span>
                  <span className="font-medium text-ink">{fmtMk(exitFundShareK)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex justify-end gap-3">
              <Button
                variant="outline"
                className="border-line text-ink hover:bg-bg"
                onClick={() => setShowExitScenario(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-brand text-white hover:bg-action-hover disabled:opacity-40"
                onClick={saveExit}
                disabled={!canSaveExit}
              >
                Save EXIT Scenario
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
