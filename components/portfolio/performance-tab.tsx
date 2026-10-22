"use client"

import { Fragment, useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import type { Company, Comment } from "@/lib/mock-data"
import { importedCommentsFor } from "@/lib/imported-comments"
import { buildMonthlyComments } from "@/lib/monthly-comments"
import { CardHeader } from "@/components/portfolio/card-header"
import { buildCompanySeries, MON, LAST_ACTUAL, ROWS, type MonthMetrics, type RowMeta } from "@/lib/portfolio-performance-data"

const INK = "var(--ink)"
const MUTE = "var(--ink-3)"
const POS = "var(--ok)"
const NEG = "var(--alert)"

const nf = (v: number, d = 1) => {
  const val = Object.is(v, -0) || Math.abs(v) < 5e-4 ? 0 : v
  return val.toLocaleString("en-GB", { minimumFractionDigits: d, maximumFractionDigits: d }).replace("-", "−")
}
const pctTxt = (v: number, d = 1) => (Math.abs(v) < 0.05 ? "–" : (v > 0 ? "+" : "−") + nf(Math.abs(v), d) + "%")
const ppTxt = (v: number, d = 1) => (Math.abs(v) < 0.05 ? "–" : (v > 0 ? "+" : "−") + nf(Math.abs(v), d) + "pp")
const tone = (v: number, invert?: boolean) => {
  if (Math.abs(v) < 1) return "var(--ink-2)"
  return (invert ? v < 0 : v >= 0) ? POS : NEG
}
// calm blue-grey palette for the column chart
const C1 = "#55627d"
const C2 = "#9aa5ba"
const C3 = "#cdd3df"
const BUDGET = "var(--ink-2)"
const pillClass = (active: boolean) =>
  cn(
    "rounded-[7px] border-none px-[11px] py-[5px] text-[11.5px] cursor-pointer transition-colors",
    active ? "bg-white font-semibold text-ink shadow-[0_1px_3px_rgba(20,52,43,0.10)]" : "bg-transparent font-medium text-ink-3",
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
  const [metric, setMetric] = useState<"Total" | "Cash EBITDA" | "Free CF" | "Revenue" | "NWC">("Total")
  const [back, setBack] = useState(8)
  const [fwd, setFwd] = useState(3)
  const [showLY, setShowLY] = useState(false)
  const [showGrowth, setShowGrowth] = useState(false)
  const [showBudget, setShowBudget] = useState(true)
  const [showLYline, setShowLYline] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [hover, setHover] = useState<number | null>(null)
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({})
  // general comments from imported performance sheets (read in the browser, so after mount)
  const [imported, setImported] = useState<Comment[]>([])
  useEffect(() => setImported(importedCommentsFor(company.name)), [company.name])
  const [arrPeriod, setArrPeriod] = useState<"LTM" | "YTD" | "QTR" | "MTD">("LTM")
  // one CFO comment per month: the uploaded comment where there is one, otherwise the demo comment
  const allComments = useMemo(() => {
    const importedMonths = new Set(imported.map((c) => c.month))
    const generated = buildMonthlyComments(company, A, B).filter((c) => !importedMonths.has(c.month))
    return [...imported, ...generated]
  }, [company, A, B, imported])

  useEffect(() => {
    setMonth(LAST_ACTUAL)
    setExpanded({})
    setHover(null)
    setOpenComments({})
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
      const dec = tiny ? 2 : 1
      const dv = isPct ? v.a - v.b : v.b ? ((v.a - v.b) / Math.abs(v.b)) * 100 : 0
      const gv = isPct ? v.a - v.ly : Math.abs(v.ly) >= 0.25 ? ((v.a - v.ly) / Math.abs(v.ly)) * 100 : null
      const base: React.CSSProperties = {
        textAlign: "right",
        padding: sub ? "2.5px 6px" : "1.5px 6px",
        whiteSpace: "nowrap",
        borderTop: sub ? "1px solid var(--line)" : undefined,
        fontSize: isPct ? 10 : undefined,
        color: isPct ? "var(--ink-2)" : undefined,
      }
      const num = (x: number) => (isPct ? nf(x, 1) + "%" : nf(x, dec))
      out.push({ text: num(v.a), style: { ...base, fontWeight: isPct ? 500 : sub ? 700 : 500, color: isPct ? base.color : INK } })
      out.push({ text: num(v.b), style: { ...base, color: "var(--ink-2)" } })
      const dAbs = v.a - v.b
      out.push({
        text: isPct ? ppTxt(dv) : tiny ? (Math.abs(dAbs) < 5e-3 ? "–" : (dAbs > 0 ? "+" : "−") + nf(Math.abs(dAbs), 2)) : pctTxt(dv),
        style: { ...base, fontWeight: isPct ? 400 : 500, color: isPct ? "var(--ink-2)" : tone(tiny ? (v.a - v.b) * 100 : dv, meta.invert) },
      })
      if (showLY) out.push({ text: num(v.ly), style: { ...base, color: "var(--ink-2)" } })
      if (showGrowth)
        out.push({
          text: gv === null ? "n/a" : isPct ? ppTxt(gv) : pctTxt(gv),
          style: { ...base, color: gv === null || isPct ? "var(--ink-2)" : tone(gv, meta.invert) },
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
      rowStyle: { cursor: meta.kids ? "pointer" : "default", background: exp ? "var(--surface-2)" : "transparent" } as React.CSSProperties,
      labelStyle: {
        textAlign: "left", padding: sub ? "2.5px 12px" : "1.5px 12px", borderTop: sub ? "1px solid var(--line)" : undefined,
        fontWeight: isPct ? 400 : sub ? 700 : meta.kids ? 600 : 500, color: isPct ? "var(--ink-2)" : INK,
        fontSize: isPct ? 10 : 11, paddingLeft: isPct ? 25 : 12, whiteSpace: "nowrap",
      } as React.CSSProperties,
      caretStyle: {
        display: "inline-block", width: meta.kids ? 13 : 0, overflow: "hidden", color: MUTE,
        transform: `rotate(${exp ? 90 : 0}deg)`, transition: "transform .15s",
      } as React.CSSProperties,
      children: exp
        ? meta.kids!.map((k) => ({
            key: k, label: k, cells: cellsFor(k, { key: k }),
            labelStyle: { textAlign: "left", padding: "1.5px 12px 1.5px 26px", fontSize: 10, color: "var(--ink-2)", whiteSpace: "nowrap" } as React.CSSProperties,
          }))
        : [],
    }
  })

  // ---------- chart ----------
  const ltm = basis === "LTM"
  const STACKS: Record<string, { label: string; c: string; v: (r: MonthMetrics) => number; inner?: boolean }[]> = {
    Total: [
      { label: "N. EBITDA", c: C1, v: (r) => r["N. EBITDA"], inner: true },
      { label: "Revenue", c: C2, v: (r) => r.Total - r["N. EBITDA"] },
    ],
    "Cash EBITDA": [
      { label: "EBITDA", c: C1, v: (r) => r.EBITDA },
      { label: "Normalizations", c: C2, v: (r) => r.Normalization },
      { label: "Capitalized cost", c: C3, v: (r) => r["Capitalized dev. cost"] },
    ],
    "Free CF": [
      { label: "Free CF", c: C1, v: (r) => r["Free CF"], inner: true },
      { label: "Investment CF (outflow)", c: C3, v: (r) => -r["Investment CF"] },
    ],
    NWC: [
      { label: "Net working capital", c: C1, v: (r) => r.NWC, inner: true },
    ],
    Revenue: [
      { label: "Recurring revenue own IP", c: C1, v: (r) => r["Recurring revenue own IP"], inner: true },
      { label: "Recurring revenue other", c: C2, v: (r) => r["Recurring revenue other"] },
      { label: "Non-recurring revenue", c: C3, v: (r) => r["Non-recurring revenue"] },
    ],
  }
  const parts = STACKS[metric]
  const tf = metric === "Free CF" ? (r: MonthMetrics) => r["Operating CF"] : (r: MonthMetrics) => r[metric]
  const pick = (j: number) => (j < 0 ? LY[12 + j] : j > LAST_ACTUAL ? B[j] : A[j])
  const agg = (i: number, fn: (r: MonthMetrics) => number, src?: MonthMetrics[]) => {
    const at = (j: number) => (src ? (j < 0 ? LY[12 + j] : src[j]) : pick(j))
    if (!ltm || metric === "NWC") return fn(at(i)) // NWC is a month-end balance: never summed over twelve months
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
  const dec = (ltm && metric !== "NWC") || metric === "Total" || metric === "Revenue" ? 1 : 2
  const CH = 190, AX = 18

  const bars = vis.map((i) => {
    const fc = i > LAST_ACTUAL, tot = totals[i], sel = i === month
    return {
      i, month: MON[i], value: nf(tot, dec), sel,
      stackStyle: {
        position: "absolute", bottom: 0, left: "8%", right: "8%", height: `${barH(tot)}%`,
        display: "flex", flexDirection: "column-reverse", borderRadius: "4px 4px 2px 2px", overflow: "hidden",
        opacity: fc ? 0.42 : 1, outline: sel ? "2px solid var(--ai)" : "none", outlineOffset: 2, transition: "height .25s",
      } as React.CSSProperties,
      segments: parts.map((p) => {
        const pv = agg(i, p.v), frac = (pv / tot) * 100
        return {
          text: p.inner && frac > 9 ? nf(pv, dec) : "",
          style: {
            height: `${frac}%`, background: p.c, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9.5, fontWeight: 600, color: "#ffffff", fontVariantNumeric: "tabular-nums", transition: "height .25s",
          } as React.CSSProperties,
        }
      }),
      showBudget, showLY: showLYline,
      budgetStyle: { position: "absolute", left: "2%", right: "2%", bottom: `${barH(budgets[i])}%`, height: 0, borderTop: `2px dashed ${BUDGET}` } as React.CSSProperties,
      lyStyle: { position: "absolute", left: "2%", right: "2%", bottom: `${barH(lys[i])}%`, height: 0, borderTop: "1.5px dotted var(--ink-3)" } as React.CSSProperties,
      valueStyle: {
        position: "absolute", zIndex: 2, bottom: `calc(${barH(tot)}% + 5px)`, left: "50%", transform: "translateX(-50%)",
        padding: "0 3px", borderRadius: 3, background: "rgba(255,255,255,0.9)", textAlign: "center", fontSize: 10, fontWeight: 600,
        color: fc ? MUTE : "var(--ink)", fontVariantNumeric: "tabular-nums",
      } as React.CSSProperties,
      labelStyle: { flex: 1, textAlign: "center", fontSize: 11, color: sel ? INK : "var(--ink-3)", fontWeight: sel ? 600 : 400 } as React.CSSProperties,
    }
  })
  const yTicks = [0, 0.5, 1].map((f) => ({
    label: nf(max * f, dec),
    lineStyle: { position: "absolute", left: 40, right: 0, bottom: AX + f * (CH - AX), height: 1, background: f === 0 ? "var(--line)" : "var(--line)" } as React.CSSProperties,
    labelStyle: { position: "absolute", left: 0, width: 34, textAlign: "right", bottom: AX + f * (CH - AX) - 5, fontSize: 10, color: "var(--ink-3)", fontVariantNumeric: "tabular-nums" } as React.CSSProperties,
  }))
  const hoverIdx = hover !== null && vis.includes(hover) ? hover : null
  const tooltip =
    hoverIdx === null
      ? null
      : {
          title: `${ltm && metric !== "NWC" ? "LTM to " : ""}${MON[hoverIdx]} 2026${hoverIdx > LAST_ACTUAL ? " · forecast" : ""}`,
          lines: (metric === "NWC"
            ? [
                { k: "Trade receivables", v: nf(agg(hoverIdx, (r) => r["Trade receivables"]), 2) },
                { k: "Other receivables", v: nf(agg(hoverIdx, (r) => r["Other receivables"]), 2) },
                { k: "Trade payables", v: nf(agg(hoverIdx, (r) => r["Trade payables"]), 2) },
                { k: "Deferred revenue & accruals", v: nf(agg(hoverIdx, (r) => r["Deferred revenue & accruals"]), 2) },
                { k: "NWC", v: nf(totals[hoverIdx], 2) },
              ]
            : metric === "Free CF"
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
            transform: "translateX(-50%)", background: "var(--action-hover)", color: "var(--bg)", padding: "8px 11px", borderRadius: 9,
            fontSize: 11, pointerEvents: "none", whiteSpace: "nowrap", boxShadow: "0 6px 18px rgba(20,52,43,0.22)", zIndex: 3,
          } as React.CSSProperties,
        }

  // ---------- KPI tiles ----------
  const netDebtDelta = company.financials.netDebt.fy2025LE - company.financials.netDebt.fy2024A
  const kpiTiles: { label: string; value: string; delta?: string; deltaGood?: boolean; lines: { k: string; v: string }[] }[] = [
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

  // Software capex (capitalised software on the balance sheet) against ARR (recurring revenue of the month × 12)
  const recurring = (r: MonthMetrics) => r["Recurring revenue own IP"] + r["Recurring revenue other"]
  const swBalance = (src: MonthMetrics[], upTo: number) => {
    // opening balance ≈ 2.2 years of capitalisation, written off straight-line over 36 months
    let bal = LY.reduce((t, r) => t + r["Capitalized dev. cost"], 0) * 2.2
    for (let j = 0; j <= upTo; j++) bal += src[j]["Capitalized dev. cost"] - bal / 36
    return bal
  }
  // scaled so the latest actual balance is about 35% of ARR (≈ €4m for a company with €11m ARR)
  const swScale = (0.35 * recurring(A[LAST_ACTUAL]) * 12) / (swBalance(A, LAST_ACTUAL) || 1)
  const swCapex = swBalance(A, month) * swScale
  const swCapexBud = swBalance(B, month) * swScale
  const arr = recurring(A[month]) * 12
  const arrBud = recurring(B[month]) * 12
  const swPct = arr ? (swCapex / arr) * 100 : 0
  const swPctBud = arrBud ? (swCapexBud / arrBud) * 100 : 0
  const swDec = (v: number) => (Math.abs(v) < 10 ? 2 : 1)
  kpiTiles.push({
    label: "Software capex", value: `€${nf(swCapex, swDec(swCapex))}m`,
    lines: [
      { k: "ARR", v: `€${nf(arr, swDec(arr))}m` },
      { k: "% of ARR", v: `${nf(swPct, 1)}%` },
      { k: "Budget", v: `${nf(swPctBud, 1)}%` },
    ],
  })

  // ---------- ARR bridge: new, upsell, downsell and churn over a selectable period ----------
  const arrAt = (j: number) => recurring(pick(j)) * 12
  const periodStart = arrPeriod === "LTM" ? month - 11 : arrPeriod === "YTD" ? 0 : arrPeriod === "QTR" ? month - 2 : month
  const periodMonths = month - periodStart + 1
  const arrOpen = arrAt(periodStart - 1)
  const arrClose = arrAt(month)
  const arrNet = arrClose - arrOpen
  const lossRaw = -arrOpen * 0.0115 * periodMonths * (0.9 + 0.2 * Math.abs(Math.sin(company.id.length + month)))
  const gainRaw = arrNet - lossRaw
  const gain = Math.max(gainRaw, arrOpen * 0.01)
  const loss = arrNet - gain
  const arrSteps = [
    { label: "Opening ARR", value: arrOpen, total: true },
    { label: "New", value: gain * 0.62 },
    { label: "Upsell", value: gain * 0.38 },
    { label: "Downsell", value: loss * 0.3 },
    { label: "Churn", value: loss * 0.7 },
    { label: "Closing ARR", value: arrClose, total: true },
  ]
  let arrRun = 0
  const arrBars = arrSteps.map((st) => {
    const before = arrRun
    const after = st.total ? st.value : arrRun + st.value
    arrRun = after
    return { ...st, start: st.total ? st.value : before, end: after, lo: st.total ? 0 : Math.min(before, after), hi: st.total ? st.value : Math.max(before, after) }
  })
  const arrTop = Math.max(...arrBars.map((x) => x.hi))
  const arrFloor = Math.max(0, Math.min(...arrBars.map((x) => (x.total ? x.hi : x.lo))) * 0.85)
  const ARR_H = 168
  const arrPx = (v: number) => ((v - arrFloor) / (arrTop - arrFloor || 1)) * ARR_H
  const arrFmt = (v: number) => `${v < 0 ? "−" : ""}€${nf(Math.abs(v), 2)}m`
  const arrTicks = [0, 0.5, 1].map((f) => arrFloor + (arrTop - arrFloor) * f)
  const periodLabels = { LTM: "Last 12 months", YTD: "Year to date", QTR: "Last quarter", MTD: "Month" } as const

  // ---------- KPIs: latest value (reporting month) against budget ----------
  // churn and new business already sit in the ARR bridge; Pipeline and Billability take the lead
  const kpiRank = (name: string) => (/pipeline/i.test(name) ? 0 : /billab/i.test(name) ? 1 : 2)
  const kpiCells = company.kpis.customKPIs
    .filter((k) => !/churn|^#?\s*new\b/i.test(k.name))
    .sort((x, y) => kpiRank(x.name) - kpiRank(y.name))
    .map((k) => {
    const a = k.actual[month], b = k.budget[month]
    const euro = /\(€m\)/.test(k.name)
    const percent = !euro && /%/.test(k.name)
    const label = k.name.replace(/\s*\(.*\)\s*$/, "").replace(/\s*%$/, "")
    const value = euro ? `€${nf(a, 1)}m` : percent ? `${nf(a, 1)}%` : nf(a, Number.isInteger(a) || Math.abs(a) >= 100 ? 0 : 1)
    const diff = percent ? a - b : b ? ((a - b) / Math.abs(b)) * 100 : 0
    const good = /churn/i.test(k.name) ? diff <= 0 : diff >= 0
    return { label, value, delta: percent ? ppTxt(diff) : pctTxt(diff), good }
  })

  // ---------- comments ----------
  const comments = [...allComments].sort((a, b) => (b.month ?? 0) - (a.month ?? 0) || b.createdAt.localeCompare(a.createdAt))
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
          <span className="text-[11px] font-medium text-ink-3">Reporting month</span>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="appearance-none rounded-lg border border-line-strong bg-white px-2.5 py-[5px] text-[12px] font-semibold text-ink outline-none"
          >
            {MON.slice(0, LAST_ACTUAL + 1).map((m, i) => (
              <option key={m} value={i}>{m} 2026</option>
            ))}
          </select>
          <span className="text-[11px] text-ink-3">Last available data {MON[LAST_ACTUAL]} 2026 · amounts in €m</span>
        </div>
        <span className="text-[11px] text-ink-3">Fiscal year 01-2026 – 12-2026</span>
      </div>

      <div className="grid grid-cols-[1.75fr_1fr] items-start gap-2.5">
        {/* Financial summary table */}
        <div className="flex h-[376px] flex-col overflow-hidden rounded-xl border border-line bg-white">
          <CardHeader
            title="Financial summary"
            subtitle="Δ = vs budget · click Revenue or Total operational cost to expand · amounts in €m"
            controls={
              <>
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
                    style={{ border: `1px solid ${t.on ? "var(--action-hover)" : "var(--line-strong)"}`, background: t.on ? "var(--action-hover)" : "var(--surface)", color: "var(--bg)", fontSize: 9, lineHeight: 1 }}
                  >
                    {t.on ? "✓" : ""}
                  </span>
                  {t.label}
                </button>
              ))}
              </>
            }
          />
          <div className="min-h-0 flex-1 overflow-y-auto">
            <table className="w-full table-fixed border-collapse text-[10.5px] [font-variant-numeric:tabular-nums]">
              <thead>
                <tr>
                  <th style={{ width: 168, borderBottom: "1px solid var(--line)" }}></th>
                  {groupDefs.map((g, gi) => (
                    <th
                      key={g.key}
                      colSpan={span}
                      style={{
                        textAlign: "center", padding: "5px 6px 4px", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
                        fontWeight: 600, color: "var(--ink-2)", borderBottom: "1px solid var(--line)",
                        borderLeft: "1px solid var(--line)", width: subColsByGroup[gi].reduce((a, c) => a + c.width, 0),
                      }}
                    >
                      {g.label}
                    </th>
                  ))}
                </tr>
                <tr>
                  <th style={{ width: 168, textAlign: "left", padding: "4px 12px 5px", fontSize: 9.5, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-3)", fontWeight: 600, borderBottom: "1px solid var(--line)" }}>
                    Line
                  </th>
                  {subColsByGroup.flatMap((cols, gi) =>
                    cols.map((c, ci) => (
                      <th
                        key={`${gi}-${c.label}`}
                        title={c.title}
                        style={{
                          textAlign: "right", padding: "4px 6px 5px", fontSize: 9.5, letterSpacing: "0.05em", textTransform: "uppercase",
                          color: "var(--ink-3)", fontWeight: 600, borderBottom: "1px solid var(--line)", whiteSpace: "nowrap", width: c.width,
                          borderLeft: ci === 0 ? "1px solid var(--line)" : undefined,
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
                      <tr key={k.key} style={{ background: "var(--surface-2)" }}>
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
        <div className="flex h-[376px] flex-col overflow-hidden rounded-xl border border-line bg-white">
          <CardHeader title="Comments" subtitle="One CFO comment per month" />
          <div className="grid content-start gap-[5px] overflow-y-auto px-3 pb-2.5">
            {comments.map((c) => {
              const open = !!openComments[c.id]
              const long = c.text.length > 120
              const text = open || !long ? c.text : c.text.slice(0, 110).trim() + "…"
              return (
                <div key={c.id} className="rounded-lg border border-line bg-surface-2 px-[9px] py-[6px]">
                  <div className="mb-[3px] flex items-center gap-1.5">
                    <span className="flex h-[17px] w-[17px] items-center justify-center rounded-full bg-action-hover text-[9px] font-semibold text-bg">
                      {c.author[0]}
                    </span>
                    <span className="text-[11px] font-semibold">{c.author}</span>
                    <span className="text-[10px] text-ink-3">{c.month !== undefined ? `${MON[c.month]} 2026` : c.period}</span>
                    <span className="ml-auto text-[10px] text-ink-3">{formatDate(c.createdAt)}</span>
                  </div>
                  <div className="text-[10.5px] leading-snug text-ink">{text}</div>
                  {long && (
                    <button
                      onClick={() => setOpenComments((s) => ({ ...s, [c.id]: !open }))}
                      className="mt-[3px] border-none bg-transparent p-0 text-[10.5px] font-semibold text-ok underline underline-offset-2"
                    >
                      {open ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 items-start gap-2.5">
        {/* Chart */}
        <div className="flex h-[336px] flex-col overflow-hidden rounded-xl border border-line bg-white">
          <CardHeader
            title={metric === "Total" ? `Revenue & N. EBITDA${ltm ? " · LTM" : ""}` : metric === "NWC" ? "NWC · month-end" : `${metric}${ltm ? " · LTM" : ""}`}
            subtitle={
              metric === "Free CF"
                ? `${ltm ? "Rolling twelve months" : "Per month"} · bar height = operating CF, dark = free CF after investments · €m`
                : metric === "NWC"
                ? "Receivables less payables and deferred revenue · balance at month-end · faded = forecast · dashed line = budget · €m"
                : `${ltm ? "Rolling twelve months" : "Per month"} · faded = forecast · dashed line = budget · €m`
            }
            controls={
              <>
                <div className="flex gap-0.5 rounded-lg bg-surface-2 p-[3px]">
                  {(["Total", "Revenue", "Cash EBITDA", "Free CF", "NWC"] as const).map((x) => (
                    <button key={x} onClick={() => setMetric(x)} className={pillClass(metric === x)}>{x}</button>
                  ))}
                </div>
                <div className="flex gap-0.5 rounded-lg bg-surface-2 p-[3px]">
                  {(["Month", "LTM"] as const).map((b) => (
                    <button
                      key={b}
                      onClick={() => setBasis(b)}
                      disabled={metric === "NWC"}
                      title={metric === "NWC" ? "NWC is a month-end balance" : b === "LTM" ? "Rolling twelve months per month" : "Result of the individual month"}
                      className={cn(pillClass(basis === b && metric !== "NWC"), "px-2.5 py-1 text-[11px] disabled:cursor-not-allowed disabled:opacity-40")}
                    >
                      {b}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <select
                    value={back}
                    onChange={(e) => setBack(Number(e.target.value))}
                    title="Months shown before the reporting month"
                    className="appearance-none rounded-md border border-line-strong bg-white px-2 py-1 text-[10.5px] font-medium text-ink"
                  >
                    {[2, 5, 8, 11].map((v) => (
                      <option key={v} value={v}>{v + 1}m back</option>
                    ))}
                  </select>
                  <select
                    value={fwd}
                    onChange={(e) => setFwd(Number(e.target.value))}
                    title="Forecast months shown after the reporting month"
                    className="appearance-none rounded-md border border-line-strong bg-white px-2 py-1 text-[10.5px] font-medium text-ink"
                  >
                    {[0, 3, 5].map((v) => (
                      <option key={v} value={v}>{v === 0 ? "no forecast" : `${v}m ahead`}</option>
                    ))}
                  </select>
                </div>
              </>
            }
          />
          <div className="flex min-h-0 flex-1 flex-col px-3 pb-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              {parts.map((p) => (
                <div key={p.label} className="flex items-center gap-1.5 whitespace-nowrap text-[11px] text-ink">
                  <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: p.c }} />
                  {p.label}
                </div>
              ))}
              <span className="h-3 w-px bg-line" />
              {[
                { label: "Budget", on: showBudget, toggle: () => setShowBudget((v) => !v), color: BUDGET, dash: "dashed" },
                { label: "Last year", on: showLYline, toggle: () => setShowLYline((v) => !v), color: "var(--ink-3)", dash: "dotted" },
              ].map((s) => (
                <button
                  key={s.label}
                  onClick={s.toggle}
                  className="flex items-center gap-1.5 border-none bg-transparent p-0 text-[11px] font-medium"
                  style={{ color: s.on ? INK : "var(--ink-3)" }}
                >
                  <span className="inline-block w-4" style={{ borderTop: `2px ${s.dash} ${s.on ? s.color : "var(--line)"}` }} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative mt-auto pl-10" style={{ height: CH }}>
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
        </div>

        {/* ARR bridge */}
        <div className="flex h-[336px] flex-col overflow-hidden rounded-xl border border-line bg-white">
          <CardHeader
            title="ARR bridge"
            subtitle={`${periodLabels[arrPeriod]} to ${MON[month]} 2026 · opening ARR to closing ARR · €m · net ${arrNet >= 0 ? "+" : "−"}€${nf(Math.abs(arrNet), 2)}m (${nf((arrNet / (arrOpen || 1)) * 100, 1)}%)`}
            controls={
              <div className="flex gap-0.5 rounded-lg bg-surface-2 p-[3px]">
                {(["LTM", "YTD", "QTR", "MTD"] as const).map((k) => (
                  <button key={k} onClick={() => setArrPeriod(k)} title={periodLabels[k]} className={cn(pillClass(arrPeriod === k), "px-2.5 py-1 text-[11px]")}>
                    {k === "QTR" ? "Quarter" : k === "MTD" ? "Month" : k}
                  </button>
                ))}
              </div>
            }
          />
          <div className="relative mx-3 mb-3 mt-auto pl-14" style={{ height: ARR_H + 44 }}>
            {arrTicks.map((t, i) => (
              <div key={i}>
                <div className="absolute left-14 right-0 border-t border-line" style={{ bottom: 26 + arrPx(t) }} />
                <div className="absolute left-0 w-12 text-right text-[10px] tabular-nums text-ink-3" style={{ bottom: 26 + arrPx(t) - 6 }}>€{nf(t, 2)}m</div>
              </div>
            ))}
            <div className="absolute flex" style={{ left: 56, right: 0, bottom: 0, top: 0 }}>
              {arrBars.map((x, i) => {
                const color = x.total ? "#323a5f" : x.value < 0 ? "var(--alert)" : "#4a6f75"
                return (
                  <div key={x.label} className="relative flex-1">
                    {i > 0 && <div className="absolute border-t border-dashed border-line-strong" style={{ bottom: 26 + arrPx(x.start), left: 0, width: "calc(50% - 23px)" }} />}
                    {i < arrBars.length - 1 && <div className="absolute border-t border-dashed border-line-strong" style={{ bottom: 26 + arrPx(x.end), right: 0, width: "calc(50% - 23px)" }} />}
                    <div className="absolute left-1/2 -translate-x-1/2 rounded-[3px]" style={{ width: 46, bottom: 26 + arrPx(Math.max(x.lo, arrFloor)), height: Math.max(2, arrPx(x.hi) - arrPx(Math.max(x.lo, arrFloor))), background: color }} />
                    <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[10.5px] font-medium tabular-nums text-ink" style={{ bottom: 26 + arrPx(x.hi) + 3 }}>
                      {arrFmt(x.value)}
                    </span>
                    <span className="absolute inset-x-0 bottom-0 text-center text-[10.5px] text-ink-2">{x.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Key metrics and KPIs: five equal blocks across the page */}
      <div>
        <div className="mb-1.5 flex items-center justify-between px-0.5">
          <div className="text-[13px] font-semibold">Key metrics &amp; KPIs</div>
          <span className="text-[10.5px] text-ink-3">Latest value · {MON[month]} 2026</span>
        </div>
        <div className="grid grid-cols-5 gap-2.5">
          {kpiTiles.map((t) => (
            <div key={t.label} className="min-w-0 rounded-xl border border-line bg-white px-3 py-2.5">
              <div className="truncate text-[10px] font-semibold uppercase tracking-[0.07em] text-ink-3">{t.label}</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-[22px] font-semibold leading-tight tracking-[-0.02em] [font-variant-numeric:tabular-nums]">{t.value}</span>
                {t.delta && <span className="text-[11px] font-semibold" style={{ color: t.deltaGood ? POS : NEG }}>{t.delta}</span>}
              </div>
              <div className="mt-2 grid gap-0.5 border-t border-line pt-2">
                {t.lines.map((l) => (
                  <div key={l.k} className="flex justify-between gap-2 text-[11px]">
                    <span className="truncate text-ink-3">{l.k}</span>
                    <span className="font-semibold [font-variant-numeric:tabular-nums]">{l.v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="min-w-0 rounded-xl border border-line bg-white px-3 py-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-ink-3">KPIs</span>
              <span className="text-[10px] text-ink-3">vs budget</span>
            </div>
            {kpiCells.length > 0 ? (
              <div className="mt-2 grid gap-1.5">
                {kpiCells.slice(0, 4).map((k) => (
                  <div key={k.label} className="flex items-baseline justify-between gap-2 text-[11px]">
                    <span className="truncate text-ink-3" title={k.label}>{k.label}</span>
                    <span className="flex shrink-0 items-baseline gap-1.5">
                      <span className="text-[13px] font-semibold [font-variant-numeric:tabular-nums]">{k.value}</span>
                      <span className="text-[10px] font-semibold" style={{ color: k.good ? POS : NEG }}>{k.delta}</span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 text-[11px] text-ink-3">No KPIs tracked yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
