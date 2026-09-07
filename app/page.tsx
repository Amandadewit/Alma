"use client"

import { useState, Fragment } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { funds, companies as allCompanies, type StatusType } from "@/lib/mock-data"

type ViewMode = "FY" | "YTD" | "Month"

const pct = (num: number, den: number) => (den ? Math.round((num / den) * 100) : 0)
const statusToColor: Record<StatusType, string> = { "on-track": "green", watch: "orange", alert: "red" }

// Active (still-held) companies drive the operational performance overview.
// Exited companies are realised and shown on the fund valuation page instead.
const activeCompanies = allCompanies.filter((c) => !c.exited)
const exitedCount = allCompanies.length - activeCompanies.length

// Portfolio-wide KPIs derived from the live company data
const portfolioFairValue = activeCompanies.reduce((s, c) => s + c.valuation.current.fairValue, 0)
const portfolioInvested = activeCompanies.reduce((s, c) => s + c.valuation.current.investedValue, 0)
const portfolioRealised = activeCompanies.reduce((s, c) => s + c.valuation.current.realisedProceeds, 0)
const portfolioEbitdaLTM = activeCompanies.reduce((s, c) => s + c.financials.normalizedEbitda.fy.ltm, 0)
const weightedMOI = portfolioInvested > 0 ? (portfolioFairValue + portfolioRealised) / portfolioInvested : 0

const kpiData = {
  portfolioValue: { value: Math.round(portfolioFairValue), change: 12, label: "PORTFOLIO WAARDE", unit: "M", changeLabel: "vs. IC" },
  weightedMOI: { value: Math.round(weightedMOI * 10) / 10, change: 0.2, label: "GEWOGEN MOI", unit: "x", changeLabel: "vs. Q4" },
  totalEbitda: { value: Math.round(portfolioEbitdaLTM * 10) / 10, change: -3, label: "TOTAAL EBITDA LTM", unit: "M", changeLabel: "vs. budget" },
  companies: { value: activeCompanies.length, active: activeCompanies.length, exited: exitedCount, label: "BEDRIJVEN" },
}

// Heatmap data — one row per active company, dimensions derived from status/KPIs
const heatmapData = activeCompanies.map((c) => ({
  company: c.name,
  financieel: c.status,
  management: c.kpis.enps === null ? "watch" : c.kpis.enps >= 45 ? "on-track" : c.kpis.enps >= 30 ? "watch" : "alert",
  vcp: c.status,
  exit: c.holdingPeriod >= 4 ? "watch" : "on-track",
}))

// Performance summary — one row per active company
const performanceSummary = activeCompanies.map((c) => ({
  company: c.name,
  revenueLTM: c.financials.revenue.fy.ltm,
  ebitdaPct: Math.round(c.financials.normalizedEbitdaPercent.fy.ltm),
  vsBudget: pct(c.financials.revenue.fy.le - c.financials.revenue.fy.budget, c.financials.revenue.fy.budget),
  status: c.status === "on-track" ? "Actief" : "Watch",
}))

// Financial highlights — every fund with its active companies, from mock-data
const financialData = funds
  .map((fund) => ({
    id: fund.id,
    name: fund.name,
    companies: activeCompanies
      .filter((c) => c.fundId === fund.id)
      .map((c) => {
        const r = c.financials.revenue.fy
        const e = c.financials.normalizedEbitda.fy
        const ep = c.financials.normalizedEbitdaPercent.fy
        const nd = c.financials.netDebt
        return {
          name: c.name,
          status: statusToColor[c.status],
          entry: c.entryDate,
          revenue: { a2024: r.ly, ltm: r.ltm, le2025: r.le, delta: pct(r.le - r.budget, r.budget) },
          ebitda: { a2024: e.ly, ltm: e.ltm, le2025: e.le, delta: pct(e.le - e.budget, e.budget) },
          ebitdaPct: { a2024: Math.round(ep.ly), le2025: Math.round(ep.le), b2025: Math.round(ep.budget) },
          netDebt: { a2024: nd.fy2024A, le2025: nd.fy2025LE, b2025: nd.fy2025B, levLE: nd.leverageLE },
        }
      }),
  }))
  .filter((fund) => fund.companies.length > 0)

