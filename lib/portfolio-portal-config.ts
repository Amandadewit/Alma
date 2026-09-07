import { LucideIcon, LineChart, Scale, Gauge, MessageSquare } from "lucide-react"

export type FieldType = "number" | "percent" | "text" | "textarea"

export interface FieldDef {
  key: string
  label: string
  type: FieldType
  unit?: string
  required?: boolean
  tooltip: string
  /** Prior month value, used for month-over-month delta validation. */
  prior?: number
  placeholder?: string
}

export interface SectionDef {
  id: string
  title: string
  icon: LucideIcon
  description: string
  fields: FieldDef[]
}

export const submissionPeriod = "May 2026"
export const priorPeriod = "Apr 2026"

export const portalSections: SectionDef[] = [
  {
    id: "pnl",
    title: "Profit & Loss",
    icon: LineChart,
    description: "Monthly income statement figures",
    fields: [
      {
        key: "revenue",
        label: "Revenue",
        type: "number",
        unit: "€M",
        required: true,
        prior: 2.42,
        placeholder: "0.00",
        tooltip:
          "Total net sales recognised in the reporting month, excluding VAT. Use accrual accounting consistent with prior submissions.",
      },
      {
        key: "cogs",
        label: "Cost of Goods Sold",
        type: "number",
        unit: "€M",
        prior: 1.05,
        placeholder: "0.00",
        tooltip: "Direct costs attributable to the goods/services sold in the period (materials, direct labour).",
      },
      {
        key: "ebitda",
        label: "EBITDA",
        type: "number",
        unit: "€M",
        required: true,
        prior: 0.58,
        placeholder: "0.00",
        tooltip:
          "Earnings before interest, taxes, depreciation and amortisation. Exclude one-off / non-recurring items and disclose them under Comments.",
      },
      {
        key: "netIncome",
        label: "Net Income",
        type: "number",
        unit: "€M",
        prior: 0.31,
        placeholder: "0.00",
        tooltip: "Bottom-line profit after interest, tax, depreciation and amortisation for the month.",
      },
    ],
  },
  {
    id: "balance",
    title: "Balance Sheet",
    icon: Scale,
    description: "Month-end financial position",
    fields: [
      {
        key: "cash",
        label: "Cash & Equivalents",
        type: "number",
        unit: "€M",
        required: true,
        prior: 1.84,
        placeholder: "0.00",
        tooltip: "Closing cash and cash equivalents at month-end, including short-term deposits.",
      },
      {
        key: "totalDebt",
        label: "Total Debt",
        type: "number",
        unit: "€M",
        required: true,
        prior: 18.0,
        placeholder: "0.00",
        tooltip: "Total interest-bearing financial debt outstanding at month-end (senior, mezzanine, shareholder loans).",
      },
      {
        key: "equity",
        label: "Total Equity",
        type: "number",
        unit: "€M",
        prior: 12.4,
        placeholder: "0.00",
        tooltip: "Book value of shareholders' equity at month-end.",
      },
    ],
  },
  {
    id: "kpis",
    title: "Key KPIs",
    icon: Gauge,
    description: "Operating metrics",
    fields: [
      {
        key: "headcount",
        label: "Headcount (FTE)",
        type: "number",
        required: true,
        prior: 142,
        placeholder: "0",
        tooltip: "Total full-time equivalent employees at month-end.",
      },
      {
        key: "newCustomers",
        label: "New Customers",
        type: "number",
        prior: 12,
        placeholder: "0",
        tooltip: "Number of net-new customers acquired during the reporting month.",
      },
      {
        key: "churn",
        label: "Customer Churn",
        type: "percent",
        unit: "%",
        prior: 3.1,
        placeholder: "0.0",
        tooltip: "Percentage of customers lost during the month relative to the opening customer base.",
      },
      {
        key: "arr",
        label: "ARR",
        type: "number",
        unit: "€M",
        prior: 26.0,
        placeholder: "0.00",
        tooltip: "Annual Recurring Revenue: annualised value of active recurring contracts at month-end.",
      },
    ],
  },
  {
    id: "comments",
    title: "Management Comments",
    icon: MessageSquare,
    description: "Narrative & context",
    fields: [
      {
        key: "commentary",
        label: "Monthly commentary",
        type: "textarea",
        required: true,
        placeholder: "Summarise trading performance, key wins, and any variance vs. budget…",
        tooltip: "Required narrative on the month's performance. Explain any material variances flagged by the validation panel.",
      },
      {
        key: "risks",
        label: "Key risks & watch items",
        type: "textarea",
        placeholder: "Note any emerging risks, pipeline concerns, or operational issues…",
        tooltip: "Optional: highlight risks the deal team should be aware of for this reporting period.",
      },
    ],
  },
]

export const fundContact = {
  name: "Willem de Jong",
  role: "Investment Director, Alma Capital Fund IV",
  email: "w.dejong@almacapital.com",
}

export type ReportStatus = "due" | "overdue" | "submitted"

export interface PendingReport {
  id: string
  title: string
  kind: "performance" | "budget" | "esg"
  /** Grouping for the portal: recurring monthly vs. once-a-year filings. */
  group: "monthly" | "annual"
  cadence: string
  description: string
  /** Human readable deadline, e.g. "10 Jun 2026" */
  deadline: string
  /** Days until deadline. Negative = overdue. */
  daysLeft: number
  status: ReportStatus
  /** Example template file name offered for download. Empty = no template. */
  template: string
  /** Accepted upload formats shown in the drop zone. */
  accepts: string
}

