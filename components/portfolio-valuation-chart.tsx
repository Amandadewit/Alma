"use client"

import { portfolioValuationData } from "@/lib/mock-data"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts"

export function PortfolioValuationChart() {
  const maxValue = Math.max(...portfolioValuationData.map((d) => d.totalProceeds))

  return (
    <div className="overflow-hidden rounded-[10px] border border-[#E8E6E0] bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E8E6E0] px-4 py-3">
        <h2 className="text-[13px] font-medium text-[#2C2C2A]">Portfolio valuation</h2>
        <span className="text-[11px] text-[#6B6963]">Per company · EUR millions</span>
      </div>

      {/* Chart */}
      <div className="px-4 py-3">
        <div className="h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={portfolioValuationData}
              margin={{ top: 20, right: 5, left: 5, bottom: 5 }}
              barGap={2}
              barCategoryGap="20%"
            >
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fill: "#6B6963" }}
                interval={0}
              />
              <YAxis hide domain={[0, maxValue * 1.1]} />
              <Bar dataKey="investment" fill="#D4C5A9" radius={[3, 3, 0, 0]}>
                <LabelList
                  dataKey="investment"
                  position="top"
                  style={{ fontSize: 8, fill: "#6B6963" }}
                />
              </Bar>
              <Bar dataKey="fairValue" fill="#1B4D45" radius={[3, 3, 0, 0]}>
                <LabelList
                  dataKey="fairValue"
                  position="top"
                  style={{ fontSize: 8, fill: "#6B6963" }}
                />
              </Bar>
              <Bar dataKey="totalProceeds" fill="#085041" radius={[3, 3, 0, 0]}>
                <LabelList
                  dataKey="totalProceeds"
                  position="top"
                  style={{ fontSize: 8, fill: "#6B6963" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-3 border-t border-[#E8E6E0] px-4 py-2 text-[10px] text-[#6B6963]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-sm bg-[#D4C5A9]" />
          Investment
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-sm bg-[#1B4D45]" />
          Fair value
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-sm bg-[#085041]" />
          Total (expected) proceeds
        </span>
      </div>
    </div>
  )
}
