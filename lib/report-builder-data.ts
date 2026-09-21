// Fund / portfolio / company data for the Excel Report Builder, transcribed
// from the client report templates (Vortex Capital Partners, Holland Capital).

export interface ReportFund {
  id: string
  client: string
  clientShort: string
  fund: string
  format: "vortex" | "holland"
  accent: string
  asOf: string
  period: string
  currency: string
  unit: string
}

export const FUNDS: ReportFund[] = [
  {
    id: "vcp3",
    client: "Vortex Capital Partners",
    clientShort: "Vortex",
    fund: "Fund III",
    format: "vortex",
    accent: "#1E4034",
    asOf: "30 juni 2026",
    period: "Q2 2026",
    currency: "€",
    unit: "€ x 1,000",
  },
  {
    id: "gbo4",
    client: "Holland Capital",
    clientShort: "Holland Capital",
    fund: "HC-GBO IV",
    format: "holland",
    accent: "#1F3A5F",
    asOf: "30 juni 2026",
    period: "Q2 2026",
    currency: "EUR",
    unit: "EURk",
  },
  {
    id: "gbo5",
    client: "Holland Capital",
    clientShort: "Holland Capital",
    fund: "HC-GBO V",
    format: "holland",
    accent: "#1F3A5F",
    asOf: "30 juni 2026",
    period: "Q2 2026",
    currency: "EUR",
    unit: "EURk",
  },
]

// ---------- Vortex Fund III ----------
export interface VortexPosition {
  name: string
  invested: string
  geo: string
  industry: string
  own: number
  hold: number
  cap: number
  fmv: number
  book: number
  gain: number
  mom: number
}

export const VORTEX_PORTFOLIO: VortexPosition[] = [
  { name: "Enable U", invested: "nov-20", geo: "NL", industry: "IT integration specialist", own: 0.627, hold: 5.73, cap: 7245059, fmv: 15033407, book: 7245059, gain: 7788348, mom: 2.075 },
  { name: "Health Cloud Initiative", invested: "sep-21", geo: "NL", industry: "Healthcare business software", own: 0.448, hold: 4.82, cap: 11323500, fmv: 26433943, book: 11323500, gain: 15110443, mom: 2.334 },
  { name: "Dawn Technology", invested: "mrt-22", geo: "NL", industry: "Software development", own: 0.515, hold: 4.30, cap: 8868243, fmv: 10618797, book: 8868243, gain: 1750554, mom: 1.197 },
  { name: "Kitry", invested: "apr-22", geo: "BE", industry: "EHS software", own: 0.886, hold: 4.27, cap: 4634511, fmv: 5271888, book: 4634511, gain: 637377, mom: 1.138 },
  { name: "Kees de Boekhouder", invested: "jun-22", geo: "NL", industry: "Bookkeeping-as-a-Service", own: 0.520, hold: 4.12, cap: 4834373, fmv: 11195922, book: 4834373, gain: 6361549, mom: 2.316 },
  { name: "Eneve", invested: "nov-22", geo: "NL, ES, PT, UK", industry: "Energy software and services", own: 0.726, hold: 3.68, cap: 9405434, fmv: 38820727, book: 9405434, gain: 29415293, mom: 4.127 },
  { name: "Verius Software", invested: "nov-23", geo: "NL", industry: "Software for the public domain", own: 0.795, hold: 2.70, cap: 6224608, fmv: 7172692, book: 6224608, gain: 948084, mom: 1.152 },
]

export interface CompanySheetRow {
  label: string
  fmt: "num" | "pct" | "int" | "text" | "years" | "eur" | "mom"
  v: (number | string)[]
  indent?: boolean
  rule?: boolean
  gap?: boolean
}

export interface CompanySheet {
  company: string
  section: string
  cols: { y: string; t: string }[]
  rows: CompanySheetRow[]
  valuation: { label: string; v: number | string; fmt: string }[]
}

