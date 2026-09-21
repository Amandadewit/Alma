"use client"

import { Fragment, useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import type { Company } from "@/lib/mock-data"
import { buildCompanySeries, MON, LAST_ACTUAL, ROWS, type MonthMetrics, type RowMeta } from "@/lib/portfolio-performance-data"

const INK = "#16281F"
const MUTE = "#8A938D"
const POS = "#4B7F63"
const NEG = "#A5705F"

const nf = (v: number, d = 1) => {
  const val = Object.is(v, -0) || Math.abs(v) < 5e-4 ? 0 : v
  return val.toLocaleString("en-GB", { minimumFractionDigits: d, maximumFractionDigits: d }).replace("-", "−")
}
const pctTxt = (v: number, d = 1) => (Math.abs(v) < 0.05 ? "–" : (v > 0 ? "+" : "−") + nf(Math.abs(v), d) + "%")
const ppTxt = (v: number, d = 1) => (Math.abs(v) < 0.05 ? "–" : (v > 0 ? "+" : "−") + nf(Math.abs(v), d) + "pp")
const tone = (v: number, invert?: boolean) => {
  if (Math.abs(v) < 1) return "#5F6A63"
  return (invert ? v < 0 : v >= 0) ? POS : NEG
}
const pillClass = (active: boolean) =>
  cn(
    "rounded-[7px] border-none px-[11px] py-[5px] text-[11.5px] cursor-pointer transition-colors",
    active ? "bg-white font-semibold text-[#16281F] shadow-[0_1px_3px_rgba(20,52,43,0.10)]" : "bg-transparent font-medium text-[#8A938D]",
  )

type Scope = "FIRST" | "YTD" | "FY"
interface Cell {
  text: string
  style: React.CSSProperties
}

interface PerformanceTabProps {
  company: Company
}

export function PerformanceTab({ company }: PerformanceTabProps) {
  const { A, B, LY } = useMemo(() => buildCompanySeries(company), [company])

  const [month, setMonth] = useState(LAST_ACTUAL)
  const [basis, setBasis] = useState<"Month" | "LTM">("Month")
  const [metric, setMetric] = useState<"Total" | "Cash EBITDA" | "Free CF" | "Revenue">("Total")
  const [back, setBack] = useState(8)
  const [fwd, setFwd] = useState(3)
  const [showLY, setShowLY] = useState(false)
  const [showGrowth, setShowGrowth] = useState(false)
  const [showBudget, setShowBudget] = useState(true)
  const [showLYline, setShowLYline] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [hover, setHover] = useState<number | null>(null)
  const [kpi, setKpi] = useState<string>(company.kpis.customKPIs[0]?.name ?? "")
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({})
  const [precision, setPrecision] = useState<1 | 2 | 3>(1)

  useEffect(() => {
    setMonth(LAST_ACTUAL)
    setExpanded({})
    setHover(null)
    setOpenComments({})
    setKpi(company.kpis.customKPIs[0]?.name ?? "")
  }, [company.id])

  const sum = (src: MonthMetrics[], from: number, to: number, line: string) => {
    let s = 0
    for (let i = from; i <= to; i++) s += src[i][line] ?? 0
    return s
  }

  const raw = (scope: Scope, line: string) => {
    if (scope === "FIRST") return { a: A[month][line], b: B[month][line], ly: LY[month][line] }
    if (scope === "YTD") return { a: sum(A, 0, month, line), b: sum(B, 0, month, line), ly: sum(LY, 0, month, line) }
    return { a: sum(A, 0, LAST_ACTUAL, line) + sum(B, LAST_ACTUAL + 1, 11, line), b: sum(B, 0, 11, line), ly: sum(LY, 0, 11, line) }
  }

  const vals = (scope: Scope, line: string, meta: RowMeta) => {
    if (!meta.pct) return raw(scope, line)
    const e = raw(scope, meta.pct), r = raw(scope, "Revenue")
    return { a: (e.a / r.a) * 100, b: (e.b / r.b) * 100, ly: (e.ly / r.ly) * 100 }
  }

  const cellsFor = (line: string, meta: RowMeta): Cell[] => {
    const out: Cell[] = []
    const isPct = !!meta.pct
    const sub = !!meta.sub
    ;(["FIRST", "YTD", "FY"] as Scope[]).forEach((scope) => {
      const v = vals(scope, line, meta)
      const tiny = !isPct && Math.abs(v.b) < 0.25
      const dec = Math.max(precision, tiny ? 2 : 1)
      const dv = isPct ? v.a - v.b : v.b ? ((v.a - v.b) / Math.abs(v.b)) * 100 : 0
      const gv = isPct ? v.a - v.ly : Math.abs(v.ly) >= 0.25 ? ((v.a - v.ly) / Math.abs(v.ly)) * 100 : null
      const base: React.CSSProperties = {
        textAlign: "right",
        padding: sub ? "2.5px 6px" : "1.5px 6px",
        whiteSpace: "nowrap",
        borderTop: sub ? "1px solid #E3E1D8" : undefined,
        fontSize: isPct ? 10 : undefined,
        color: isPct ? "#5F6A63" : undefined,
      }
      // The Decimals control only governs the A/B/LY value columns above — the
      // Δ/Growth columns are already a relative measure and stay at their own
      // fixed precision so they read consistently regardless of the setting.
      const num = (x: number) => (isPct ? nf(x, precision) + "%" : nf(x, dec))
      out.push({ text: num(v.a), style: { ...base, fontWeight: isPct ? 500 : sub ? 700 : 500, color: isPct ? base.color : INK } })
      out.push({ text: num(v.b), style: { ...base, color: "#5F6A63" } })
      const dAbs = v.a - v.b
      out.push({
        text: isPct ? ppTxt(dv) : tiny ? (Math.abs(dAbs) < 5e-3 ? "–" : (dAbs > 0 ? "+" : "−") + nf(Math.abs(dAbs), 2)) : pctTxt(dv),
        style: { ...base, fontWeight: isPct ? 400 : 500, color: isPct ? "#5F6A63" : tone(tiny ? (v.a - v.b) * 100 : dv, meta.invert) },
      })
      if (showLY) out.push({ text: num(v.ly), style: { ...base, color: "#5F6A63" } })
      if (showGrowth)
        out.push({
          text: gv === null ? "n/a" : isPct ? ppTxt(gv) : pctTxt(gv),
          style: { ...base, color: gv === null || isPct ? "#5F6A63" : tone(gv, meta.invert) },
        })
    })
    return out
  }

  // ---------- table header ----------
  const span = 3 + (showLY ? 1 : 0) + (showGrowth ? 1 : 0)
  const groupDefs = [
    { label: `MTD · ${MON[month]}`, key: "mtd" },
    { label: `YTD · Jan–${MON[month]}`, key: "ytd" },
    { label: "FY 2026 · LE", key: "fy" },
  ]
  type SubCol = { label: string; title: string; width: number }
  const subColsByGroup: SubCol[][] = groupDefs.map((g, gi) => {
    const set: [string, string, number][] = [
      gi === 2 ? ["LE", "Latest estimate", 56] : ["A", "Actual", 52],
      ["B", "Budget", 50],
      ["Δ", "Variance vs budget", 54],
    ]
    if (showLY) set.push(["LY", "Last year, same period", 50])
    if (showGrowth) set.push(["Growth", "Growth vs last year", 60])
    return set.map(([label, desc, width]) => ({ label, title: `${g.label} · ${desc}`, width }))
  })

  const rows = ROWS.map((meta) => {
    const line = meta.key
    const exp = !!(meta.kids && expanded[line])
    const sub = !!meta.sub
    const isPct = !!meta.pct
    return {
      meta,
      label: meta.label || line,
      cells: cellsFor(line, meta),
      exp,
      onClick: meta.kids ? () => setExpanded((s) => ({ ...s, [line]: !exp })) : undefined,
      rowStyle: { cursor: meta.kids ? "pointer" : "default", background: exp ? "#FCFBF8" : "transparent" } as React.CSSProperties,
      labelStyle: {
        textAlign: "left", padding: sub ? "2.5px 12px" : "1.5px 12px", borderTop: sub ? "1px solid #E3E1D8" : undefined,
        fontWeight: isPct ? 400 : sub ? 700 : meta.kids ? 600 : 500, color: isPct ? "#5F6A63" : INK,
        fontSize: isPct ? 10 : 11, paddingLeft: isPct ? 25 : 12, whiteSpace: "nowrap",
      } as React.CSSProperties,
      caretStyle: {
        display: "inline-block", width: meta.kids ? 13 : 0, overflow: "hidden", color: MUTE,
        transform: `rotate(${exp ? 90 : 0}deg)`, transition: "transform .15s",
      } as React.CSSProperties,
      children: exp
        ? meta.kids!.map((k) => ({
            key: k, label: k, cells: cellsFor(k, {}),
            labelStyle: { textAlign: "left", padding: "1.5px 12px 1.5px 26px", fontSize: 10, color: "#4A544D", whiteSpace: "nowrap" } as React.CSSProperties,
          }))
        : [],
    }
  })

  // ---------- chart ----------
  const ltm = basis === "LTM"
  const STACKS: Record<string, { label: string; c: string; v: (r: MonthMetrics) => number; inner?: boolean }[]> = {
    Total: [
      { label: "N. EBITDA", c: "#9FBFAC", v: (r) => r["N. EBITDA"], inner: true },
      { label: "Revenue", c: "#2C5847", v: (r) => r.Total - r["N. EBITDA"] },
    ],
    "Cash EBITDA": [
      { label: "EBITDA", c: "#2C5847", v: (r) => r.EBITDA },
      { label: "Normalizations", c: "#6F9C83", v: (r) => r.Normalization },
      { label: "Capitalized cost", c: "#BFD5C6", v: (r) => r["Capitalized dev. cost"] },
    ],
    "Free CF": [
      { label: "Free CF", c: "#2C5847", v: (r) => r["Free CF"], inner: true },
      { label: "Investment CF (outflow)", c: "#C9BFA6", v: (r) => -r["Investment CF"] },
    ],
    Revenue: [
      { label: "Recurring revenue own IP", c: "#2C5847", v: (r) => r["Recurring revenue own IP"], inner: true },
      { label: "Recurring revenue other", c: "#6F9C83", v: (r) => r["Recurring revenue other"] },
      { label: "Non-recurring revenue", c: "#BFD5C6", v: (r) => r["Non-recurring revenue"] },
    ],
  }
  const parts = STACKS[metric]
  const tf = metric === "Free CF" ? (r: MonthMetrics) => r["Operating CF"] : (r: MonthMetrics) => r[metric]
  const pick = (j: number) => (j < 0 ? LY[12 + j] : j > LAST_ACTUAL ? B[j] : A[j])
  const agg = (i: number, fn: (r: MonthMetrics) => number, src?: MonthMetrics[]) => {
    const at = (j: number) => (src ? (j < 0 ? LY[12 + j] : src[j]) : pick(j))
    if (!ltm) return fn(at(i))
    let s = 0
    for (let j = i - 11; j <= i; j++) s += fn(at(j))
    return s
  }
  const totals = MON.map((_, i) => agg(i, tf))
  const budgets = MON.map((_, i) => agg(i, tf, B))
  const lys = MON.map((_, i) => agg(i, tf, LY))
  const lo0 = Math.max(0, month - back), hi0 = Math.min(11, month + fwd)
  const vis: number[] = []
  for (let i = lo0; i <= hi0; i++) vis.push(i)
  const max = Math.max(...vis.map((i) => Math.max(totals[i], budgets[i]))) * 1.16
  const barH = (v: number) => Math.max(1.5, (v / max) * 100)
  const dec = ltm || metric === "Total" || metric === "Revenue" ? 1 : 2
  const CH = 240, AX = 18

  const bars = vis.map((i) => {
    const fc = i > LAST_ACTUAL, tot = totals[i], sel = i === month
    return {
      i, month: MON[i], value: nf(tot, dec), sel,
      stackStyle: {
        position: "absolute", bottom: 0, left: "8%", right: "8%", height: `${barH(tot)}%`,
        display: "flex", flexDirection: "column-reverse", borderRadius: "4px 4px 2px 2px", overflow: "hidden",
        opacity: fc ? 0.42 : 1, outline: sel ? "2px solid #B79B62" : "none", outlineOffset: 2, transition: "height .25s",
      } as React.CSSProperties,
      segments: parts.map((p) => {
        const pv = agg(i, p.v), frac = (pv / tot) * 100
        return {
          text: p.inner && frac > 9 ? nf(pv, dec) : "",
          style: {
            height: `${frac}%`, background: p.c, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9.5, fontWeight: 600, color: "#1B3329", fontVariantNumeric: "tabular-nums", transition: "height .25s",
          } as React.CSSProperties,
        }
      }),
      showBudget, showLY: showLYline,
      budgetStyle: { position: "absolute", left: "2%", right: "2%", bottom: `${barH(budgets[i])}%`, height: 0, borderTop: "2px dashed #B79B62" } as React.CSSProperties,
      lyStyle: { position: "absolute", left: "2%", right: "2%", bottom: `${barH(lys[i])}%`, height: 0, borderTop: "1.5px dotted #9BA49D" } as React.CSSProperties,
      valueStyle: {
        position: "absolute", zIndex: 2, bottom: `calc(${barH(tot)}% + 5px)`, left: "50%", transform: "translateX(-50%)",
        padding: "0 3px", borderRadius: 3, background: "rgba(255,255,255,0.9)", textAlign: "center", fontSize: 10, fontWeight: 600,
        color: fc ? MUTE : "#3A473F", fontVariantNumeric: "tabular-nums",
      } as React.CSSProperties,
      labelStyle: { flex: 1, textAlign: "center", fontSize: 11, color: sel ? INK : "#9BA49D", fontWeight: sel ? 600 : 400 } as React.CSSProperties,
    }
  })
  const yTicks = [0, 0.5, 1].map((f) => ({
    label: nf(max * f, dec),
    lineStyle: { position: "absolute", left: 40, right: 0, bottom: AX + f * (CH - AX), height: 1, background: f === 0 ? "#D6D3C8" : "#F0EEE7" } as React.CSSProperties,
    labelStyle: { position: "absolute", left: 0, width: 34, textAlign: "right", bottom: AX + f * (CH - AX) - 5, fontSize: 10, color: "#9BA49D", fontVariantNumeric: "tabular-nums" } as React.CSSProperties,
  }))
  const hoverIdx = hover !== null && vis.includes(hover) ? hover : null
  const tooltip =
    hoverIdx === null
      ? null
      : {
          title: `${ltm ? "LTM to " : ""}${MON[hoverIdx]} 2026${hoverIdx > LAST_ACTUAL ? " · forecast" : ""}`,
          lines: (metric === "Free CF"
            ? [
                { k: "Operating CF", v: nf(agg(hoverIdx, (r) => r["Operating CF"]), 2) },
                { k: "Investment CF", v: nf(agg(hoverIdx, (r) => r["Investment CF"]), 2) },
                { k: "Free CF", v: nf(agg(hoverIdx, (r) => r["Free CF"]), 2) },
              ]
            : parts.map((p) => ({ k: p.label, v: nf(agg(hoverIdx, p.v), 2) })).concat([{ k: "Total", v: nf(totals[hoverIdx], 2) }])
          ).concat([
            { k: "Budget", v: nf(budgets[hoverIdx], 2) },
            { k: "Last year", v: nf(lys[hoverIdx], 2) },
          ]),
          style: {
            position: "absolute", bottom: 76, left: `calc(40px + (100% - 40px) * ${(vis.indexOf(hoverIdx) + 0.5) / vis.length})`,
            transform: "translateX(-50%)", background: "#14342B", color: "#F4F3EE", padding: "8px 11px", borderRadius: 9,
            fontSize: 11, pointerEvents: "none", whiteSpace: "nowrap", boxShadow: "0 6px 18px rgba(20,52,43,0.22)", zIndex: 3,
          } as React.CSSProperties,
        }

  // ---------- KPI tiles ----------
  const netDebtDelta = company.financials.netDebt.fy2025LE - company.financials.netDebt.fy2024A
  const kpiTiles = [
    {
      label: "FTE total", value: String(company.kpis.fteTotal),
      lines: [
        { k: "eNPS", v: company.kpis.enps !== null ? String(company.kpis.enps) : "—" },
        { k: "Sick leave rate", v: `${company.kpis.sickLeaveRate}%` },
        { k: "Turnover (LTM)", v: company.kpis.turnover !== null ? `${company.kpis.turnover}%` : "—" },
      ],
    },
    {
      label: "Total leverage", value: `${company.kpis.totalLeverage.toFixed(1)}x`,
      lines: [
        { k: "Bank leverage", v: `${company.kpis.bankLeverage.toFixed(1)}x` },
        { k: "Covenant status", v: company.kpis.covenantBreach },
      ],
    },
    {
      label: "Net debt", value: `€${company.kpis.netDebt.toFixed(1)}m`,
      delta: `${netDebtDelta <= 0 ? "−" : "+"}${nf(Math.abs(netDebtDelta), 1)}m`, deltaGood: netDebtDelta <= 0,
      lines: [
        { k: "Bank debt", v: `€${company.kpis.bankDebt.toFixed(1)}m` },
        { k: "Cash end", v: `€${company.kpis.cashEnd.toFixed(1)}m` },
        { k: "Other debt", v: `€${(company.kpis.otherDebt * 1000).toFixed(1)}K` },
      ],
    },
  ]

  // ---------- KPI selector + trend chart ----------
  const kpiSlice = LAST_ACTUAL + 1
  const currentKPI = company.kpis.customKPIs.find((k) => k.name === kpi)
  const kpiAct = currentKPI ? currentKPI.actual.slice(0, kpiSlice) : []
  const kpiBud = currentKPI ? currentKPI.budget.slice(0, kpiSlice) : []
  const kpiAll = [...kpiAct, ...kpiBud]
  const kpiLo = kpiAll.length ? Math.min(...kpiAll) * 0.97 : 0
  const kpiHi = kpiAll.length ? Math.max(...kpiAll) * 1.03 : 1
  const pt = (arr: number[]) => arr.map((v, i) => `${(i / Math.max(1, arr.length - 1)) * 320},${100 - ((v - kpiLo) / (kpiHi - kpiLo || 1)) * 92}`).join(" ")

  // ---------- comments ----------
  const formatDate = (iso: string) => {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ""
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
  }

  return (
    <div className="flex flex-col gap-2.5">
      {/* Reporting month */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-medium text-[#8A938D]">Reporting month</span>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="appearance-none rounded-lg border border-[#DAD8CE] bg-white px-2.5 py-[5px] text-[12px] font-semibold text-[#16281F] outline-none"
          >
            {MON.slice(0, LAST_ACTUAL + 1).map((m, i) => (
              <option key={m} value={i}>{m} 2026</option>
            ))}
          </select>
          <span className="text-[11px] text-[#8A938D]">Last available data {MON[LAST_ACTUAL]} 2026 · amounts in €m</span>
        </div>
        <span className="text-[11px] text-[#8A938D]">Fiscal year 01-2026 – 12-2026</span>
      </div>

      <div className="grid grid-cols-[1.12fr_1fr] items-start gap-2.5">
        {/* Financial summary table */}
        <div className="overflow-hidden rounded-xl border border-[#E3E1D8] bg-white">
          <div className="flex items-center justify-between gap-2.5 px-3 pb-1.5 pt-2.5">
            <div>
              <div className="text-[14px] font-semibold">Financial summary</div>
              <div className="mt-0.5 text-[10.5px] text-[#8A938D]">
                Δ = vs budget · click Revenue or Total operational cost to expand · amounts in €m
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#8A938D]">Decimals</span>
                <div className="flex gap-0.5 rounded-lg bg-[#F1F0EA] p-[3px]">
                  {([1, 2, 3] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setPrecision(d)}
                      title={`Show values with ${d} decimal${d === 1 ? "" : "s"}`}
                      className={cn(pillClass(precision === d), "min-w-[22px] px-2 py-1 text-center")}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              {[
                { label: "LY", on: showLY, toggle: () => setShowLY((v) => !v) },
                { label: "Growth", on: showGrowth, toggle: () => setShowGrowth((v) => !v) },
              ].map((t) => (
                <button
                  key={t.label}
                  onClick={t.toggle}
                  className="flex items-center gap-1.5 border-none bg-transparent p-0 text-[11px]"
                  style={{ fontWeight: t.on ? 600 : 500, color: t.on ? INK : MUTE }}
                >
                  <span
                    className="flex h-[13px] w-[13px] items-center justify-center rounded"
                    style={{ border: `1px solid ${t.on ? "#14342B" : "#D0CEC4"}`, background: t.on ? "#14342B" : "#FFFFFF", color: "#F4F3EE", fontSize: 9, lineHeight: 1 }}
                  >
                    {t.on ? "✓" : ""}
                  </span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="max-h-[380px] overflow-y-auto">
            <table className="w-full table-fixed border-collapse text-[10.5px] [font-variant-numeric:tabular-nums]">
              <thead>
                <tr>
                  <th style={{ width: 168, borderBottom: "1px solid #EFEDE5" }}></th>
                  {groupDefs.map((g, gi) => (
                    <th
                      key={g.key}
                      colSpan={span}
                      style={{
                        textAlign: "center", padding: "5px 6px 4px", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
                        fontWeight: 600, color: "#7A837C", borderBottom: "1px solid #EFEDE5",
                        borderLeft: "1px solid #EDEBE3", width: subColsByGroup[gi].reduce((a, c) => a + c.width, 0),
                      }}
                    >
                      {g.label}
                    </th>
                  ))}
                </tr>
                <tr>
                  <th style={{ width: 168, textAlign: "left", padding: "4px 12px 5px", fontSize: 9.5, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8A938D", fontWeight: 600, borderBottom: "1px solid #E3E1D8" }}>
                    Line
                  </th>
                  {subColsByGroup.flatMap((cols, gi) =>
                    cols.map((c, ci) => (
                      <th
                        key={`${gi}-${c.label}`}
                        title={c.title}
                        style={{
                          textAlign: "right", padding: "4px 6px 5px", fontSize: 9.5, letterSpacing: "0.05em", textTransform: "uppercase",
                          color: "#98A09A", fontWeight: 600, borderBottom: "1px solid #E3E1D8", whiteSpace: "nowrap", width: c.width,
                          borderLeft: ci === 0 ? "1px solid #EDEBE3" : undefined,
                        }}
                      >
                        {c.label}
                      </th>
                    )),
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <Fragment key={r.meta.key}>
                    <tr onClick={r.onClick} style={r.rowStyle}>
                      <td style={r.labelStyle}>
                        <span style={r.caretStyle}>›</span>
                        {r.label}
                      </td>
                      {r.cells.map((c, ci) => (
                        <td key={ci} style={c.style}>{c.text}</td>
                      ))}
                    </tr>
                    {r.children.map((k) => (
                      <tr key={k.key} style={{ background: "#FBFAF7" }}>
                        <td style={k.labelStyle}>{k.label}</td>
                        {k.cells.map((c, ci) => (
                          <td key={ci} style={c.style}>{c.text}</td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Comments */}
        <div className="flex h-[380px] flex-col overflow-hidden rounded-xl border border-[#E3E1D8] bg-white">
          <div className="flex items-center justify-between px-3 pb-1.5 pt-2.5">
            <div className="text-[14px] font-semibold">Comments</div>
            <span className="text-[10.5px] text-[#8A938D]">{company.comments.length} comments</span>
          </div>
          <div className="grid content-start gap-[7px] overflow-y-auto px-3 pb-2.5">
            {company.comments.map((c) => {
              const open = !!openComments[c.id]
              const long = c.text.length > 160
              const text = open || !long ? c.text : c.text.slice(0, 150).trim() + "…"
              return (
                <div key={c.id} className="rounded-[10px] border border-[#EEECE4] bg-[#FBFAF7] px-[11px] py-[9px]">
                  <div className="mb-[5px] flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#14342B] text-[10px] font-semibold text-[#F4F3EE]">
                      {c.author[0]}
                    </span>
                    <span className="text-[12px] font-semibold">{c.author}</span>
                    <span className="text-[11px] text-[#9BA49D]">{c.period}</span>
                    <span className="ml-auto text-[11px] text-[#9BA49D]">{formatDate(c.createdAt)}</span>
                  </div>
                  <div className="text-[11.5px] leading-relaxed text-[#3A473F]">{text}</div>
                  {long && (
                    <button
                      onClick={() => setOpenComments((s) => ({ ...s, [c.id]: !open }))}
                      className="mt-[5px] border-none bg-transparent p-0 text-[11.5px] font-semibold text-[#39604B] underline underline-offset-2"
                    >
                      {open ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-xl border border-[#E3E1D8] bg-white p-3 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[14px] font-semibold">
                {metric === "Total" ? `Revenue & N. EBITDA${ltm ? " · LTM" : ""}` : `${metric}${ltm ? " · LTM" : ""}`}
              </div>
              <div className="mt-0.5 text-[10.5px] text-[#8A938D]">
                {metric === "Free CF"
                  ? `${ltm ? "Rolling twelve months" : "Per month"} · bar height = operating CF, dark = free CF after investments · €m`
                  : `${ltm ? "Rolling twelve months" : "Per month"} · faded = forecast · dashed line = budget · €m`}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5 rounded-lg bg-[#F1F0EA] p-[3px]">
                {(["Total", "Revenue", "Cash EBITDA", "Free CF"] as const).map((x) => (
                  <button key={x} onClick={() => setMetric(x)} className={pillClass(metric === x)}>{x}</button>
                ))}
              </div>
              <div className="flex gap-0.5 rounded-lg bg-[#F1F0EA] p-[3px]">
                {(["Month", "LTM"] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBasis(b)}
                    title={b === "LTM" ? "Rolling twelve months per month" : "Result of the individual month"}
                    className={cn(pillClass(basis === b), "px-2.5 py-1 text-[11px]")}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-2.5 flex flex-nowrap items-center justify-between gap-4">
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              {parts.map((p) => (
                <div key={p.label} className="flex items-center gap-1.5 whitespace-nowrap text-[11px] text-[#3A473F]">
                  <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: p.c }} />
                  {p.label}
                </div>
              ))}
              <span className="h-3 w-px bg-[#E3E1D8]" />
              {[
                { label: "Budget", on: showBudget, toggle: () => setShowBudget((v) => !v), color: "#B79B62", dash: "dashed" },
                { label: "Last year", on: showLYline, toggle: () => setShowLYline((v) => !v), color: "#9BA49D", dash: "dotted" },
              ].map((s) => (
                <button
                  key={s.label}
                  onClick={s.toggle}
                  className="flex items-center gap-1.5 border-none bg-transparent p-0 text-[11px] font-medium"
                  style={{ color: s.on ? INK : "#AEB6B0" }}
                >
                  <span className="inline-block w-4" style={{ borderTop: `2px ${s.dash} ${s.on ? s.color : "#CBD1CB"}` }} />
                  {s.label}
                </button>
              ))}
            </div>
            <div className="flex flex-none items-center gap-1.5">
              <span className="whitespace-nowrap text-[10.5px] text-[#8A938D]">Window</span>
              <select
                value={back}
                onChange={(e) => setBack(Number(e.target.value))}
                title="Months shown before the reporting month"
                className="appearance-none rounded-md border border-[#DAD8CE] bg-white px-2 py-1 text-[10.5px] font-medium text-[#3A473F]"
              >
                {[2, 5, 8, 11].map((v) => (
                  <option key={v} value={v}>{v + 1}m back</option>
                ))}
              </select>
              <select
                value={fwd}
                onChange={(e) => setFwd(Number(e.target.value))}
                title="Forecast months shown after the reporting month"
                className="appearance-none rounded-md border border-[#DAD8CE] bg-white px-2 py-1 text-[10.5px] font-medium text-[#3A473F]"
              >
                {[0, 3, 5].map((v) => (
                  <option key={v} value={v}>{v === 0 ? "no forecast" : `${v}m ahead`}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative mt-3.5 pl-10" style={{ height: CH }}>
            {yTicks.map((t, i) => (
              <div key={i} style={t.lineStyle} />
            ))}
            {yTicks.map((t, i) => (
              <div key={i} style={t.labelStyle}>{t.label}</div>
            ))}
            <div className="absolute flex items-end gap-1.5" style={{ inset: "0 0 18px 40px" }}>
              {bars.map((b) => (
                <div
                  key={b.i}
                  onMouseEnter={() => setHover(b.i)}
                  onMouseLeave={() => setHover(null)}
                  className="relative h-full flex-1"
                >
                  <div style={b.stackStyle}>
                    {b.segments.map((s, si) => (
                      <div key={si} style={s.style}>{s.text}</div>
                    ))}
                  </div>
                  {b.showBudget && <div style={b.budgetStyle} />}
                  {b.showLY && <div style={b.lyStyle} />}
                  <div style={b.valueStyle}>{b.value}</div>
                </div>
              ))}
            </div>
            <div className="absolute bottom-0 left-10 right-0 flex gap-1.5">
              {bars.map((b) => (
                <div key={b.i} style={b.labelStyle}>{b.month}</div>
              ))}
            </div>
            {tooltip && (
              <div style={tooltip.style}>
                <div className="mb-1 font-semibold">{tooltip.title}</div>
                {tooltip.lines.map((l, i) => (
                  <div key={i} className="flex justify-between gap-4 [font-variant-numeric:tabular-nums]">
                    <span className="opacity-70">{l.k}</span>
                    <span>{l.v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* KPIs Panel */}
        <div className="flex h-[366px] flex-col overflow-hidden rounded-xl border border-[#E3E1D8] bg-white p-3.5">
          <div className="mb-[11px] flex items-center justify-between">
            <div className="text-[15px] font-semibold">Key metrics &amp; KPIs</div>
            <span className="text-[11px] text-[#8A938D]">Last measured {MON[LAST_ACTUAL]} 2026</span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {kpiTiles.map((t) => (
              <div key={t.label} className="rounded-[11px] border border-[#EAE8E0] bg-[#FBFAF7] px-[13px] py-[11px]">
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#8A938D]">{t.label}</div>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="text-[26px] font-semibold tracking-[-0.02em] [font-variant-numeric:tabular-nums]">{t.value}</span>
                  {"delta" in t && t.delta && (
                    <span className="text-[11.5px] font-semibold" style={{ color: t.deltaGood ? POS : NEG }}>{t.delta}</span>
                  )}
                </div>
                <div className="mt-[11px] grid gap-1.5">
                  {t.lines.map((l) => (
                    <div key={l.k} className="flex justify-between gap-2.5 text-[12px]">
                      <span className="text-[#8A938D]">{l.k}</span>
                      <span className="font-semibold [font-variant-numeric:tabular-nums]">{l.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {company.kpis.customKPIs.length > 0 ? (
            <div className="mt-2.5 grid min-h-0 flex-1 grid-cols-[186px_1fr] gap-3">
              <div className="grid min-h-0 content-start gap-1.5 overflow-y-auto">
                <div className="mb-0.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#8A938D]">KPI selector</div>
                {company.kpis.customKPIs.map((k) => {
                  const act = k.actual.slice(0, kpiSlice), bud = k.budget.slice(0, kpiSlice)
                  const up = (act[act.length - 1] ?? 0) >= (bud[bud.length - 1] ?? 0)
                  const good = k.name.toLowerCase().includes("churn") ? !up : up
                  const on = kpi === k.name
                  return (
                    <button
                      key={k.name}
                      onClick={() => setKpi(k.name)}
                      className="flex cursor-pointer items-center justify-between gap-2 rounded-[9px] px-3 py-[9px] text-left text-[12.5px]"
                      style={{ border: `1px solid ${on ? "#14342B" : "transparent"}`, background: on ? "#14342B" : "#F6F5F0", color: on ? "#F4F3EE" : INK, fontWeight: on ? 600 : 500 }}
                    >
                      <span>{k.name}</span>
                      <span className="text-[9.5px]" style={{ color: on ? (good ? "#93C8A8" : "#DBA898") : good ? POS : NEG }}>{up ? "▲" : "▼"}</span>
                    </button>
                  )
                })}
              </div>
              <div className="flex min-h-0 flex-col overflow-hidden rounded-[11px] border border-[#EAE8E0] bg-[#FBFAF7] px-3 pb-1.5 pt-2.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1.5">
                  <div className="text-[13px] font-semibold">{kpi}</div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-[#8A938D]">
                    <span className="flex items-center gap-[5px]"><span className="inline-block h-0.5 w-3.5 bg-[#14342B]" />Actual</span>
                    <span className="flex items-center gap-[5px]"><span className="inline-block h-0 w-3.5" style={{ borderTop: "2px dashed #B79B62" }} />Budget</span>
                  </div>
                </div>
                <svg viewBox="0 0 320 108" preserveAspectRatio="none" className="mt-1.5 min-h-0 w-full flex-1 overflow-visible">
                  {[8, 54, 100].map((y) => (
                    <line key={y} x1="0" x2="320" y1={y} y2={y} stroke="#E7E4DA" strokeWidth={1} />
                  ))}
                  <polyline points={pt(kpiBud)} fill="none" stroke="#B79B62" strokeWidth={2} strokeDasharray="5 4" />
                  <polyline points={pt(kpiAct)} fill="none" stroke="#14342B" strokeWidth={2.4} strokeLinejoin="round" />
                  {kpiAct.map((v, i) => (
                    <circle key={i} cx={(i / Math.max(1, kpiAct.length - 1)) * 320} cy={100 - ((v - kpiLo) / (kpiHi - kpiLo || 1)) * 92} r={2.8} fill="#14342B" />
                  ))}
                </svg>
                <div className="mt-0.5 flex justify-between text-[10.5px] text-[#9BA49D]">
                  {MON.slice(0, kpiSlice).map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-2.5 flex flex-1 items-center justify-center text-[11.5px] text-[#8A938D]">
              No custom KPIs tracked for this company yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