type FundRow = (typeof financialData)[number]
type CompanyRow = FundRow["companies"][number]

export default function PerformanceOverviewPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("FY")
  const [selectedFund, setSelectedFund] = useState("all")
  const [expandedFunds, setExpandedFunds] = useState<string[]>(financialData.map((f) => f.id))

  const toggleFund = (fundId: string) => {
    setExpandedFunds((prev) =>
      prev.includes(fundId) ? prev.filter((id) => id !== fundId) : [...prev, fundId]
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "green": return "bg-[#22C55E]"
      case "orange": return "bg-[#F59E0B]"
      case "red": return "bg-[#EF4444]"
      default: return "bg-[#9CA3AF]"
    }
  }

  const getHeatmapColor = (status: string) => {
    switch (status) {
      case "on-track": return "bg-[#D1FAE5] text-[#065F46]"
      case "watch": return "bg-[#FEF3C7] text-[#92400E]"
      case "alert": return "bg-[#FEE2E2] text-[#991B1B]"
      default: return "bg-[#F3F4F6] text-[#6B7280]"
    }
  }

  const getStatusBadge = (status: string) => {
    return status === "Actief" 
      ? "bg-[#D1FAE5] text-[#065F46]" 
      : "bg-[#FEF3C7] text-[#92400E]"
  }

  const formatDelta = (value: number) => {
    const color = value >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"
    const prefix = value >= 0 ? "+" : ""
    return <span className={color}>{prefix}{value}%</span>
  }

  const formatChange = (value: number, isPositiveGood = true) => {
    const isPositive = value >= 0
    const color = isPositiveGood 
      ? (isPositive ? "text-[#22C55E]" : "text-[#EF4444]")
      : (isPositive ? "text-[#EF4444]" : "text-[#22C55E]")
    const prefix = isPositive ? "+" : ""
    return <span className={color}>{prefix}{value}%</span>
  }

  // Calculate totals
  const calculateTotals = (companies: CompanyRow[]) => {
    const totals = companies.reduce((acc, c) => ({
      revenue: { a2024: acc.revenue.a2024 + c.revenue.a2024, ltm: acc.revenue.ltm + c.revenue.ltm, le2025: acc.revenue.le2025 + c.revenue.le2025 },
      ebitda: { a2024: acc.ebitda.a2024 + c.ebitda.a2024, ltm: acc.ebitda.ltm + c.ebitda.ltm, le2025: acc.ebitda.le2025 + c.ebitda.le2025 },
      netDebt: { a2024: acc.netDebt.a2024 + c.netDebt.a2024, le2025: acc.netDebt.le2025 + c.netDebt.le2025, b2025: acc.netDebt.b2025 + c.netDebt.b2025 },
    }), { revenue: { a2024: 0, ltm: 0, le2025: 0 }, ebitda: { a2024: 0, ltm: 0, le2025: 0 }, netDebt: { a2024: 0, le2025: 0, b2025: 0 } })
    
    const revenueDelta = Math.round(((totals.revenue.le2025 - totals.revenue.ltm) / totals.revenue.ltm) * 100)
    const ebitdaDelta = Math.round(((totals.ebitda.le2025 - totals.ebitda.ltm) / totals.ebitda.ltm) * 100)
    const avgEbitdaPct = Math.round((totals.ebitda.ltm / totals.revenue.ltm) * 100)
    const avgLev = (totals.netDebt.le2025 / totals.ebitda.le2025).toFixed(1)
    
    return { ...totals, revenueDelta, ebitdaDelta, avgEbitdaPct, avgLev }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF7] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E8E6E0] bg-white px-6 py-4">
        <h1 className="text-xl font-medium text-[#2C2C2A]">Portfolio overzicht</h1>
        <Select value={selectedFund} onValueChange={setSelectedFund}>
          <SelectTrigger className="w-[220px] border-[#E8E6E0]">
            <SelectValue placeholder="Select fund" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle fondsen</SelectItem>
            {funds.map((fund) => (
              <SelectItem key={fund.id} value={fund.id}>{fund.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 space-y-6 p-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-[#E8E6E0] bg-white">
            <CardContent className="p-5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#6B6963]">{kpiData.portfolioValue.label}</p>
              <p className="mt-1 text-3xl font-semibold text-[#2C2C2A]">
                {"€ "}{kpiData.portfolioValue.value}{kpiData.portfolioValue.unit}
              </p>
              <p className="mt-1 text-[12px]">
                <span className="text-[#22C55E]">+{kpiData.portfolioValue.change}%</span>
                <span className="text-[#9CA3AF]"> {kpiData.portfolioValue.changeLabel}</span>
              </p>
            </CardContent>
          </Card>
          <Card className="border-[#E8E6E0] bg-white">
            <CardContent className="p-5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#6B6963]">{kpiData.weightedMOI.label}</p>
              <p className="mt-1 text-3xl font-semibold text-[#2C2C2A]">
                {kpiData.weightedMOI.value}{kpiData.weightedMOI.unit}
              </p>
              <p className="mt-1 text-[12px]">
                <span className="text-[#22C55E]">+{kpiData.weightedMOI.change}x</span>
                <span className="text-[#9CA3AF]"> {kpiData.weightedMOI.changeLabel}</span>
              </p>
            </CardContent>
          </Card>
          <Card className="border-[#E8E6E0] bg-white">
            <CardContent className="p-5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#6B6963]">{kpiData.totalEbitda.label}</p>
              <p className="mt-1 text-3xl font-semibold text-[#2C2C2A]">
                {"€ "}{kpiData.totalEbitda.value}{kpiData.totalEbitda.unit}
              </p>
              <p className="mt-1 text-[12px]">
                <span className="text-[#EF4444]">{kpiData.totalEbitda.change}%</span>
                <span className="text-[#9CA3AF]"> {kpiData.totalEbitda.changeLabel}</span>
              </p>
            </CardContent>
          </Card>
          <Card className="border-[#E8E6E0] bg-white">
            <CardContent className="p-5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#6B6963]">{kpiData.companies.label}</p>
              <p className="mt-1 text-3xl font-semibold text-[#2C2C2A]">{kpiData.companies.value}</p>
              <p className="mt-1 text-[12px] text-[#9CA3AF]">
                {kpiData.companies.active} actief · {kpiData.companies.exited} geëxit
              </p>
            </CardContent>
          </Card>
        </div>



        {/* Financial Highlights Table */}
        <Card className="border-[#E8E6E0] bg-white">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-[#E8E6E0] px-5 py-4">
              <h3 className="text-[14px] font-semibold text-[#2C2C2A]">Financial highlights</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-lg border border-[#E8E6E0]">
                  {(["FY", "YTD", "Month"] as ViewMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={cn(
                        "px-3 py-1 text-[11px] font-medium transition-colors",
                        viewMode === mode
                          ? "bg-[#1B4D45] text-white"
                          : "text-[#6B6963] hover:bg-[#F7F6F3]",
                        mode === "FY" && "rounded-l-lg",
                        mode === "Month" && "rounded-r-lg"
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-[#9CA3AF]">in mEUR</span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-[#E8E6E0]">
                    <th className="w-[180px] bg-white"></th>
                    <th className="w-12 bg-white"></th>
                    <th className="w-16 bg-white"></th>
                    <th colSpan={4} className="border-l border-[#E8E6E0] bg-white py-2 text-center text-[12px] font-semibold text-[#2C2C2A]">
                      Revenue
                    </th>
                    <th colSpan={4} className="border-l border-[#E8E6E0] bg-white py-2 text-center text-[12px] font-semibold text-[#2C2C2A]">
                      Norm. EBITDA
                    </th>
                    <th colSpan={3} className="border-l border-[#E8E6E0] bg-white py-2 text-center text-[12px] font-semibold text-[#2C2C2A]">
                      Norm. EBITDA %
                    </th>
                    <th colSpan={4} className="border-l border-[#E8E6E0] bg-white py-2 text-center text-[12px] font-semibold text-[#2C2C2A]">
                      Net Debt
                    </th>
                  </tr>
                  <tr className="border-b border-[#E8E6E0] bg-[#FAFAF7] text-[10px]">
                    <th className="px-4 py-2 text-left font-medium text-[#6B6963]">Company</th>
                    <th className="px-2 py-2 text-center font-medium text-[#6B6963]">Status</th>
                    <th className="px-2 py-2 text-center font-medium text-[#6B6963]">Entry</th>
                    <th className="border-l border-[#E8E6E0] px-2 py-2 text-right font-medium text-[#6B6963]">2024A</th>
                    <th className="px-2 py-2 text-right font-medium text-[#6B6963]">LTM</th>
                    <th className="px-2 py-2 text-right font-medium text-[#6B6963]">2025LE</th>
                    <th className="px-2 py-2 text-right font-medium text-[#6B6963]">Δ LE vs B</th>
                    <th className="border-l border-[#E8E6E0] px-2 py-2 text-right font-medium text-[#6B6963]">2024A</th>
                    <th className="px-2 py-2 text-right font-medium text-[#6B6963]">LTM</th>
                    <th className="px-2 py-2 text-right font-medium text-[#6B6963]">2025LE</th>
                    <th className="px-2 py-2 text-right font-medium text-[#6B6963]">Δ LE vs B</th>
                    <th className="border-l border-[#E8E6E0] px-2 py-2 text-right font-medium text-[#6B6963]">2024A</th>
                    <th className="px-2 py-2 text-right font-medium text-[#6B6963]">2025LE</th>
                    <th className="px-2 py-2 text-right font-medium text-[#6B6963]">2025B</th>
                    <th className="border-l border-[#E8E6E0] px-2 py-2 text-right font-medium text-[#6B6963]">2024A</th>
                    <th className="px-2 py-2 text-right font-medium text-[#6B6963]">2025LE</th>
                    <th className="px-2 py-2 text-right font-medium text-[#6B6963]">2025B</th>
                    <th className="px-2 py-2 text-right font-medium text-[#6B6963]">Lev. LE</th>
                  </tr>
                </thead>
                <tbody>
                  {financialData
                    .filter((fund) => selectedFund === "all" || fund.id === selectedFund)
                    .map((fund) => (
                    <Fragment key={fund.id}>
                      <tr
                        onClick={() => toggleFund(fund.id)}
                        className="cursor-pointer border-b border-[#E8E6E0] bg-[#F7F6F3] hover:bg-[#EFEDEA]"
                      >
                        <td className="px-4 py-2.5" colSpan={18}>
                          <div className="flex items-center gap-2">
                            {expandedFunds.includes(fund.id) ? (
                              <ChevronDown className="h-3.5 w-3.5 text-[#6B6963]" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 text-[#6B6963]" />
                            )}
                            <span className="text-[12px] font-semibold text-[#2C2C2A]">{fund.name}</span>
                          </div>
                        </td>
                      </tr>
                      {expandedFunds.includes(fund.id) && (
                        <>
                          {fund.companies.map((company, idx) => (
                            <tr key={idx} className="border-b border-[#E8E6E0] hover:bg-[#FAFAF7]">
                              <td className="px-4 py-2 pl-8 text-[#2C2C2A]">{company.name}</td>
                              <td className="px-2 py-2 text-center">
                                <span className={cn("inline-block h-2.5 w-2.5 rounded-full", getStatusColor(company.status))} />
                              </td>
                              <td className="px-2 py-2 text-center text-[#6B6963]">{company.entry}</td>
                              <td className="border-l border-[#E8E6E0] px-2 py-2 text-right tabular-nums text-[#2C2C2A]">{company.revenue.a2024.toFixed(1)}</td>
                              <td className="px-2 py-2 text-right tabular-nums text-[#2C2C2A]">{company.revenue.ltm.toFixed(1)}</td>
                              <td className="px-2 py-2 text-right tabular-nums text-[#2C2C2A]">{company.revenue.le2025.toFixed(1)}</td>
                              <td className="px-2 py-2 text-right tabular-nums">{formatDelta(company.revenue.delta)}</td>
                              <td className="border-l border-[#E8E6E0] px-2 py-2 text-right tabular-nums text-[#2C2C2A]">{company.ebitda.a2024.toFixed(1)}</td>
                              <td className="px-2 py-2 text-right tabular-nums text-[#2C2C2A]">{company.ebitda.ltm.toFixed(1)}</td>
                              <td className="px-2 py-2 text-right tabular-nums text-[#2C2C2A]">{company.ebitda.le2025.toFixed(1)}</td>
                              <td className="px-2 py-2 text-right tabular-nums">{formatDelta(company.ebitda.delta)}</td>
                              <td className="border-l border-[#E8E6E0] px-2 py-2 text-right tabular-nums text-[#2C2C2A]">{company.ebitdaPct.a2024}%</td>
                              <td className="px-2 py-2 text-right tabular-nums text-[#2C2C2A]">{company.ebitdaPct.le2025}%</td>
                              <td className="px-2 py-2 text-right tabular-nums text-[#2C2C2A]">{company.ebitdaPct.b2025}%</td>
                              <td className="border-l border-[#E8E6E0] px-2 py-2 text-right tabular-nums text-[#2C2C2A]">{company.netDebt.a2024.toFixed(1)}</td>
                              <td className="px-2 py-2 text-right tabular-nums text-[#2C2C2A]">{company.netDebt.le2025.toFixed(1)}</td>
                              <td className="px-2 py-2 text-right tabular-nums text-[#2C2C2A]">{company.netDebt.b2025.toFixed(1)}</td>
                              <td className="px-2 py-2 text-right tabular-nums text-[#2C2C2A]">{company.netDebt.levLE}x</td>
                            </tr>
                          ))}
                          {/* Total Row */}
                          {(() => {
                            const totals = calculateTotals(fund.companies)
                            return (
                              <tr className="border-b border-[#E8E6E0] bg-[#FAFAF7]">
                                <td className="px-4 py-2 pl-8 font-medium text-[#6B6963]">Total / Wtd avg</td>
                                <td className="px-2 py-2"></td>
                                <td className="px-2 py-2"></td>
                                <td className="border-l border-[#E8E6E0] px-2 py-2 text-right tabular-nums font-medium text-[#2C2C2A]">{totals.revenue.a2024.toFixed(1)}</td>
                                <td className="px-2 py-2 text-right tabular-nums font-medium text-[#2C2C2A]">{totals.revenue.ltm.toFixed(1)}</td>
                                <td className="px-2 py-2 text-right tabular-nums font-medium text-[#2C2C2A]">{totals.revenue.le2025.toFixed(1)}</td>
                                <td className="px-2 py-2 text-right tabular-nums font-medium">{formatDelta(totals.revenueDelta)}</td>
                                <td className="border-l border-[#E8E6E0] px-2 py-2 text-right tabular-nums font-medium text-[#2C2C2A]">{totals.ebitda.a2024.toFixed(1)}</td>
                                <td className="px-2 py-2 text-right tabular-nums font-medium text-[#2C2C2A]">{totals.ebitda.ltm.toFixed(1)}</td>
                                <td className="px-2 py-2 text-right tabular-nums font-medium text-[#2C2C2A]">{totals.ebitda.le2025.toFixed(1)}</td>
                                <td className="px-2 py-2 text-right tabular-nums font-medium">{formatDelta(totals.ebitdaDelta)}</td>
                                <td className="border-l border-[#E8E6E0] px-2 py-2 text-right tabular-nums font-medium text-[#2C2C2A]">{totals.avgEbitdaPct}%</td>
                                <td className="px-2 py-2 text-right tabular-nums font-medium text-[#2C2C2A]">{totals.avgEbitdaPct}%</td>
                                <td className="px-2 py-2 text-right tabular-nums font-medium text-[#2C2C2A]">{totals.avgEbitdaPct}%</td>
                                <td className="border-l border-[#E8E6E0] px-2 py-2 text-right tabular-nums font-medium text-[#2C2C2A]">{totals.netDebt.a2024.toFixed(1)}</td>
                                <td className="px-2 py-2 text-right tabular-nums font-medium text-[#2C2C2A]">{totals.netDebt.le2025.toFixed(1)}</td>
                                <td className="px-2 py-2 text-right tabular-nums font-medium text-[#2C2C2A]">{totals.netDebt.b2025.toFixed(1)}</td>
                                <td className="px-2 py-2 text-right tabular-nums font-medium text-[#2C2C2A]">{totals.avgLev}x</td>
                              </tr>
                            )
                          })()}
                        </>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Heatmap and Performance Summary - Compact Row */}
        <div className="grid grid-cols-5 gap-4">
          {/* Heatmap - takes 3 columns */}
          <Card className="col-span-3 border-[#E8E6E0] bg-white">
            <CardContent className="p-4">
              <h3 className="mb-3 text-[13px] font-semibold text-[#2C2C2A]">Heatmap</h3>
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-[10px] text-[#6B6963]">
                    <th className="pb-1.5 text-left font-medium">Bedrijf</th>
                    <th className="pb-1.5 text-center font-medium">Financieel</th>
                    <th className="pb-1.5 text-center font-medium">Management</th>
                    <th className="pb-1.5 text-center font-medium">Value Creation Plan</th>
                    <th className="pb-1.5 text-center font-medium">EXIT</th>
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-1 text-[#2C2C2A]">{row.company}</td>
                      <td className="py-1 text-center">
                        <span className={cn("inline-block rounded px-2 py-0.5 text-[10px] font-medium", getHeatmapColor(row.financieel))}>
                          {row.financieel === "on-track" ? "On track" : row.financieel === "watch" ? "Watch" : "Alert"}
                        </span>
                      </td>
                      <td className="py-1 text-center">
                        <span className={cn("inline-block rounded px-2 py-0.5 text-[10px] font-medium", getHeatmapColor(row.management))}>
                          {row.management === "on-track" ? "On track" : row.management === "watch" ? "Watch" : "Alert"}
                        </span>
                      </td>
                      <td className="py-1 text-center">
                        <span className={cn("inline-block rounded px-2 py-0.5 text-[10px] font-medium", getHeatmapColor(row.vcp))}>
                          {row.vcp === "on-track" ? "On track" : row.vcp === "watch" ? "Watch" : "Alert"}
                        </span>
                      </td>
                      <td className="py-1 text-center">
                        <span className={cn("inline-block rounded px-2 py-0.5 text-[10px] font-medium", getHeatmapColor(row.exit))}>
                          {row.exit === "on-track" ? "On track" : row.exit === "watch" ? "Watch" : "Alert"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Performance Summary - takes 2 columns */}
          <Card className="col-span-2 border-[#E8E6E0] bg-white">
            <CardContent className="p-4">
              <h3 className="mb-3 text-[13px] font-semibold text-[#2C2C2A]">Performance samenvatting</h3>
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-[10px] text-[#6B6963]">
                    <th className="pb-1.5 text-left font-medium">Bedrijf</th>
                    <th className="pb-1.5 text-right font-medium">Revenue LTM</th>
                    <th className="pb-1.5 text-right font-medium">EBITDA %</th>
                    <th className="pb-1.5 text-right font-medium">vs. Budget</th>
                    <th className="pb-1.5 text-center font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceSummary.map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-1 text-[#2C2C2A]">{row.company}</td>
                      <td className="py-1 text-right tabular-nums text-[#2C2C2A]">{"€ "}{row.revenueLTM}M</td>
                      <td className="py-1 text-right tabular-nums text-[#2C2C2A]">{row.ebitdaPct}%</td>
                      <td className="py-1 text-right tabular-nums">{formatChange(row.vsBudget)}</td>
                      <td className="py-1 text-center">
                        <span className={cn("inline-block rounded-full px-2 py-0.5 text-[9px] font-medium", getStatusBadge(row.status))}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#E8E6E0] bg-white px-6 py-3">
        <span className="text-[11px] text-[#9CA3AF]">Last Refresh: 03/03/2026</span>
      </div>
    </div>
  )
}
