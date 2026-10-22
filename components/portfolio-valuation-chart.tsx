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
    <div className="overflow-hidden rounded-[10px] border border-line bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-[13px] font-medium text-ink">Portfolio valuation</h2>
        <span className="text-[11px] text-ink-2">Per company · EUR millions</span>
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
                tick={{ fontSize: 9, fill: "var(--ink-2)" }}
                interval={0}
              />
              <YAxis hide domain={[0, maxValue * 1.1]} />
              <Bar dataKey="investment" fill="var(--ai-soft)" radius={[3, 3, 0, 0]}>
                <LabelList
                  dataKey="investment"
                  position="top"
                  style={{ fontSize: 8, fill: "var(--ink-2)" }}
                />
              </Bar>
              <Bar dataKey="fairValue" fill="var(--brand)" radius={[3, 3, 0, 0]}>
                <LabelList
                  dataKey="fairValue"
                  position="top"
                  style={{ fontSize: 8, fill: "var(--ink-2)" }}
                />
              </Bar>
              <Bar dataKey="totalProceeds" fill="var(--action-hover)" radius={[3, 3, 0, 0]}>
                <LabelList
                  dataKey="totalProceeds"
                  position="top"
                  style={{ fontSize: 8, fill: "var(--ink-2)" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-3 border-t border-line px-4 py-2 text-[10px] text-ink-2">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-sm bg-ai-soft" />
          Investment
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-sm bg-brand" />
          Fair value
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-sm bg-action-hover" />
          Total (expected) proceeds
        </span>
      </div>
    </div>
  )
}
