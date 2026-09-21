"use client"

import { useMemo, useState } from "react"
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google"
import { cn } from "@/lib/utils"
import {
  FUNDS,
  COMPANIES,
  COMPANY_SHEETS,
  HOLLAND_PORTFOLIOS,
  FUND_IRR,
  PC_ROWS,
  PC_ROW_CODES,
  PC_COLS,
  PC_COL_CODES,
  PC_FORMULA,
  PC_CATALOG,
  PF_COLS,
  PF_COL_CODES,
  PF_FORMULA,
  PF_CATALOG,
  type HollandCompanySheet,
  type HollandPosition,
  type MetricCatalogEntry,
} from "@/lib/report-builder-data"
import { buildXlsx, downloadXlsx, type XlsxCell, type XlsxSheet } from "@/lib/xlsx-writer"

const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-plex-sans" })
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-mono" })

const ACCENT = "#1F3A5F"
const HOLLAND_FUNDS = FUNDS.filter((f) => f.format === "holland")

type Template = "company" | "portfolio"

type CellRole =
  | "title" | "head" | "headL" | "sub" | "subL" | "label" | "labelIndent" | "labelBold"
  | "num" | "numMuted" | "numBold" | "numBudget" | "numLE" | "empty" | "formula" | "note" | "spacer"

interface GridCell {
  v: string | number
  role: CellRole
  span?: number
  fmt?: string
  code?: string | null
  rowLabel?: string
  colIdx?: number
}

interface Grid {
  name: string
  cols: number[]
  rows: GridCell[][]
  blank?: boolean
}

const SELECTABLE_ROLES = new Set<CellRole>(["num", "numMuted", "numBold", "numBudget", "numLE", "empty", "formula"])

function fmt(v: unknown, f?: string): string {
  if (v === "" || v === null || v === undefined) return ""
  if (typeof v === "string") return v
  const n = v as number
  const nl = (x: number, d = 0) => x.toLocaleString("nl-NL", { minimumFractionDigits: d, maximumFractionDigits: d })
  if (f === "pct") return nl(n * 100, 1) + "%"
  if (f === "mom") return nl(n, 2) + "x"
  return nl(n)
}

function cellClass(role: CellRole, selected: boolean): string {
  const base = "border-b border-[#F0F0EB] px-[11px] py-[6px]"
  const mono = cn(plexMono.className, "[font-variant-numeric:tabular-nums]")
  const sel = selected ? "outline outline-2 outline-[#1F3A5F] [outline-offset:-2px]" : ""
  switch (role) {
    case "title":
      return "border-b-2 border-[#1F3A5F] px-[11px] pb-1.5 pt-4 text-[13px] font-bold tracking-tight"
    case "head":
      return cn(base, mono, "whitespace-nowrap border-b-0 bg-[#1F3A5F] text-right text-[11px] font-semibold text-white")
    case "headL":
      return cn(base, "whitespace-nowrap border-b-0 bg-[#1F3A5F] text-left text-[11px] font-semibold text-white")
    case "sub":
      return cn(base, mono, "whitespace-nowrap bg-[#F6F6F2] text-right text-[10.5px] text-[#5A5A52]")
    case "subL":
      return cn(base, "whitespace-nowrap bg-[#F6F6F2] text-[10.5px] font-medium text-[#5A5A52]")
    case "label":
      return cn(base, "whitespace-nowrap text-[#33332E]")
    case "labelIndent":
      return cn(base, "whitespace-nowrap pl-[26px] text-[11.5px] text-[#7A7A72]")
    case "labelBold":
      return cn(base, "whitespace-nowrap font-semibold text-[#1C1C1A]")
    case "num":
      return cn(base, mono, sel, "whitespace-nowrap text-right text-[#33332E]")
    case "numMuted":
      return cn(base, mono, sel, "whitespace-nowrap text-right text-[11.5px] text-[#8A8A81]")
    case "numBold":
      return cn(base, mono, sel, "whitespace-nowrap text-right font-semibold text-[#1C1C1A]")
    case "numBudget":
      return cn(base, mono, sel, "whitespace-nowrap bg-[#F7F7F3] text-right text-[#5A5A52]")
    case "numLE":
      return cn(base, mono, sel, "whitespace-nowrap bg-[#EDF3F8] text-right text-[#2B4A66]")
    case "empty":
      return cn(base, mono, sel, "cursor-pointer whitespace-nowrap bg-[#FFFCEC] text-right text-[#B08E2E]")
    case "formula":
      return cn(base, mono, sel, "cursor-pointer whitespace-nowrap bg-[#FAFAF6] text-right text-[#9A9A92]")
    case "note":
      return "px-[11px] pb-0.5 pt-2.5 text-[11px] italic leading-relaxed text-[#8A8A81]"
    case "spacer":
      return "h-2.5 p-0"
    default:
      return base
  }
}

