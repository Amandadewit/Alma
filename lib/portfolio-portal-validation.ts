import { portalSections, type FieldDef } from "./portfolio-portal-config"

export type CheckLevel = "ok" | "warning" | "error"

export interface CheckItem {
  level: CheckLevel
  message: string
}

export interface SectionResult {
  level: CheckLevel
  filled: number
  total: number
  requiredMissing: number
  items: CheckItem[]
}

export type FormValues = Record<string, string>

function parseNum(v: string | undefined): number | null {
  if (v === undefined || v.trim() === "") return null
  const n = Number(v.replace(",", "."))
  return Number.isFinite(n) ? n : null
}

const DELTA_THRESHOLD = 0.3

function deltaCheck(field: FieldDef, value: number): CheckItem | null {
  if (field.prior === undefined || field.prior === 0) return null
  const delta = (value - field.prior) / Math.abs(field.prior)
  if (Math.abs(delta) > DELTA_THRESHOLD) {
    const pct = Math.round(delta * 100)
    return {
      level: "warning",
      message: `${field.label} ${pct > 0 ? "up" : "down"} ${Math.abs(pct)}% vs. prior month — please confirm and explain in comments.`,
    }
  }
  return null
}

export function validateSection(sectionId: string, values: FormValues): SectionResult {
  const section = portalSections.find((s) => s.id === sectionId)!
  const items: CheckItem[] = []
  let filled = 0
  let requiredMissing = 0

  for (const field of section.fields) {
    const raw = values[field.key]
    const hasValue = raw !== undefined && raw.trim() !== ""
    if (hasValue) filled++

    if (field.required && !hasValue) {
      requiredMissing++
      items.push({ level: "error", message: `${field.label} is required.` })
      continue
    }

    if (field.type === "number" || field.type === "percent") {
      const num = parseNum(raw)
      if (hasValue && num === null) {
        items.push({ level: "error", message: `${field.label} must be a valid number.` })
        continue
      }
      if (num !== null) {
        if (num < 0 && field.key !== "netIncome") {
          items.push({ level: "warning", message: `${field.label} is negative — confirm this is correct.` })
        }
        const d = deltaCheck(field, num)
        if (d) items.push(d)
      }
    }
  }

  // Cross-field checks
  if (sectionId === "pnl") {
    const rev = parseNum(values.revenue)
    const ebitda = parseNum(values.ebitda)
    if (rev !== null && ebitda !== null && rev > 0 && ebitda > rev) {
      items.push({ level: "error", message: "EBITDA exceeds Revenue — check your figures." })
    }
  }
  if (sectionId === "balance") {
    const debt = parseNum(values.totalDebt)
    const cash = parseNum(values.cash)
    const ebitda = parseNum(values.ebitda)
    if (debt !== null && cash !== null && ebitda !== null && ebitda > 0) {
      const leverage = (debt - cash) / (ebitda * 12)
      if (leverage > 6) {
        items.push({
          level: "warning",
          message: `Net leverage ~${leverage.toFixed(1)}x EBITDA is above the 6.0x covenant threshold.`,
        })
      }
    }
  }

  const hasError = items.some((i) => i.level === "error")
  const hasWarning = items.some((i) => i.level === "warning")
  const level: CheckLevel = hasError ? "error" : hasWarning ? "warning" : "ok"

  return {
    level,
    filled,
    total: section.fields.length,
    requiredMissing,
    items,
  }
}

export function validateAll(values: FormValues): Record<string, SectionResult> {
  const out: Record<string, SectionResult> = {}
  for (const s of portalSections) out[s.id] = validateSection(s.id, values)
  return out
}

export function canSubmit(results: Record<string, SectionResult>): boolean {
  return Object.values(results).every((r) => r.level !== "error")
}

export function warningCount(results: Record<string, SectionResult>): number {
  return Object.values(results).reduce(
    (acc, r) => acc + r.items.filter((i) => i.level === "warning").length,
    0,
  )
}