const enableU: CompanySheet = {
  company: "Enable U",
  section: "2.2.1 Quarterly report Q2 2026 Enable U",
  cols: [
    { y: "2019 FY", t: "Actual" }, { y: "2025 FY", t: "Actual" }, { y: "2026 FY", t: "Budget" },
    { y: "2026 LTM", t: "Actual" }, { y: "2026 YTD", t: "Budget" }, { y: "2026 YTD", t: "Actual" },
  ],
  rows: [
    { label: "Revenue", fmt: "num", v: [8781, 24272, 27518, 24205, 13337, 11958] },
    { label: "% growth (y-o-y)", fmt: "pct", indent: true, v: [0.170956, 0.01599, 0.133734, -0.051008, 0.109014, -0.005985] },
    { label: "Gross profit", fmt: "num", gap: true, v: [3123, 20555, 24064, 21140, 11608, 10356] },
    { label: "% of revenues", fmt: "pct", indent: true, v: [0.355654, 0.846861, 0.874482, 0.873373, 0.870361, 0.866031] },
    { label: "EBITDA", fmt: "num", gap: true, v: [910, 2017, 3561, 2664, 1095, 1142] },
    { label: "Normalized EBITDA", fmt: "num", rule: true, v: [910, 2572, 3919, 3166, 1328, 1326] },
    { label: "% EBITDA margin", fmt: "pct", indent: true, v: [0.103633, 0.105966, 0.142416, 0.130799, 0.099573, 0.110888] },
    { label: "EBIT", fmt: "num", gap: true, v: [657, -983, 3008, 602, 803, 567] },
    { label: "Normalized EBIT", fmt: "num", v: [657, -428, 3365, 1103, 1036, 750] },
    { label: "% EBIT margin", fmt: "pct", indent: true, v: [0.074821, -0.017633, 0.122284, 0.045569, 0.077679, 0.062720] },
    { label: "Normalizations", fmt: "num", gap: true, v: ["--", 555, 358, 502, 233, 184] },
    { label: "Capital expenditures", fmt: "num", v: [-268, -851, -1170, -926, -650, -508] },
    { label: "Net debt / (cash)", fmt: "num", v: ["N/M", 3196, 3000, 4202, 4500, 4202] },
    { label: "# FTE", fmt: "int", v: [56, 150, 175, 155, 172, 155] },
  ],
  valuation: [
    { label: "Status", v: "In portfolio", fmt: "text" },
    { label: "Holding period", v: 5.726, fmt: "years" },
    { label: "Capital invested", v: 7245059, fmt: "eur" },
    { label: "Fair market valuation", v: 15033873, fmt: "eur" },
    { label: "Current indicative gain", v: 7788814, fmt: "eur" },
    { label: "Current indicative MoM", v: 2.075, fmt: "mom" },
  ],
}

// ---------- Holland Capital ----------
export interface HollandPosition {
  name: string
  inv: string
  exit: string
  hold: string
  stake: number | null
  amt: number
  real: number
  fmv: number
  tot: number
  mm: number
  irr: number | "n/a"
  realized?: boolean
}