export default function ReportBuilderExcelPage() {
  const [template, setTemplate] = useState<Template>("company")
  const [fundId, setFundId] = useState("gbo4")
  const [company, setCompany] = useState(COMPANIES.gbo4[0].id)
  const [period, setPeriod] = useState("Q2 2026")
  const [filled, setFilled] = useState(false)
  const [showCodes, setShowCodes] = useState(true)
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [mapCell, setMapCell] = useState<{ key: string; rowLabel: string; colIdx: number } | null>(null)

  const fund = FUNDS.find((f) => f.id === fundId)!
  const companies = COMPANIES[fundId] || []
  const comp = companies.find((c) => c.id === company)
  const positions = HOLLAND_PORTFOLIOS[fundId] || []
  const isPF = template === "portfolio"
  const catalog: MetricCatalogEntry[] = isPF ? PF_CATALOG : PC_CATALOG
  const formulaCodes = isPF ? PF_FORMULA : PC_FORMULA

  const cellKey = (rowLabel: string, colIdx: number) => `${template}|${fundId}|${rowLabel}|${colIdx}`

  const baseCode = (rowLabel: string, colIdx: number): string | undefined => {
    const mapped = mapping[cellKey(rowLabel, colIdx)]
    if (mapped) return mapped
    return isPF ? PF_COL_CODES[colIdx] : PC_ROW_CODES[rowLabel]
  }

  const codeFor = (rowLabel: string, colIdx: number): string | null => {
    const b = baseCode(rowLabel, colIdx)
    if (!b) return null
    return isPF ? b : `${b}.${PC_COL_CODES[colIdx]}`
  }

  function portfolioGrid(): Grid {
    const w = 11
    const rows: GridCell[][] = []
    rows.push([{ v: `2. Portfolio Overview – ${fund.fund} · ${period}`, role: "title", span: w }])
    rows.push([{ v: "Name", role: "headL" }, ...PF_COLS.map((c) => ({ v: c, role: "head" as CellRole }))])
    rows.push([{ v: "metric code", role: "subL" }, ...PF_COL_CODES.map((c) => ({ v: c, role: "sub" as CellRole }))])
    const fmts = ["text", "text", "text", "pct", "num", "num", "num", "num", "mom", "pct"]
    const rowValues = (c: HollandPosition): (string | number | null)[] => [
      c.inv, c.exit, c.hold, c.stake, c.amt, c.real, c.fmv, c.tot, c.mm, c.irr === "n/a" ? null : c.irr,
    ]
    positions.forEach((c) => {
      const values = rowValues(c)
      rows.push([
        { v: c.name, role: "label" },
        ...PF_COL_CODES.map((_cc, i) => {
          const base = baseCode(c.name, i)
          const role: CellRole = filled ? (i >= 8 ? "numBold" : "numMuted") : base && formulaCodes.includes(base) ? "formula" : "empty"
          const raw = values[i]
          return { v: filled ? (raw === null ? "" : raw) : "", fmt: fmts[i], role, code: codeFor(c.name, i), rowLabel: c.name, colIdx: i }
        }),
      ])
    })
    const s = (k: keyof HollandPosition) => positions.reduce((a, b) => a + (typeof b[k] === "number" ? (b[k] as number) : 0), 0)
    const totAmt = s("amt"), totReal = s("real"), totFmv = s("fmv"), totTot = s("tot")
    const irr = FUND_IRR[fund.id]
    rows.push([
      { v: "Total", role: "labelBold" },
      ...PF_COL_CODES.map((_cc, i) => {
        if (i < 4) return { v: "", role: "num" as CellRole }
        const tot: Record<number, number | string> = { 4: totAmt, 5: totReal, 6: totFmv, 7: totTot, 8: totTot / -totAmt, 9: irr === undefined ? "n/a" : irr }
        return { v: filled ? tot[i] : "", fmt: fmts[i], role: filled ? ("numBold" as CellRole) : ("formula" as CellRole), code: `${PF_COL_CODES[i]}.TOTAL` }
      }),
    ])
    rows.push([{ v: "Alle bedragen in EURk. Amount invested negatief conform de uitdraai. Gele cellen zijn invoer uit Key Data, grijze cellen rekenen zichzelf; de totaalregel herrekent de gross MM over het hele fonds.", role: "note", span: w }])
    return { name: "Portfolio Overview", cols: [22, 13, 11, 13, 12, 14, 14, 14, 14, 10, 10], rows }
  }

  function blankCompanyGrid(): Grid {
    const w = PC_COLS.length + 1
    const rows: GridCell[][] = []
    rows.push([{ v: `${comp ? comp.name : ""} – Financials (P&L) · ${period}`, role: "title", span: w }])
    rows.push([{ v: "EURk", role: "headL" }, ...PC_COLS.map((x) => ({ v: x, role: "head" as CellRole }))])
    rows.push([{ v: "metric code", role: "subL" }, ...PC_COL_CODES.map((x) => ({ v: x, role: "sub" as CellRole }))])
    PC_ROWS.forEach((l) => {
      const base = baseCode(l, 0)
      const isF = !!base && PC_FORMULA.includes(base)
      rows.push([
        { v: l, role: isF ? "labelIndent" : "label" },
        ...PC_COLS.map((_x, i) => ({ v: "", role: (isF ? "formula" : "empty") as CellRole, code: codeFor(l, i), rowLabel: l, colIdx: i })),
      ])
    })
    rows.push([{ v: "Valuation", role: "title", span: w }])
    ;["Toegepaste multiple (x)", "Fair market value aandeel fonds", "FMV vorig kwartaal", "Totale investering"].forEach((l, i) => {
      const code = ["VAL.MULT", "VAL.FMV", "VAL.FMV.PREV", "VAL.INV"][i]
      rows.push([{ v: l, role: "label" }, { v: "", role: "empty", span: w - 1, code, rowLabel: l, colIdx: 0 }])
    })
    rows.push([{ v: "De standaardzin van de waardering wordt opgebouwd uit deze vier invoervelden, zodat hij meeloopt met de cijfers.", role: "note", span: w }])
    return { name: "Company detail", cols: [30, ...PC_COLS.map(() => 12)], rows, blank: true }
  }

  function filledCompanyGrid(s: HollandCompanySheet): Grid {
    const rows: GridCell[][] = []
    const roleFor = (k: string): CellRole => (k === "b" ? "numBudget" : k === "le" ? "numLE" : "num")
    rows.push([{ v: `${s.company} – Financials (P&L) · ${period}`, role: "title", span: 8 }])
    rows.push([{ v: "EURk", role: "headL" }, ...s.cols.map((c) => ({ v: c, role: "head" as CellRole }))])
    s.rows.forEach((r) => {
      if (r.gap) rows.push([{ v: "", role: "spacer", span: 8 }])
      const lab: CellRole = r.indent ? "labelIndent" : r.rule ? "labelBold" : "label"
      rows.push([
        { v: r.label, role: lab },
        ...r.v.map((v, i) => ({
          v, fmt: r.fmt, role: r.indent ? "numMuted" : r.rule ? "numBold" : roleFor(s.colKind[i]),
          code: codeFor(r.label, i), rowLabel: r.label, colIdx: i,
        } as GridCell)),
      ])
    })
    rows.push([{ v: "Valuation", role: "title", span: 8 }])
    rows.push([{ v: s.valuationText, role: "note", span: 8 }])
    s.valuationInputs.forEach((v) => rows.push([{ v: v.label, role: "label" }, { v: v.v, role: "numBold", span: 7 }]))
    return { name: "Company detail", cols: [30, 12, 12, 12, 12, 12, 12, 12], rows }
  }

  function companyGrid(): Grid {
    const sheet = COMPANY_SHEETS[company]
    if (filled && sheet && "colKind" in sheet) return filledCompanyGrid(sheet)
    return blankCompanyGrid()
  }

  const grid = isPF ? portfolioGrid() : companyGrid()

  const handleDownload = () => {
    const styleFor: Record<string, number> = {
      title: 8, head: 4, headL: 4, sub: 0, subL: 0, label: 0, labelIndent: 0, labelBold: 1,
      num: 2, numMuted: 2, numBold: 7, numBudget: 2, numLE: 10, empty: 0, formula: 0, note: 6, spacer: 0,
    }
    const rows: XlsxCell[][] = grid.rows.map((row) =>
      row.map((c) => {
        const numeric = typeof c.v === "number" && ["num", "pct", "mom"].includes(c.fmt || "")
        let s = styleFor[c.role] || 0
        if (numeric && c.fmt === "pct") s = 3
        else if (numeric && c.fmt === "mom") s = 5
        return numeric ? { v: c.v as number, t: "n" as const, s } : { v: fmt(c.v, c.fmt), t: "s" as const, s }
      }),
    )
    const sheet: XlsxSheet = { name: grid.name, cols: grid.cols, rows }
    const blob = buildXlsx([sheet], { headerHex: "FF" + ACCENT.replace("#", "").toUpperCase() })
    const name = `Holland Capital ${fund.fund} ${period} ${isPF ? "portfolio totaal" : comp?.name || ""}`
    downloadXlsx(blob, name.replace(/[\\/:*?"<>|]/g, "-") + ".xlsx")
  }

  const selectFund = (id: string) => {
    setFundId(id)
    setCompany(COMPANIES[id][0].id)
    setMapCell(null)
  }

  const selectTemplate = (t: Template) => {
    setTemplate(t)
    setMapCell(null)
  }

  const toggleCodes = () => {
    if (showCodes) setMapCell(null)
    setShowCodes((v) => !v)
  }

  const currentBase = mapCell ? baseCode(mapCell.rowLabel, mapCell.colIdx) : null
  const colCode = mapCell ? (isPF ? PF_COL_CODES[mapCell.colIdx] : PC_COL_CODES[mapCell.colIdx]) : ""

  const flagEmpty = filled && !isPF && !COMPANY_SHEETS[company]
  const flagText = flagEmpty
    ? `● Geen cijfers voor ${comp?.name || ""} in ${period} — sjabloon blijft leeg`
    : filled
      ? `● Voorbeeldweergave met de cijfers van ${period}`
      : "○ Leeg sjabloon — geel is invoer uit Key Data, grijs rekent zichzelf. Klik een cel om de metric code te wijzigen."

  return (
    <div className={cn(plexSans.className, "flex h-screen flex-col bg-[#F5F5F2] text-[#1C1C1A]")}>
      {/* Header */}
      <header className="flex flex-none items-center justify-between gap-6 border-b border-[#E7E7E1] bg-white px-7 py-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-[#1F3A5F] text-[12px] font-bold text-white">
            HC
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[#1C1C1A]">Holland Capital — report builder</h1>
            <p className="mt-[3px] text-[12.5px] text-[#6B6B64]">Kies een template, zet fonds, periode en bedrijf, download de Excel.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-[#E1E1DA] px-3 py-[7px] text-[12.5px] text-[#4A4A44]">
          <span className="h-[7px] w-[7px] rounded-full bg-[#3F8F63]" />
          Peildatum {fund.asOf}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Left config panel */}
        <section className="w-[312px] flex-none overflow-y-auto border-r border-[#E7E7E1] bg-[#FCFCFA] px-5 py-[18px] pb-10">
          <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[.07em] text-[#8A8A81]">1 · Template</div>
          <div className="mb-[22px] flex flex-col gap-2">
            {([
              { id: "company" as Template, label: "Portfolio company detail", sub: "P&L 2024A → 2026LE + waardering" },
              { id: "portfolio" as Template, label: "Portfolio totaal", sub: "Eén regel per positie, gross MM en IRR" },
            ]).map((t) => {
              const on = t.id === template
              return (
                <div
                  key={t.id}
                  onClick={() => selectTemplate(t.id)}
                  className={cn(
                    "cursor-pointer rounded-[10px] border px-3 py-[11px]",
                    on ? "border-[#1F3A5F] bg-[#F2F5F9] shadow-[inset_3px_0_0_#1F3A5F]" : "border-[#E7E7E1] bg-white",
                  )}
                >
                  <div className="flex items-center gap-[11px]">
                    <div className="h-[30px] w-[38px] flex-none overflow-hidden rounded border border-[#DCDCD4] bg-white">
                      <div className={cn("h-1.5", on ? "bg-[#1F3A5F]" : "bg-[#B9C3CE]")} />
                      <div className="flex gap-0.5 p-[3px]">
                        <div className="h-[3px] w-[9px] rounded-[1px] bg-[#D8D8D0]" />
                        <div className="h-[3px] w-[5px] rounded-[1px] bg-[#EFE2B8]" />
                        <div className="h-[3px] w-[5px] rounded-[1px] bg-[#EFE2B8]" />
                        <div className="h-[3px] w-[5px] rounded-[1px] bg-[#EFE2B8]" />
                      </div>
                      <div className="flex gap-0.5 px-[3px] pb-[3px]">
                        <div className="h-[3px] w-[9px] rounded-[1px] bg-[#D8D8D0]" />
                        <div className="h-[3px] w-[5px] rounded-[1px] bg-[#EFE2B8]" />
                        <div className="h-[3px] w-[5px] rounded-[1px] bg-[#EFE2B8]" />
                        <div className="h-[3px] w-[5px] rounded-[1px] bg-[#EFE2B8]" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold">{t.label}</div>
                      <div className="mt-0.5 text-[11.5px] text-[#7A7A72]">{t.sub}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[.07em] text-[#8A8A81]">2 · Fonds</div>
          <div className="mb-[22px] flex gap-2">
            {HOLLAND_FUNDS.map((f) => {
              const on = f.id === fundId
              return (
                <div
                  key={f.id}
                  onClick={() => selectFund(f.id)}
                  className={cn(
                    "flex-1 cursor-pointer rounded-lg border px-1.5 py-2 text-center text-[12px] font-medium",
                    on ? "border-[#1F3A5F] bg-[#F2F5F9] text-[#1F3A5F]" : "border-[#E7E7E1] bg-white text-[#5A5A52]",
                  )}
                >
                  {f.fund}
                </div>
              )
            })}
          </div>

          <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[.07em] text-[#8A8A81]">3 · Periode</div>
          <div className="mb-[22px] flex gap-2">
            {["Q4 2025", "Q1 2026", "Q2 2026"].map((p) => {
              const on = p === period
              return (
                <div
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "flex-1 cursor-pointer rounded-lg border px-1.5 py-2 text-center text-[12px] font-medium",
                    on ? "border-[#1F3A5F] bg-[#F2F5F9] text-[#1F3A5F]" : "border-[#E7E7E1] bg-white text-[#5A5A52]",
                  )}
                >
                  {p}
                </div>
              )
            })}
          </div>

          <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[.07em] text-[#8A8A81]">
            {isPF ? "4 · Totaal" : "4 · Company"}
          </div>

          {!isPF && (
            <div className="flex flex-col overflow-hidden rounded-[9px] border border-[#E7E7E1] bg-white">
              {companies.map((c) => {
                const on = c.id === company
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setCompany(c.id)
                      setMapCell(null)
                    }}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 border-b border-[#F0F0EB] px-[11px] py-[9px]",
                      on ? "bg-[#F2F5F9]" : "bg-white",
                    )}
                  >
                    <div className={cn("h-[13px] w-[13px] flex-none rounded-full bg-white", on ? "border-[4px] border-[#1F3A5F]" : "border border-[#CFCFC6]")} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12.5px] font-medium">{c.name}</div>
                      <div className="truncate text-[11px] text-[#8A8A81]">{c.source}</div>
                    </div>
                    <div className={cn("h-[7px] w-[7px] flex-none rounded-full", c.ready ? "bg-[#3F8F63]" : "bg-[#D9A441]")} />
                  </div>
                )
              })}
            </div>
          )}

          {isPF && (
            <div className="flex items-center gap-2.5 rounded-[9px] border border-[#1F3A5F] bg-[#F2F5F9] px-3 py-[11px]">
              <div className="h-[13px] w-[13px] flex-none rounded-full border-[4px] border-[#1F3A5F] bg-white" />
              <div>
                <div className="text-[12.5px] font-medium">Totaal — {fund.fund}</div>
                <div className="text-[11px] text-[#8A8A81]">{positions.length} posities · één regel per positie</div>
              </div>
            </div>
          )}
        </section>

        {/* Main content */}
        <section className="flex min-w-0 flex-1 flex-col bg-[#F1F1EE]">
          <div className="flex flex-none flex-wrap items-center gap-3 border-b border-[#E1E1DA] bg-white px-5 py-[10px]">
            <div className="flex min-w-0 flex-1 basis-[220px] items-baseline gap-2.5 overflow-hidden">
              <div className="flex-none whitespace-nowrap text-[13px] font-semibold">
                {isPF ? "Portfolio totaal" : "Portfolio company detail"}
              </div>
              <div className="min-w-0 truncate whitespace-nowrap text-[12px] text-[#8A8A81]">
                Holland Capital · {fund.fund} · {period} · {isPF ? `${positions.length} posities` : comp?.name || ""}
              </div>
            </div>
            <div className="flex flex-none items-center gap-2">
              <button
                onClick={() => setFilled((v) => !v)}
                className={cn(
                  "whitespace-nowrap rounded-lg border px-[13px] py-2 text-[12.5px] font-medium",
                  filled ? "border-[#1F3A5F] bg-[#F2F5F9] text-[#1F3A5F]" : "border-[#DCDCD4] bg-white text-[#3A3A34]",
                )}
              >
                {filled ? "Cijfers Q2 2026" : "Leeg sjabloon"}
              </button>
              <button
                onClick={toggleCodes}
                className={cn(
                  "whitespace-nowrap rounded-lg border px-[13px] py-2 text-[12.5px] font-medium",
                  showCodes ? "border-[#1F3A5F] bg-[#F2F5F9] text-[#1F3A5F]" : "border-[#DCDCD4] bg-white text-[#3A3A34]",
                )}
              >
                Metric codes
              </button>
              <button
                onClick={handleDownload}
                className="whitespace-nowrap rounded-lg bg-[#1F3A5F] px-[15px] py-2 text-[12.5px] font-semibold text-white hover:bg-[#14283F]"
              >
                Download .xlsx
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1">
            <div className="min-w-0 flex-1 overflow-auto px-6 py-[22px] pb-10">
              <div className="mx-auto max-w-[1120px] overflow-hidden rounded-[10px] border border-[#E1E1DA] bg-white shadow-[0_1px_2px_rgba(20,20,10,.04)]">
                <div className="flex items-center justify-between gap-4 border-b border-[#EFEFEA] px-[22px] py-4">
                  <div>
                    <div className="text-[15px] font-semibold tracking-tight">
                      {isPF ? `Portfolio totaal — ${fund.fund}` : `${comp?.name || ""} — company detail`}
                    </div>
                    <div className="mt-[3px] text-[12px] text-[#7A7A72]">
                      {isPF
                        ? `${positions.length} posities per 30 juni 2026 · gross MM per regel, totaalregel herrekend`
                        : `Holland Capital ${fund.fund} · ${comp?.source || ""}`}
                    </div>
                  </div>
                  <div className={cn(plexMono.className, "whitespace-nowrap rounded-md border border-[#E7E7E1] px-[9px] py-[5px] text-[11px] text-[#8A8A81]")}>
                    {grid.name}
                  </div>
                </div>
                <div className="overflow-x-auto px-[22px] pb-[18px] pt-1.5">
                  <table className="w-full border-collapse text-[12.5px]">
                    <tbody>
                      {grid.rows.map((row, ri) => (
                        <tr key={ri}>
                          {row.map((c, ci) => {
                            const mappable = !!c.code && !!c.rowLabel
                            const selected = mappable && mapCell !== null && mapCell.key === cellKey(c.rowLabel!, c.colIdx!)
                            const showCode = showCodes && !!c.code
                            return (
                              <td
                                key={ci}
                                colSpan={c.span || 1}
                                onClick={mappable ? () => {
                                  setMapCell({ key: cellKey(c.rowLabel!, c.colIdx!), rowLabel: c.rowLabel!, colIdx: c.colIdx! })
                                  setShowCodes(true)
                                } : undefined}
                                className={cellClass(c.role, selected && SELECTABLE_ROLES.has(c.role))}
                              >
                                <div>{c.role === "note" ? String(c.v) : fmt(c.v, c.fmt)}</div>
                                {showCode && (
                                  <div className={cn(plexMono.className, "mt-0.5 text-[9.5px]", c.role === "empty" ? "text-[#C1A85E]" : "text-[#B0B0A6]")}>
                                    {c.code}
                                  </div>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mx-auto mt-3.5 flex max-w-[1120px] flex-wrap gap-2.5">
                <div
                  className={cn(
                    "rounded-lg border px-[13px] py-[9px] text-[12px]",
                    filled ? "border-[#E7E7E1] bg-white text-[#6B6B64]" : "border-[#F0E0B0] bg-[#FDF6E3] text-[#8A6D1F]",
                  )}
                >
                  {flagText}
                </div>
                <div className="rounded-lg border border-[#E7E7E1] bg-white px-[13px] py-[9px] text-[12px] text-[#6B6B64]">
                  1 tabblad in de download · opmaak conform de Holland Capital-kwartaalrapportage
                </div>
              </div>
            </div>

            {mapCell && (
              <aside className="flex w-[300px] flex-none flex-col border-l border-[#E1E1DA] bg-white">
                <div className="flex items-start justify-between gap-2.5 border-b border-[#EFEFEA] px-[18px] pb-3 pt-4">
                  <div>
                    <div className="text-[13.5px] font-semibold">Cel-mapping</div>
                    <div className="mt-[3px] text-[11.5px] text-[#7A7A72]">
                      {mapCell.rowLabel} × {isPF ? PF_COLS[mapCell.colIdx] : PC_COLS[mapCell.colIdx]}
                    </div>
                  </div>
                  <div onClick={() => setMapCell(null)} className="cursor-pointer text-base leading-none text-[#9A9A92]">
                    ×
                  </div>
                </div>
                <div className="border-b border-[#EFEFEA] px-[18px] py-[14px]">
                  <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[.07em] text-[#8A8A81]">Huidige metric</div>
                  <div className={cn(plexMono.className, "text-[13px] font-semibold")}>
                    {isPF ? currentBase : `${currentBase}.${colCode}`}
                  </div>
                  <div className="mt-1 text-[11.5px] leading-relaxed text-[#7A7A72]">
                    {(catalog.find((x) => x.code === currentBase)?.label) || "Nog niet gekoppeld"} ·{" "}
                    {currentBase && formulaCodes.includes(currentBase) ? "rekent zichzelf" : "invoer uit Key Data"}
                  </div>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-[18px] py-[14px] pb-6">
                  <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[.07em] text-[#8A8A81]">Beschikbaar in Key Data</div>
                  <div className="flex flex-col gap-1.5">
                    {catalog.map((m) => {
                      const on = m.code === currentBase
                      return (
                        <div
                          key={m.code}
                          onClick={() => setMapping((prev) => ({ ...prev, [mapCell.key]: m.code }))}
                          className={cn(
                            "cursor-pointer rounded-lg border px-[11px] py-[9px]",
                            on ? "border-[#1F3A5F] bg-[#F2F5F9]" : "border-[#EDEDE7] bg-white",
                          )}
                        >
                          <div className="flex items-baseline justify-between gap-2">
                            <div className={cn(plexMono.className, "text-[11.5px] font-semibold")}>{m.code}</div>
                            <div className="text-[10.5px] text-[#9A9A92]">{m.kind}</div>
                          </div>
                          <div className="mt-0.5 text-[11.5px] text-[#6B6B64]">{m.label}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </aside>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
