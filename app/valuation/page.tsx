"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { funds, fundAllocation, companies } from "@/lib/mock-data"
import { ValueProgressionChart } from "@/components/valuation/value-progression-chart"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from "recharts"
import { X, ChevronRight, ChevronDown } from "lucide-react"

interface Fund {
  id: string
  name: string
  shortName: string
  committedCapital: number
  invested: number
  fairValue: number
  vintageYear: number
  grossMOI: number
  grossIRR: number
}

export default function FundValuationPage() {
  const [selectedFundId, setSelectedFundId] = useState<string | null>(null)
  const [showAllocationDetails, setShowAllocationDetails] = useState(false)

  const selectedFund = selectedFundId ? funds.find(f => f.id === selectedFundId) : null

  // Calculate MOI Exit Outlook
  const getMoiExitOutlook = (fund: Fund) => {
    return (fund.grossMOI * 1.4).toFixed(2)
  }

  // Calculate totals
  const totals = {
    totalFundSize: funds.reduce((sum, f) => sum + f.committedCapital, 0),
    investedCapital: funds.reduce((sum, f) => sum + f.invested, 0),
    avgMOICurrent: funds.reduce((sum, f) => sum + f.grossMOI, 0) / funds.length,
    avgMOIExit: funds.reduce((sum, f) => sum + f.grossMOI * 1.4, 0) / funds.length,
  }

  // Pie chart data
  const allocationPieData = [
    { name: "Invested", amount: fundAllocation.invested.total },
    { name: "Reserved Add-ons", amount: fundAllocation.reservedAddOns.total },
    { name: "Fees & Costs", amount: fundAllocation.feesCosts.total },
    { name: "Dry Powder", amount: fundAllocation.dryPowder },
  ]

  const COLORS = ["var(--brand)", "var(--ai)", "var(--ink-3)", "var(--line)"]

  // Get companies for selected fund
  const fundCompanies = selectedFund
    ? companies.filter((c) => c.fundId === selectedFund.id)
    : []

  // Chart data for portfolio valuation
  const portfolioChartData = fundCompanies.slice(0, 3).map((c) => ({
    name: c.name.split(" ")[0],
    Investment: c.valuation.current.investedValue,
    "Fair Value": c.valuation.current.fairValue,
    "Total (expected) proceeds": c.valuation.exit.fairValue,
  }))

  // Calculate totals for Current and Exit sections
  const currentTotals = {
    investment: fundCompanies.reduce((sum, c) => sum + c.valuation.current.investedValue, 0),
    fairValue: fundCompanies.reduce((sum, c) => sum + c.valuation.current.fairValue, 0),
    realised: fundCompanies.reduce((sum, c) => sum + (c.valuation.current.realisedProceeds || 0), 0),
  }

  const exitTotals = {
    investment: fundCompanies.reduce((sum, c) => sum + c.valuation.exit.investedValue, 0),
    totalProceeds: fundCompanies.reduce((sum, c) => sum + c.valuation.exit.fairValue, 0),
  }

  // Value-progression series built from THIS fund's Current table totals so the
  // final quarter matches the table exactly (invested / realised / fair value → MOI).
  // Earlier quarters ramp up to those values to show the value building over time.
  const valueProgression = (() => {
    if (!selectedFund) return []
    const investedNow = currentTotals.investment
    const realisedNow = currentTotals.realised
    const fairNow = currentTotals.fairValue

    const quarterSeq = [
      { quarter: "Q2", year: "2025" },
      { quarter: "Q3", year: "2025" },
      { quarter: "Q4", year: "2025" },
      { quarter: "Q1", year: "2026" },
      { quarter: "Q2", year: "2026" },
    ]
    const deploy = [0.82, 0.9, 0.96, 1, 1] // capital deployment over time
    const fairRamp = [0.55, 0.68, 0.8, 0.92, 1] // fair value build-up
    const realisedRamp = [0, 0.18, 0.42, 0.72, 1] // exits realise later

    return quarterSeq.map((q, i) => ({
      ...q,
      invested: investedNow * deploy[i],
      realised: realisedNow * realisedRamp[i],
      fair: fairNow * fairRamp[i],
    }))
  })()

  // Annualised IRR derived from MOI over the holding period: MOI^(1/years) - 1
  const calcIRR = (moi: number, years: number) => {
    if (moi <= 0 || years <= 0) return 0
    return (Math.pow(moi, 1 / years) - 1) * 100
  }

  // Average holding period across the fund's companies, for the totals row
  const avgHolding =
    fundCompanies.length > 0
      ? fundCompanies.reduce((sum, c) => sum + c.holdingPeriod, 0) / fundCompanies.length
      : 0
  const currentTotalMoi =
    currentTotals.investment > 0
      ? (currentTotals.fairValue + currentTotals.realised) / currentTotals.investment
      : 0

  // Split the fund into realised (exited) and unrealised (still held) companies
  // using the company's own `exited` flag.
  const indexedCompanies = fundCompanies.map((company, idx) => ({ company, idx }))
  const unrealisedRows = indexedCompanies.filter(({ company }) => !company.exited)
  const realisedRows = indexedCompanies.filter(({ company }) => company.exited)

  // Current-side figures always come from the company's Current valuation so the
  // subtotals and Total portfolio reconcile to the fund's Current totals
  // (invested / realised / fair value → MOI). The realised/unrealised split is a
  // grouping of companies, not a different figure source.
  const rowFigures = ({ company }: { company: (typeof fundCompanies)[number]; idx: number }) => {
    const invested = company.valuation.current.investedValue
    const realisedReturn = company.valuation.current.realisedProceeds || 0
    const fairValue = company.valuation.current.fairValue
    const holding = company.holdingPeriod
    const moi = invested > 0 ? (fairValue + realisedReturn) / invested : 0
    return { invested, realisedReturn, fairValue, holding, moi, irr: calcIRR(moi, holding) }
  }

  const groupTotals = (rows: typeof indexedCompanies) => {
    const invested = rows.reduce((s, r) => s + rowFigures(r).invested, 0)
    const realisedReturn = rows.reduce((s, r) => s + rowFigures(r).realisedReturn, 0)
    const fairValue = rows.reduce((s, r) => s + rowFigures(r).fairValue, 0)
    const holding = rows.length > 0 ? rows.reduce((s, r) => s + r.company.holdingPeriod, 0) / rows.length : 0
    const moi = invested > 0 ? (fairValue + realisedReturn) / invested : 0
    const exitInvestment = rows.reduce((s, r) => s + r.company.valuation.exit.investedValue, 0)
    const exitProceeds = rows.reduce((s, r) => s + r.company.valuation.exit.fairValue, 0)
    return { invested, realisedReturn, fairValue, holding, moi, irr: calcIRR(moi, holding), exitInvestment, exitProceeds }
  }

  const unrealisedTotals = groupTotals(unrealisedRows)
  const realisedTotals = groupTotals(realisedRows)
  const portfolioTotals = {
    invested: unrealisedTotals.invested + realisedTotals.invested,
    realisedReturn: unrealisedTotals.realisedReturn + realisedTotals.realisedReturn,
    fairValue: unrealisedTotals.fairValue + realisedTotals.fairValue,
    holding: avgHolding,
    exitInvestment: unrealisedTotals.exitInvestment + realisedTotals.exitInvestment,
    exitProceeds: unrealisedTotals.exitProceeds + realisedTotals.exitProceeds,
  }
  const portfolioMoi =
    portfolioTotals.invested > 0
      ? (portfolioTotals.fairValue + portfolioTotals.realisedReturn) / portfolioTotals.invested
      : 0

  const handleFundClick = (fundId: string) => {
    setSelectedFundId(selectedFundId === fundId ? null : fundId)
  }

  return (
    <div className="flex min-h-screen flex-col font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <div>
          <h1 className="text-xl font-medium text-ink">Fund Valuation</h1>
          <p className="text-[13px] text-ink-2">Overview of all funds and valuations</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Main Content Area */}
        <div className="space-y-4">
          {/* Funds Table */}
          <div className="rounded-[10px] border border-line bg-white">
            <div className="border-b border-line px-4 py-3">
              <h2 className="text-[13px] font-medium text-ink">All Funds</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-line bg-bg">
                    <th className="w-8 px-2 py-3"></th>
                    <th className="px-4 py-3 text-left font-medium text-ink-2">Name</th>
                    <th className="px-4 py-3 text-right font-medium text-ink-2">Total Fund Size</th>
                    <th className="px-4 py-3 text-right font-medium text-ink-2">Invested Capital</th>
                    <th className="px-4 py-3 text-center font-medium text-ink-2">Vintage Year</th>
                    <th className="px-4 py-3 text-right font-medium text-ink-2">MOI Current</th>
                    <th className="px-4 py-3 text-right font-medium text-ink-2">MOI Exit Outlook</th>
                  </tr>
                </thead>
                <tbody>
                  {funds.map((fund) => (
                    <tr
                      key={fund.id}
                      onClick={() => handleFundClick(fund.id)}
                      className={cn(
                        "cursor-pointer border-b border-line transition-colors",
                        selectedFundId === fund.id ? "bg-bg" : "hover:bg-surface-2"
                      )}
                    >
                      <td className="px-2 py-4">
                        {selectedFundId === fund.id ? (
                          <ChevronDown className="h-4 w-4 text-brand" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-ink-2" />
                        )}
                      </td>
                      <td className="px-4 py-4 font-medium text-ink">{fund.name}</td>
                      <td className="px-4 py-4 text-right tabular-nums text-ink">
                        € {fund.committedCapital}M
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums text-ink">
                        € {fund.invested}M
                      </td>
                      <td className="px-4 py-4 text-center text-ink">{fund.vintageYear}</td>
                      <td className="px-4 py-4 text-right tabular-nums font-medium text-brand">
                        {fund.grossMOI.toFixed(2)}x
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums font-medium text-ai">
                        {getMoiExitOutlook(fund)}x
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-bg">
                    <td></td>
                    <td className="px-4 py-3 font-semibold text-ink">Total</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-ink">
                      € {totals.totalFundSize}M
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-ink">
                      € {totals.investedCapital}M
                    </td>
                    <td className="px-4 py-3 text-center text-ink-2">—</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-brand">
                      {totals.avgMOICurrent.toFixed(2)}x
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-ai">
                      {totals.avgMOIExit.toFixed(2)}x
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Inline Fund Details - Shows when a fund is selected */}
          {selectedFund && (
            <div className="space-y-4 rounded-[10px] border border-brand/20 bg-surface-2 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[15px] font-medium text-ink">{selectedFund.name}</h3>
                  <p className="text-[12px] text-ink-2">Portfolio valuation and exit outlook</p>
                </div>
                <button
                  onClick={() => setSelectedFundId(null)}
                  className="rounded-lg p-1 hover:bg-line"
                >
                  <X className="h-4 w-4 text-ink-2" />
                </button>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-4 gap-4">
                {/* Portfolio Valuation Chart */}
                <div className="col-span-3 rounded-[10px] border border-line bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-[13px] font-medium text-ink">Portfolio Valuation</h4>
                    <div className="flex items-center gap-4 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-sm bg-ai-soft" />
                        <span className="text-ink-2">Investment</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-sm bg-ai-text" />
                        <span className="text-ink-2">Fair Value</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-sm bg-ok-soft" />
                        <span className="text-ink-2">Total (expected) proceeds</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={portfolioChartData} barGap={4} barCategoryGap="25%">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--ink-2)" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "var(--ink-2)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}M`} />
                        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid var(--line)" }} formatter={(v: number) => [`${v}M`, ""]} />
                        <Bar dataKey="Investment" fill="var(--ai-soft)" radius={[2, 2, 0, 0]} maxBarSize={35}>
                          <LabelList dataKey="Investment" position="top" fontSize={10} fill="var(--ink-2)" formatter={(v: number) => `${v}M`} />
                        </Bar>
                        <Bar dataKey="Fair Value" fill="var(--ai-text)" radius={[2, 2, 0, 0]} maxBarSize={35}>
                          <LabelList dataKey="Fair Value" position="top" fontSize={10} fill="var(--ink-2)" formatter={(v: number) => `${v}M`} />
                        </Bar>
                        <Bar dataKey="Total (expected) proceeds" fill="var(--ok-soft)" radius={[2, 2, 0, 0]} maxBarSize={35}>
                          <LabelList dataKey="Total (expected) proceeds" position="top" fontSize={10} fill="var(--ink-2)" formatter={(v: number) => `${v}M`} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Fund Allocation Pie Chart */}
                <div className="rounded-[10px] border border-line bg-white p-4">
                  <h4 className="mb-2 text-[13px] font-medium text-ink">Fund Allocation</h4>
                  <div 
                    className="flex cursor-pointer justify-center transition-opacity hover:opacity-80"
                    onClick={() => setShowAllocationDetails(true)}
                  >
                    <div className="h-[120px] w-[120px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={allocationPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={55}
                            paddingAngle={2}
                            dataKey="amount"
                          >
                            {allocationPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ fontSize: 10, borderRadius: 8, border: "1px solid var(--line)" }}
                            formatter={(value: number) => [`€ ${value}M`, ""]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    {allocationPieData.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-sm" style={{ backgroundColor: COLORS[index] }} />
                          <span className="text-ink-2">{item.name}</span>
                        </div>
                        <span className="tabular-nums font-medium text-ink">€ {item.amount}M</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowAllocationDetails(true)}
                    className="mt-2 w-full text-center text-[10px] font-medium text-brand hover:underline"
                  >
                    View details
                  </button>
                </div>
              </div>

              {/* Value progression of portfolio companies (replaces Fund Valuation chart) */}
              <ValueProgressionChart periods={valueProgression} />

              {/* Combined Current + Exit Table */}
              <div className="rounded-[10px] border border-line bg-white">
                <div className="border-b border-line px-4 py-3">
                  <h2 className="text-[13px] font-medium text-ink">Portfolio performance</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-line">
                        <th colSpan={4} className="border-r border-line bg-white px-3 py-1.5"></th>
                        <th colSpan={5} className="border-r border-line bg-bg px-3 py-1.5 text-center text-[11px] font-semibold text-ink">
                          Current
                        </th>
                        <th colSpan={4} className="bg-bg px-3 py-1.5 text-center text-[11px] font-semibold text-ink">
                          Exit
                        </th>
                      </tr>
                      <tr className="border-b border-line bg-surface-2 text-[10px]">
                        <th className="px-3 py-1.5 text-left font-medium text-ink-2">Company</th>
                        <th className="px-2 py-1.5 text-center font-medium text-ink-2">Status</th>
                        <th className="px-3 py-1.5 text-left font-medium text-ink-2">Entry</th>
                        <th className="border-r border-line px-3 py-1.5 text-right font-medium text-ink-2">Holding</th>
                        <th className="px-3 py-1.5 text-right font-medium text-ink-2">Invested</th>
                        <th className="px-3 py-1.5 text-right font-medium text-ink-2">Realised</th>
                        <th className="px-3 py-1.5 text-right font-medium text-ink-2">Fair Value</th>
                        <th className="px-3 py-1.5 text-right font-medium text-ink-2">MOI</th>
                        <th className="border-r border-line px-3 py-1.5 text-right font-medium text-ink-2">IRR</th>
                        <th className="px-3 py-1.5 text-center font-medium text-ink-2">Exit</th>
                        <th className="px-3 py-1.5 text-right font-medium text-ink-2">Invested</th>
                        <th className="px-3 py-1.5 text-right font-medium text-ink-2">Proceeds</th>
                        <th className="px-3 py-1.5 text-right font-medium text-ink-2">MOI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Unrealised group */}
                      <tr className="border-b border-line bg-surface-2">
                        <td colSpan={13} className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink-2">
                          Unrealised
                        </td>
                      </tr>
                      {unrealisedRows.map(({ company, idx }) => {
                        const f = rowFigures({ company, idx })
                        return (
                          <tr key={company.id} className="border-b border-line hover:bg-surface-2">
                            <td className="px-3 py-2 font-medium text-ink">{company.name}</td>
                            <td className="px-2 py-2 text-center">
                              <span className={cn(
                                "inline-block w-5 text-[10px] font-medium",
                                company.status === "on-track" ? "text-brand" : company.status === "watch" ? "text-ai" : "text-alert"
                              )}>
                                {company.status === "on-track" ? "P" : company.status === "watch" ? "W" : "X"}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-ink-2">{company.entryDate}</td>
                            <td className="border-r border-line px-3 py-2 text-right tabular-nums text-ink-2">{f.holding.toFixed(1)} yrs</td>
                            <td className="px-3 py-2 text-right tabular-nums text-ink">{f.invested.toFixed(1)}M</td>
                            <td className="px-3 py-2 text-right tabular-nums text-ink">{f.realisedReturn > 0 ? `${f.realisedReturn.toFixed(1)}M` : "—"}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-ink">{f.fairValue.toFixed(1)}M</td>
                            <td className="px-3 py-2 text-right tabular-nums font-medium text-ink">{f.moi.toFixed(2)}x</td>
                            <td className="border-r border-line px-3 py-2 text-right tabular-nums font-medium text-ink">{f.irr.toFixed(1)}%</td>
                            <td className="px-3 py-2 text-center tabular-nums text-ink-2">{company.valuation.exit.year}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-ink">{company.valuation.exit.investedValue.toFixed(1)}M</td>
                            <td className="px-3 py-2 text-right tabular-nums text-ink">{company.valuation.exit.fairValue.toFixed(1)}M</td>
                            <td className="px-3 py-2 text-right tabular-nums font-medium text-ink">{company.valuation.exit.moi.toFixed(2)}x</td>
                          </tr>
                        )
                      })}
                      <tr className="border-b-2 border-line bg-surface-2">
                        <td className="px-3 py-2 font-semibold text-ink">Total unrealised</td>
                        <td></td>
                        <td></td>
                        <td className="border-r border-line px-3 py-2 text-right tabular-nums font-semibold text-ink">{unrealisedTotals.holding.toFixed(1)} yrs</td>
                        <td className="px-3 py-2 text-right tabular-nums font-semibold text-ink">{unrealisedTotals.invested.toFixed(1)}M</td>
                        <td className="px-3 py-2 text-right tabular-nums font-semibold text-ink">{unrealisedTotals.realisedReturn > 0 ? `${unrealisedTotals.realisedReturn.toFixed(1)}M` : "—"}</td>
                        <td className="px-3 py-2 text-right tabular-nums font-semibold text-ink">{unrealisedTotals.fairValue.toFixed(1)}M</td>
                        <td className="px-3 py-2 text-right tabular-nums font-semibold text-ink">{unrealisedTotals.moi.toFixed(2)}x</td>
                        <td className="border-r border-line px-3 py-2 text-right tabular-nums font-semibold text-ink">{unrealisedTotals.irr.toFixed(1)}%</td>
                        <td></td>
                        <td className="px-3 py-2 text-right tabular-nums font-semibold text-ink">{unrealisedTotals.exitInvestment.toFixed(1)}M</td>
                        <td className="px-3 py-2 text-right tabular-nums font-semibold text-ink">{unrealisedTotals.exitProceeds.toFixed(1)}M</td>
                        <td className="px-3 py-2 text-right tabular-nums font-semibold text-ink">{unrealisedTotals.exitInvestment > 0 ? (unrealisedTotals.exitProceeds / unrealisedTotals.exitInvestment).toFixed(2) : "0.00"}x</td>
                      </tr>

                      {/* Realised group */}
                      {realisedRows.length > 0 && (
                        <>
                          <tr className="border-b border-line bg-surface-2">
                            <td colSpan={13} className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink-2">
                              Realised
                            </td>
                          </tr>
                          {realisedRows.map(({ company, idx }) => {
                            const f = rowFigures({ company, idx })
                            return (
                              <tr key={company.id} className="border-b border-line hover:bg-surface-2">
                                <td className="px-3 py-2 font-medium text-ink">{company.name}</td>
                                <td className="px-2 py-2 text-center">
                                  <span className="inline-block w-5 text-[10px] font-medium text-ink-2">R</span>
                                </td>
                                <td className="px-3 py-2 text-ink-2">{company.entryDate}</td>
                                <td className="border-r border-line px-3 py-2 text-right tabular-nums text-ink-2">{f.holding.toFixed(1)} yrs</td>
                                <td className="px-3 py-2 text-right tabular-nums text-ink">{f.invested.toFixed(1)}M</td>
                                <td className="px-3 py-2 text-right tabular-nums text-ink">{f.realisedReturn.toFixed(1)}M</td>
                                <td className="px-3 py-2 text-right tabular-nums text-ink">{f.fairValue.toFixed(1)}M</td>
                                <td className="px-3 py-2 text-right tabular-nums font-medium text-ink">{f.moi.toFixed(2)}x</td>
                                <td className="border-r border-line px-3 py-2 text-right tabular-nums font-medium text-ink">{f.irr.toFixed(1)}%</td>
                                <td className="px-3 py-2 text-center tabular-nums text-ink-2">{company.valuation.exit.year}</td>
                                <td className="px-3 py-2 text-right tabular-nums text-ink">{company.valuation.exit.investedValue.toFixed(1)}M</td>
                                <td className="px-3 py-2 text-right tabular-nums text-ink">{company.valuation.exit.fairValue.toFixed(1)}M</td>
                                <td className="px-3 py-2 text-right tabular-nums font-medium text-ink">{company.valuation.exit.moi.toFixed(2)}x</td>
                              </tr>
                            )
                          })}
                          <tr className="border-b-2 border-line bg-surface-2">
                            <td className="px-3 py-2 font-semibold text-ink">Total realised</td>
                            <td></td>
                            <td></td>
                            <td className="border-r border-line px-3 py-2 text-right tabular-nums font-semibold text-ink">{realisedTotals.holding.toFixed(1)} yrs</td>
                            <td className="px-3 py-2 text-right tabular-nums font-semibold text-ink">{realisedTotals.invested.toFixed(1)}M</td>
                            <td className="px-3 py-2 text-right tabular-nums font-semibold text-ink">{realisedTotals.realisedReturn.toFixed(1)}M</td>
                            <td className="px-3 py-2 text-right tabular-nums font-semibold text-ink">{realisedTotals.fairValue.toFixed(1)}M</td>
                            <td className="px-3 py-2 text-right tabular-nums font-semibold text-ink">{realisedTotals.moi.toFixed(2)}x</td>
                            <td className="border-r border-line px-3 py-2 text-right tabular-nums font-semibold text-ink">{realisedTotals.irr.toFixed(1)}%</td>
                            <td></td>
                            <td className="px-3 py-2 text-right tabular-nums font-semibold text-ink">{realisedTotals.exitInvestment.toFixed(1)}M</td>
                            <td className="px-3 py-2 text-right tabular-nums font-semibold text-ink">{realisedTotals.exitProceeds.toFixed(1)}M</td>
                            <td className="px-3 py-2 text-right tabular-nums font-semibold text-ink">{realisedTotals.exitInvestment > 0 ? (realisedTotals.exitProceeds / realisedTotals.exitInvestment).toFixed(2) : "0.00"}x</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-surface-2">
                        <td className="px-3 py-2 font-semibold text-ai">Total portfolio</td>
                        <td></td>
                        <td></td>
                        <td className="border-r border-line px-3 py-2 text-right tabular-nums font-semibold text-ai">{portfolioTotals.holding.toFixed(1)} yrs</td>
                        <td className="px-3 py-2 text-right tabular-nums font-semibold text-ai">{portfolioTotals.invested.toFixed(1)}M</td>
                        <td className="px-3 py-2 text-right tabular-nums font-semibold text-ai">{portfolioTotals.realisedReturn.toFixed(1)}M</td>
                        <td className="px-3 py-2 text-right tabular-nums font-semibold text-ai">{portfolioTotals.fairValue.toFixed(1)}M</td>
                        <td className="px-3 py-2 text-right tabular-nums font-semibold text-ai">{portfolioMoi.toFixed(2)}x</td>
                        <td className="border-r border-line px-3 py-2 text-right tabular-nums font-semibold text-ai">{calcIRR(portfolioMoi, portfolioTotals.holding).toFixed(1)}%</td>
                        <td className="px-3 py-2 text-center tabular-nums font-semibold text-ai">2028</td>
                        <td className="px-3 py-2 text-right tabular-nums font-semibold text-ai">{portfolioTotals.exitInvestment.toFixed(1)}M</td>
                        <td className="px-3 py-2 text-right tabular-nums font-semibold text-ai">{portfolioTotals.exitProceeds.toFixed(1)}M</td>
                        <td className="px-3 py-2 text-right tabular-nums font-semibold text-ai">
                          {portfolioTotals.exitInvestment > 0 ? (portfolioTotals.exitProceeds / portfolioTotals.exitInvestment).toFixed(2) : "0.00"}x
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Fund Allocation Details - Inline */}
              <div className="rounded-[10px] border border-line bg-white">
                <div className="border-b border-line px-4 py-3">
                  <h4 className="text-[13px] font-medium text-ink">Fund Allocation</h4>
                </div>
                <div className="grid grid-cols-4 gap-4 p-4">
                  {/* Invested */}
                  <div className="rounded-lg border border-line p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-sm bg-brand" />
                        <span className="text-[11px] font-medium text-ink">Invested</span>
                      </div>
                      <span className="text-[11px] tabular-nums font-semibold text-ink">€ {fundAllocation.invested.total}M</span>
                    </div>
                    <div className="mt-2 space-y-1 pl-4">
                      {fundAllocation.invested.companies.slice(0, 4).map((c, i) => (
                        <div key={i} className="flex justify-between text-[10px]">
                          <span className="text-ink-2 truncate max-w-[100px]">{c.name}</span>
                          <span className="tabular-nums text-ink">€ {c.amount}M</span>
                        </div>
                      ))}
                      {fundAllocation.invested.companies.length > 4 && (
                        <div className="text-[10px] text-ink-2">+ {fundAllocation.invested.companies.length - 4} more</div>
                      )}
                    </div>
                  </div>

                  {/* Reserved for Add-ons */}
                  <div className="rounded-lg border border-line p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-sm bg-ai" />
                        <span className="text-[11px] font-medium text-ink">Reserved Add-ons</span>
                      </div>
                      <span className="text-[11px] tabular-nums font-semibold text-ink">€ {fundAllocation.reservedAddOns.total}M</span>
                    </div>
                    <div className="mt-2 space-y-1 pl-4">
                      {fundAllocation.reservedAddOns.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-[10px]">
                          <span className="text-ink-2 truncate max-w-[100px]">{item.name}</span>
                          <span className="tabular-nums text-ink">€ {item.amount}M</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fees & Costs */}
                  <div className="rounded-lg border border-line p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-sm bg-ink-3" />
                        <span className="text-[11px] font-medium text-ink">Current & Future Fees</span>
                      </div>
                      <span className="text-[11px] tabular-nums font-semibold text-ink">€ {fundAllocation.feesCosts.total}M</span>
                    </div>
                    <div className="mt-2 space-y-1 pl-4">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-ink-2">Management Fee</span>
                        <span className="tabular-nums text-ink">€ {fundAllocation.feesCosts.managementFee}M</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-ink-2">Est. Future Costs</span>
                        <span className="tabular-nums text-ink">€ {fundAllocation.feesCosts.estFutureCosts}M</span>
                      </div>
                    </div>
                  </div>

                  {/* Open Commitment */}
                  <div className="rounded-lg border border-line p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-sm bg-line" />
                        <span className="text-[11px] font-medium text-ink">Open Commitment</span>
                      </div>
                      <span className="text-[11px] tabular-nums font-semibold text-ink">€ {fundAllocation.dryPowder}M</span>
                    </div>
                    <div className="mt-2 pl-4 text-[10px] text-ink-2">
                      Available for new investments (Dry Powder)
                    </div>
                  </div>
                </div>
              </div>

              {/* Last Refresh */}
              <div className="text-[11px] text-ink-2">
                Last Refresh: 16/12/2025
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Allocation Details Modal */}
      {showAllocationDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-[10px] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 className="text-lg font-medium text-ink">Fund Allocation Details</h2>
              <button
                onClick={() => setShowAllocationDetails(false)}
                className="rounded-lg p-1 hover:bg-bg"
              >
                <X className="h-5 w-5 text-ink-2" />
              </button>
            </div>
            
            <div className="space-y-4 p-6">
              {/* Invested */}
              <div className="rounded-lg border border-line p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-brand" />
                    <span className="text-[13px] font-medium text-ink">Invested</span>
                  </div>
                  <span className="text-[13px] tabular-nums font-semibold text-ink">€ {fundAllocation.invested.total}M</span>
                </div>
                <div className="mt-3 space-y-1.5 pl-5">
                  {fundAllocation.invested.companies.map((c, i) => (
                    <div key={i} className="flex justify-between text-[11px]">
                      <span className="text-ink-2">{c.name}</span>
                      <span className="tabular-nums text-ink">€ {c.amount}M</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reserved for Add-ons */}
              <div className="rounded-lg border border-line p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-ai" />
                    <span className="text-[13px] font-medium text-ink">Reserved for Add-ons</span>
                  </div>
                  <span className="text-[13px] tabular-nums font-semibold text-ink">€ {fundAllocation.reservedAddOns.total}M</span>
                </div>
                <div className="mt-3 space-y-1.5 pl-5">
                  {fundAllocation.reservedAddOns.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-[11px]">
                      <span className="text-ink-2">{item.name}</span>
                      <span className="tabular-nums text-ink">€ {item.amount}M</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fees & Costs */}
              <div className="rounded-lg border border-line p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-ink-3" />
                    <span className="text-[13px] font-medium text-ink">Current & Future Fees</span>
                  </div>
                  <span className="text-[13px] tabular-nums font-semibold text-ink">€ {fundAllocation.feesCosts.total}M</span>
                </div>
                <div className="mt-3 space-y-1.5 pl-5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-ink-2">Management Fee</span>
                    <span className="tabular-nums text-ink">€ {fundAllocation.feesCosts.managementFee}M</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-ink-2">Est. Future Costs</span>
                    <span className="tabular-nums text-ink">€ {fundAllocation.feesCosts.estFutureCosts}M</span>
                  </div>
                </div>
              </div>

              {/* Open Commitment */}
              <div className="rounded-lg border border-line p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-line" />
                    <span className="text-[13px] font-medium text-ink">Open Commitment / Dry Powder</span>
                  </div>
                  <span className="text-[13px] tabular-nums font-semibold text-ink">€ {fundAllocation.dryPowder}M</span>
                </div>
                <div className="mt-2 pl-5 text-[11px] text-ink-2">
                  Available for new investments
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
