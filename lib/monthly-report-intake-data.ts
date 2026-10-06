// Logic around the uploaded monthly-report workbooks of the Excel intake demo.
// Two test cases: A = lender report (Visionplanner export, EUR) and B = month-end close (Alma template, EUR k).
// Sign rule in Alma: income +, costs -, balance-sheet assets +, equity and liabilities -
// (credit side), with net debt and leverage as the one positive exception.
import { CASE_A } from "./intake-case-a"
import { CASE_B } from "./intake-case-b"

export type Section = "IS" | "BS" | "CF" | "KPI" | "HR"
export type Decision = "overwrite" | "current" | "keep"

export interface IntakeRow {
  row: number // row number in the main sheet
  code: number // metric code in the Alma data model
  label: string
  kind: "DATA" | "RANGE" | "FORMULA"
  sec: Section
  v: (number | null)[] // Jan..Aug
  ytd: number | null
  le: number | null
  ly: number | null
  calc?: number[] // components that make up this total (negative code = subtract)
  pct?: number[] // [numerator code, denominator code]: margin, recalculated and not stored
  flip?: "cost" | "credit" | "activated" // stored with the opposite sign
  isNew?: 1 // record not recognised by the saved mapping
  alias?: string // metric name in the data model when it differs from the sheet
  alma?: Record<string, number> // what Alma already holds for earlier months where it differs from the file
}

export interface LtmRow { code: number; label: string; kind: string; v: (number | null)[] }
export interface NormRow { label: string; kind: "RANGE" | "DATA" | "SPEC" | "CHECK"; v: (number | null)[]; ytd: number | null }

export interface RawCase {
  id: "A" | "B"
  fileName: string
  company: string
  period: string
  formatName: string
  unitNote: string
  tabs: { name: string; kind: "main" | "ltm" | "norm" | "summary" }[]
  extra: { key: "ytd" | "le" | "ly"; label: string }[]
  ytdTol: number
  balance: { assets: number; liab: number; tol: number; reported?: number }
  uploadComment: string
  contextComment: string
  fieldComments: Record<string, string>
  claims: { text: string; code: number; expect: number }[]
  rows: IntakeRow[]
  ltm?: LtmRow[]
  norm?: NormRow[]
  summary?: { label: string; month: string | null; ytd: string | null }[]
  summaryExtra?: { label: string; text: string }[]
  board?: string
}

export const MONTHS = ["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug"]
export const CURRENT = 7

export const SECTION_LABEL: Record<Section, string> = {
  IS: "Income statement", BS: "Balance sheet", CF: "Cash flow", KPI: "Company KPIs", HR: "HR KPIs",
}

export const nl = (v: number, d = 0) =>
  v.toLocaleString("nl-NL", { minimumFractionDigits: d, maximumFractionDigits: d }).replace("-", "−")
export const fmtAmt = (v: number) => nl(v, Math.abs(v) < 100 && v !== 0 ? 1 : 0)

