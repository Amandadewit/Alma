"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { StatusDot } from "@/components/status-dot"
import { companies } from "@/lib/mock-data"

interface FinancialHighlightsTableProps {
  period: "FY" | "YTD" | "Month"
  fundId: string
}

export function FinancialHighlightsTable({ period, fundId }: FinancialHighlightsTableProps) {
  const [activePeriod, setActivePeriod] = useState(period)
  const fundCompanies = companies.filter((c) => c.fundId === fundId)

  const formatDelta = (value: number) => {
    if (value === 0) return "0%"
    const sign = value > 0 ? "+" : ""
    return `${sign}${value}%`
  }

  const getDeltaClass = (value: number) => {
    if (value > 0) return "text-ok"
    if (value < 0) return "text-alert"
    return "text-ink-2"
  }

  // Calculate totals
  const totals = {
    revenue2024A: fundCompanies.reduce((sum, c) => sum + c.financials.revenue.fy.ly, 0),
    revenueLTM: fundCompanies.reduce((sum, c) => sum + c.financials.revenue.fy.ltm, 0),
    revenue2025LE: fundCompanies.reduce((sum, c) => sum + c.financials.revenue.fy.le, 0),
    revenue2025B: fundCompanies.reduce((sum, c) => sum + c.financials.revenue.fy.budget, 0),
    ebitda2024A: fundCompanies.reduce((sum, c) => sum + c.financials.normalizedEbitda.fy.ly, 0),
    ebitdaLTM: fundCompanies.reduce((sum, c) => sum + c.financials.normalizedEbitda.fy.ltm, 0),
    ebitda2025LE: fundCompanies.reduce((sum, c) => sum + c.financials.normalizedEbitda.fy.le, 0),
    ebitda2025B: fundCompanies.reduce((sum, c) => sum + c.financials.normalizedEbitda.fy.budget, 0),
    netDebt2024A: fundCompanies.reduce((sum, c) => sum + c.financials.netDebt.fy2024A, 0),
    netDebt2025LE: fundCompanies.reduce((sum, c) => sum + c.financials.netDebt.fy2025LE, 0),
    netDebt2025B: fundCompanies.reduce((sum, c) => sum + c.financials.netDebt.fy2025B, 0),
  }

  return (
    <div className="overflow-hidden rounded-[10px] border border-line bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-[13px] font-medium text-ink">Financial highlights</h2>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5 rounded-md bg-surface-2 p-0.5">
            {(["FY", "YTD", "Month"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setActivePeriod(p)}
                className={cn(
                  "rounded px-2.5 py-1 text-[10px] transition-colors",
                  activePeriod === p
                    ? "bg-brand font-medium text-white"
                    : "text-ink-2 hover:text-ink"
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <span className="ml-2 text-[11px] text-ink-2">in mEUR</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-line">
              <th className="bg-bg px-2 py-1.5 text-left font-medium text-ink-2"></th>
              <th className="bg-bg px-2 py-1.5 text-center font-medium text-ink-2"></th>
              <th className="bg-bg px-2 py-1.5 text-left font-medium text-ink-2"></th>
              <th colSpan={4} className="bg-bg px-2 py-1.5 text-center text-[10px] font-medium text-brand">
                Revenue
              </th>
              <th colSpan={4} className="border-l border-line bg-bg px-2 py-1.5 text-center text-[10px] font-medium text-brand">
                Norm. EBITDA
              </th>
              <th colSpan={3} className="border-l border-line bg-bg px-2 py-1.5 text-center text-[10px] font-medium text-brand">
                Norm. EBITDA %
              </th>
              <th colSpan={4} className="border-l border-line bg-bg px-2 py-1.5 text-center text-[10px] font-medium text-brand">
                Net Debt
              </th>
            </tr>
            <tr className="border-b border-line bg-bg">
              <th className="px-2 py-1.5 text-left font-medium text-ink-2">Company</th>
              <th className="px-2 py-1.5 text-center font-medium text-ink-2">Status</th>
              <th className="px-2 py-1.5 text-left font-medium text-ink-2">Entry</th>
              <th className="px-2 py-1.5 text-right font-medium text-ink-2">2024A</th>
              <th className="px-2 py-1.5 text-right font-medium text-ink-2">LTM</th>
              <th className="px-2 py-1.5 text-right font-medium text-ink-2">2025LE</th>
              <th className="px-2 py-1.5 text-right font-medium text-ink-2">Δ LE vs B</th>
              <th className="border-l border-line px-2 py-1.5 text-right font-medium text-ink-2">2024A</th>
              <th className="px-2 py-1.5 text-right font-medium text-ink-2">LTM</th>
              <th className="px-2 py-1.5 text-right font-medium text-ink-2">2025LE</th>
              <th className="px-2 py-1.5 text-right font-medium text-ink-2">Δ LE vs B</th>
              <th className="border-l border-line px-2 py-1.5 text-right font-medium text-ink-2">2024A</th>
              <th className="px-2 py-1.5 text-right font-medium text-ink-2">2025LE</th>
              <th className="px-2 py-1.5 text-right font-medium text-ink-2">2025B</th>
              <th className="border-l border-line px-2 py-1.5 text-right font-medium text-ink-2">2024A</th>
              <th className="px-2 py-1.5 text-right font-medium text-ink-2">2025LE</th>
              <th className="px-2 py-1.5 text-right font-medium text-ink-2">2025B</th>
              <th className="px-2 py-1.5 text-right font-medium text-ink-2">Lev. LE</th>
            </tr>
          </thead>
          <tbody>
            {/* Fund header row */}
            <tr>
              <td colSpan={18} className="bg-bg px-2 py-1.5 text-[10px] font-medium text-brand">
                Fund IV
              </td>
            </tr>

            {/* Company rows */}
            {fundCompanies.map((company) => {
              const revDelta = Math.round(((company.financials.revenue.fy.le - company.financials.revenue.fy.budget) / company.financials.revenue.fy.budget) * 100)
              const ebitdaDelta = Math.round(((company.financials.normalizedEbitda.fy.le - company.financials.normalizedEbitda.fy.budget) / company.financials.normalizedEbitda.fy.budget) * 100)

              return (
                <tr key={company.id} className="border-b border-line hover:bg-bg">
                  <td className="px-2 py-1.5 text-ink">{company.name}</td>
                  <td className="px-2 py-1.5 text-center">
                    <StatusDot status={company.status} />
                  </td>
                  <td className="px-2 py-1.5 text-ink">{company.entryDate}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-ink">{company.financials.revenue.fy.ly.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-ink">{company.financials.revenue.fy.ltm.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-ink">{company.financials.revenue.fy.le.toFixed(1)}</td>
                  <td className={cn("px-2 py-1.5 text-right tabular-nums", getDeltaClass(revDelta))}>{formatDelta(revDelta)}</td>
                  <td className="border-l border-line px-2 py-1.5 text-right tabular-nums text-ink">{company.financials.normalizedEbitda.fy.ly.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-ink">{company.financials.normalizedEbitda.fy.ltm.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-ink">{company.financials.normalizedEbitda.fy.le.toFixed(1)}</td>
                  <td className={cn("px-2 py-1.5 text-right tabular-nums", getDeltaClass(ebitdaDelta))}>{formatDelta(ebitdaDelta)}</td>
                  <td className="border-l border-line px-2 py-1.5 text-right tabular-nums text-ink">{Math.round(company.financials.normalizedEbitdaPercent.fy.ly)}%</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-ink">{Math.round(company.financials.normalizedEbitdaPercent.fy.le)}%</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-ink">{Math.round(company.financials.normalizedEbitdaPercent.fy.budget)}%</td>
                  <td className="border-l border-line px-2 py-1.5 text-right tabular-nums text-ink">{company.financials.netDebt.fy2024A.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-ink">{company.financials.netDebt.fy2025LE.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-ink">{company.financials.netDebt.fy2025B.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-ink">{company.financials.netDebt.leverageLE.toFixed(1)}x</td>
                </tr>
              )
            })}

            {/* Total row */}
            <tr className="border-t-2 border-line bg-surface-2">
              <td className="px-2 py-1.5 font-medium text-ink">Total / Wtd avg</td>
              <td className="px-2 py-1.5"></td>
              <td className="px-2 py-1.5"></td>
              <td className="px-2 py-1.5 text-right tabular-nums font-medium text-ink">{totals.revenue2024A.toFixed(1)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums font-medium text-ink">{totals.revenueLTM.toFixed(1)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums font-medium text-ink">{totals.revenue2025LE.toFixed(1)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums font-medium text-ok">+1%</td>
              <td className="border-l border-line px-2 py-1.5 text-right tabular-nums font-medium text-ink">{totals.ebitda2024A.toFixed(1)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums font-medium text-ink">{totals.ebitdaLTM.toFixed(1)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums font-medium text-ink">{totals.ebitda2025LE.toFixed(1)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums font-medium text-ok">-2%</td>
              <td className="border-l border-line px-2 py-1.5 text-right tabular-nums font-medium text-ink">18%</td>
              <td className="px-2 py-1.5 text-right tabular-nums font-medium text-ink">18%</td>
              <td className="px-2 py-1.5 text-right tabular-nums font-medium text-ink">18%</td>
              <td className="border-l border-line px-2 py-1.5 text-right tabular-nums font-medium text-ink">{totals.netDebt2024A.toFixed(1)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums font-medium text-ink">{totals.netDebt2025LE.toFixed(1)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums font-medium text-ink">{totals.netDebt2025B.toFixed(1)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums font-medium text-ink">2.5x</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