const gbo4Portfolio: HollandPosition[] = [
  { name: "AMP Groep", inv: "sep-20", exit: "n/a", hold: "", stake: 0.5971, amt: -7665, real: 22, fmv: 7465, tot: 7487, mm: 0.98, irr: "n/a" },
  { name: "Magnus Energy", inv: "nov-20", exit: "n/a", hold: "", stake: 0.6419, amt: -6044, real: 0, fmv: 12364, tot: 12364, mm: 2.05, irr: 0.16 },
  { name: "Magnus Black", inv: "nov-20", exit: "jul-24", hold: "3,6 years", stake: null, amt: -1158, real: 2226, fmv: 0, tot: 2226, mm: 1.92, irr: 0.18, realized: true },
  { name: "Emixa", inv: "nov-20", exit: "n/a", hold: "", stake: 0.5826, amt: -14310, real: 0, fmv: 17905, tot: 17905, mm: 1.25, irr: 0.05 },
  { name: "TSC", inv: "dec-20", exit: "n/a", hold: "", stake: 0.4098, amt: -6801, real: 0, fmv: 11415, tot: 11415, mm: 1.68, irr: 0.15 },
  { name: "YWCC", inv: "jun-21", exit: "sep-25", hold: "5,0 years", stake: null, amt: -4125, real: 22824, fmv: 3479, tot: 26303, mm: 6.38, irr: 0.53, realized: true },
  { name: "KidsLodge", inv: "sep-21", exit: "n/a", hold: "", stake: 0.6796, amt: -5923, real: 0, fmv: 6132, tot: 6132, mm: 1.04, irr: 0.01 },
  { name: "YOEP", inv: "nov-21", exit: "n/a", hold: "", stake: 0.8173, amt: -5509, real: 0, fmv: 0, tot: 0, mm: 0, irr: "n/a" },
  { name: "Da Vinci", inv: "okt-22", exit: "n/a", hold: "", stake: 0.6737, amt: -4895, real: 0, fmv: 4928, tot: 4928, mm: 1.01, irr: 0 },
  { name: "Cuccibu", inv: "nov-22", exit: "n/a", hold: "", stake: 0.7054, amt: -5323, real: 91, fmv: 4113, tot: 4204, mm: 0.79, irr: "n/a" },
  { name: "Beyonder", inv: "apr-23", exit: "n/a", hold: "", stake: 0.4032, amt: -6046, real: 0, fmv: 4597, tot: 4597, mm: 0.76, irr: "n/a" },
  { name: "Attenza", inv: "jun-23", exit: "n/a", hold: "", stake: 0.79, amt: -3239, real: 0, fmv: 3138, tot: 3138, mm: 0.97, irr: "n/a" },
  { name: "Supply Chain Group", inv: "jul-23", exit: "n/a", hold: "", stake: 0.6537, amt: -8060, real: 240, fmv: 7921, tot: 8161, mm: 1.01, irr: 0.01 },
  { name: "Lopital", inv: "aug-23", exit: "n/a", hold: "", stake: 0.95, amt: -9495, real: 0, fmv: 11066, tot: 11066, mm: 1.17, irr: 0.05 },
  { name: "Adjust", inv: "jan-24", exit: "n/a", hold: "", stake: 0.4538, amt: -4625, real: 0, fmv: 1743, tot: 1743, mm: 0.38, irr: "n/a" },
]

export interface HollandSheetRow {
  label: string
  fmt: "num" | "pct"
  v: (number | string)[]
  indent?: boolean
  rule?: boolean
  gap?: boolean
}

export interface HollandCompanySheet {
  company: string
  section: string
  cols: string[]
  colKind: ("a" | "b" | "le")[]
  rows: HollandSheetRow[]
  valuationText: string
  valuationInputs: { label: string; v: string }[]
}