export function buildCase(raw: RawCase) {
  const ROWS = raw.rows
  const ROW_BY_CODE: Record<number, IntakeRow> = Object.fromEntries(ROWS.map((r) => [r.code, r]))
  const LTM_ROWS = raw.ltm ?? []
  const NORM_ROWS = raw.norm ?? []
  const COLS = raw.id === "A" ? ["B", "C", "D", "E", "F", "G", "H", "I"] : ["F", "G", "H", "I", "J", "K", "L", "M"]
  const mainSheet = raw.tabs.find((t) => t.kind === "main")!.name

  const isPct = (r: IntakeRow) => !!r.pct || r.label.includes("Margin %") || r.label.includes("margin %") || r.label === "Debt Ratio" || r.label.endsWith(" %")
  const isStoredRow = (r: IntakeRow) => !isPct(r)
  const isUnmapped = (r: IntakeRow) => !!r.isNew
  const isFlow = (r: IntakeRow) => (r.sec === "IS" || r.sec === "CF") && !isPct(r) && r.ytd !== null
  const hasData = (r: IntakeRow) =>
    r.code === raw.balance.reported || r.v.some((x) => x !== null && x !== 0) || (r.ytd ?? 0) !== 0 || (r.le ?? 0) !== 0
  const cellRef = (r: IntakeRow, m: number) => `${mainSheet}!${COLS[m]}${r.row}`
  const stored = (r: IntakeRow, v: number) => (r.flip ? -v : v)

  const recalc = (r: IntakeRow, m = CURRENT): number | null => {
    if (r.pct) {
      const num = ROW_BY_CODE[r.pct[0]].v[m], den = ROW_BY_CODE[r.pct[1]].v[m]
      return num !== null && den ? (num / den) * 100 : null
    }
    if (!r.calc || r.calc.length === 0) return null
    return r.calc.reduce((a, cd) => a + (cd < 0 ? -1 : 1) * (ROW_BY_CODE[Math.abs(cd)].v[m] ?? 0), 0)
  }

  const almaAt = (r: IntakeRow, m: number): number => {
    const a = r.alma?.[String(m)]
    return a !== undefined ? a : r.v[m] ?? 0
  }
  const diffAt = (r: IntakeRow, m: number) => (r.v[m] ?? 0) - almaAt(r, m)
  const CHANGED_MONTHS = Array.from({ length: CURRENT }, (_, m) => m).filter((m) => ROWS.some((r) => r.alma?.[String(m)] !== undefined))

  // YTD for a line as Alma would hold it after the CFO's choices for the changed months
  const ytdAfter = (r: IntakeRow, decisions: Record<number, Decision>): number => {
    let sum = 0
    let aug = r.v[CURRENT] ?? 0
    for (let m = 0; m < CURRENT; m++) {
      const d = diffAt(r, m)
      const dec = decisions[m]
      if (d === 0) sum += r.v[m] ?? 0
      else if (dec === "overwrite") sum += r.v[m] ?? 0
      else if (dec === "current") { sum += almaAt(r, m); aug += d }
      else sum += almaAt(r, m)
    }
    return sum + aug
  }

  const ltmAfter = (code: number, decisions: Record<number, Decision>): { after: number; inFile: number } | null => {
    const l = LTM_ROWS.find((x) => x.code === code)
    const r = ROW_BY_CODE[code]
    if (!l || !r) return null
    const inFile = l.v[CURRENT] ?? 0
    let after = inFile
    for (let m = 0; m < CURRENT; m++) {
      const d = diffAt(r, m)
      if (d !== 0 && (decisions[m] === "keep" || decisions[m] === undefined)) after -= d
    }
    return { after, inFile }
  }

  // assets minus equity and liabilities per month
  const balanceDiff = (m: number) => (ROW_BY_CODE[raw.balance.assets].v[m] ?? 0) - (ROW_BY_CODE[raw.balance.liab].v[m] ?? 0)

  const fmtVal = (r: IntakeRow, v: number | null): string => {
    if (v === null) return ""
    if (isPct(r)) return nl(v, 1) + "%"
    if (raw.id === "B") {
      if (r.code === 4000003 || r.code === 4100003) return nl(v * 100, 1) + "%"
      if (r.code === 4100004 || r.code === 4100005) return nl(v, 1) + "%"
      if (r.code === 4100002) return nl(v, 2)
      if (r.code === 4100001) return nl(v, 0)
      if (r.sec === "HR") return nl(v, 1)
    }
    return fmtAmt(v)
  }

  return {
    raw, ROWS, ROW_BY_CODE, LTM_ROWS, NORM_ROWS, COLS, mainSheet, CHANGED_MONTHS,
    isPct, isStoredRow, isUnmapped, isFlow, hasData, cellRef, stored, recalc, almaAt, diffAt, ytdAfter, ltmAfter, balanceDiff, fmtVal,
  }
}

export type IntakeCase = ReturnType<typeof buildCase>

export const CASES: Record<"A" | "B", RawCase> = { A: CASE_A, B: CASE_B }
