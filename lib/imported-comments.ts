// General comments that come with an imported performance sheet ("On this upload" in the
// Excel intake). After an upload is imported they show up in the Comments card of the
// Portfolio Performance dashboard, next to the comments the deal team wrote.
import type { Comment } from "./mock-data"

const KEY = "alma-imported-comments"

interface StoredComment extends Comment {
  company: string
}

// Demo: the Testcase A upload (Fictus Capital Management, Aug 2026) is already imported.
const SEEDED: StoredComment[] = [
  {
    id: "upload-Fictus Capital Management-Aug 2026",
    company: "Fictus Capital Management",
    author: "Fictus CFO",
    period: "Aug 2026",
    createdAt: "2026-09-04",
    month: 7,
    role: "cfo",
    text: "The new clients won in 2026 (Client A, Client B, Client C, Client D, Client E, Client F and Client G) are all still ramping up towards their full ARR potential and therefore do not yet compensate for the ARR churned per 30-08 at Client H, Client I, Client J and Client K. To rebuild that base we have deliberately added cost in the accelerated Compliance and BI build-out and in the CPO, which remains EBITDA- and cash-neutral for the full year as it is funded by the CaaS overperformance versus budget and the savings from the months without a COO, with YTD normalized EBITDA ahead of budget confirming this. The CRM now shows the first leads on both propositions.",
  },
]

function stored(): StoredComment[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]")
  } catch {
    return []
  }
}

/** Called when a performance sheet is confirmed and saved: the general comment goes to the dashboard. */
export function saveImportedComment(company: string, period: string, text: string) {
  if (!text.trim()) return
  const id = `upload-${company}-${period}`
  const entry: StoredComment = {
    id,
    company,
    author: `${company.split(" ")[0]} CFO`,
    period,
    month: Math.max(0, ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(period.slice(0, 3).toLowerCase())),
    role: "cfo",
    createdAt: new Date().toISOString().slice(0, 10),
    text: text.trim(),
  }
  try {
    localStorage.setItem(KEY, JSON.stringify([...stored().filter((c) => c.id !== id), entry]))
  } catch {
    // demo only: storage may be blocked
  }
}

/** Imported comments for a company; a comment saved in the browser replaces the demo one with the same id. */
export function importedCommentsFor(company: string): Comment[] {
  const byId = new Map<string, StoredComment>()
  for (const c of [...SEEDED, ...stored()]) if (c.company === company) byId.set(c.id, c)
  return [...byId.values()].map(({ company: _c, ...c }) => c)
}