const powerGroup: HollandCompanySheet = {
  company: "Power Group",
  section: "2.1 Power Group – HC-GBO V – Q2 2026",
  cols: ["2024A", "2025A", "2026A YTD", "2026B YTD", "2026A LTM", "2026B", "2026LE"],
  colKind: ["a", "a", "a", "b", "a", "b", "le"],
  rows: [
    { label: "Sales", fmt: "num", v: [27960, 27960, 16511, 17192, 28858, 35106, 37426] },
    { label: "Growth %", fmt: "pct", indent: true, v: ["", "", 0.057516, 0.101134, 0.032117, 0.255579, 0.338555] },
    { label: "Gross margin", fmt: "num", v: [10986, 10986, 5420, 6115, 9902, 12686, 12421] },
    { label: "Gross margin %", fmt: "pct", indent: true, v: ["", 0.392918, 0.328266, 0.355689, 0.343128, 0.361363, 0.331882] },
    { label: "Opex", fmt: "num", v: [-6954, -6954, -3838, -3951, -7268, -7849, -7966] },
    { label: "EBITDA", fmt: "num", rule: true, v: ["", 4032, 1582, 2164, 2634, 4837, 4455] },
    { label: "EBITDA %", fmt: "pct", indent: true, v: ["", 0.144206, 0.095815, 0.125872, 0.091275, 0.137783, 0.119035] },
    { label: "Depreciation", fmt: "num", v: [-2693, -2693, -1526, -1476, -2996, -3271, -3069] },
    { label: "EBITA", fmt: "num", v: ["", 1339, 56, 688, -362, 1566, 1386] },
    { label: "EBITA %", fmt: "pct", indent: true, v: ["", 0.047890, 0.003392, 0.040019, -0.012544, 0.044608, 0.037033] },
    { label: "Net debt (cash)", fmt: "num", gap: true, v: [15043, "", 16267, "n.a.", 16267, "n.a.", "n.a."] },
  ],
  valuationText:
    "Applying a multiple of 7x LTM EBITDA leads to an enterprise value of EUR 18.4m. As a result, the fair market value for the stake of HC-GBO V is EUR 2.5m, which is EUR 1.1m lower than the previous quarter. This implies a loss of EUR 12.5m on a total investment of EUR 15.0m (0.2x money multiple per Q2 2026).",
  valuationInputs: [
    { label: "Toegepaste multiple (x)", v: "7,0x" },
    { label: "Fair market value aandeel fonds", v: "EUR 2.467k" },
    { label: "FMV vorig kwartaal", v: "EUR 3.567k" },
    { label: "Totale investering", v: "EUR 14.958k" },
  ],
}

export const gbo5Portfolio: HollandPosition[] = [
  { name: "Power Group", inv: "apr-24", exit: "n/a", hold: "", stake: 0.6612, amt: -14958, real: 0, fmv: 2467, tot: 2467, mm: 0.16, irr: "n/a" },
]

export const HOLLAND_PORTFOLIOS: Record<string, HollandPosition[]> = { gbo4: gbo4Portfolio, gbo5: gbo5Portfolio }
// Fondsniveau gross IRR komt uit het fondsmodel, niet uit de regels.
export const FUND_IRR: Record<string, number | "n/a"> = { gbo4: 0.09, gbo5: "n/a" }

export interface ReportCompany {
  id: string
  name: string
  meta: string
  ready: boolean
  source: string
  realized?: boolean
}

export const COMPANIES: Record<string, ReportCompany[]> = {
  vcp3: VORTEX_PORTFOLIO.map((c, i) => ({
    id: "v" + i,
    name: c.name,
    meta: c.industry,
    ready: i === 0,
    source: i === 0 ? "Mgt. rapportage Q2 2026" : "Cijfers Q2 nog niet aangeleverd",
  })),
  gbo4: gbo4Portfolio.map((c, i) => ({
    id: "h" + i,
    name: c.name,
    meta: c.realized ? "Gerealiseerd · " + c.exit : "In portefeuille · " + c.inv,
    ready: false,
    source: c.realized ? "Exit — alleen portfolio-regel" : "P&L Q2 nog niet aangeleverd",
    realized: !!c.realized,
  })),
  gbo5: [{ id: "p0", name: "Power Group", meta: "Technology · OBO · apr-24", ready: true, source: "Kwartaalrapportage Q2 2026" }],
}

export const COMPANY_SHEETS: Record<string, CompanySheet | HollandCompanySheet> = { v0: enableU, p0: powerGroup }
export const GBO4_PORTFOLIO = gbo4Portfolio

// ---------- metric catalog (cell-mapping side panel) ----------
export interface MetricCatalogEntry {
  code: string
  label: string
  kind: "invoer" | "formule"
}

