// Master data per portfolio company (Key Data): company details, held by funds, add-ons and change history.
import { companies, funds } from "./mock-data"

// Lifecycle status shared by portfolio companies and add-ons
export const lifecycleStatuses = ["Active", "Exited", "Reserved capital", "Identified", "In process"] as const
export type Lifecycle = (typeof lifecycleStatuses)[number]

// Sector lookup per company id (not modelled on the company object)
export const sectorMap: Record<string, string> = {
  "medtech-group": "Healthcare",
  "fruit-op-je-werk": "Consumer",
  "cleanflow": "Cleantech",
  "logiserve": "Logistics",
  "datavault": "Technology",
  "retailplus": "Consumer",
  "nordic-payments": "Technology",
  "greenbox-logistics": "Logistics",
  "medisupply": "Healthcare",
  "aquatech": "Cleantech",
  "printwave": "Services",
  "urban-mobility": "Transport",
  "foodlab": "Consumer",
  "solarroof": "Energy",
  "purewater": "Cleantech",
  "circular-textiles": "Consumer",
  "edugrow": "Education",
  "agriloop": "Agriculture",
  "windpeak": "Energy",
  "cyberguard": "Technology",
  "brightcare": "Healthcare",
}

export const SECTORS = ["Healthcare", "Consumer", "Cleantech", "Logistics", "Technology", "Services", "Transport", "Energy", "Education", "Agriculture", "Information Technology"]

export const existingAddons = [
  { id: "1", name: "LogiPack BV", parentCompany: "GreenBox Logistics", acquisitionDate: "2023-06-15", value: 4.5, lifecycle: "Active" as Lifecycle },
  { id: "2", name: "SecureLayer Inc", parentCompany: "CyberGuard", acquisitionDate: "2024-05-01", value: 3.2, lifecycle: "Active" as Lifecycle },
  { id: "3", name: "CareClinics BV", parentCompany: "BrightCare", acquisitionDate: "2024-02-28", value: 8.0, lifecycle: "In process" as Lifecycle },
  { id: "4", name: "RoofMount GmbH", parentCompany: "SolarRoof", acquisitionDate: "2024-01-15", value: 6.5, lifecycle: "Reserved capital" as Lifecycle },
]

export const HOLDING_STATUSES = ["Portfolio", "Exited", "In process", "Identified"]
export const ADDON_TYPES = ["Acquisition", "Merger", "Carve-out"]
export const ADDON_STATUSES = ["Completed", "In process", "Identified", "Reserved capital"]

export interface FundHolding {
  id: string
  fundId: string
  entryDate: string // ISO date
  type: string
  status: string
  generalStatus: string
}

export interface Addon {
  id: string
  name: string
  type: string
  effectiveDate: string // ISO date
  entryEbitda: number
  status: string
}

export interface CompanyMaster {
  name: string
  sector: string
  description: string
  website: string
  country: string
  headOffice: string
  parent: string
  fiscalYearEnd: string
  currency: string
  origination: string
  bank: string
  dealTeam: string
  holdings: FundHolding[]
  addons: Addon[]
}

export interface Change {
  field: string
  from: string
  to: string
}

export interface HistoryEntry {
  id: string
  at: string // ISO timestamp
  by: string
  action: "Created" | "Updated"
  entity: "COMPANY" | "FUND" | "ADD-ON"
  name: string
  reason?: string
  changes: Change[]
}

const toIsoDate = (mmYYYY: string) => {
  const [mm, yyyy] = mmYYYY.split("-")
  return yyyy && mm ? `${yyyy}-${mm.padStart(2, "0")}-01` : mmYYYY
}

export function defaultMaster(companyId: string): { master: CompanyMaster; history: HistoryEntry[] } | null {
  const c = companies.find((x) => x.id === companyId)
  if (!c) return null
  const addons: Addon[] = existingAddons
    .filter((a) => a.parentCompany === c.name)
    .map((a) => ({
      id: `a-${a.id}`,
      name: a.name,
      type: "Acquisition",
      effectiveDate: a.acquisitionDate,
      entryEbitda: 0,
      status: a.lifecycle === "Active" ? "Completed" : a.lifecycle,
    }))
  const master: CompanyMaster = {
    name: c.name,
    sector: sectorMap[c.id] ?? "Services",
    description: "",
    website: "",
    country: "",
    headOffice: "",
    parent: "",
    fiscalYearEnd: "12-31",
    currency: "Euro",
    origination: "",
    bank: c.bank,
    dealTeam: c.investmentTeam.join(", "),
    holdings: [
      { id: "h-1", fundId: c.fundId, entryDate: toIsoDate(c.entryDate), type: "", status: c.exited ? "Exited" : "Portfolio", generalStatus: "" },
    ],
    addons,
  }
  const history: HistoryEntry[] = [
    { id: "seed", at: `${toIsoDate(c.entryDate)}T09:00:00`, by: "Data import", action: "Created", entity: "COMPANY", name: c.name, changes: [] },
  ]
  return { master, history }
}

