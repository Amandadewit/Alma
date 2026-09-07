import type { LucideIcon } from "lucide-react"
import {
  Compass,
  Landmark,
  Zap,
  FileSearch,
  CalendarClock,
  BarChart3,
  Banknote,
  Calculator,
  Combine,
  TrendingUp,
  Leaf,
} from "lucide-react"

export type PlaybookBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "steps"; items: { title: string; detail: string }[] }
  | { type: "table"; columns: string[]; rows: string[][] }
  | { type: "callout"; text: string }

export type PlaybookCategory = "general" | "governance" | "accounting"

export interface PlaybookChapter {
  id: string
  number: string
  title: string
  summary: string
  icon: LucideIcon
  category: PlaybookCategory
  readTime: string
  underConstruction?: boolean
  blocks: PlaybookBlock[]
}

export const categoryMeta: Record<PlaybookCategory, { label: string }> = {
  general: { label: "General" },
  governance: { label: "Governance & Compliance" },
  accounting: { label: "Accounting & Reporting" },
}

export const handbookMeta = {
  fund: "Alma Capital Partners",
  title: "Reporting Playbook",
  edition: "Edition 2026",
  audience: "For CFOs of portfolio companies",
  intro:
    "Your reference for financial reporting to the fund — about the finance team, the background to our support, and the full scope of what we can help you with. Select a chapter below to get started.",
  welcome: {
    heading: "Welcome",
    paragraphs: [
      "As CFO of a Alma Insights portfolio company, you share a common interest with Alma Insights in high-quality steering information. The reporting playbook brings together the definitions, formats, and practical guidance used across the portfolio, so you spend less time on the mechanics of reporting and more on running the business.",
      "This handbook is here to support you on these matters: what to share, when, how, and who to contact.",
      "We also see this as value creation. Companies entering the Alma Insights portfolio face broadly the same challenges in their first period of ownership: a new group structure and governance, consolidation, financing obligations, acquisition accounting, and audited annual accounts. This handbook brings together practical guidance on each of these, and shares the best practices already established across the portfolio, so you do not have to solve them from scratch.",
    ],
  },
}

