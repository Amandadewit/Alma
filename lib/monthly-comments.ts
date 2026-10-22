// Demo comments per reporting month: one CFO comment per month, with numbers drawn from the
// company's own monthly figures.
import type { Company, Comment } from "./mock-data"
import { MON, LAST_ACTUAL, type MonthMetrics } from "./portfolio-performance-data"

const pct = (a: number, b: number) => (b ? ((a - b) / Math.abs(b)) * 100 : 0)
const sign = (v: number) => (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(1) + "%"
const iso = (m: number, day: number) => `2026-${String(Math.min(12, m + 2)).padStart(2, "0")}-${String(Math.min(28, day)).padStart(2, "0")}`

export function buildMonthlyComments(company: Company, A: MonthMetrics[], B: MonthMetrics[]): Comment[] {
  const out: Comment[] = []
  const cfo = `${company.name.split(" ")[0]} CFO`

  for (let m = 0; m <= LAST_ACTUAL; m++) {
    const rev = A[m].Revenue, revB = B[m].Revenue
    const ne = A[m]["N. EBITDA"], neB = B[m]["N. EBITDA"]
    const dRev = pct(rev, revB), dNe = pct(ne, neB)
    const ahead = dNe >= 0
    const mon = MON[m]
    const add = (c: Omit<Comment, "period" | "month">) => out.push({ ...c, period: `${mon} 2026`, month: m })

    // CFO, main commentary on the month
    add({
      id: `gen-cfo-${company.id}-${m}`, author: cfo, role: "cfo", createdAt: iso(m, 5 + (m % 6)),
      text: `Revenue €${rev.toFixed(1)}m (${sign(dRev)} vs budget), normalized EBITDA €${ne.toFixed(2)}m (${sign(dNe)} vs budget). ${
        ahead
          ? "Trading ahead of plan; recurring revenue keeps building and cost is in line with the budget."
          : "Below budget this month, mainly timing of new contracts and cost phasing. Recovery measures are in place for the coming months."
      }`,
    })
  }
  return out
}