export const pendingReports: PendingReport[] = [
  {
    id: "performance-may-2026",
    title: "Performance Sheet — May 2026",
    kind: "performance",
    group: "monthly",
    cadence: "Monthly reporting",
    description: "P&L, balance sheet, cash flow and operating KPIs for May 2026.",
    deadline: "10 Jun 2026",
    daysLeft: 4,
    status: "due",
    template: "Alma_Performance_Template_v4.xlsx",
    accepts: "Excel (.xlsx, .xls) or CSV",
  },
  {
    id: "performance-jun-2026",
    title: "Performance Sheet — June 2026",
    kind: "performance",
    group: "monthly",
    cadence: "Monthly reporting",
    description: "P&L, balance sheet, cash flow and operating KPIs for June 2026.",
    deadline: "10 Jul 2026",
    daysLeft: 34,
    status: "due",
    template: "Alma_Performance_Template_v4.xlsx",
    accepts: "Excel (.xlsx, .xls) or CSV",
  },
  {
    id: "budget-fy2027",
    title: "Budget Performance Sheet — FY2027",
    kind: "budget",
    group: "annual",
    cadence: "Annual · FY2027",
    description: "Full-year budget: monthly P&L, cash flow and headcount plan for the next financial year.",
    deadline: "30 Nov 2026",
    daysLeft: 177,
    status: "due",
    template: "Alma_Budget_Template_FY2027.xlsx",
    accepts: "Excel (.xlsx, .xls) or CSV",
  },
  {
    id: "esg-fy2025",
    title: "ESG Questionnaire — FY2025",
    kind: "esg",
    group: "annual",
    cadence: "Annual · FY2025",
    description: "Environmental, social and governance metrics aligned with the SFDR PAI indicators.",
    deadline: "30 Jun 2026",
    daysLeft: 24,
    status: "due",
    template: "Alma_ESG_Questionnaire_2026.xlsx",
    accepts: "Excel (.xlsx) or PDF",
  },
]

/* ---------------------------------------------------------------------------
 * Fund-side administration data (Portfolio Portal management hub)
 * ------------------------------------------------------------------------- */

export type CompanyReportingState = "complete" | "in-progress" | "overdue" | "not-started"

export interface PortfolioCompanyStatus {
  company: string
  cfo: string
  /** Reports submitted this period vs. total required. */
  submitted: number
  required: number
  state: CompanyReportingState
  lastUpload: string
  nextDeadline: string
}

export const portfolioReportingStatus: PortfolioCompanyStatus[] = [
  { company: "FreshBox Logistics", cfo: "Marijke Bakker", submitted: 2, required: 3, state: "in-progress", lastUpload: "3 Jun 2026", nextDeadline: "10 Jun 2026" },
  { company: "MedTech Group", cfo: "Daniel Roth", submitted: 3, required: 3, state: "complete", lastUpload: "6 Jun 2026", nextDeadline: "10 Jul 2026" },
  { company: "Sure Operations", cfo: "Lisa Chen", submitted: 3, required: 3, state: "complete", lastUpload: "5 Jun 2026", nextDeadline: "10 Jul 2026" },
  { company: "CleanFlow", cfo: "Tomás Herrera", submitted: 1, required: 3, state: "in-progress", lastUpload: "2 Jun 2026", nextDeadline: "10 Jun 2026" },
  { company: "LogiServe", cfo: "Anke Visser", submitted: 0, required: 3, state: "overdue", lastUpload: "8 May 2026", nextDeadline: "31 May 2026" },
  { company: "DataVault", cfo: "Priya Nair", submitted: 0, required: 3, state: "not-started", lastUpload: "9 May 2026", nextDeadline: "10 Jun 2026" },
  { company: "RetailPlus", cfo: "Erik Sørensen", submitted: 2, required: 3, state: "in-progress", lastUpload: "4 Jun 2026", nextDeadline: "10 Jun 2026" },
]

export type AccessRole = "CFO" | "Finance analyst" | "Viewer"

export interface PortalUser {
  id: string
  name: string
  email: string
  company: string
  role: AccessRole
  status: "active" | "invited" | "suspended"
  lastActive: string
}

export const portalUsers: PortalUser[] = [
  { id: "u1", name: "Marijke Bakker", email: "m.bakker@freshbox.com", company: "FreshBox Logistics", role: "CFO", status: "active", lastActive: "Today" },
  { id: "u2", name: "Daniel Roth", email: "d.roth@medtechgroup.com", company: "MedTech Group", role: "CFO", status: "active", lastActive: "Yesterday" },
  { id: "u3", name: "Sofie Willems", email: "s.willems@freshbox.com", company: "FreshBox Logistics", role: "Finance analyst", status: "active", lastActive: "2 days ago" },
  { id: "u4", name: "Lisa Chen", email: "l.chen@sureops.com", company: "Sure Operations", role: "CFO", status: "active", lastActive: "3 days ago" },
  { id: "u5", name: "Anke Visser", email: "a.visser@logiserve.com", company: "LogiServe", role: "CFO", status: "invited", lastActive: "—" },
  { id: "u6", name: "Priya Nair", email: "p.nair@datavault.io", company: "DataVault", role: "CFO", status: "suspended", lastActive: "3 weeks ago" },
]