export const fundLabel = (fundId: string) => funds.find((f) => f.id === fundId)?.shortName ?? fundId

export const COMPANY_FIELDS: { key: keyof Omit<CompanyMaster, "holdings" | "addons">; label: string; wide?: boolean; options?: string[] }[] = [
  { key: "name", label: "Company Name" },
  { key: "sector", label: "Sector", options: SECTORS },
  { key: "description", label: "Description", wide: true },
  { key: "website", label: "Website" },
  { key: "country", label: "Country" },
  { key: "headOffice", label: "Head Office Location" },
  { key: "parent", label: "Parent Company" },
  { key: "fiscalYearEnd", label: "Fiscal Year End" },
  { key: "currency", label: "Currency", options: ["Euro", "US Dollar", "British Pound"] },
  { key: "origination", label: "Origination" },
  { key: "bank", label: "Bank Name" },
  { key: "dealTeam", label: "Deal Team", wide: true },
]

const dash = (v: string | number) => (v === "" || v === undefined ? "—" : String(v))

// Everything that differs between two versions of the master data, grouped per entity for the history
export function diffMaster(before: CompanyMaster, after: CompanyMaster, by: string, reason: string): HistoryEntry[] {
  const at = new Date().toISOString()
  const out: HistoryEntry[] = []
  const mk = (entity: HistoryEntry["entity"], name: string, changes: Change[]): HistoryEntry => ({
    id: `${at}-${entity}-${name}-${out.length}`, at, by, action: "Updated", entity, name, reason: reason.trim() || undefined, changes,
  })

  const companyChanges: Change[] = []
  for (const f of COMPANY_FIELDS) {
    if (before[f.key] !== after[f.key]) companyChanges.push({ field: f.label, from: dash(before[f.key]), to: dash(after[f.key]) })
  }
  if (companyChanges.length) out.push(mk("COMPANY", after.name, companyChanges))

  const hLabels: [keyof FundHolding, string][] = [["fundId", "Fund"], ["entryDate", "Entry date"], ["type", "Type"], ["status", "Status"], ["generalStatus", "General status"]]
  for (const h of before.holdings) {
    const n = after.holdings.find((x) => x.id === h.id)
    if (!n) { out.push(mk("FUND", fundLabel(h.fundId), [{ field: "Held by fund", from: "held", to: "removed" }])); continue }
    const ch: Change[] = []
    for (const [k, label] of hLabels) {
      if (h[k] !== n[k]) ch.push({ field: label, from: k === "fundId" ? fundLabel(h[k]) : dash(h[k]), to: k === "fundId" ? fundLabel(n[k]) : dash(n[k]) })
    }
    if (ch.length) out.push(mk("FUND", fundLabel(n.fundId), ch))
  }
  for (const n of after.holdings) {
    if (!before.holdings.some((x) => x.id === n.id)) out.push(mk("FUND", fundLabel(n.fundId), [{ field: "Held by fund", from: "—", to: `added (entry ${dash(n.entryDate)})` }]))
  }

  const aLabels: [keyof Addon, string][] = [["name", "Add-on"], ["type", "Type"], ["effectiveDate", "Effective date"], ["entryEbitda", "Entry norm. EBITDA"], ["status", "Status"]]
  for (const a of before.addons) {
    const n = after.addons.find((x) => x.id === a.id)
    if (!n) { out.push(mk("ADD-ON", a.name, [{ field: "Add-on", from: "present", to: "removed" }])); continue }
    const ch: Change[] = []
    for (const [k, label] of aLabels) {
      if (a[k] !== n[k]) ch.push({ field: label, from: dash(a[k]), to: dash(n[k]) })
    }
    if (ch.length) out.push(mk("ADD-ON", n.name, ch))
  }
  for (const n of after.addons) {
    if (!before.addons.some((x) => x.id === n.id)) out.push(mk("ADD-ON", n.name || "New add-on", [{ field: "Add-on", from: "—", to: `added (${dash(n.type)}, ${dash(n.effectiveDate)})` }]))
  }
  return out
}
