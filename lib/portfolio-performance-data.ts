// Monthly P&L waterfall for the Performance tab's financial summary table and
// chart. The underlying monthly curves were modelled on Sure Operations and
// are scaled per company against that anchor so every company's numbers stay
// consistent with the ytd/fy figures already shown elsewhere in the app.
import type { Company } from "./mock-data"

export const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
export const LAST_ACTUAL = 7

const ANCHOR_REVENUE_LTM = 41.7
const ANCHOR_MARGIN_LE = 0.19

const MA_SHAPE = [0.163, 0.155, 0.172, 0.168, 0.179, 0.183, 0.176, 0.178, 0.181, 0.184, 0.186, 0.19]
const MB_SHAPE = [0.17, 0.17, 0.174, 0.174, 0.176, 0.178, 0.178, 0.18, 0.18, 0.182, 0.184, 0.186]
const MLY_SHAPE = [0.158, 0.15, 0.164, 0.161, 0.17, 0.172, 0.166, 0.17, 0.172, 0.175, 0.177, 0.18]

// Revenue composition shapes (own IP / other recurring / non-recurring), summing to ~1 unit/month at the anchor.
const OWN_A = [1.80, 1.84, 1.90, 1.96, 2.03, 2.10, 2.14, 2.20, 2.27, 2.33, 2.39, 2.46]
const OWN_B = [1.78, 1.82, 1.86, 1.90, 1.95, 1.99, 2.03, 2.07, 2.11, 2.15, 2.19, 2.23]
const OWN_LY = [1.55, 1.58, 1.62, 1.66, 1.71, 1.75, 1.79, 1.83, 1.87, 1.91, 1.95, 1.99]
const OTH_A = [0.78, 0.76, 0.77, 0.75, 0.76, 0.74, 0.72, 0.73, 0.74, 0.75, 0.76, 0.77]
const OTH_B = [0.80, 0.81, 0.82, 0.83, 0.84, 0.85, 0.86, 0.87, 0.88, 0.89, 0.90, 0.91]
const OTH_LY = [0.76, 0.77, 0.78, 0.79, 0.80, 0.81, 0.82, 0.83, 0.84, 0.85, 0.86, 0.87]
const OTX_A = [0.44, 0.28, 0.54, 0.39, 0.49, 0.51, 0.33, 0.37, 0.41, 0.43, 0.43, 0.49]
const OTX_B = [0.37, 0.35, 0.47, 0.42, 0.46, 0.46, 0.41, 0.41, 0.41, 0.41, 0.46, 0.46]
const OTX_LY = [0.40, 0.31, 0.52, 0.40, 0.50, 0.52, 0.33, 0.36, 0.39, 0.44, 0.47, 0.49]

export interface MonthMetrics {
  [key: string]: number
}

export interface RowMeta {
  key: string
  label?: string
  kids?: string[]
  sub?: boolean
  pct?: string
  invert?: boolean
}

export const ROWS: RowMeta[] = [
  { key: "Revenue", kids: ["Recurring revenue own IP", "Recurring revenue other", "Non-recurring revenue"] },
  { key: "COGS" },
  { key: "Gross profit", sub: true },
  { key: "Gross margin %", label: "margin %", pct: "Gross profit" },
  { key: "OPEX", label: "Total operational cost", kids: ["Personnel costs", "Management fees", "Other personnel cost", "Automation expenses", "Housing costs", "Sales & marketing", "General & office"] },
  { key: "EBITDA", sub: true },
  { key: "EBITDA margin %", label: "margin %", pct: "EBITDA" },
  { key: "Normalization", label: "Normalizations (add-back)" },
  { key: "N. EBITDA", sub: true },
  { key: "N. EBITDA margin %", label: "margin %", pct: "N. EBITDA" },
  { key: "Capitalized dev. cost" },
  { key: "Cash EBITDA", sub: true },
  { key: "Cash EBITDA margin %", label: "margin %", pct: "Cash EBITDA" },
  { key: "Free CF", label: "Free cash flow", sub: true },
]

function buildMonth(marginArr: number[], i: number, own: number[], oth: number[], otx: number[], revScale: number): MonthMetrics {
  const rOwn = own[i] * revScale, rOth = oth[i] * revScale, rOtx = otx[i] * revScale
  const r = rOwn + rOth + rOtx
  const e = r * marginArr[i]
  const cogs = -r * 0.077, gp = r + cogs, opex = e - gp
  const w = [0.455, 0.098, 0.043, 0.050, 0.032, 0.048, 0.042 + 0.004 * (i % 3)]
  const ws = w.reduce((x, y) => x + y, 0)
  const oc = w.map((x) => (opex * x) / ws)
  const tx = (0.012 + 0.004 * (i % 3)) * revScale
  const rs = 0.008 * (i % 2) * revScale
  const on = (0.006 + 0.002 * (i % 4)) * revScale
  const norm = tx + rs + on
  const cap = (0.04 + (i % 2) * 0.01) * revScale
  const ne = e + norm, ce = ne + cap
  // net working capital (month-end balance)
  const recv = r * 1.35, orec = r * (0.28 + 0.01 * (i % 3)), pay = -r * 0.8, dfr = -r * (0.55 + 0.01 * (i % 4))
  const nwc = recv + orec + pay + dfr
  const ocf = ce * 0.88 - 0.015 * (i % 3) * revScale
  const icf = -(0.05 + (i % 4) * 0.012) * revScale
  return {
    "Operating CF": ocf, "Investment CF": icf, "Free CF": ocf + icf,
    Revenue: r, "Recurring revenue own IP": rOwn, "Recurring revenue other": rOth, "Non-recurring revenue": rOtx,
    COGS: cogs, "Gross profit": gp,
    "Personnel costs": oc[0], "Management fees": oc[1], "Other personnel cost": oc[2],
    "Automation expenses": oc[3], "Housing costs": oc[4], "Sales & marketing": oc[5], "General & office": oc[6],
    OPEX: opex, EBITDA: e,
    "Transaction costs": tx, "Restructuring costs": rs, "Other normalizations": on,
    Normalization: norm, "N. EBITDA": ne,
    "Capitalized dev. cost": cap, "Cash EBITDA": ce,
    Total: r,
    "Trade receivables": recv, "Other receivables": orec, "Trade payables": pay, "Deferred revenue & accruals": dfr, NWC: nwc,
  }
}

export interface CompanySeries {
  A: MonthMetrics[]
  B: MonthMetrics[]
  LY: MonthMetrics[]
}

export function buildCompanySeries(company: Company): CompanySeries {
  const revScale = company.financials.revenue.fy.ltm / ANCHOR_REVENUE_LTM
  const marginScale = (company.financials.normalizedEbitdaPercent.fy.le / 100) / ANCHOR_MARGIN_LE
  const MA = MA_SHAPE.map((v) => v * marginScale)
  const MB = MB_SHAPE.map((v) => v * marginScale)
  const MLY = MLY_SHAPE.map((v) => v * marginScale)
  const A = MON.map((_, i) => buildMonth(MA, i, OWN_A, OTH_A, OTX_A, revScale))
  const B = MON.map((_, i) => buildMonth(MB, i, OWN_B, OTH_B, OTX_B, revScale))
  const LY = MON.map((_, i) => buildMonth(MLY, i, OWN_LY, OTH_LY, OTX_LY, revScale))
  return { A, B, LY }
}