export const playbookChapters: PlaybookChapter[] = [
  {
    id: "getting-started",
    number: "01",
    title: "Getting Started",
    summary: "The finance, deal and ESG contacts, the escalation path, and where we can help beyond reporting.",
    icon: Compass,
    category: "general",
    readTime: "4 min read",
    blocks: [
      {
        type: "paragraph",
        text: "This chapter introduces the people you will work with and how to reach them. Beyond collecting numbers, the finance team is a resource you can lean on for definitions, systems, one-off situations, and preparing for the next stage of the investment.",
      },
      { type: "heading", text: "Your contacts" },
      {
        type: "table",
        columns: ["Team", "For", "Contact"],
        rows: [
          ["Finance team", "Templates, definitions, deadlines, technical accounting", "reporting@almacapital.com"],
          ["Deal team", "Strategy, add-ons, board matters, value creation", "Your deal partner"],
          ["ESG team", "CSRD scope, ESG data template, sustainability questions", "esg@almacapital.com"],
        ],
      },
      { type: "heading", text: "Escalation path" },
      {
        type: "steps",
        items: [
          { title: "Primary fund contact", detail: "Your first point of contact for day-to-day reporting questions." },
          { title: "Portfolio Finance team", detail: "For unresolved or technical accounting matters." },
          { title: "Deal partner", detail: "For urgent, time-critical, or strategic issues." },
        ],
      },
      { type: "heading", text: "Where we can help beyond reporting" },
      {
        type: "list",
        items: [
          "Setting up or improving your finance systems and month-end close.",
          "Preparing budgets, reforecasts, and board packs.",
          "Structuring add-on acquisitions and integrating reporting.",
          "Getting audit-ready and aligning statutory results with monthly data.",
        ],
      },
      {
        type: "callout",
        text: "New to the portfolio? Read Chapter 05 (Reporting Calendar) and Chapter 06 (Performance Sheet) first.",
      },
    ],
  },
  {
    id: "governance",
    number: "02",
    title: "Governance",
    summary: "What private equity is, group structure, the board, reserved matters, legal mergers, and UBO/KYC.",
    icon: Landmark,
    category: "governance",
    readTime: "8 min read",
    blocks: [
      {
        type: "paragraph",
        text: "Understanding the governance framework helps you know who decides what, and which actions need approval before you act. Private equity ownership brings an active board, a defined group structure, and a set of matters reserved to the fund.",
      },
      { type: "heading", text: "How private equity ownership works" },
      {
        type: "paragraph",
        text: "The fund holds your company through a group structure of holding entities. Value is created over the hold period through growth, operational improvement, and add-on acquisitions, with a planned exit in mind from day one.",
      },
      { type: "heading", text: "The board and reserved matters" },
      {
        type: "list",
        items: [
          "The board sets strategy and monitors performance; the fund is represented as a shareholder.",
          "Reserved matters require fund approval — e.g. budgets, acquisitions, financing, senior hires, and capex above threshold.",
          "Legal mergers and changes to the group structure must be planned with the fund in advance.",
        ],
      },
      { type: "heading", text: "UBO / KYC obligations" },
      {
        type: "paragraph",
        text: "Keep ultimate beneficial owner (UBO) records and know-your-customer (KYC) documentation up to date. Notify the fund of any change in directors, shareholders, or authorised signatories so registrations stay current.",
      },
    ],
  },
  {
    id: "special-events",
    number: "03",
    title: "Special Events",
    summary: "Events that need proactive notification, across transactions, financing, people, systems, and operations.",
    icon: Zap,
    category: "governance",
    readTime: "6 min read",
    blocks: [
      {
        type: "paragraph",
        text: "Some events fall outside the normal monthly rhythm and must be reported as they happen, not just at month-end. Early notice lets us adjust valuations, covenant tracking, and structuring correctly. They fall into four categories.",
      },
      { type: "heading", text: "1. Transactions & structure" },
      {
        type: "list",
        items: [
          "Add-on acquisitions or disposals — notify before completion where possible.",
          "Legal mergers, demergers, or changes to the group structure.",
          "New entity incorporations or liquidations.",
        ],
      },
      { type: "heading", text: "2. Financing & balance sheet" },
      {
        type: "list",
        items: [
          "Refinancings or changes to the debt structure.",
          "Covenant breaches or waivers.",
          "Material changes to working capital facilities or guarantees.",
        ],
      },
      { type: "heading", text: "3. People" },
      {
        type: "list",
        items: [
          "CFO or CEO transitions.",
          "Changes to authorised signatories or key finance staff.",
        ],
      },
      { type: "heading", text: "4. Systems, process & operations / continuity" },
      {
        type: "list",
        items: [
          "ERP or accounting system migrations.",
          "Material litigation, restructurings, or impairments.",
          "Business continuity events (cyber, fraud, major operational disruption).",
        ],
      },
      {
        type: "callout",
        text: "When in doubt, tell your fund contact early. A quick call before an event is always better than a surprise afterwards.",
      },
    ],
  },
  {
    id: "external-audit",
    number: "04",
    title: "External Audit Guide",
    summary: "Aligning the annual audit with monthly reporting, the audit timeline, 403/408 declarations, and ledger adjustments.",
    icon: FileSearch,
    category: "governance",
    readTime: "6 min read",
    blocks: [
      {
        type: "paragraph",
        text: "Your statutory audit and monthly reporting should reconcile. Differences between audited results and the sum of your monthly submissions must be explained and, where needed, corrected via a true-up in the ledger.",
      },
      { type: "heading", text: "Aligning audit with monthly reporting" },
      {
        type: "list",
        items: [
          "Share the audit timetable with your fund contact at the start of the audit.",
          "Reconcile audited full-year figures to your monthly submissions before sign-off.",
          "Post any material audit adjustments in the ledger in the month they are identified, with commentary.",
          "Provide the signed audit report and management letter once available.",
        ],
      },
      { type: "heading", text: "403 / 408 declarations" },
      {
        type: "paragraph",
        text: "Where the group relies on a Dutch article 403 declaration (parent assumes liability) or an article 408 exemption from consolidated reporting, confirm the position with the fund each year and ensure filings are consistent across entities.",
      },
      {
        type: "callout",
        text: "Audit adjustments should never be netted silently — always route them through the ledger with a clear description.",
      },
    ],
  },
  {
    id: "reporting-calendar",
    number: "05",
    title: "Reporting Calendar",
    summary: "The annual reporting calendar, monthly and quarterly deadlines, and statutory filing obligations.",
    icon: CalendarClock,
    category: "accounting",
    readTime: "5 min read",
    blocks: [
      {
        type: "paragraph",
        text: "Knowing the calendar keeps reporting predictable. The rhythm repeats monthly, with additional quarterly and annual obligations layered on top.",
      },
      {
        type: "table",
        columns: ["Cadence", "Obligation", "Deadline"],
        rows: [
          ["Monthly", "Performance sheet + commentary", "10th business day, 17:00 CET"],
          ["Quarterly", "Reforecast (latest estimate)", "15th business day after quarter-end"],
          ["Annual", "Approved budget for the next financial year", "Before start of financial year"],
          ["Annual", "Signed statutory accounts + audit report", "Per statutory deadline"],
          ["Annual", "ESG data template (CSRD)", "31 October"],
        ],
      },
      {
        type: "callout",
        text: "Late submissions delay the entire portfolio's reporting. If you anticipate a delay, tell your fund contact before the deadline.",
      },
    ],
  },
  {
    id: "performance-sheet",
    number: "06",
    title: "Performance Sheet",
    summary: "How the performance sheet works: process, expectations, common errors, definitions, the ARR/MRR bridge, and add-on rules.",
    icon: BarChart3,
    category: "accounting",
    readTime: "10 min read",
    blocks: [
      {
        type: "paragraph",
        text: "The performance sheet is the backbone of monthly reporting. It captures your P&L, balance sheet, cash flow and operating KPIs in a single standardised template so results are comparable across the portfolio.",
      },
      { type: "heading", text: "Process & expectations" },
      {
        type: "list",
        items: [
          "Use the current template version — do not add, remove, or reorder rows.",
          "Report in your functional currency; the fund converts to EUR.",
          "Fill all required cells; use 0 rather than leaving blanks.",
          "Provide commentary explaining variances and one-off items.",
        ],
      },
      { type: "heading", text: "Common errors to avoid" },
      {
        type: "list",
        items: [
          "Mixing recurring and non-recurring revenue without labelling them.",
          "Changing the sign convention on cash flow lines.",
          "Leaving intercompany balances unreconciled.",
          "Overwriting prior-period actuals when correcting an error — use a true-up instead.",
        ],
      },
      { type: "heading", text: "ARR & MRR bridge" },
      {
        type: "paragraph",
        text: "For recurring-revenue businesses, provide the movement bridge from opening to closing ARR/MRR: new, expansion, contraction, and churn. This lets us see the quality of growth, not just the net number.",
      },
      { type: "heading", text: "Key definitions" },
      {
        type: "table",
        columns: ["Term", "Definition"],
        rows: [
          ["EBITDA", "Earnings before interest, tax, depreciation and amortisation, before normalisation."],
          ["Adjusted EBITDA", "EBITDA normalised for one-off or owner-specific items, agreed with the fund."],
          ["ARR / MRR", "Annual / monthly recurring revenue from contracted, repeatable sources."],
          ["LE", "Latest estimate — your current best forecast for the full year."],
          ["Net Debt", "Total financial debt less cash and cash equivalents at period end."],
        ],
      },
      { type: "heading", text: "Add-on reporting rules" },
      {
        type: "paragraph",
        text: "When an add-on completes, report it from the completion date and show the impact separately from organic performance until it is fully integrated. Share the opening balance sheet as soon as available.",
      },
      {
        type: "callout",
        text: "Deadline: performance sheets are due by 17:00 CET on the 10th business day of each month.",
      },
    ],
  },
  {
    id: "cash-treasury",
    number: "07",
    title: "Cash & Treasury",
    summary: "Bank mandates, payment authorisation, liquidity forecasting, credit facilities, and currency exposure.",
    icon: Banknote,
    category: "accounting",
    readTime: "5 min read",
    underConstruction: true,
    blocks: [
      {
        type: "paragraph",
        text: "This chapter is under construction. It will cover how to manage cash and treasury in a fund-owned group, including controls, forecasting, and financing facilities.",
      },
      { type: "heading", text: "Topics coming soon" },
      {
        type: "list",
        items: [
          "Bank mandates and authorised signatories.",
          "Payment authorisation controls and segregation of duties.",
          "Rolling liquidity forecasting.",
          "Credit facility usage and reporting.",
          "Currency exposure and hedging policy.",
        ],
      },
      {
        type: "callout",
        text: "In the meantime, direct any cash or treasury questions to your fund contact.",
      },
    ],
  },
  {
    id: "accounting-positions",
    number: "08",
    title: "Accounting Position Guidelines",
    summary: "Software capitalisation, COGS, revenue recognition, leases, accruals & incentives, goodwill, consolidation and intercompany.",
    icon: Calculator,
    category: "accounting",
    readTime: "12 min read",
    blocks: [
      {
        type: "paragraph",
        text: "Consistent accounting positions are what make portfolio data comparable. Apply these guidelines consistently; if your local GAAP differs, reconcile to the position below and note the adjustment in commentary.",
      },
      { type: "heading", text: "Software capitalisation" },
      {
        type: "list",
        items: [
          "Purchased perpetual-licence software → intangible fixed asset (IFA).",
          "Internally developed software meeting the criteria → IFA, supported by a project register.",
          "SaaS subscriptions and cloud services → operating expense in the P&L.",
        ],
      },
      { type: "heading", text: "COGS" },
      {
        type: "table",
        columns: ["Include in COGS", "Exclude from COGS"],
        rows: [
          ["Direct materials and components", "Sales & marketing salaries"],
          ["Direct labour delivering the product", "General & administrative overhead"],
          ["Hosting / infrastructure for delivery", "R&D and product development"],
          ["Inbound freight and duties", "Depreciation of office assets"],
        ],
      },
      { type: "heading", text: "Other positions" },
      {
        type: "list",
        items: [
          "Revenue recognition — recognise over time or at a point in time consistent with the contract; disclose the policy.",
          "Leases — capitalise where required and split the P&L impact between depreciation and interest.",
          "Personnel accruals & incentives — accrue bonuses and holiday pay in the period earned.",
          "Goodwill & impairment — test annually and flag any indicators of impairment to the fund.",
          "Consolidation, eliminations & intercompany — reconcile and eliminate intercompany balances every month.",
        ],
      },
      {
        type: "callout",
        text: "If a treatment is genuinely ambiguous, apply it consistently month to month and explain it in the commentary.",
      },
    ],
  },
  {
    id: "acquisition-accounting",
    number: "09",
    title: "Acquisition Accounting",
    summary: "Opening balance & PPA, transaction costs, Dutch fiscal rules, add-on consolidation, and cap table accounting.",
    icon: Combine,
    category: "accounting",
    readTime: "9 min read",
    blocks: [
      {
        type: "paragraph",
        text: "Add-on acquisitions need careful accounting from day one so the group stays comparable and audit-ready. Coordinate with the fund before completion wherever possible.",
      },
      { type: "heading", text: "Opening balance & purchase price allocation" },
      {
        type: "list",
        items: [
          "Prepare an opening balance sheet at the completion date.",
          "Allocate the purchase price to identifiable assets and liabilities; recognise goodwill on the residual.",
          "Share the draft PPA with the fund before finalising.",
        ],
      },
      { type: "heading", text: "Transaction costs & fiscal rules" },
      {
        type: "list",
        items: [
          "Expense transaction costs unless they qualify for capitalisation under the applicable standard.",
          "Apply Dutch fiscal rules on interest deductibility, fiscal unity, and participation exemption where relevant.",
        ],
      },
      { type: "heading", text: "Consolidation & cap table" },
      {
        type: "list",
        items: [
          "Consolidate the add-on from the completion date and eliminate intercompany balances.",
          "Keep the cap table accounting aligned with the group structure and any earn-out or equity arrangements.",
        ],
      },
    ],
  },
  {
    id: "budget-guidelines",
    number: "10",
    title: "Budget Guidelines",
    summary: "Revenue, COGS and OPEX budget structure, and the checks to run before you submit.",
    icon: TrendingUp,
    category: "accounting",
    readTime: "6 min read",
    blocks: [
      {
        type: "paragraph",
        text: "The annual budget is the baseline against which we track actuals each month. Submit it in the same structure as the performance sheet so variance reporting is automatic.",
      },
      { type: "heading", text: "Budget structure" },
      {
        type: "list",
        items: [
          "Revenue — split by recurring vs non-recurring and by segment where relevant.",
          "COGS — consistent with the COGS definition, budgeted to preserve gross margin visibility.",
          "OPEX — by function, including headcount and key operating KPIs.",
          "Budget by month for the full financial year, not just annual totals.",
        ],
      },
      { type: "heading", text: "Pre-submission checks" },
      {
        type: "list",
        items: [
          "Line items and dimensions match the performance sheet exactly.",
          "Monthly phasing sums to the annual total.",
          "Headcount and KPIs are included, not only financials.",
          "The budget is board-approved before the start of the financial year.",
        ],
      },
      {
        type: "callout",
        text: "Reforecasts (latest estimate) are submitted quarterly; do not overwrite the original budget.",
      },
    ],
  },
  {
    id: "esg-reporting",
    number: "11",
    title: "ESG Reporting",
    summary: "CSRD scope, the ESG data template, and the 31 October submission deadline.",
    icon: Leaf,
    category: "accounting",
    readTime: "5 min read",
    blocks: [
      {
        type: "paragraph",
        text: "ESG data is collected alongside financial reporting to meet the fund's CSRD obligations and to track sustainability performance across the portfolio.",
      },
      { type: "heading", text: "CSRD scope" },
      {
        type: "paragraph",
        text: "Under the Corporate Sustainability Reporting Directive, the fund reports consolidated sustainability information. Your company contributes the underlying data points relevant to its size and sector.",
      },
      { type: "heading", text: "The ESG data template" },
      {
        type: "list",
        items: [
          "Complete the standard ESG data template provided by the ESG team.",
          "Cover environmental (emissions, energy), social (workforce, health & safety), and governance metrics.",
          "Use actual data where available; clearly label estimates and their basis.",
        ],
      },
      {
        type: "callout",
        text: "Deadline: the ESG data template is due by 31 October each year. Contact esg@almacapital.com with any questions.",
      },
    ],
  },
]
