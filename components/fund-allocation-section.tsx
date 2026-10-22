"use client"

import { fundAllocation } from "@/lib/mock-data"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface FundAllocationSectionProps {
  committedCapital: number
}

const COLORS = {
  invested: "var(--brand)",
  reserved: "var(--ai)",
  fees: "var(--ai-soft)",
  dryPowder: "var(--brand-soft)",
}

export function FundAllocationSection({ committedCapital }: FundAllocationSectionProps) {
  const chartData = [
    { name: "Invested", value: 50, color: COLORS.invested },
    { name: "Reserved", value: 10, color: COLORS.reserved },
    { name: "Fees", value: 10, color: COLORS.fees },
    { name: "Dry powder", value: 30, color: COLORS.dryPowder },
  ]

  return (
    <div className="overflow-hidden rounded-[10px] border border-line bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-[13px] font-medium text-ink">Fund allocation planning</h2>
        <span className="text-[11px] text-ink-2">€ {committedCapital}M committed capital</span>
      </div>

      {/* Content */}
      <div className="grid grid-cols-[180px_1fr] gap-0">
        {/* Left - Donut Chart */}
        <div className="flex flex-col items-center justify-center border-r border-line py-5">
          <div className="relative h-[150px] w-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={55}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-[9px] uppercase tracking-wide text-ink-2">Fund size</div>
              <div className="text-lg font-medium text-ink">€ {committedCapital}M</div>
              <div className="text-[9px] text-ink-2">committed</div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-3 flex w-full flex-col gap-1.5 px-4">
            <div className="flex items-center gap-2 text-[10px] text-ink-2">
              <span className="h-2 w-2 shrink-0 rounded-sm bg-brand" />
              <span>Invested</span>
              <span className="ml-auto font-medium text-ink">50%</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-ink-2">
              <span className="h-2 w-2 shrink-0 rounded-sm bg-ai" />
              <span>Reserved add-ons</span>
              <span className="ml-auto font-medium text-ink">10%</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-ink-2">
              <span className="h-2 w-2 shrink-0 rounded-sm bg-ai-soft" />
              <span>Fees & costs</span>
              <span className="ml-auto font-medium text-ink">10%</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-ink-2">
              <span className="h-2 w-2 shrink-0 rounded-sm bg-brand-soft" />
              <span>Dry powder</span>
              <span className="ml-auto font-medium text-ink">30%</span>
            </div>
          </div>
        </div>

        {/* Right - Breakdown Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <tbody>
              {/* Invested */}
              <tr className="bg-surface-2">
                <td className="px-3 py-2 font-medium text-ink">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-brand" />
                    Invested in companies
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-medium text-ink">50%</td>
                <td className="px-3 py-2 text-right font-medium text-ink">€ {fundAllocation.invested.total.toFixed(1)}M</td>
              </tr>
              {fundAllocation.invested.companies.map((company, i) => (
                <tr key={i} className="border-b border-line">
                  <td className="py-1.5 pl-7 pr-3 text-ink-2">{company.name}</td>
                  <td className="px-3 py-1.5"></td>
                  <td className="px-3 py-1.5 text-right text-ink">€ {company.amount.toFixed(1)}M</td>
                </tr>
              ))}

              {/* Reserved */}
              <tr className="bg-surface-2">
                <td className="px-3 py-2 font-medium text-ink">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-ai" />
                    Reserved for add-ons
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-medium text-ink">10%</td>
                <td className="px-3 py-2 text-right font-medium text-ink">€ {fundAllocation.reservedAddOns.total.toFixed(1)}M</td>
              </tr>
              {fundAllocation.reservedAddOns.items.map((item, i) => (
                <tr key={i} className="border-b border-line">
                  <td className="py-1.5 pl-7 pr-3 text-ink-2">{item.name}</td>
                  <td className="px-3 py-1.5"></td>
                  <td className="px-3 py-1.5 text-right text-ink">€ {item.amount.toFixed(1)}M</td>
                </tr>
              ))}

              {/* Fees */}
              <tr className="bg-surface-2">
                <td className="px-3 py-2 font-medium text-ink">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-ai-soft" />
                    Fees & costs
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-medium text-ink">10%</td>
                <td className="px-3 py-2 text-right font-medium text-ink">€ {fundAllocation.feesCosts.total.toFixed(1)}M</td>
              </tr>
              <tr className="border-b border-line">
                <td className="py-1.5 pl-7 pr-3 text-ink-2">Management fee + expenses</td>
                <td className="px-3 py-1.5"></td>
                <td className="px-3 py-1.5 text-right text-ink">€ {fundAllocation.feesCosts.managementFee.toFixed(1)}M</td>
              </tr>
              <tr className="border-b border-line">
                <td className="py-1.5 pl-7 pr-3 text-ink-2">Est. future costs</td>
                <td className="px-3 py-1.5"></td>
                <td className="px-3 py-1.5 text-right text-ink">€ {fundAllocation.feesCosts.estFutureCosts.toFixed(1)}M</td>
              </tr>

              {/* Dry powder */}
              <tr className="bg-surface-2">
                <td className="px-3 py-2 font-medium text-ink">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-brand-soft" />
                    Dry powder
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-medium text-ink">30%</td>
                <td className="px-3 py-2 text-right font-medium text-ink">€ {fundAllocation.dryPowder.toFixed(1)}M</td>
              </tr>

              {/* Total */}
              <tr className="border-t-2 border-line bg-bg">
                <td className="px-3 py-2 font-medium text-ink">Fund size</td>
                <td className="px-3 py-2 text-right font-medium text-ink">100%</td>
                <td className="px-3 py-2 text-right font-medium text-ink">€ {committedCapital.toFixed(1)}M</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
