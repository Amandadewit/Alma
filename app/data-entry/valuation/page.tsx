"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { companies, funds } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Plus, Pencil } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export default function ValuationEntryPage() {
  const [selectedFund, setSelectedFund] = useState(funds[0])
  const [showNewValuation, setShowNewValuation] = useState(false)
  const [showExitScenario, setShowExitScenario] = useState(false)
  const [selectedQuarter, setSelectedQuarter] = useState("Q4")

  const fundCompanies = companies.filter((c) => c.fundId === selectedFund.id)

  // Valuation form state - New Valuation Entry (all values in €m)
  const [valuationForm, setValuationForm] = useState({
    // 1. Company
    company: "",
    quarterDate: "30-Jun-2026",
    // 2. Enterprise Value (Multiple method)
    earningsBasis: "NORM_EBITDA", // dropdown: Norm. EBITDA, LTM EBITDA, LTM Revenue, LE EBITDA
    ltmMetricValue: 0.9, // Given from data (€m)
    adjustments: 0, // Input field (€m)
    evEbitdaBasis: "Entry", // dropdown: Entry, Current, Peer
    multiple: 7.0, // EV/EBITDA multiple
    // 3. Bridge to Equity (all €m)
    netDebt: 0, // Given from data
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
  })

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

  // Exit scenario form state
  const [exitForm, setExitForm] = useState({
    company: "",
    exitYear: "2027",
    projections: [
      { year: "2025", revenue: 45000, ebitda: 6500, netDebt: 25000 },
      { year: "2026", revenue: 52000, ebitda: 7800, netDebt: 22000 },
      { year: "2027 (EXIT)", revenue: 58000, ebitda: 9200, netDebt: 18000, isExit: true },
      { year: "2028", revenue: 65000, ebitda: 10500, netDebt: 14000 },
      { year: "2029", revenue: 72000, ebitda: 12000, netDebt: 10000 },
      { year: "2030", revenue: 80000, ebitda: 14000, netDebt: 5000 },
    ],
    exitMultiple: 8,
    exitShareholding: 75,
    exitCumpref: "",
  })

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
    const q4FV = c.valuation.current.fairValue * 1000
    const q3FV = q4FV * (0.85 + seedFV)
    const deltaFV = q4FV - q3FV
    const q4MOI = c.valuation.current.moi
    const q3MOI = q4MOI * (0.9 + seedMOI)
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
  const exitScenarioData = fundCompanies.map((c, i) => ({
    company: c.name,
    status: c.status === "on-track" ? "P" : c.status === "watch" ? "W" : "X",
    exitYear: 2026 + (i % 3),
    investment: c.valuation.exit.investedValue,
    totalProceeds: c.valuation.exit.fairValue,
    moi: c.valuation.exit.moi,
    lastUpdated: `${15 + i} apr 2026`,
  }))

  const exitTotals = {
    investment: exitScenarioData.reduce((sum, c) => sum + c.investment, 0),
    totalProceeds: exitScenarioData.reduce((sum, c) => sum + c.totalProceeds, 0),
    avgMoi: exitScenarioData.reduce((sum, c) => sum + c.moi, 0) / exitScenarioData.length,
  }

  return (
    <div className="flex min-h-screen flex-col font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E8E6E0] px-6 py-4">
        <div>
          <h1 className="text-xl font-medium text-[#2C2C2A]">Valuation Entry</h1>
          <p className="text-[13px] text-[#6B6963]">Manage portfolio valuations and scenarios</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-[#E8E6E0] bg-white text-[#2C2C2A] hover:bg-[#F7F6F3]"
            onClick={() => setShowExitScenario(true)}
          >
            <TrendingUp className="h-4 w-4" />
            Update EXIT Scenario
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-[#1B4D45] text-white hover:bg-[#164039]"
            onClick={() => setShowNewValuation(true)}
          >
            <Plus className="h-4 w-4" />
            New Valuation
          </Button>
        </div>
      </div>

      {/* Fund Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E6E0] px-6 py-3">
        <span className="text-[13px] text-[#6B6963]">Fund:</span>
        {funds.map((fund) => (
          <button
            key={fund.id}
            onClick={() => setSelectedFund(fund)}
            className={cn(
              "rounded-lg px-4 py-2 text-[13px] font-medium transition-colors",
              selectedFund.id === fund.id
                ? "bg-[#1B4D45] text-white"
                : "bg-[#F7F6F3] text-[#6B6963] hover:bg-[#E8E6E0]"
            )}
          >
            {fund.shortName}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Portfolio Valuation Chart */}
          <div className="rounded-[10px] border border-[#E8E6E0] bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[13px] font-medium text-[#2C2C2A]">Portfolio Valuation</h2>
              <div className="flex items-center gap-4 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm bg-[#9CA3AF]" />
                  <span className="text-[#6B6963]">Investment</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm bg-[#1B4D45]" />
                  <span className="text-[#6B6963]">Fair Value</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm bg-[#B8975A]" />
                  <span className="text-[#6B6963]">Total (expected) proceeds</span>
                </div>
              </div>
            </div>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={portfolioChartData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6B6963" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#6B6963" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}M`} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #E8E6E0" }} />
                  <Bar dataKey="Investment" fill="#9CA3AF" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Fair Value" fill="#1B4D45" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Total Exit" fill="#B8975A" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fund Valuation Chart */}
          <div className="rounded-[10px] border border-[#E8E6E0] bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[13px] font-medium text-[#2C2C2A]">Fund Valuation</h2>
              <div className="flex items-center gap-4 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm bg-[#1B4D45]" />
                  <span className="text-[#6B6963]">Fair + Realised Value</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm bg-[#B8975A]" />
                  <span className="text-[#6B6963]">Exit Valuation</span>
                </div>
              </div>
            </div>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quarterlyChartData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E0" vertical={false} />
                  <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: "#6B6963" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#6B6963" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}M`} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #E8E6E0" }} />
                  <Bar dataKey="Fair + Realised Value" fill="#1B4D45" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Exit Valuation" fill="#B8975A" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Table 1: Huidige Waarderingen (Current Valuations) */}
        <div className="rounded-[10px] border border-[#E8E6E0] bg-white">
          <div className="flex items-center justify-between border-b border-[#E8E6E0] px-4 py-3">
            <div className="flex items-center gap-3">
              <h2 className="text-[13px] font-medium text-[#2C2C2A]">Huidige Waarderingen</h2>
              <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                <SelectTrigger className="h-8 w-28 border-[#E8E6E0] text-[11px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q4">Q4 2025</SelectItem>
                  <SelectItem value="Q3">Q3 2025</SelectItem>
                  <SelectItem value="Q2">Q2 2025</SelectItem>
                  <SelectItem value="Q1">Q1 2025</SelectItem>
                </SelectContent>
              </Select>
              <span className="rounded bg-[#1B4D45]/10 px-2 py-0.5 text-[10px] font-medium text-[#1B4D45]">Current</span>
            </div>
            <span className="text-[10px] text-[#6B6963]">Click row to edit</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-[#E8E6E0] bg-[#F7F6F3]">
                  <th className="px-4 py-2.5 text-left font-medium text-[#6B6963]">Company</th>
                  <th className="px-4 py-2.5 text-center font-medium text-[#6B6963]">Status</th>
                  <th className="px-4 py-2.5 text-right font-medium text-[#6B6963]">Investment</th>
                  <th className="px-4 py-2.5 text-right font-medium text-[#6B6963]">Fair Value</th>
                  <th className="px-4 py-2.5 text-right font-medium text-[#6B6963]">Realised</th>
                  <th className="px-4 py-2.5 text-right font-medium text-[#6B6963]">MOI</th>
                  <th className="w-10 px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {fundCompanies.map((company) => (
                  <tr key={company.id} className="cursor-pointer border-b border-[#E8E6E0] hover:bg-[#F7F6F3]">
                    <td className="px-4 py-2.5 font-medium text-[#2C2C2A]">{company.name}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={cn(
                        "inline-block w-5 text-[10px] font-medium",
                        company.status === "on-track" ? "text-[#1B4D45]" :
                        company.status === "watch" ? "text-[#B8975A]" : "text-[#A32D2D]"
                      )}>
                        {company.status === "on-track" ? "P" : company.status === "watch" ? "W" : "X"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-[#2C2C2A]">
                      {(company.valuation.current.investedValue * 1000).toFixed(0)}K
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-[#2C2C2A]">
                      {(company.valuation.current.fairValue * 1000).toFixed(0)}K
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-[#2C2C2A]">
                      {company.valuation.exit.fairValue > company.valuation.current.fairValue * 1.5 ? "100K" : "0"}
                    </td>
                    <td className={cn(
                      "px-4 py-2.5 text-right tabular-nums font-medium",
                      company.valuation.current.moi >= 1 ? "text-[#2C2C2A]" : "text-[#A32D2D]"
                    )}>
                      {company.valuation.current.moi.toFixed(2)}x
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Pencil className="h-3.5 w-3.5 text-[#6B6963]" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Huidig vs Vorige Versie (Quarter Comparison) */}
        <div className="rounded-[10px] border border-[#E8E6E0] bg-white">
          <div className="flex items-center justify-between border-b border-[#E8E6E0] px-4 py-3">
            <h2 className="text-[13px] font-medium text-[#2C2C2A]">Huidig vs Vorige Versie (Q4 2025 vs Q3 2025)</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-[#E8E6E0] bg-[#F7F6F3]">
                  <th className="px-4 py-2.5 text-left font-medium text-[#6B6963]">Company</th>
                  <th className="px-4 py-2.5 text-right font-medium text-[#6B6963]">Q4 FV</th>
                  <th className="px-4 py-2.5 text-right font-medium text-[#6B6963]">Q3 FV</th>
                  <th className="px-4 py-2.5 text-right font-medium text-[#6B6963]">Δ FV</th>
                  <th className="px-4 py-2.5 text-right font-medium text-[#6B6963]">Q4 MOI</th>
                  <th className="px-4 py-2.5 text-right font-medium text-[#6B6963]">Q3 MOI</th>
                  <th className="px-4 py-2.5 text-right font-medium text-[#6B6963]">Δ MOI</th>
                </tr>
              </thead>
              <tbody>
                {quarterComparisonData.map((row, i) => (
                  <tr key={i} className="border-b border-[#E8E6E0] hover:bg-[#F7F6F3]">
                    <td className="px-4 py-2.5 font-medium text-[#2C2C2A]">{row.company}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-[#2C2C2A]">
                      {row.q4FV >= 1000 ? `${(row.q4FV / 1000).toFixed(0)}K` : row.q4FV.toFixed(0)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-[#2C2C2A]">
                      {row.q3FV >= 1000 ? `${(row.q3FV / 1000).toFixed(0)}K` : row.q3FV.toFixed(0)}
                    </td>
                    <td className={cn(
                      "px-4 py-2.5 text-right tabular-nums font-medium",
                      row.deltaFV >= 0 ? "text-[#3B6D11]" : "text-[#A32D2D]"
                    )}>
                      {row.deltaFV >= 0 ? "+" : ""}{row.deltaFV >= 1000 ? `${(row.deltaFV / 1000).toFixed(0)}K` : row.deltaFV.toFixed(0)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-[#2C2C2A]">{row.q4MOI.toFixed(2)}x</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-[#2C2C2A]">{row.q3MOI.toFixed(2)}x</td>
                    <td className={cn(
                      "px-4 py-2.5 text-right tabular-nums font-medium",
                      row.deltaMOI >= 0 ? "text-[#3B6D11]" : "text-[#A32D2D]"
                    )}>
                      {row.deltaMOI >= 0 ? "+" : ""}{row.deltaMOI.toFixed(2)}x
                    </td>
                  </tr>
                ))}
                {/* Total row */}
                <tr className="border-t-2 border-[#E8E6E0] bg-[#F7F6F3]">
                  <td className="px-4 py-2.5 font-medium text-[#B8975A]">Total</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-[#B8975A]">
                    {(comparisonTotals.q4FV / 1000).toFixed(0)}K
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-[#B8975A]">
                    {(comparisonTotals.q3FV / 1000).toFixed(0)}K
                  </td>
                  <td className={cn(
                    "px-4 py-2.5 text-right tabular-nums font-medium",
                    comparisonTotals.deltaFV >= 0 ? "text-[#3B6D11]" : "text-[#A32D2D]"
                  )}>
                    {comparisonTotals.deltaFV >= 0 ? "+" : ""}{(comparisonTotals.deltaFV / 1000).toFixed(0)}K
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-[#B8975A]">{comparisonTotals.q4MOI.toFixed(2)}x</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-[#B8975A]">{comparisonTotals.q3MOI.toFixed(2)}x</td>
                  <td className={cn(
                    "px-4 py-2.5 text-right tabular-nums font-medium",
                    comparisonTotals.deltaMOI >= 0 ? "text-[#3B6D11]" : "text-[#A32D2D]"
                  )}>
                    {comparisonTotals.deltaMOI >= 0 ? "+" : ""}{comparisonTotals.deltaMOI.toFixed(2)}x
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 3: EXIT Outlooks */}
        <div className="rounded-[10px] border border-[#E8E6E0] bg-white">
          <div className="flex items-center justify-between border-b border-[#E8E6E0] px-4 py-3">
            <div className="flex items-center gap-3">
              <h2 className="text-[13px] font-medium text-[#2C2C2A]">EXIT Outlooks</h2>
              <span className="rounded bg-[#B8975A]/10 px-2 py-0.5 text-[10px] font-medium text-[#B8975A]">Projected</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-[#E8E6E0] bg-[#F7F6F3]">
                  <th className="px-4 py-2.5 text-left font-medium text-[#6B6963]">Company</th>
                  <th className="px-4 py-2.5 text-center font-medium text-[#6B6963]">Status</th>
                  <th className="px-4 py-2.5 text-center font-medium text-[#6B6963]">Exit Year</th>
                  <th className="px-4 py-2.5 text-right font-medium text-[#6B6963]">Investment</th>
                  <th className="px-4 py-2.5 text-right font-medium text-[#6B6963]">Total Proceeds</th>
                  <th className="px-4 py-2.5 text-right font-medium text-[#6B6963]">MOI</th>
                  <th className="px-4 py-2.5 text-right font-medium text-[#6B6963]">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {exitScenarioData.map((row, i) => (
                  <tr key={i} className="border-b border-[#E8E6E0] hover:bg-[#F7F6F3]">
                    <td className="px-4 py-2.5 font-medium text-[#2C2C2A]">{row.company}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={cn(
                        "inline-block w-5 text-[10px] font-medium",
                        row.status === "P" ? "text-[#1B4D45]" :
                        row.status === "W" ? "text-[#B8975A]" : "text-[#A32D2D]"
                      )}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center tabular-nums text-[#B8975A]">{row.exitYear}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-[#2C2C2A]">{row.investment.toFixed(1)}M</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-[#2C2C2A]">{row.totalProceeds.toFixed(1)}M</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-medium text-[#2C2C2A]">{row.moi.toFixed(2)}x</td>
                    <td className="px-4 py-2.5 text-right text-[#6B6963]">{row.lastUpdated}</td>
                  </tr>
                ))}
                {/* Total row */}
                <tr className="border-t-2 border-[#E8E6E0] bg-[#F7F6F3]">
                  <td className="px-4 py-2.5 font-medium text-[#B8975A]">Total</td>
                  <td className="px-4 py-2.5"></td>
                  <td className="px-4 py-2.5 text-center tabular-nums text-[#B8975A]">2028</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-[#B8975A]">{exitTotals.investment.toFixed(1)}M</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-[#B8975A]">{exitTotals.totalProceeds.toFixed(1)}M</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-[#B8975A]">{exitTotals.avgMoi.toFixed(2)}x</td>
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
          <DialogHeader className="border-b border-[#E8E6E0] px-8 py-5 bg-[#1B4D45]">
            <DialogTitle className="text-xl font-medium text-white">New Valuation Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-0">
            {/* Section 1: Company */}
            <div className="border-b border-[#E8E6E0] bg-[#1B4D45] px-8 py-2.5">
              <span className="text-[13px] font-semibold text-white">1. Company</span>
            </div>
            <div className="grid grid-cols-2 gap-6 px-8 py-5 text-[13px]">
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] text-[#6B6963]">Company name</span>
                <Select value={valuationForm.company} onValueChange={(v) => setValuationForm({ ...valuationForm, company: v })}>
                  <SelectTrigger className="h-9 w-full border-[#1B4D45] text-[13px]">
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
                <span className="text-[12px] text-[#6B6963]">Valuation date</span>
                <Select value={valuationForm.quarterDate} onValueChange={(v) => setValuationForm({ ...valuationForm, quarterDate: v })}>
                  <SelectTrigger className="h-9 w-full border-[#1B4D45] text-[13px]">
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
            <div className="border-b border-[#E8E6E0] bg-[#1B4D45] px-8 py-2.5">
              <span className="text-[13px] font-semibold text-white">2. Enterprise Value (Multiple method)</span>
            </div>
            <div className="px-8 py-4 text-[13px]">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="text-[12px] text-[#6B6963]">
                    <th className="text-left font-medium pb-3 w-[230px]">Measure</th>
                    <th className="text-right font-medium pb-3 w-[190px]">Value (€m)</th>
                    <th className="text-left font-medium pb-3 pl-6">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 text-[#6B6963]">Earnings basis</td>
                    <td className="py-2 text-right">
                      <Select value={valuationForm.earningsBasis} onValueChange={(v) => setValuationForm({ ...valuationForm, earningsBasis: v })}>
                        <SelectTrigger className="h-9 w-40 border-[#1B4D45] text-[13px] ml-auto">
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
                      <Input type="text" className="h-8 w-full border-[#E8E6E0] text-[13px]" placeholder="" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-[#6B6963]">LTM metric value</td>
                    <td className="py-2 text-right">
                      <span className="tabular-nums font-medium text-[#2C2C2A] bg-[#F5EFE0] border border-[#B8975A] px-3 py-1 rounded">
                        {fmtEur(valuationForm.ltmMetricValue)}
                      </span>
                    </td>
                    <td className="py-2 pl-6">
                      <Input type="text" className="h-8 w-full border-[#E8E6E0] text-[13px]" placeholder="Given from data" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-[#6B6963]">Adjustments</td>
                    <td className="py-2 text-right">
                      <Input
                        type="text"
                        value={valuationForm.adjustments || ""}
                        onChange={(e) => setValuationForm({ ...valuationForm, adjustments: parseFloat(e.target.value) || 0 })}
                        className="h-9 w-28 border-[#1B4D45] text-[13px] text-right text-[#1B4D45] font-medium ml-auto"
                        placeholder="0.0"
                      />
                    </td>
                    <td className="py-2 pl-6">
                      <Input type="text" className="h-8 w-full border-[#E8E6E0] text-[13px]" placeholder="" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-[#6B6963]">Adjusted LTM Valuation Value</td>
                    <td className="py-2 text-right tabular-nums font-medium text-[#2C2C2A]">{fmtEur(ltmValuationValue)}</td>
                    <td className="py-2 pl-6">
                      <Input type="text" className="h-8 w-full border-[#E8E6E0] text-[13px]" placeholder="Calculation" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-[#6B6963]">EV/EBITDA</td>
                    <td className="py-2">
                      <div className="flex items-center justify-end gap-2">
                        <Select value={valuationForm.evEbitdaBasis} onValueChange={(v) => setValuationForm({ ...valuationForm, evEbitdaBasis: v })}>
                          <SelectTrigger className="h-9 w-[88px] border-[#1B4D45] text-[13px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Entry">Entry</SelectItem>
                            <SelectItem value="Current">Current</SelectItem>
                            <SelectItem value="Peer">Peer</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className="tabular-nums font-medium text-[#2C2C2A] bg-[#F5EFE0] border border-[#B8975A] px-2 py-1 rounded w-16 text-right">
                          {valuationForm.multiple.toFixed(1)}x
                        </span>
                      </div>
                    </td>
                    <td className="py-2 pl-6">
                      <Input type="text" className="h-8 w-full border-[#E8E6E0] text-[13px]" placeholder="" />
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="flex items-center justify-between border-t border-[#E8E6E0] pt-3 mt-3">
                <span className="font-semibold text-[#2C2C2A] text-[14px]">Enterprise Value</span>
                <span className="tabular-nums font-bold text-[#2C2C2A] text-[14px]">{fmtEur(enterpriseValue)}</span>
              </div>
            </div>

            {/* Section 3: Bridge to Equity */}
            <div className="border-b border-[#E8E6E0] bg-[#1B4D45] px-8 py-2.5">
              <span className="text-[13px] font-semibold text-white">3. Bridge to Equity</span>
            </div>
            <div className="px-8 py-4 text-[13px]">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="text-[12px] text-[#6B6963]">
                    <th className="text-left font-medium pb-3 w-[230px]">Measure</th>
                    <th className="text-right font-medium pb-3 w-[190px]">Value (€m)</th>
                    <th className="text-left font-medium pb-3 pl-6">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 text-[#6B6963]">(–) Net debt</td>
                    <td className="py-2 text-right">
                      <span className="tabular-nums font-medium text-[#2C2C2A] bg-[#F5EFE0] border border-[#B8975A] px-3 py-1 rounded">
                        {fmtEur(valuationForm.netDebt)}
                      </span>
                    </td>
                    <td className="py-2 pl-6">
                      <Input type="text" className="h-8 w-full border-[#E8E6E0] text-[13px]" placeholder="Given from data" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-[#6B6963]">(–) Net debt adjustments</td>
                    <td className="py-2 text-right">
                      <Input
                        type="text"
                        value={valuationForm.netDebtAdjustments || ""}
                        onChange={(e) => setValuationForm({ ...valuationForm, netDebtAdjustments: parseFloat(e.target.value) || 0 })}
                        className="h-9 w-28 border-[#1B4D45] text-[13px] text-right text-[#1B4D45] font-medium ml-auto"
                        placeholder="0.0"
                      />
                    </td>
                    <td className="py-2 pl-6">
                      <Input type="text" className="h-8 w-full border-[#E8E6E0] text-[13px]" placeholder="" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-[#6B6963]">(–) Earn-out / Exit bonus</td>
                    <td className="py-2 text-right">
                      <Input
                        type="text"
                        value={valuationForm.earnOutExitBonus || ""}
                        onChange={(e) => setValuationForm({ ...valuationForm, earnOutExitBonus: parseFloat(e.target.value) || 0 })}
                        className="h-9 w-28 border-[#1B4D45] text-[13px] text-right text-[#1B4D45] font-medium ml-auto"
                        placeholder="0.0"
                      />
                    </td>
                    <td className="py-2 pl-6">
                      <Input type="text" className="h-8 w-full border-[#E8E6E0] text-[13px]" placeholder="" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-[#6B6963]">(–) Transaction costs</td>
                    <td className="py-2 text-right">
                      <Input
                        type="text"
                        value={valuationForm.transactionCosts || ""}
                        onChange={(e) => setValuationForm({ ...valuationForm, transactionCosts: parseFloat(e.target.value) || 0 })}
                        className="h-9 w-28 border-[#1B4D45] text-[13px] text-right text-[#1B4D45] font-medium ml-auto"
                        placeholder="0.0"
                      />
                    </td>
                    <td className="py-2 pl-6">
                      <Input type="text" className="h-8 w-full border-[#E8E6E0] text-[13px]" placeholder="" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-[#6B6963]">(+/–) Other adjustments</td>
                    <td className="py-2 text-right">
                      <Input
                        type="text"
                        value={valuationForm.otherAdjustments || ""}
                        onChange={(e) => setValuationForm({ ...valuationForm, otherAdjustments: parseFloat(e.target.value) || 0 })}
                        className="h-9 w-28 border-[#1B4D45] text-[13px] text-right text-[#1B4D45] font-medium ml-auto"
                        placeholder="0.0"
                      />
                    </td>
                    <td className="py-2 pl-6">
                      <Input type="text" className="h-8 w-full border-[#E8E6E0] text-[13px]" placeholder="" />
                    </td>
                  </tr>
                  <tr className="border-t border-[#E8E6E0]">
                    <td className="py-2 text-[#2C2C2A]">Total deductions</td>
                    <td className="py-2 text-right tabular-nums font-medium text-[#2C2C2A]">{fmtEur(totalDeductions)}</td>
                    <td className="py-2 pl-6">
                      <Input type="text" className="h-8 w-full border-[#E8E6E0] text-[13px]" placeholder="Calculation" />
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="flex items-center justify-between border-t border-[#E8E6E0] pt-3 mt-3 bg-[#F7F6F3] -mx-2 px-3 py-2 rounded">
                <span className="font-semibold text-[#2C2C2A] text-[14px]">Equity Value</span>
                <span className="tabular-nums font-bold text-[#2C2C2A] text-[14px]">{fmtEur(equityValue)}</span>
              </div>
            </div>

            {/* Section 4: Capital structure (waterfall) */}
            <div className="border-b border-[#E8E6E0] bg-[#1B4D45] px-8 py-2.5">
              <span className="text-[13px] font-semibold text-white">4. Capital structure (waterfall)</span>
            </div>
            <div className="px-8 py-4 text-[13px]">
              <table className="w-full">
                <thead>
                  <tr className="text-[12px] text-[#6B6963]">
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
                      <td className="py-1.5 text-[#2C2C2A]">{item.instrument}</td>
                      <td className="py-1.5 text-right">
                        <Input
                          type="text"
                          value={item.faceValue || ""}
                          onChange={(e) => {
                            const newStructure = [...valuationForm.capitalStructure]
                            newStructure[idx].faceValue = parseFloat(e.target.value) || 0
                            setValuationForm({ ...valuationForm, capitalStructure: newStructure })
                          }}
                          className={cn("h-8 w-24 text-[13px] text-right font-medium ml-auto", item.faceValue > 0 ? "border-[#1B4D45] text-[#1B4D45]" : "border-[#E8E6E0]")}
                          placeholder="—"
                        />
                      </td>
                      <td className="py-1.5 text-right">
                        <Input
                          type="text"
                          value={item.hurdle || ""}
                          onChange={(e) => {
                            const newStructure = [...valuationForm.capitalStructure]
                            newStructure[idx].hurdle = parseFloat(e.target.value) || 0
                            setValuationForm({ ...valuationForm, capitalStructure: newStructure })
                          }}
                          className={cn("h-8 w-24 text-[13px] text-right font-medium ml-auto", item.hurdle > 0 ? "border-[#1B4D45] text-[#1B4D45]" : "border-[#E8E6E0]")}
                          placeholder="0.0"
                        />
                      </td>
                      <td className="py-1.5 text-center text-[#6B6963]">{item.priority}</td>
                      <td className="py-1.5 text-right tabular-nums text-[#2C2C2A]">{fmtEur(waterfallAllocations[idx])}</td>
                      <td className="py-1.5 pl-6">
                        <Input
                          type="text"
                          value={item.notes}
                          onChange={(e) => {
                            const newStructure = [...valuationForm.capitalStructure]
                            newStructure[idx].notes = e.target.value
                            setValuationForm({ ...valuationForm, capitalStructure: newStructure })
                          }}
                          className="h-8 w-full border-[#E8E6E0] text-[13px]"
                          placeholder=""
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t border-[#E8E6E0] mt-3 pt-3 space-y-2">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-medium text-[#2C2C2A]">Total allocated</span>
                  <span className="tabular-nums font-medium text-[#2C2C2A]">{fmtEur(totalAllocated)}</span>
                </div>
                <div className="flex items-center justify-between italic text-[#6B6963] text-[13px]">
                  <span>Check (Equity Value – Allocated)</span>
                  <span className="tabular-nums text-[#B8975A]">{fmtEur(checkEquityAllocated)}</span>
                </div>
              </div>
            </div>

            {/* Section 5: Your positions */}
            <div className="border-b border-[#E8E6E0] bg-[#1B4D45] px-8 py-2.5">
              <span className="text-[13px] font-semibold text-white">5. Your positions</span>
            </div>
            <div className="px-8 py-4 text-[13px]">
              <table className="w-full">
                <thead>
                  <tr className="text-[12px] text-[#6B6963]">
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
                      <td className="py-1.5 text-[#2C2C2A]">{pos.instrument}</td>
                      <td className="py-1.5 text-[#2C2C2A]">{selectedFund.shortName}</td>
                      <td className="py-1.5 text-right">
                        <Input
                          type="text"
                          value={pos.ownPct || ""}
                          onChange={(e) => {
                            const newPositions = [...valuationForm.positions]
                            newPositions[idx].ownPct = parseFloat(e.target.value) || 0
                            setValuationForm({ ...valuationForm, positions: newPositions })
                          }}
                          className={cn("h-8 w-20 text-[13px] text-right font-medium ml-auto", pos.ownPct > 0 ? "border-[#1B4D45] text-[#1B4D45]" : "border-[#E8E6E0]")}
                          placeholder="—"
                        />
                      </td>
                      <td className="py-1.5 text-right">
                        <Input
                          type="text"
                          value={pos.adj || ""}
                          onChange={(e) => {
                            const newPositions = [...valuationForm.positions]
                            newPositions[idx].adj = parseFloat(e.target.value) || 0
                            setValuationForm({ ...valuationForm, positions: newPositions })
                          }}
                          className={cn("h-8 w-20 text-[13px] text-right font-medium ml-auto", pos.adj !== 0 ? "border-[#1B4D45] text-[#1B4D45]" : "border-[#E8E6E0]")}
                          placeholder="—"
                        />
                      </td>
                      <td className="py-1.5 text-right tabular-nums text-[#2C2C2A]">{fmtEur(pos.allocatedValue)}</td>
                      <td className="py-1.5 text-right tabular-nums font-medium text-[#2C2C2A]">{pos.fmv > 0 ? fmtEur(pos.fmv) : "—"}</td>
                      <td className="py-1.5 pl-6">
                        <Input
                          type="text"
                          value={pos.commentary}
                          onChange={(e) => {
                            const newPositions = [...valuationForm.positions]
                            newPositions[idx].commentary = e.target.value
                            setValuationForm({ ...valuationForm, positions: newPositions })
                          }}
                          className="h-8 w-full border-[#E8E6E0] text-[13px]"
                          placeholder=""
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t-2 border-[#2C2C2A] mt-4 pt-3 flex items-center justify-between font-semibold text-[14px]">
                <span className="text-[#2C2C2A]">Total FMV (your positions)</span>
                <span className="tabular-nums text-[#2C2C2A]">{fmtEur(totalFMV)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 border-t border-[#E8E6E0] px-8 py-5 bg-[#F7F6F3]">
              <Button
                variant="outline"
                className="border-[#E8E6E0] text-[#2C2C2A] hover:bg-white h-10 px-6"
                onClick={() => setShowNewValuation(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#1B4D45] text-white hover:bg-[#164039] h-10 px-6"
                onClick={() => setShowNewValuation(false)}
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
          <DialogHeader className="border-b border-[#E8E6E0] px-6 py-4">
            <DialogTitle className="text-lg font-medium text-[#2C2C2A]">Update EXIT Scenario</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto p-6">
            {/* Company & Exit Year */}
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-[#6B6963]">Company</label>
                <Select value={exitForm.company} onValueChange={(v) => setExitForm({ ...exitForm, company: v })}>
                  <SelectTrigger className="h-9 border-[#E8E6E0] text-[12px]">
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
                <label className="mb-1.5 block text-[11px] font-medium text-[#6B6963]">Expected Exit Year</label>
                <Select value={exitForm.exitYear} onValueChange={(v) => setExitForm({ ...exitForm, exitYear: v })}>
                  <SelectTrigger className="h-9 border-[#E8E6E0] text-[12px]">
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
            <div className="mb-4 rounded-lg border border-[#E8E6E0]">
              <div className="border-b border-[#E8E6E0] bg-[#F7F6F3] px-4 py-2">
                <span className="text-[12px] font-medium text-[#2C2C2A]">Yearly Projections (€k)</span>
              </div>
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-[#E8E6E0] bg-[#FAFAF7]">
                    <th className="px-4 py-2 text-left font-medium text-[#6B6963]">Year</th>
                    <th className="px-4 py-2 text-center font-medium text-[#6B6963]">Revenue</th>
                    <th className="px-4 py-2 text-center font-medium text-[#6B6963]">EBITDA</th>
                    <th className="px-4 py-2 text-center font-medium text-[#6B6963]">Net Debt</th>
                  </tr>
                </thead>
                <tbody>
                  {exitForm.projections.map((row, idx) => (
                    <tr key={idx} className="border-b border-[#E8E6E0] last:border-b-0">
                      <td className="px-4 py-2">
                        <span className={cn(
                          "font-medium",
                          row.isExit ? "text-[#B8975A]" : "text-[#2C2C2A]"
                        )}>
                          {row.year}
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
                          className="h-8 border-[#E8E6E0] text-center text-[11px]"
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
                          className="h-8 border-[#E8E6E0] text-center text-[11px]"
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
                          className="h-8 border-[#E8E6E0] text-center text-[11px]"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* EXIT Valuation Parameters */}
            <div className="rounded-lg border border-[#E8E6E0] p-4">
              <div className="mb-3 text-[12px] font-medium text-[#2C2C2A]">EXIT Valuation Parameters</div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-[#6B6963]">EXIT EV/EBITDA Multiple</label>
                  <Input
                    type="number"
                    value={exitForm.exitMultiple}
                    onChange={(e) => setExitForm({ ...exitForm, exitMultiple: parseFloat(e.target.value) || 0 })}
                    className="h-9 border-[#E8E6E0] text-[12px]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-[#6B6963]">Shareholding %</label>
                  <Input
                    type="number"
                    value={exitForm.exitShareholding}
                    onChange={(e) => setExitForm({ ...exitForm, exitShareholding: parseFloat(e.target.value) || 0 })}
                    className="h-9 border-[#E8E6E0] text-[12px]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-[#6B6963]">Cumpref Value (€k)</label>
                  <Input
                    type="text"
                    placeholder="Leave empty if none"
                    value={exitForm.exitCumpref}
                    onChange={(e) => setExitForm({ ...exitForm, exitCumpref: e.target.value })}
                    className="h-9 border-[#E8E6E0] text-[12px]"
                  />
                </div>
              </div>

              {/* Calculated EXIT values */}
              <div className="mt-4 space-y-2 border-t border-[#E8E6E0] pt-3">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#6B6963]">EXIT EBITDA ({exitForm.exitYear})</span>
                  <span className="font-medium text-[#2C2C2A]">€ 9.2M</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#6B6963]">EXIT Net Debt ({exitForm.exitYear})</span>
                  <span className="font-medium text-[#2C2C2A]">€ 18.0M</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex justify-end gap-3">
              <Button
                variant="outline"
                className="border-[#E8E6E0] text-[#2C2C2A] hover:bg-[#F7F6F3]"
                onClick={() => setShowExitScenario(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#1B4D45] text-white hover:bg-[#164039]"
                onClick={() => setShowExitScenario(false)}
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