export const PC_ROWS = ["Sales", "Growth %", "Gross margin", "Gross margin %", "Opex", "EBITDA", "EBITDA %", "Depreciation", "EBITA", "EBITA %", "Net debt (cash)"]
export const PC_ROW_CODES: Record<string, string> = {
  Sales: "REV", "Growth %": "REV.GRW", "Gross margin": "GP", "Gross margin %": "GP.MRG",
  Opex: "OPEX", EBITDA: "EBITDA", "EBITDA %": "EBITDA.MRG", Depreciation: "DEPR",
  EBITA: "EBITA", "EBITA %": "EBITA.MRG", "Net debt (cash)": "NETDEBT",
}
export const PC_COLS = ["2024A", "2025A", "2026A YTD", "2026B YTD", "2026A LTM", "2026B", "2026LE"]
export const PC_COL_CODES = ["FY24.A", "FY25.A", "YTD26.A", "YTD26.B", "LTM26.A", "FY26.B", "FY26.LE"]
export const PC_FORMULA = ["REV.GRW", "GP.MRG", "EBITDA.MRG", "EBITA.MRG"]
export const PC_CATALOG: MetricCatalogEntry[] = [
  { code: "REV", label: "Revenue / net sales", kind: "invoer" },
  { code: "GP", label: "Gross margin (brutomarge)", kind: "invoer" },
  { code: "OPEX", label: "Operating expenses", kind: "invoer" },
  { code: "EBITDA", label: "EBITDA (reported)", kind: "invoer" },
  { code: "DEPR", label: "Afschrijvingen", kind: "invoer" },
  { code: "EBITA", label: "EBITA", kind: "invoer" },
  { code: "NETDEBT", label: "Net debt / (cash)", kind: "invoer" },
  { code: "FTE", label: "Aantal FTE (eind periode)", kind: "invoer" },
  { code: "REV.GRW", label: "Omzetgroei y-o-y", kind: "formule" },
  { code: "GP.MRG", label: "Brutomarge %", kind: "formule" },
  { code: "EBITDA.MRG", label: "EBITDA-marge %", kind: "formule" },
  { code: "EBITA.MRG", label: "EBITA-marge %", kind: "formule" },
]

export const PF_COLS = ["Date of investment", "Date of exit", "Holding period", "Equity stake %", "Amount invested", "Realized proceeds", "Fair market value", "Realized + FMV", "Gross MM", "Gross IRR"]
export const PF_COL_CODES = ["DATE.INV", "DATE.EXIT", "HOLD", "STAKE", "AMT.INV", "PROC.REAL", "FMV", "TOT.RFMV", "MM.GROSS", "IRR.GROSS"]
export const PF_FORMULA = ["HOLD", "TOT.RFMV", "MM.GROSS"]
export const PF_CATALOG: MetricCatalogEntry[] = [
  { code: "DATE.INV", label: "Datum eerste investering", kind: "invoer" },
  { code: "DATE.EXIT", label: "Exitdatum (leeg als in portefeuille)", kind: "invoer" },
  { code: "STAKE", label: "Equity stake % fonds", kind: "invoer" },
  { code: "AMT.INV", label: "Amount invested (negatief)", kind: "invoer" },
  { code: "PROC.REAL", label: "Gerealiseerde opbrengsten", kind: "invoer" },
  { code: "FMV", label: "Fair market value", kind: "invoer" },
  { code: "BOOK", label: "Book value", kind: "invoer" },
  { code: "IRR.GROSS", label: "Gross IRR (uit fondsmodel)", kind: "invoer" },
  { code: "HOLD", label: "Holding period = peildatum -/- investeringsdatum", kind: "formule" },
  { code: "TOT.RFMV", label: "Realized + FMV", kind: "formule" },
  { code: "MM.GROSS", label: "Gross MM = (realized + FMV) / invested", kind: "formule" },
]
