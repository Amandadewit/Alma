"use client"

import { Fragment, useState } from "react"
import { cn } from "@/lib/utils"
import type { Company, ManagementMember } from "@/lib/mock-data"
import { valueCreationBridgeData, funds } from "@/lib/mock-data"
import { CardHeader } from "@/components/portfolio/card-header"
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList } from "recharts"

const RATING: Record<ManagementMember["rating"], { color: string; label: string }> = {
  strong: { color: "var(--ok)", label: "Strong" },
  watch: { color: "var(--watch)", label: "Watch" },
  replace: { color: "var(--alert)", label: "Replace" },
}

const ADDON_STATUS: Record<string, string> = {
  Closed: "bg-ok-soft text-ok",
  Signed: "bg-brand-soft text-brand",
  Pipeline: "bg-surface-2 text-ink-2",
}

// Actual performance vs the investment case (IC) and the management case (MC), mEUR
const YEARS = [2023, 2024, 2025, 2026, 2027, 2028, 2029]
const LAST_ACTUAL_YEAR = 2026
const REV_ACT = [0.62, 0.78, 0.92, 1.0]
const REV_IC = [0.64, 0.75, 0.9, 1.05, 1.18, 1.32, 1.46]
const REV_MC = [0.66, 0.8, 0.97, 1.07, 1.12, 1.2, 1.28]
const EB_ACT = [0.68, 0.9, 1.0, 0.98]
const EB_IC = [0.75, 0.85, 1.0, 1.15, 1.3, 1.5, 1.7]
const EB_MC = [0.72, 0.8, 0.95, 1.05, 1.08, 1.18, 1.25]
const C_ACT = "#323a5f"
const C_IC = "#7f8189"
const C_MC = "#b9bccb"

const HV_INV = "#9aa5ba"
const HV_FAIR = "#4a6f75"

const fmtM = (v: number, d = 1) => v.toLocaleString("en-GB", { minimumFractionDigits: d, maximumFractionDigits: d })

interface StrategyTabProps {
  company: Company
}

