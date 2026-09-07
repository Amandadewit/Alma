"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import type { Company } from "@/lib/mock-data"
import { valueCreationBridgeData, projectionData } from "@/lib/mock-data"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList } from "recharts"

interface StrategyTabProps {
  company: Company
}

export function StrategyTab({ company }: StrategyTabProps) {
  const [bridgeView, setBridgeView] = useState<"Overview" | "Details">("Overview")

  // Calculate cumulative heights for waterfall chart
  const entryToCurrent = valueCreationBridgeData.entryToCurrent
  const currentToExit = valueCreationBridgeData.currentToExit
  const maxEbitda = currentToExit.ebitdaExit
  const chartHeight = 140

  // Entry to Current cumulative values
  const entryHeight = (entryToCurrent.ebitdaEntry / maxEbitda) * chartHeight
  const maHeight = (entryToCurrent.ma / maxEbitda) * chartHeight
  const organicHeight = (entryToCurrent.organicGrowth / maxEbitda) * chartHeight
  const ltmHeight = (entryToCurrent.ebitdaLTM / maxEbitda) * chartHeight

  // Current to Exit - these are additive from LTM
  const revenueGrowthHeight = (currentToExit.revenueGrowth / maxEbitda) * chartHeight
  const marginHeight = (currentToExit.marginImprovement / maxEbitda) * chartHeight
  const exitHeight = chartHeight

  // Cumulative bottom positions for waterfall effect
  const maBottom = entryHeight
  const organicBottom = maBottom + maHeight
  const revenueBottom = ltmHeight
  const marginBottom = revenueBottom + revenueGrowthHeight

  return (
    <div className="flex flex-col gap-3.5">
      {/* Meta Bar */}
      <div className="flex gap-8 rounded-[10px] border border-[#E8E6E0] bg-white px-4 py-3 text-xs">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-[#6B6963]">Holding period</div>
          <div className="mt-0.5 font-medium text-[#2C2C2A]">{company.holdingPeriod.toFixed(1)} yr</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-[#6B6963]">Bank</div>
          <div className="mt-0.5 font-medium text-[#2C2C2A]">{company.bank}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-[#6B6963]">Investment team</div>
          <div className="mt-0.5 font-medium text-[#2C2C2A]">{company.investmentTeam.join("; ")}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        {/* Valuation Card - Updated Layout */}
        <div className="overflow-hidden rounded-[10px] border border-[#E8E6E0] bg-white">
          <div className="border-b border-[#E8E6E0] px-4 py-3">
            <h3 className="text-[12px] font-medium text-[#2C2C2A]">Valuation</h3>
          </div>

          {/* MOI Header Row with Current and LE columns */}
          <div className="grid grid-cols-2">
            {/* Current Column */}
            <div className="border-r border-[#E8E6E0] p-4 text-right">
              <div className="text-[10px] text-[#6B6963]">MOI</div>
              <div className="mt-1 text-[32px] font-medium tabular-nums text-[#2C2C2A]">{company.valuation.current.moi.toFixed(2)}x</div>
            </div>
            {/* LE Column */}
            <div className="p-4 text-right">
              <div className="text-right text-[11px] font-medium text-[#2C2C2A]">LE</div>
              <div className="text-[10px] text-[#6B6963]">MOI</div>
              <div className="mt-1 text-[32px] font-medium tabular-nums text-[#2C2C2A]">{company.valuation.exit.moi.toFixed(2)}x</div>
            </div>
          </div>

          {/* Valuation Details Table */}
          <div className="border-t border-[#E8E6E0] px-4 py-3">
            <table className="w-full text-[11px]">
              <thead>
                <tr>
                  <td className="py-1.5 text-[#6B6963]"></td>
                  <td className="py-1.5 text-right text-[10px] font-medium uppercase tracking-wide text-[#6B6963]">Current</td>
                  <td className="py-1.5 text-right text-[10px] font-medium uppercase tracking-wide text-[#6B6963]">EXIT</td>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[#F1EFE8]">
                  <td className="py-1.5 text-[#6B6963]">Invested Value</td>
                  <td className="py-1.5 text-right tabular-nums font-medium text-[#2C2C2A]">{company.valuation.current.investedValue.toFixed(1)}M</td>
                  <td className="py-1.5 text-right tabular-nums font-medium text-[#2C2C2A]">{company.valuation.exit.investedValue.toFixed(1)}M</td>
                </tr>
                <tr className="border-t border-[#F1EFE8]">
                  <td className="py-1.5 text-[#6B6963]">Fair Value</td>
                  <td className="py-1.5 text-right tabular-nums font-medium text-[#2C2C2A]">{company.valuation.current.fairValue.toFixed(1)}M</td>
                  <td className="py-1.5 text-right tabular-nums font-medium text-[#2C2C2A]">{company.valuation.exit.fairValue.toFixed(1)}M</td>
                </tr>
                <tr className="border-t border-[#F1EFE8]">
                  <td className="py-1.5 text-[#6B6963]">EV / EBITDA</td>
                  <td className="py-1.5 text-right tabular-nums font-medium text-[#2C2C2A]">{company.valuation.current.evEbitda.toFixed(1)}x</td>
                  <td className="py-1.5 text-right tabular-nums font-medium text-[#2C2C2A]">{company.valuation.exit.evEbitda.toFixed(1)}x</td>
                </tr>
                <tr className="border-t border-[#F1EFE8]">
                  <td className="py-1.5 text-[#6B6963]">Share Ordinary Equity</td>
                  <td className="py-1.5 text-right tabular-nums font-medium text-[#2C2C2A]">{company.valuation.current.shareOrdinaryEquity ?? "--"}</td>
                  <td className="py-1.5 text-right tabular-nums font-medium text-[#2C2C2A]">{company.valuation.exit.shareOrdinaryEquity}%</td>
                </tr>
                <tr className="border-t border-[#F1EFE8]">
                  <td className="py-1.5 text-[#6B6963]">Year</td>
                  <td className="py-1.5 text-right tabular-nums font-medium text-[#2C2C2A]">{company.valuation.current.year}</td>
                  <td className="py-1.5 text-right tabular-nums font-medium text-[#2C2C2A]">{company.valuation.exit.year}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Comments Panel */}
        <div className="overflow-hidden rounded-[10px] border border-[#E8E6E0] bg-white">
          <div className="flex items-center justify-between border-b border-[#E8E6E0] px-4 py-3">
            <h3 className="text-[12px] font-medium text-[#2C2C2A]">Comments</h3>
            <button className="text-[11px] text-[#1B4D45] hover:underline">+ add</button>
          </div>
          <div className="custom-scrollbar max-h-[180px] overflow-y-auto p-3.5">
            <div className="flex flex-col gap-2">
              {company.comments.map((comment) => (
                <div key={comment.id} className="rounded-lg bg-[#F7F6F3] p-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-[#2C2C2A]">{comment.author}</span>
                    <span className="text-[10px] text-[#B8975A]">{comment.period}</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#6B6963]">{comment.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* EBITDA Bridge - Full Width Waterfall Chart */}
        <div className="col-span-2 overflow-hidden rounded-[10px] border border-[#E8E6E0] bg-white">
          <div className="flex items-center justify-between border-b border-[#E8E6E0] px-4 py-3">
            <div className="flex gap-0.5 rounded-md bg-[#F1EFE8] p-0.5">
              {(["Overview", "Details"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setBridgeView(v)}
                  className={cn(
                    "rounded px-2.5 py-1 text-[10px] transition-colors",
                    bridgeView === v
                      ? "bg-white font-medium text-[#2C2C2A]"
                      : "text-[#6B6963] hover:text-[#2C2C2A]"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4">
            {/* Section Labels */}
            <div className="mb-3 grid grid-cols-[4fr_3fr] gap-8">
              <div className="text-[11px] font-medium text-[#2C2C2A]">Entry to Current</div>
              <div className="text-[11px] font-medium text-[#2C2C2A]">Current to Exit</div>
            </div>

            {/* Waterfall Chart */}
            <div className="relative" style={{ height: 200 }}>
              <div className="absolute inset-0 flex">
                {/* Entry to Current Section */}
                <div className="flex flex-[4] items-end justify-around gap-1 pr-4">
                  {/* EBITDA Entry */}
                  <div className="flex flex-col items-center">
                    <span className="mb-1 text-[10px] font-medium tabular-nums text-[#2C2C2A]">{entryToCurrent.ebitdaEntry.toFixed(1)}M</span>
                    <div
                      className="w-14 rounded-t-sm bg-[#5A8A8A]"
                      style={{ height: entryHeight }}
                    />
                    <span className="mt-2 text-center text-[9px] text-[#6B6963]">EBITDA Entry</span>
                  </div>

                  {/* M&A - Floating */}
                  <div className="flex flex-col items-center">
                    <span className="mb-1 text-[10px] font-medium tabular-nums text-[#2C2C2A]">{entryToCurrent.ma.toFixed(1)}M</span>
                    <div className="relative" style={{ height: chartHeight }}>
                      <div
                        className="absolute bottom-0 w-14 rounded-t-sm bg-[#7BA9A9]"
                        style={{ height: maHeight, bottom: maBottom }}
                      />
                    </div>
                    <span className="mt-2 text-center text-[9px] text-[#6B6963]">M&A</span>
                  </div>

                  {/* Organic Growth - Floating */}
                  <div className="flex flex-col items-center">
                    <span className="mb-1 text-[10px] font-medium tabular-nums text-[#2C2C2A]">{entryToCurrent.organicGrowth.toFixed(1)}M</span>
                    <div className="relative" style={{ height: chartHeight }}>
                      <div
                        className="absolute bottom-0 w-14 rounded-t-sm bg-[#5A8A8A]"
                        style={{ height: organicHeight, bottom: organicBottom }}
                      />
                    </div>
                    <span className="mt-2 text-center text-[9px] text-[#6B6963]">Organic growth</span>
                  </div>

                  {/* EBITDA LTM */}
                  <div className="flex flex-col items-center">
                    <span className="mb-1 text-[10px] font-medium tabular-nums text-[#5A8A8A]">{entryToCurrent.ebitdaLTM.toFixed(1)}M</span>
                    <div
                      className="w-14 rounded-t-sm bg-[#5A8A8A]"
                      style={{ height: ltmHeight }}
                    />
                    <span className="mt-2 text-center text-[9px] text-[#6B6963]">EBITDA LTM</span>
                  </div>
                </div>

                {/* Current to Exit Section */}
                <div className="flex flex-[3] items-end justify-around gap-1 border-l border-[#E8E6E0] pl-4">
                  {/* Revenue Growth - Floating */}
                  <div className="flex flex-col items-center">
                    <span className="mb-1 text-[10px] font-medium tabular-nums text-[#2C2C2A]">{currentToExit.revenueGrowth.toFixed(1)}M</span>
                    <div className="relative" style={{ height: chartHeight }}>
                      <div
                        className="absolute bottom-0 w-14 rounded-t-sm bg-[#5A8A8A]"
                        style={{ height: revenueGrowthHeight, bottom: revenueBottom }}
                      />
                    </div>
                    <span className="mt-2 text-center text-[9px] text-[#6B6963]">Revenue growth</span>
                  </div>

                  {/* Margin Improvement - Floating (green) */}
                  <div className="flex flex-col items-center">
                    <span className="mb-1 text-[10px] font-medium tabular-nums text-[#22C55E]">{currentToExit.marginImprovement.toFixed(1)}M</span>
                    <div className="relative" style={{ height: chartHeight }}>
                      <div
                        className="absolute bottom-0 w-14 rounded-t-sm bg-[#22C55E]"
                        style={{ height: marginHeight, bottom: marginBottom }}
                      />
                    </div>
                    <span className="mt-2 text-center text-[9px] text-[#6B6963]">Margin imp.</span>
                  </div>

                  {/* EBITDA Exit */}
                  <div className="flex flex-col items-center">
                    <span className="mb-1 text-[10px] font-medium tabular-nums text-[#5A8A8A]">{currentToExit.ebitdaExit.toFixed(1)}M</span>
                    <div
                      className="w-14 rounded-t-sm bg-[#5A8A8A]"
                      style={{ height: exitHeight }}
                    />
                    <span className="mt-2 text-center text-[9px] text-[#6B6963]">EBITDA Exit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="overflow-hidden rounded-[10px] border border-[#E8E6E0] bg-white">
          <div className="border-b border-[#E8E6E0] px-4 py-3">
            <h3 className="text-[12px] font-medium text-[#2C2C2A]">Revenue — FVIII Case vs LE</h3>
          </div>
          <div className="p-3.5">
            <div className="mb-1.5 flex gap-2.5 text-[9px] text-[#6B6963]">
              <span className="flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-sm bg-[#1B4D45]" />
                FVIII
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-sm bg-[#9FE1CB]" />
                LE
              </span>
            </div>
            <div className="h-[80px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectionData.revenue} barGap={2} margin={{ top: 15, right: 5, left: 5, bottom: 5 }}>
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#6B6963" }} />
                  <YAxis hide domain={[0, 60]} />
                  <Bar dataKey="fundCase" fill="#1B4D45" radius={[2, 2, 0, 0]} barSize={18}>
                    <LabelList dataKey="fundCase" position="inside" style={{ fontSize: 8, fill: "#fff", fontWeight: 500 }} />
                  </Bar>
                  <Bar dataKey="le" fill="#9FE1CB" radius={[2, 2, 0, 0]} barSize={18}>
                    <LabelList dataKey="le" position="inside" style={{ fontSize: 8, fill: "#2C2C2A", fontWeight: 500 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* EBITDA Chart */}
        <div className="overflow-hidden rounded-[10px] border border-[#E8E6E0] bg-white">
          <div className="border-b border-[#E8E6E0] px-4 py-3">
            <h3 className="text-[12px] font-medium text-[#2C2C2A]">N. EBITDA — FVIII Case vs LE</h3>
          </div>
          <div className="p-3.5">
            <div className="mb-1.5 flex gap-2.5 text-[9px] text-[#6B6963]">
              <span className="flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-sm bg-[#1B4D45]" />
                FVIII
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-sm bg-[#9FE1CB]" />
                LE
              </span>
            </div>
            <div className="h-[80px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectionData.ebitda} barGap={2} margin={{ top: 15, right: 5, left: 5, bottom: 5 }}>
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#6B6963" }} />
                  <YAxis hide domain={[0, 12]} />
                  <Bar dataKey="fundCase" fill="#1B4D45" radius={[2, 2, 0, 0]} barSize={18}>
                    <LabelList dataKey="fundCase" position="inside" style={{ fontSize: 8, fill: "#fff", fontWeight: 500 }} />
                  </Bar>
                  <Bar dataKey="le" fill="#9FE1CB" radius={[2, 2, 0, 0]} barSize={18}>
                    <LabelList dataKey="le" position="inside" style={{ fontSize: 8, fill: "#2C2C2A", fontWeight: 500 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
