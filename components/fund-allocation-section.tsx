"use client"

import { fundAllocation } from "@/lib/mock-data"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface FundAllocationSectionProps {
  committedCapital: number
}

const COLORS = {
  invested: "#1B4D45",
  reserved: "#B8975A",
  fees: "#D4C5A9",
  dryPowder: "#9FE1CB",
}

export function FundAllocationSection({ committedCapital }: FundAllocationSectionProps) {
  const chartData = [
    { name: "Invested", value: 50, color: COLORS.invested },
    { name: "Reserved", value: 10, color: COLORS.reserved },
    { name: "Fees", value: 10, color: COLORS.fees },
    { name: "Dry powder", value: 30, color: COLORS.dryPowder },
  ]

  return (
    <div className="overflow-hidden rounded-[10px] border border-[#E8E6E0] bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E8E6E0] px-4 py-3">
        <h2 className="text-[13px] font-medium text-[#2C2C2A]">Fund allocation planning</h2>
        <span className="text-[11px] text-[#6B6963]">€ {committedCapital}M committed capital</span>
      </div>

      {/* Content */}
      <div className="grid grid-cols-[180px_1fr] gap-0">
        {/* Left - Donut Chart */}
        <div className="flex flex-col items-center justify-center border-r border-[#E8E6E0] py-5">
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
              <div className="text-[9px] uppercase tracking-wide text-[#6B6963]">Fund size</div>
              <div className="text-lg font-medium text-[#2C2C2A]">€ {committedCapital}M</div>
              <div className="text-[9px] text-[#6B6963]">committed</div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-3 flex w-full flex-col gap-1.5 px-4">
            <div className="flex items-center gap-2 text-[10px] text-[#6B6963]">
              <span className="h-2 w-2 shrink-0 rounded-sm bg-[#1B4D45]" />
              <span>Invested</span>
              <span className="ml-auto font-medium text-[#2C2C2A]">50%</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#6B6963]">
              <span className="h-2 w-2 shrink-0 rounded-sm bg-[#B8975A]" />
              <span>Reserved add-ons</span>
              <span className="ml-auto font-medium text-[#2C2C2A]">10%</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#6B6963]">
              <span className="h-2 w-2 shrink-0 rounded-sm bg-[#D4C5A9]" />
              <span>Fees & costs</span>
              <span className="ml-auto font-medium text-[#2C2C2A]">10%</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#6B6963]">
              <span className="h-2 w-2 shrink-0 rounded-sm bg-[#9FE1CB]" />
              <span>Dry powder</span>
              <span className="ml-auto font-medium text-[#2C2C2A]">30%</span>
            </div>
          </div>
        </div>

        {/* Right - Breakdown Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <tbody>
              {/* Invested */}
              <tr className="bg-[#FAFAF7]">
                <td className="px-3 py-2 font-medium text-[#2C2C2A]">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-[#1B4D45]" />
                    Invested in companies
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-medium text-[#2C2C2A]">50%</td>
                <td className="px-3 py-2 text-right font-medium text-[#2C2C2A]">€ {fundAllocation.invested.total.toFixed(1)}M</td>
              </tr>
              {fundAllocation.invested.companies.map((company, i) => (
                <tr key={i} className="border-b border-[#E8E6E0]">
                  <td className="py-1.5 pl-7 pr-3 text-[#6B6963]">{company.name}</td>
                  <td className="px-3 py-1.5"></td>
                  <td className="px-3 py-1.5 text-right text-[#2C2C2A]">€ {company.amount.toFixed(1)}M</td>
                </tr>
              ))}

              {/* Reserved */}
              <tr className="bg-[#FAFAF7]">
                <td className="px-3 py-2 font-medium text-[#2C2C2A]">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-[#B8975A]" />
                    Reserved for add-ons
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-medium text-[#2C2C2A]">10%</td>
                <td className="px-3 py-2 text-right font-medium text-[#2C2C2A]">€ {fundAllocation.reservedAddOns.total.toFixed(1)}M</td>
              </tr>
              {fundAllocation.reservedAddOns.items.map((item, i) => (
                <tr key={i} className="border-b border-[#E8E6E0]">
                  <td className="py-1.5 pl-7 pr-3 text-[#6B6963]">{item.name}</td>
                  <td className="px-3 py-1.5"></td>
                  <td className="px-3 py-1.5 text-right text-[#2C2C2A]">€ {item.amount.toFixed(1)}M</td>
                </tr>
              ))}

              {/* Fees */}
              <tr className="bg-[#FAFAF7]">
                <td className="px-3 py-2 font-medium text-[#2C2C2A]">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-[#D4C5A9]" />
                    Fees & costs
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-medium text-[#2C2C2A]">10%</td>
                <td className="px-3 py-2 text-right font-medium text-[#2C2C2A]">€ {fundAllocation.feesCosts.total.toFixed(1)}M</td>
              </tr>
              <tr className="border-b border-[#E8E6E0]">
                <td className="py-1.5 pl-7 pr-3 text-[#6B6963]">Management fee + expenses</td>
                <td className="px-3 py-1.5"></td>
                <td className="px-3 py-1.5 text-right text-[#2C2C2A]">€ {fundAllocation.feesCosts.managementFee.toFixed(1)}M</td>
              </tr>
              <tr className="border-b border-[#E8E6E0]">
                <td className="py-1.5 pl-7 pr-3 text-[#6B6963]">Est. future costs</td>
                <td className="px-3 py-1.5"></td>
                <td className="px-3 py-1.5 text-right text-[#2C2C2A]">€ {fundAllocation.feesCosts.estFutureCosts.toFixed(1)}M</td>
              </tr>

              {/* Dry powder */}
              <tr className="bg-[#FAFAF7]">
                <td className="px-3 py-2 font-medium text-[#2C2C2A]">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-[#9FE1CB]" />
                    Dry powder
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-medium text-[#2C2C2A]">30%</td>
                <td className="px-3 py-2 text-right font-medium text-[#2C2C2A]">€ {fundAllocation.dryPowder.toFixed(1)}M</td>
              </tr>

              {/* Total */}
              <tr className="border-t-2 border-[#E8E6E0] bg-[#F7F6F3]">
                <td className="px-3 py-2 font-medium text-[#2C2C2A]">Fund size</td>
                <td className="px-3 py-2 text-right font-medium text-[#2C2C2A]">100%</td>
                <td className="px-3 py-2 text-right font-medium text-[#2C2C2A]">€ {committedCapital.toFixed(1)}M</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