export function StrategyTab({ company }: StrategyTabProps) {
  const [bridgeView, setBridgeView] = useState<"Overview" | "Details">("Overview")

  // ---------- EBITDA bridge (waterfall) ----------
  const e2c = valueCreationBridgeData.entryToCurrent
  const c2e = valueCreationBridgeData.currentToExit
  type Step = { label: string; value: number; total?: boolean; group: "e2c" | "c2e" }
  const steps: Step[] = [
    { label: "EBITDA Entry", value: e2c.ebitdaEntry, total: true, group: "e2c" },
    { label: "M&A", value: e2c.ma, group: "e2c" },
    { label: "Organic growth", value: e2c.organicGrowth, group: "e2c" },
    { label: "EBITDA LTM", value: e2c.ebitdaLTM, total: true, group: "e2c" },
    { label: "Revenue growth", value: c2e.revenueGrowth, group: "c2e" },
    { label: "Margin imp.", value: c2e.marginImprovement, group: "c2e" },
    { label: "EBITDA Exit", value: c2e.ebitdaExit, total: true, group: "c2e" },
  ]
  let running = 0
  const bridge = steps.map((st) => {
    const before = running
    const after = st.total ? st.value : running + st.value
    running = after
    return { ...st, start: st.total ? st.value : before, end: after, lo: st.total ? 0 : Math.min(before, after), hi: st.total ? st.value : Math.max(before, after) }
  })
  const bridgeMax = Math.max(...bridge.map((x) => x.hi)) * 1.0
  const BRIDGE_H = 104
  const BAR_W = 40
  const px = (v: number) => (v / bridgeMax) * BRIDGE_H
  const BRIDGE_UP = "#4a6f75"
  const fmtStep = (v: number) => `${v < 0 ? "-" : ""}${Math.abs(v).toFixed(1)}M`

  // ---------- valuation scenarios ----------
  const addOns = company.addOns ?? []
  const pendingAddOns = addOns.filter((a) => a.status !== "Closed")
  const maEquity = pendingAddOns.reduce((t, a) => t + a.equity, 0)
  const cur = company.valuation.current
  const le = company.valuation.exit
  const margin = company.financials.normalizedEbitdaPercent.fy.ltm / 100
  const maInvested = le.investedValue + maEquity
  const maFair = le.fairValue + maEquity * le.moi * 1.15 // add-ons are bought at lower multiples than the platform exits at
  const scenarios = [
    {
      key: "current", title: "Current", moi: cur.moi, invested: cur.investedValue, fair: cur.fairValue,
      evEbitda: cur.evEbitda, evRevenue: cur.evEbitda * margin, share: cur.shareOrdinaryEquity === null ? "--" : `${cur.shareOrdinaryEquity}%`, year: cur.year,
    },
    {
      key: "le", title: "EXIT excl. M&A", moi: le.moi, invested: le.investedValue, fair: le.fairValue,
      evEbitda: le.evEbitda, evRevenue: le.evEbitda * (margin + 0.03), share: `${le.shareOrdinaryEquity}%`, year: le.year,
    },
    {
      key: "ma", title: "EXIT incl. M&A", moi: maInvested > 0 ? maFair / maInvested : 0, invested: maInvested, fair: maFair,
      evEbitda: le.evEbitda + 0.5, evRevenue: (le.evEbitda + 0.5) * (margin + 0.05), share: `${le.shareOrdinaryEquity}%`, year: le.year,
    },
  ]
  const fund = funds.find((f) => f.id === company.fundId)

  // ---------- historical valuations: last three quarters ----------
  const QUARTERS = ["Q4 2025", "Q1 2026", "Q2 2026"]
  const FAIR_CUR = [0.93, 0.97, 1]
  const FAIR_LE = [0.95, 0.975, 1]
  const FAIR_MA = [0.94, 0.97, 1]
  const MA_SHARE = [0.6, 0.8, 1] // add-ons in the exit-incl.-M&A case grow as the pipeline firms up
  const history = QUARTERS.map((label, i) => ({
    label,
    cur: { inv: cur.investedValue, fair: cur.fairValue * FAIR_CUR[i] },
    le: { inv: le.investedValue, fair: le.fairValue * FAIR_LE[i] },
    ma: { inv: le.investedValue + maEquity * MA_SHARE[i], fair: maFair * FAIR_MA[i] },
  }))
  const hLast = history[history.length - 1]
  const histGroups = [
    ...history.map((q) => ({ label: q.label, exit: false, inv: q.cur.inv, fair: q.cur.fair })),
    { label: "EXIT incl. M&A", exit: true, inv: hLast.ma.inv, fair: hLast.ma.fair },
    { label: "EXIT excl. M&A", exit: true, inv: hLast.le.inv, fair: hLast.le.fair },
  ]
  const histMax = Math.max(...histGroups.flatMap((g) => [g.inv, g.fair])) * 1.15 || 1
  const HV_BASE = 160, HV_H = 112, HV_W = 100
  const hMoi = (v: { inv: number; fair: number }) => (v.inv ? v.fair / v.inv : 0)

  // ---------- actual performance vs investment case ----------
  const revBase = company.financials.revenue.fy.ltm
  const ebBase = company.financials.normalizedEbitda.fy.ltm
  const baseCase = YEARS.map((y, i) => ({
    year: String(y),
    ebitdaAct: y <= LAST_ACTUAL_YEAR ? ebBase * EB_ACT[i] : null,
    ebitdaIc: ebBase * EB_IC[i],
    ebitdaMc: ebBase * EB_MC[i],
    revAct: y <= LAST_ACTUAL_YEAR ? revBase * REV_ACT[i] : null,
    revIc: revBase * REV_IC[i],
    revMc: revBase * REV_MC[i],
  }))
  const yMax = Math.ceil((Math.max(...baseCase.map((d) => Math.max(d.revIc, d.revMc, d.revAct ?? 0))) * 1.12) / 10) * 10 || 10
  const labelDec = yMax <= 10 ? 1 : 0
  const barLabel = (v: unknown) => (typeof v === "number" ? fmtM(v, labelDec) : "")

  return (
    <div className="flex flex-col gap-3.5">
      {/* Meta Bar */}
      <div className="flex flex-wrap gap-x-8 gap-y-3 rounded-[10px] border border-line bg-white px-4 py-3 text-xs">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-ink-2">Fund</div>
          <div className="mt-0.5 font-medium text-ink">{fund?.name ?? "—"}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-ink-2">Holding period</div>
          <div className="mt-0.5 font-medium text-ink">{company.holdingPeriod.toFixed(1)} yr</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-ink-2">Bank</div>
          <div className="mt-0.5 font-medium text-ink">{company.bank}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-ink-2">Investment team</div>
          <div className="mt-0.5 font-medium text-ink">{company.investmentTeam.join("; ")}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-ink-2">Management</div>
          <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-1 font-medium text-ink">
            {(company.management ?? []).map((m) => (
              <span key={m.role} className="flex items-center gap-1.5" title={`${m.role}: ${RATING[m.rating].label}`}>
                <span className="h-2 w-2 rounded-full" style={{ background: RATING[m.rating].color }} />
                {m.name}
                <span className="text-[10px] font-normal text-ink-3">{m.role}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3.5">
        {/* Valuation: Current, EXIT excl. M&A (= LE) and EXIT incl. M&A */}
        <div className="col-span-7 flex flex-col overflow-hidden rounded-[10px] border border-line bg-white">
          <CardHeader className="px-4" title="Valuation" subtitle="Current and the two exit scenarios" />
          <table className="w-full table-fixed border-collapse text-[11px]">
            <colgroup>
              <col style={{ width: "26%" }} />
              <col /><col /><col />
            </colgroup>
            <thead>
              <tr>
                <th />
                {scenarios.map((x, i) => (
                  <th key={x.key} className={cn("px-4 pb-0 pt-3 text-right text-[12px] font-semibold text-ink", i > 0 && "border-l border-line", x.key === "ma" && "bg-surface-2/60")}>
                    {x.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 align-bottom pb-3 text-[10px] text-ink-2" />
                {scenarios.map((x, i) => (
                  <td key={x.key} className={cn("px-4 pb-3 text-right", i > 0 && "border-l border-line", x.key === "ma" && "bg-surface-2/60")}>
                    <div className="text-[10px] text-ink-2">MOI</div>
                    <div className="text-[30px] font-medium leading-tight tabular-nums text-ink">{x.moi.toFixed(2)}x</div>
                  </td>
                ))}
              </tr>
              {([
                ["Invested Value", (x: (typeof scenarios)[number]) => `${fmtM(x.invested)}M`],
                ["Fair Value", (x: (typeof scenarios)[number]) => `${fmtM(x.fair)}M`],
                ["EV / EBITDA", (x: (typeof scenarios)[number]) => `${fmtM(x.evEbitda)}x`],
                ["EV / Revenue", (x: (typeof scenarios)[number]) => `${fmtM(x.evRevenue, 2)}x`],
                ["Share Ordinary Equity", (x: (typeof scenarios)[number]) => x.share],
                ["Year", (x: (typeof scenarios)[number]) => String(x.year)],
              ] as [string, (x: (typeof scenarios)[number]) => string][]).map(([label, f], ri) => (
                <tr key={label} className={cn(ri === 0 && "border-t-2 border-line")}>
                  <td className="px-4 py-1.5 text-ink-2">{label}</td>
                  {scenarios.map((x, i) => (
                    <td key={x.key} className={cn("px-4 py-1.5 text-right tabular-nums text-ink", i > 0 && "border-l border-line", x.key === "ma" && "bg-surface-2/60")}>
                      {f(x)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-line px-4 py-2 text-[10.5px] text-ink-3">
            EXIT excl. M&amp;A is the latest estimate (LE). EXIT incl. M&amp;A adds {pendingAddOns.length} signed and pipeline add-on{pendingAddOns.length === 1 ? "" : "s"}: €{fmtM(maEquity)}M extra invested value.
          </div>
        </div>

        {/* Comments Panel */}
        <div className="col-span-5 flex flex-col overflow-hidden rounded-[10px] border border-line bg-white">
          <CardHeader className="px-4" title="Comments" subtitle="Deal team notes on the strategy" aside={<button className="text-[11px] text-brand hover:underline">+ add</button>} />
          <div className="custom-scrollbar max-h-[300px] overflow-y-auto p-3.5">
            <div className="flex flex-col gap-2">
              {company.comments.map((comment) => (
                <div key={comment.id} className="rounded-lg bg-bg p-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-ink">{comment.author}</span>
                    <span className="text-[10px] text-ai">{comment.period}</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-ink-2">{comment.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* EBITDA bridge: compact waterfall */}
        <div className="col-span-7 flex flex-col overflow-hidden rounded-[10px] border border-line bg-white">
          <CardHeader
            className="px-4"
            title="EBITDA bridge"
            subtitle="Entry to current and current to exit · €M"
            controls={
              <div className="flex gap-0.5 rounded-md bg-surface-2 p-0.5">
                {(["Overview", "Details"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setBridgeView(v)}
                    className={cn(
                      "rounded px-2.5 py-1 text-[10px] transition-colors",
                      bridgeView === v ? "bg-white font-medium text-ink" : "text-ink-2 hover:text-ink",
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            }
          />

          {bridgeView === "Overview" ? (
            <div className="grid grid-cols-[4fr_3fr] gap-6 px-4 pb-3 pt-2.5">
              {(["e2c", "c2e"] as const).map((g) => (
                <div key={g}>
                  <div className="border-b border-line-strong pb-1 text-center text-[11px] font-medium text-ink">
                    {g === "e2c" ? "Entry to Current" : "Current to Exit"}
                  </div>
                  <div className="mt-2 flex">
                    {bridge.filter((x) => x.group === g).map((x) => {
                      const i = bridge.indexOf(x)
                      const first = i === 0
                      const last = i === bridge.length - 1
                      const color = x.total ? BRIDGE_UP : x.value < 0 ? "var(--alert)" : BRIDGE_UP
                      return (
                        <div key={x.label} className="flex flex-1 flex-col items-center">
                          <div className="relative w-full" style={{ height: BRIDGE_H + 16 }}>
                            {/* connectors */}
                            {!first && (
                              <div className="absolute border-t border-dashed border-line-strong" style={{ bottom: px(x.start), left: 0, width: `calc(50% - ${BAR_W / 2}px)` }} />
                            )}
                            {!last && (
                              <div className="absolute border-t border-dashed border-line-strong" style={{ bottom: px(x.end), right: 0, width: `calc(50% - ${BAR_W / 2}px)` }} />
                            )}
                            <div
                              className="absolute left-1/2 -translate-x-1/2 rounded-[3px]"
                              style={{ width: BAR_W, bottom: px(x.lo), height: Math.max(2, px(x.hi) - px(x.lo)), background: color }}
                            />
                            <span
                              className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium tabular-nums text-ink"
                              style={{ bottom: px(x.hi) + 3 }}
                            >
                              {fmtStep(x.value)}
                            </span>
                          </div>
                          <span className="mt-1.5 text-center text-[9px] text-ink-2">{x.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-[9.5px] uppercase tracking-[0.05em] text-ink-3">
                  <th className="px-4 py-2 text-left font-semibold">Step</th>
                  <th className="py-2 text-right font-semibold">€M</th>
                  <th className="px-4 py-2 text-right font-semibold">% of exit EBITDA</th>
                </tr>
              </thead>
              <tbody>
                {bridge.map((x) => (
                  <tr key={x.label} className={cn("border-t border-line", x.total && "font-semibold")}>
                    <td className="px-4 py-1.5 text-ink">{x.label}</td>
                    <td className="py-1.5 text-right tabular-nums text-ink">{fmtStep(x.value)}</td>
                    <td className="px-4 py-1.5 text-right tabular-nums text-ink-2">{((x.value / c2e.ebitdaExit) * 100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add-ons */}
        <div className="col-span-5 flex flex-col overflow-hidden rounded-[10px] border border-line bg-white">
          <CardHeader className="px-4" title="Add-ons" subtitle="Closed, signed and pipeline acquisitions" aside={`${addOns.length} add-ons · EV €${fmtM(addOns.reduce((t, a) => t + a.ev, 0))}M`} />
          <table className="w-full table-fixed text-[11px]">
            <thead>
              <tr className="text-[9.5px] uppercase tracking-[0.05em] text-ink-3">
                <th className="px-4 py-2 text-left font-semibold">Add-on</th>
                <th className="w-[64px] py-2 text-left font-semibold">Status</th>
                <th className="w-[62px] py-2 text-left font-semibold">Date</th>
                <th className="w-[48px] py-2 text-right font-semibold">EV</th>
                <th className="w-[72px] px-4 py-2 text-right font-semibold">EBITDA</th>
              </tr>
            </thead>
            <tbody>
              {addOns.map((a) => (
                <tr key={a.id} className="border-t border-line">
                  <td className="px-4 py-2">
                    <div className="truncate font-medium text-ink">{a.name}</div>
                    <div className="truncate text-[10px] text-ink-3">{a.description}</div>
                  </td>
                  <td className="py-2">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", ADDON_STATUS[a.status])}>{a.status}</span>
                  </td>
                  <td className="py-2 text-ink-2">{a.date}</td>
                  <td className="py-2 text-right tabular-nums text-ink">{fmtM(a.ev)}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-ink-2">{fmtM(a.ebitda)}</td>
                </tr>
              ))}
              {addOns.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-ink-3">No add-ons for this company</td></tr>
              )}
            </tbody>
          </table>
          <div className="border-t border-line px-4 py-2 text-[10.5px] text-ink-3">€m · EV = enterprise value paid · date = closing, or expected closing</div>
        </div>

        {/* Actual performance vs investment base case */}
        <div className="col-span-7 flex flex-col overflow-hidden rounded-[10px] border border-line bg-white">
          <CardHeader className="px-4" title="Actual performance vs investment base case" subtitle="mEUR · bars = EBITDA, lines = revenue" />
          <div className="flex flex-1 items-end gap-4 px-4 pb-4 pt-2">
            <div className="flex w-[118px] shrink-0 flex-col justify-center gap-1.5 text-[10.5px] text-ink">
              {([
                ["EBITDA Actual", C_ACT, "bar"], ["EBITDA IC", C_IC, "bar"], ["EBITDA MC", C_MC, "bar"],
                ["Revenue actual", C_ACT, "line"], ["Revenue IC", C_IC, "dash"], ["Revenue MC", C_MC, "dash"],
              ] as [string, string, "bar" | "line" | "dash"][]).map(([label, c, kind]) => (
                <div key={label} className="flex items-center gap-2 whitespace-nowrap">
                  {kind === "bar" ? (
                    <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: c }} />
                  ) : (
                    <span className="inline-block w-[10px]" style={{ borderTop: `2.5px ${kind === "dash" ? "dashed" : "solid"} ${c}` }} />
                  )}
                  {label}
                </div>
              ))}
            </div>
            <div className="h-[230px] min-w-0 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={baseCase} margin={{ top: 16, right: 8, left: 0, bottom: 0 }} barGap={1} barCategoryGap="22%">
                  <CartesianGrid vertical={false} stroke="var(--line)" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--ink-2)" }} />
                  <YAxis domain={[0, yMax]} ticks={[0, yMax / 2, yMax]} axisLine={false} tickLine={false} width={26} tick={{ fontSize: 10, fill: "var(--ink-3)" }} />
                  <Bar dataKey="ebitdaAct" fill={C_ACT} radius={[2, 2, 0, 0]} isAnimationActive={false}>
                    <LabelList dataKey="ebitdaAct" position="top" formatter={barLabel} style={{ fontSize: 9, fill: "var(--ink)" }} />
                  </Bar>
                  <Bar dataKey="ebitdaIc" fill={C_IC} radius={[2, 2, 0, 0]} isAnimationActive={false}>
                    <LabelList dataKey="ebitdaIc" position="top" formatter={barLabel} style={{ fontSize: 9, fill: "var(--ink)" }} />
                  </Bar>
                  <Bar dataKey="ebitdaMc" fill={C_MC} radius={[2, 2, 0, 0]} isAnimationActive={false}>
                    <LabelList dataKey="ebitdaMc" position="top" formatter={barLabel} style={{ fontSize: 9, fill: "var(--ink)" }} />
                  </Bar>
                  <Line dataKey="revAct" stroke={C_ACT} strokeWidth={2.4} dot={false} connectNulls={false} isAnimationActive={false} />
                  <Line dataKey="revIc" stroke={C_IC} strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
                  <Line dataKey="revMc" stroke={C_MC} strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>


        {/* Historical valuations: three reported quarters, then the two exit scenarios, one scale */}
        <div className="col-span-5 flex flex-col overflow-hidden rounded-[10px] border border-line bg-white">
          <CardHeader className="px-4" title="Historical valuations" subtitle="Invested value vs fair value · last three reported quarters and the exit scenarios · €M" />
          <div className="mt-auto px-3 pb-3 pt-4">
            <svg viewBox="0 0 520 214" className="w-full" role="img" aria-label="Invested value and fair value per reported quarter and exit scenario">
              {/* group headers */}
              <text x={150} y={10} textAnchor="middle" fontSize="9.5" fontWeight="600" fill="var(--ink-2)">Reported</text>
              <line x1={4} y1={15} x2={296} y2={15} stroke="var(--line-strong)" strokeWidth={1} />
              <text x={410} y={10} textAnchor="middle" fontSize="9.5" fontWeight="600" fill="var(--ink-2)">Exit scenarios</text>
              <line x1={304} y1={15} x2={516} y2={15} stroke="var(--line-strong)" strokeWidth={1} />
              {histGroups.map((g, i) => {
                const gx = 4 + i * HV_W + (i >= 3 ? 4 : 0)
                const invH = (g.inv / histMax) * HV_H
                const fairH = (g.fair / histMax) * HV_H
                const xInv = gx + 10, xFair = gx + 52
                const fairTop = HV_BASE - fairH
                const mx = xFair + 18
                const arrowEnd = Math.max(48, fairTop - 17)
                return (
                  <g key={g.label}>
                    <rect x={xInv} y={HV_BASE - invH} width={36} height={invH} rx={2} fill={HV_INV} />
                    <rect x={xFair} y={fairTop} width={36} height={fairH} rx={2} fill={HV_FAIR} />
                    <text x={xInv + 18} y={HV_BASE - invH - 4} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--ink)">{fmtM(g.inv)}</text>
                    <text x={mx} y={fairTop - 4} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--ink)">{fmtM(g.fair)}</text>
                    <rect x={mx - 18} y={24} width={36} height={16} rx={8} fill="#fff" stroke="var(--line-strong)" strokeWidth={1} />
                    <text x={mx} y={35.5} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--ink)">{fmtM(hMoi(g), 1)}x</text>
                    <line x1={mx} y1={40} x2={mx} y2={arrowEnd} stroke="var(--ink-2)" strokeWidth={1.2} />
                    <path d={`M${mx - 3.5},${arrowEnd - 4.5} L${mx},${arrowEnd + 1.5} L${mx + 3.5},${arrowEnd - 4.5}`} fill="none" stroke="var(--ink-2)" strokeWidth={1.2} />
                    <text x={xInv + 18} y={HV_BASE + 11} textAnchor="middle" fontSize="8" fill="var(--ink-3)">Invested</text>
                    <text x={mx} y={HV_BASE + 11} textAnchor="middle" fontSize="8" fill="var(--ink-3)">Fair</text>
                    <text x={gx + 49} y={HV_BASE + 28} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--ink)">{g.label.replace("EXIT ", "")}</text>
                    {g.exit && <text x={gx + 49} y={HV_BASE + 40} textAnchor="middle" fontSize="8.5" fill="var(--ink-3)">exit</text>}
                  </g>
                )
              })}
              <line x1={4} y1={HV_BASE} x2={516} y2={HV_BASE} stroke="var(--line-strong)" strokeWidth={1} />
              <line x1={300} y1={20} x2={300} y2={HV_BASE + 44} stroke="var(--line)" strokeWidth={1} strokeDasharray="3 3" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
