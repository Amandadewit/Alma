"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import type { Company } from "@/lib/mock-data"
import { monthlyEbitdaData } from "@/lib/mock-data"
import {
  useDashboardConfig,
  metricLabel,
  accumulationLabel,
  type MetricCode,
  type AccumulationCode,
} from "@/lib/dashboard-config"
import {
  EditToggle,
  EditableTitle,
  AddRowInline,
  AddColumnInline,
  BlockNotes,
  RemoveRowButton,
} from "@/components/dashboard/edit-controls"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LabelList,
  LineChart,
  Line,
} from "recharts"

interface PerformanceTabProps {
  company: Company
}

export function PerformanceTab({ company }: PerformanceTabProps) {
  const [selectedMonth, setSelectedMonth] = useState("Jul")
  const [chartMetric, setChartMetric] = useState<"Total" | "Revenue" | "EBITDA" | "FCF">("EBITDA")
  const [chartType, setChartType] = useState<"Actual" | "LTM" | "LE">("LTM")
  const [editing, setEditing] = useState(false)
  const cfg = useDashboardConfig(`portfolio-performance:${company.id}`)
  const [selectedKPI, setSelectedKPI] = useState(company.kpis.customKPIs[0]?.name || "")

  const formatValue = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "--"
    return value.toFixed(1).replace(".", ",")
  }

  const formatPercent = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "--"
    return `${value.toFixed(1)}%`
  }

  const getDeltaClass = (value: number) => {
    if (value > 0) return "text-[#3B6D11]"
    if (value < 0) return "text-[#A32D2D]"
    return "text-[#6B6963]"
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const monthNum = months.indexOf(selectedMonth) + 1 || 7
  const periodEnd = String(monthNum).padStart(2, "0")
  const round1 = (n: number) => Math.round(n * 10) / 10

  // MTD run-rate derived from the YTD figures over the number of elapsed months
  const mtdOf = (a: number, b: number, ly: number, divide: boolean) => {
    const div = divide ? monthNum || 1 : 1
    const actual = round1(a / div)
    const budget = round1(b / div)
    return { a: actual, b: budget, ly: round1(ly / div), d: round1(actual - budget) }
  }

  const stdRow = (m: Company["financials"]["revenue"], percent = false) => ({
    mtd: mtdOf(m.ytd.actual, m.ytd.budget, m.ytd.ly, !percent),
    ytd: { a: m.ytd.actual, b: m.ytd.budget, ly: m.ytd.ly, d: m.ytd.deltaAvsB },
    fy: { ly: m.fy.ly, ltm: m.fy.ltm, le: m.fy.le, b: m.fy.budget, d: m.fy.deltaLEvsB },
  })

  // OPEX is derived: EBITDA − Gross Margin, shown as a negative cost line
  const gm = company.financials.grossMargin
  const eb = company.financials.ebitda
  const opexYtdA = round1(eb.ytd.actual - gm.ytd.actual)
  const opexYtdB = round1(eb.ytd.budget - gm.ytd.budget)
  const opexYtdLy = round1(eb.ytd.ly - gm.ytd.ly)
  const opexFyLe = round1(eb.fy.le - gm.fy.le)
  const opexFyB = round1(eb.fy.budget - gm.fy.budget)
  const opexRow = {
    mtd: mtdOf(opexYtdA, opexYtdB, opexYtdLy, true),
    ytd: { a: opexYtdA, b: opexYtdB, ly: opexYtdLy, d: round1(opexYtdA - opexYtdB) },
    fy: { ly: round1(eb.fy.ly - gm.fy.ly), ltm: round1(eb.fy.ltm - gm.fy.ltm), le: opexFyLe, b: opexFyB, d: round1(opexFyLe - opexFyB) },
  }

  // Monthly revenue build-up split into recurring / non-recurring / other,
  // derived deterministically from the company's LTM revenue.
  const monthlyRevenue = round1(company.financials.revenue.fy.ltm / 12)
  const revenueBuildupData = monthlyEbitdaData.map((d, i) => {
    const factor = 0.92 + i * 0.014 // gentle month-over-month growth
    const total = monthlyRevenue * factor
    return {
      month: d.month,
      recurring: round1(total * 0.65),
      nonRecurring: round1(total * 0.25),
      other: round1(total * 0.1),
    }
  })

  type RowCells = {
    mtd: { a: number; b: number; ly: number; d: number }
    ytd: { a: number; b: number; ly: number; d: number }
    fy: { ly: number; ltm: number; le: number; b: number; d: number }
  }

  const renderRow = (
    label: string,
    cells: RowCells,
    opts: { bold?: boolean; bg?: boolean; percent?: boolean; last?: boolean } = {},
  ) => {
    const f = opts.percent ? formatPercent : formatValue
    const strong = opts.bold ? "font-medium" : ""
    const cell = cn("px-1.5 py-1.5 text-right tabular-nums text-[#2C2C2A]", strong)
    const del = (v: number) => cn("px-1.5 py-1.5 text-right tabular-nums", strong, getDeltaClass(v))
    return (
      <tr className={cn(!opts.last && "border-b border-[#E8E6E0]", opts.bg && "bg-[#FAFAF7]")}>
        <td className={cn("px-1.5 py-1.5 text-[#2C2C2A]", opts.bold && "font-medium")}>{label}</td>
        <td className={cell}>{f(cells.mtd.a)}</td>
        <td className={cell}>{f(cells.mtd.b)}</td>
        <td className={cell}>{f(cells.mtd.ly)}</td>
        <td className={del(cells.mtd.d)}>{f(cells.mtd.d)}</td>
        <td className={cn(cell, "border-l border-[#E8E6E0]")}>{f(cells.ytd.a)}</td>
        <td className={cell}>{f(cells.ytd.b)}</td>
        <td className={cell}>{f(cells.ytd.ly)}</td>
        <td className={del(cells.ytd.d)}>{f(cells.ytd.d)}</td>
        <td className={cn(cell, "border-l border-[#E8E6E0]")}>{f(cells.fy.ly)}</td>
        <td className={cell}>{f(cells.fy.ltm)}</td>
        <td className={cell}>{f(cells.fy.le)}</td>
        <td className={cell}>{f(cells.fy.b)}</td>
        <td className={del(cells.fy.d)}>{f(cells.fy.d)}</td>
      </tr>
    )
  }

  return (
    <div className="flex flex-col gap-3.5">
      {/* Fiscal Year Note */}
      <div className="text-right text-[11px] text-[#6B6963]">
        The fiscal year is 01-2026 – 12-2026
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        {/* Financial Summary Table */}
        <div className="overflow-hidden rounded-[10px] border border-[#E8E6E0] bg-white">
          <div className="flex items-center justify-between border-b border-[#E8E6E0] px-4 py-3">
            <h3 className="text-[12px] font-medium text-[#2C2C2A]">Financial summary</h3>
            <span className="text-[10px] text-[#6B6963]">The YTD period is 01/2026 – {periodEnd}/2026</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-[11px]">
              <thead>
                <tr className="border-b border-[#E8E6E0]">
                  <th className="bg-[#F7F6F3] px-1.5 py-1.5"></th>
                  <th colSpan={4} className="bg-[#F7F6F3] px-1.5 py-1.5 text-center text-[10px] font-medium text-[#1B4D45]">MTD</th>
                  <th colSpan={4} className="border-l border-[#E8E6E0] bg-[#F7F6F3] px-1.5 py-1.5 text-center text-[10px] font-medium text-[#1B4D45]">YTD</th>
                  <th colSpan={5} className="border-l border-[#E8E6E0] bg-[#F7F6F3] px-1.5 py-1.5 text-center text-[10px] font-medium text-[#1B4D45]">FY</th>
                </tr>
                <tr className="border-b border-[#E8E6E0] bg-[#F7F6F3]">
                  <th className="px-1.5 py-1.5 text-left">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="rounded border border-[#E8E6E0] bg-white px-1 py-0.5 text-[10px] text-[#2C2C2A]"
                    >
                      {months.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </th>
                  <th className="px-1.5 py-1.5 text-right font-medium text-[#6B6963]">A</th>
                  <th className="px-1.5 py-1.5 text-right font-medium text-[#6B6963]">B</th>
                  <th className="px-1.5 py-1.5 text-right font-medium text-[#6B6963]">LY</th>
                  <th className="px-1.5 py-1.5 text-right font-medium text-[#6B6963]">ΔAB</th>
                  <th className="border-l border-[#E8E6E0] px-1.5 py-1.5 text-right font-medium text-[#6B6963]">A</th>
                  <th className="px-1.5 py-1.5 text-right font-medium text-[#6B6963]">B</th>
                  <th className="px-1.5 py-1.5 text-right font-medium text-[#6B6963]">LY</th>
                  <th className="px-1.5 py-1.5 text-right font-medium text-[#6B6963]">ΔAB</th>
                  <th className="border-l border-[#E8E6E0] px-1.5 py-1.5 text-right font-medium text-[#6B6963]">LY</th>
                  <th className="px-1.5 py-1.5 text-right font-medium text-[#6B6963]">LTM</th>
                  <th className="px-1.5 py-1.5 text-right font-medium text-[#6B6963]">LE</th>
                  <th className="px-1.5 py-1.5 text-right font-medium text-[#6B6963]">B</th>
                  <th className="px-1.5 py-1.5 text-right font-medium text-[#6B6963]">��LE B</th>
                </tr>
              </thead>
              <tbody>
                {renderRow("Revenue", stdRow(company.financials.revenue))}
                {renderRow("GM", stdRow(company.financials.grossMargin))}
                {renderRow("OPEX", opexRow)}
                {renderRow("EBITDA", stdRow(company.financials.ebitda), { bold: true, bg: true })}
                {renderRow("N. EBITDA", stdRow(company.financials.normalizedEbitda), { bold: true, bg: true })}
                {renderRow("N. EBITDA %", stdRow(company.financials.normalizedEbitdaPercent, true), { percent: true })}
                {renderRow("Free CF", stdRow(company.financials.freeCashFlow), { last: true })}
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
          <div className="custom-scrollbar max-h-[220px] overflow-y-auto p-3.5">
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

        {/* EBITDA Chart */}
        <div className="overflow-hidden rounded-[10px] border border-[#E8E6E0] bg-white">
          <div className="flex items-center justify-between border-b border-[#E8E6E0] px-4 py-3">
            <div className="flex gap-1.5">
              <div className="flex gap-0.5 rounded-md bg-[#F1EFE8] p-0.5">
                {(["Total", "Revenue", "EBITDA", "FCF"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setChartMetric(m)}
                    className={cn(
                      "rounded px-2.5 py-1 text-[10px] transition-colors",
                      chartMetric === m
                        ? "bg-white font-medium text-[#2C2C2A]"
                        : "text-[#6B6963] hover:text-[#2C2C2A]"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5 rounded-md bg-[#F1EFE8] p-0.5">
                {(["Actual", "LTM", "LE"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setChartType(t)}
                    className={cn(
                      "rounded px-2.5 py-1 text-[10px] transition-colors",
                      chartType === t
                        ? "bg-[#1B4D45] font-medium text-white"
                        : "text-[#6B6963] hover:text-[#2C2C2A]"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-[#6B6963]">Last</span>
              <input
                type="text"
                defaultValue="1"
                className="w-7 rounded border border-[#E8E6E0] px-1.5 py-0.5 text-center text-[10px]"
              />
              <select className="rounded border border-[#E8E6E0] bg-white px-1.5 py-0.5 text-[10px]">
                <option>jaar</option>
                <option>kwartaal</option>
                <option>maand</option>
              </select>
            </div>
          </div>
          <div className="p-4">
            <div className="h-[130px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartMetric === "Revenue" ? (
                  <BarChart data={revenueBuildupData} margin={{ top: 15, right: 5, left: 5, bottom: 5 }}>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#6B6963" }} />
                    <YAxis hide />
                    <Bar dataKey="recurring" stackId="rev" fill="#1B4D45" />
                    <Bar dataKey="nonRecurring" stackId="rev" fill="#5DCAA5" />
                    <Bar dataKey="other" stackId="rev" fill="#9FE1CB" radius={[3, 3, 0, 0]} />
                  </BarChart>
                ) : (
                  <BarChart data={monthlyEbitdaData} margin={{ top: 15, right: 5, left: 5, bottom: 5 }}>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#6B6963" }} />
                    <YAxis hide domain={[0, 8]} />
                    <Bar dataKey="value" fill="#1B4D45" radius={[3, 3, 0, 0]}>
                      <LabelList dataKey="value" position="top" style={{ fontSize: 8, fill: "#6B6963" }} />
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex gap-3 border-t border-[#E8E6E0] px-4 py-2 text-[10px] text-[#6B6963]">
            {chartMetric === "Revenue" ? (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-sm bg-[#1B4D45]" />
                  Recurring
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-sm bg-[#5DCAA5]" />
                  Non-recurring
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-sm bg-[#9FE1CB]" />
                  Other
                </span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-sm bg-[#9FE1CB]" />
                  FCF
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-sm bg-[#1B4D45]" />
                  Revenue
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-sm bg-[#5DCAA5]" />
                  N. EBITDA
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-sm bg-[#E8E6E0]" />
                  Normalizations
                </span>
              </>
            )}
          </div>
        </div>

        {/* KPIs Panel */}
        <div className="overflow-hidden rounded-[10px] border border-[#E8E6E0] bg-white">
          <div className="flex items-center justify-between border-b border-[#E8E6E0] px-4 py-3">
            <h3 className="text-[12px] font-medium text-[#2C2C2A]">Key metrics & KPIs</h3>
            <span className="text-[11px] text-[#6B6963]">Last available data</span>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-3 gap-2 p-3.5">
            <div className="rounded-lg bg-[#F7F6F3] p-2.5">
              <div className="text-[10px] uppercase tracking-wide text-[#6B6963]">FTE total</div>
              <div className="mt-0.5 text-xl font-medium text-[#2C2C2A]">{company.kpis.fteTotal}</div>
              <div className="mt-1 flex justify-between text-[10px] text-[#6B6963]">
                <span>ENPS</span>
                <span className="font-medium text-[#2C2C2A]">{company.kpis.enps ?? "--"}</span>
              </div>
              <div className="mt-0.5 flex justify-between text-[10px] text-[#6B6963]">
                <span>Sick leave rate</span>
                <span className="font-medium text-[#2C2C2A]">{company.kpis.sickLeaveRate}%</span>
              </div>
              <div className="mt-0.5 flex justify-between text-[10px] text-[#6B6963]">
                <span>Turnover</span>
                <span className="font-medium text-[#2C2C2A]">{company.kpis.turnover ?? "--"}</span>
              </div>
            </div>
            <div className="rounded-lg bg-[#F7F6F3] p-2.5">
              <div className="text-[10px] uppercase tracking-wide text-[#6B6963]">Total leverage</div>
              <div className="mt-0.5 text-xl font-medium text-[#2C2C2A]">{company.kpis.totalLeverage.toFixed(1)}x</div>
              <div className="mt-1 flex justify-between text-[10px] text-[#6B6963]">
                <span>Bank leverage</span>
                <span className="font-medium text-[#2C2C2A]">{company.kpis.bankLeverage.toFixed(1)}x</span>
              </div>
              <div className="mt-0.5 flex justify-between text-[10px] text-[#6B6963]">
                <span>Covenant breach</span>
                <span className="font-medium text-[#2C2C2A]">{company.kpis.covenantBreach}</span>
              </div>
            </div>
            <div className="rounded-lg bg-[#F7F6F3] p-2.5">
              <div className="text-[10px] uppercase tracking-wide text-[#6B6963]">Net debt</div>
              <div className="mt-0.5 text-xl font-medium text-[#2C2C2A]">{company.kpis.netDebt.toFixed(1)}M</div>
              <div className="mt-1 flex justify-between text-[10px] text-[#6B6963]">
                <span>Bank debt</span>
                <span className="font-medium text-[#2C2C2A]">{company.kpis.bankDebt.toFixed(1)}M</span>
              </div>
              <div className="mt-0.5 flex justify-between text-[10px] text-[#6B6963]">
                <span>Cash end</span>
                <span className="font-medium text-[#2C2C2A]">{company.kpis.cashEnd.toFixed(1)}M</span>
              </div>
              <div className="mt-0.5 flex justify-between text-[10px] text-[#6B6963]">
                <span>Other debt</span>
                <span className="font-medium text-[#2C2C2A]">{(company.kpis.otherDebt * 1000).toFixed(1)}K</span>
              </div>
            </div>
          </div>

          {/* KPI Selector */}
          <div className="border-t border-[#E8E6E0] px-3.5">
            <div className="py-2 text-center text-[10px] tracking-wider text-[#6B6963]">KPI selector</div>
          </div>
          <div className="grid grid-cols-[140px_1fr] gap-2.5 p-3.5 pt-0">
            <div className="flex flex-col gap-0.5">
              {company.kpis.customKPIs.map((kpi) => (
                <button
                  key={kpi.name}
                  onClick={() => setSelectedKPI(kpi.name)}
                  className={cn(
                    "rounded-md px-2 py-1.5 text-left text-[11px] transition-colors",
                    selectedKPI === kpi.name
                      ? "bg-[#1B4D45] text-white"
                      : "text-[#6B6963] hover:bg-[#F7F6F3]"
                  )}
                >
                  {kpi.name}
                </button>
              ))}
            </div>
            <div className="rounded-lg bg-[#F7F6F3] p-2.5">
              <div className="mb-1.5 flex gap-2.5 text-[10px] text-[#6B6963]">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#1B4D45]" />
                  Actual
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#B8975A]" />
                  Budget
                </span>
              </div>
              <div className="h-[50px]">
                {company.kpis.customKPIs.find((k) => k.name === selectedKPI) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={company.kpis.customKPIs
                        .find((k) => k.name === selectedKPI)
                        ?.actual.map((val, i) => ({
                          month: i,
                          actual: val,
                          budget: company.kpis.customKPIs.find((k) => k.name === selectedKPI)?.budget[i],
                        }))}
                      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    >
                      <Line type="monotone" dataKey="actual" stroke="#1B4D45" strokeWidth={1.5} dot={false} />
                      <Line type="monotone" dataKey="budget" stroke="#B8975A" strokeWidth={1} dot={false} strokeDasharray="3 2" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-[#6B6963]">
                    No KPI data available
                  </div>
                )}
              </div>
              <div className="mt-1 flex justify-between text-[8px] text-[#6B6963]">
                <span>Jan</span>
                <span>Mar</span>
                <span>May</span>
                <span>Jul</span>
                <span>Sep</span>
                <span>Nov</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
