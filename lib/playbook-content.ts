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

/** A list item is either plain text or a bold lead-in followed by text. */
export type PlaybookListItem = string | { lead: string; text: string }

export type PlaybookBlock =
  /** level 2 = section heading (default), level 3 = sub-heading */
  | { type: "heading"; text: string; level?: 2 | 3 }
  /** `lead` is an optional bold lead-in rendered before the text */
  | { type: "paragraph"; text: string; lead?: string }
  | { type: "list"; items: PlaybookListItem[] }
  | { type: "steps"; items: { title: string; detail: string }[] }
  | { type: "table"; columns: string[]; rows: string[][] }
  /** note (default), warning or tip; optional bold title and bullet items */
  | { type: "callout"; text?: string; title?: string; tone?: "note" | "warning" | "tip"; items?: string[] }
  /** a "what to do when ..." protocol card with labelled lines (When, What to submit, Contact, ...) */
  | { type: "protocol"; title: string; items: { label: string; text: string }[] }
  | { type: "image"; src: string; alt: string }

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
      "As CFO of an Alma Capital Partners portfolio company, you share a common interest with Alma Capital Partners in high-quality steering information. The reporting playbook brings together the definitions, formats, and practical guidance used across the portfolio, so you spend less time on the mechanics of reporting and more on running the business.",
      "This handbook is here to support you on these matters: what to share, when, how, and who to contact.",
      "We also see this as value creation. Companies entering the Alma Capital Partners portfolio face broadly the same challenges in their first period of ownership: a new group structure and governance, consolidation, financing obligations, acquisition accounting, and audited annual accounts. This handbook brings together practical guidance on each of these, and shares the best practices already established across the portfolio, so you do not have to solve them from scratch.",
    ],
  },
}

export const playbookChapters: PlaybookChapter[] = [
  {
    id: "getting-started",
    number: "01",
    title: "Getting Started",
    summary: "Your three contacts and what to ask each, the Finance & Reporting team, and where we can help beyond reporting.",
    icon: Compass,
    category: "general",
    readTime: "3 min read",
    blocks: [
      {
        type: "paragraph",
        text: "This chapter introduces the people you work with and the support available to you. It sets out who to contact for what, what the Finance & Reporting function does, and the areas where the team can help beyond reporting itself.",
      },
      {
        type: "paragraph",
        text: "You have three contacts at Alma Capital Partners, and they are three different people. This handbook uses only these three contacts. If you are unsure which one, send it to the finance team; they will route it.",
      },
      {
        type: "table",
        columns: ["Role", "Who", "Channel"],
        rows: [
          [
            "Reporting contact",
            "Your Finance & Reporting contact",
            "reporting@almacapital.com · Mon–Fri, 9:00–18:00",
          ],
          ["Deal team", "Your deal team contact", "Direct, via your deal team contact"],
          ["Finance and ESG contact", "Your finance and ESG contact", "esg@almacapital.com"],
        ],
      },
      { type: "heading", text: "Go to the finance team for", level: 3 },
      {
        type: "list",
        items: [
          "Monthly submission and validation queries.",
          "The performance sheet, its dimensions and definitions (chapter 6).",
          "Accounting positions and acquisition accounting (chapters 8 and 9).",
          "The budget template and pre-submission checks (chapter 10).",
          "The reporting bridge and audit alignment (chapter 4).",
          "Onboarding and CFO handover.",
        ],
      },
      { type: "heading", text: "Go to the deal team for", level: 3 },
      {
        type: "list",
        items: [
          "Approvals and reserved matters (section 2.3).",
          "Special events before they appear in the figures (chapter 3).",
          "Acquisitions, add-ons and changes to the reporting scope.",
          "Financing, covenants and lender communication.",
          "Introductions to audit firms and advisers.",
        ],
      },
      { type: "heading", text: "Go to the ESG contact for", level: 3 },
      {
        type: "list",
        items: [
          "The annual ESG data request, template and submission deadline (chapter 11).",
          "Questions on CSRD scope, ESG definitions and data sources.",
        ],
      },
      { type: "heading", text: "About the Finance & Reporting team", level: 2 },
      {
        type: "paragraph",
        text: "The Finance & Reporting lead has a background in controller roles across multiple private equity portfolios. This includes hands-on CFO work at portfolio companies, audit and compliance, and building reporting infrastructure from scratch. The Finance and Reporting team built the data model, the performance sheet, and the onboarding process specifically for CFOs of portfolio companies.",
      },
      { type: "heading", text: "Where else we can help", level: 2 },
      {
        type: "paragraph",
        text: "The Finance & Reporting function exists to create value alongside you, not to add a reporting layer. Alma Capital Partners provides guidance in assessing finance processes, systems, and people. The areas below double as a short scan you can use to see where your own finance function stands.",
      },
      {
        type: "paragraph",
        text: "This includes both internal finance operations and their interactions with key stakeholders. We offer strategic advice on potential improvements to create an efficient and high-performing finance organization. This document does not replace formal legal or tax advice.",
      },
      {
        type: "paragraph",
        text: "Next to the content on this page our team will be able to advise you on:",
      },
      {
        type: "list",
        items: [
          {
            lead: "Process Optimisation & Automation:",
            text: "standardising and automating finance processes to drive efficiency.",
          },
          { lead: "Finance matureness scan:", text: "looking at the people, processes and IT." },
          {
            lead: "ERP Systems & Implementation:",
            text: "advising on ERP system selection and assisting with implementation.",
          },
          {
            lead: "Building the Right Finance Team:",
            text: "ensuring the right people are in place to execute finance operations effectively.",
          },
          {
            lead: "Faster Month-End Closing:",
            text: "streamlining financial reporting to accelerate the closing process.",
          },
          {
            lead: "Working Capital Management:",
            text: "optimising cash flow and liquidity management.",
          },
          {
            lead: "Margin Analysis & Profitability Insights:",
            text: "providing transparency on where the company generates profit.",
          },
          {
            lead: "Steering Committee & KPI Reporting:",
            text: "developing a structured reporting package with key performance indicators.",
          },
          {
            lead: "Accounting Manual:",
            text: "establishing a clear accounting framework tailored to the company's needs.",
          },
          {
            lead: "P&L Structure & Chart of Accounts:",
            text: "standard structures for the P&L layout, the chart of accounts and the reporting dimensions, so the ledger produces the reporting directly.",
          },
          {
            lead: "Acquisition Accounting:",
            text: "assisting in accounting for initial and add-on acquisitions.",
          },
        ],
      },
    ],
  },
  {
    id: "governance",
    number: "02",
    title: "Governance & Legal Structure",
    summary: "What private equity is, the group structure, board and approvals, reserved matters, KYC and UBO declarations, and insurance.",
    icon: Landmark,
    category: "governance",
    readTime: "13 min read",
    blocks: [
      {
        type: "paragraph",
        text: "This chapter explains the structure you now operate in. It starts with how private equity works and how a fund makes its return, then covers the group structure created at acquisition, the roles of the board and the general meeting, the matters that require shareholder approval, and the recurring obligations such as legal entity mergers, KYC and UBO declarations.",
      },
      { type: "heading", text: "2.1 What private equity is", level: 2 },
      {
        type: "paragraph",
        text: "Most CFOs meet private equity for the first time when their own company is acquired. This section sets out, in one page, what kind of shareholder you now have, where its money comes from and how it earns a return. It is here because it explains the rest of this playbook: two of the four return drivers are read straight off the figures you submit every month.",
      },
      { type: "heading", text: "Where the money comes from", level: 3 },
      {
        type: "paragraph",
        text: "Private equity is investment capital used to invest in companies that are not, or will no longer be, founder owned or publicly listed. What characterises it is a high required return on the equity invested, an active search for better results and for growth, and the use of bank debt to reduce the equity commitment.",
      },
      {
        type: "paragraph",
        text: "The capital in a fund comes from two groups. The limited partners (LPs) are the investors: pension funds, family offices, funds of funds and high net worth individuals. They provide 80 to 98 percent of the committed capital. The general partner (GP) is the manager of the fund, runs the investment process and provides the remaining 2 to 20 percent. A fund has a finite life, which is why an exit is not a possibility but a certainty, and why the quality of your reporting history matters long before a sale is on the table.",
      },
      { type: "heading", text: "How the return is made", level: 3 },
      {
        type: "paragraph",
        text: "Returns come from four drivers: sales growth, margin improvement, multiple expansion and debt repayment. The illustration below shows how they compound over a holding period. The figures are indicative, not a target for your company.",
      },
      {
        type: "table",
        columns: ["Line", "At entry", "At exit", "Change", "Driver"],
        rows: [
          ["Sales", "€25m", "€40m", "+60%", "Sales growth"],
          ["EBITDA margin", "20%", "25%", "+25%", "Margin improvement"],
          ["EBITDA", "€5m", "€10m", "+100%", "Follows from the two above"],
          ["Multiple", "6.0x", "10x", "+66%", "Multiple expansion"],
          ["Enterprise value", "€30m", "€100m", "+117%", "Follows from EBITDA and multiple"],
          ["Net debt", "(€15m)", "(€5m)", "−67%", "Debt repayment"],
          ["Equity value", "€15m", "€95m", "+630%", "What is left for the shareholders"],
        ],
      },
      {
        type: "paragraph",
        text: "Equity value grows from 15 to 95 million, 6.3 times the money invested, while sales grow by 60 percent. That gearing is the whole model, and it is also why a small margin or debt movement matters more than it looks. Two of the four drivers, margin improvement and debt repayment, are read directly from the figures you submit each month. The third, the multiple a buyer is willing to pay, is largely a function of how predictable and how well evidenced those figures are. That is the honest answer to why this playbook exists.",
      },
      { type: "heading", text: "Types of private equity", level: 3 },
      {
        type: "paragraph",
        text: "Funds differ by size focus, from large buyouts to the SME segment; by specialty, such as buy and build, restructuring and carve out, start up and scale up capital, or a management buyout; and by sector focus, for example technology, energy, financial services and insurance, or impact. Some investors are funds of funds and invest in other funds rather than directly in companies. The position of Alma Capital Partners is set out in the introduction.",
      },
      { type: "heading", text: "Glossary: terms you will hear", level: 3 },
      {
        type: "table",
        columns: ["Term", "What it means"],
        rows: [
          [
            "IC",
            "Investment committee. The body at Alma Capital Partners that approves an investment or a material decision. Some of the reserved matters in section 2.3 go to the IC.",
          ],
          [
            "Deal team",
            "The two or three people at Alma Capital Partners who follow your company. Your contact for everything other than the monthly reporting; see the contacts overview at the start of chapter 1.",
          ],
          [
            "LP, limited partner",
            "An investor in the fund: pension fund, family office, fund of funds or private individual.",
          ],
          ["GP, general partner", "The manager of the fund. In practice, the people you meet."],
          [
            "MOI, multiple of money",
            "Proceeds divided by the amount invested. 6.3x in the illustration above.",
          ],
          [
            "IRR",
            "The same return expressed as a percentage per year, so it is sensitive to how long the holding period runs. A good exit a year earlier is worth a great deal.",
          ],
          [
            "Leverage",
            "The ratio of debt to equity in the structure. The net debt definition in section 6.1 is what it is measured on.",
          ],
          ["Committed capital", "Capital the LPs have committed to the fund but not yet paid in."],
          [
            "Capital call",
            "The request to the LPs to transfer part of their commitment, for example to fund an acquisition or an add-on. This is why the timing of an add-on matters to the fund as well.",
          ],
          [
            "Hurdle",
            "The minimum return the fund has to achieve before the GP earns a performance fee.",
          ],
          ["Carried interest", "The GP share of the return above the hurdle."],
          [
            "Waterfall",
            "The order in which proceeds are distributed: costs, capital, hurdle, then carried interest.",
          ],
        ],
      },
      { type: "heading", text: "2.2 Group structure", level: 2 },
      {
        type: "paragraph",
        text: "Each deal has its own structural characteristics, often influenced by external parties (banks) and local regulations. Applicability of guidelines may vary per portfolio company.",
      },
      {
        type: "list",
        items: [
          {
            lead: "Top-Co:",
            text: "the consolidated reporting entity towards shareholders. Sole shareholder of New-Co.",
          },
          {
            lead: "New-Co (Holdco):",
            text: "buys and holds 100% of the shares of the acquired working company and holds bank financing.",
          },
          {
            lead: "Working company:",
            text: "the operational entity; its finance team is responsible for the accounting and legal obligations of Top-Co and New-Co as well.",
          },
        ],
      },
      {
        type: "paragraph",
        text: "In the event of an exit, the New-Co remains in place and holds any legacy items, earn-outs, and liabilities.",
      },
      {
        type: "image",
        src: "/playbook/group-structure.png",
        alt: "Group structure diagram: the PE fund and Manco / DGA sit above Top-Co, which owns New-Co (external finance), which owns the Target. Two management agreements are shown, and a dashed outline marks the fiscal unity around Top-Co, New-Co and the Target.",
      },
      {
        type: "callout",
        title: "Fiscal unity",
        text: "Ensure Top-Co and New-Co are added to the fiscal unity at the tax authorities, for both corporate income tax and VAT (New-Co is also a VAT entrepreneur).",
      },
      {
        type: "callout",
        title: "Management agreement",
        text: "For fiscal and legal reasons, New-Co should perform management work for the working company and bear the associated costs (e.g. statutory director compensation). A management agreement and actual invoicing between the entities is required. Request a template from Legal Counsel.",
      },
      { type: "heading", text: "Legal entity mergers (Buy & Build)", level: 3 },
      {
        type: "paragraph",
        text: "Alma Capital Partners recommends evaluating the merger of legal entities in a Buy & Build scenario to streamline operations and reduce administrative complexity.",
      },
      {
        type: "table",
        columns: ["Benefit", "Consideration"],
        rows: [
          [
            "Reduced administrative workload: fewer reporting obligations and bookkeeping tasks",
            "Not a one-size-fits-all: each transaction has its own structural characteristics",
          ],
          [
            "Simplified tax and legal structure: fewer intercompany transactions",
            "External dependencies (banks, covenants) must be assessed before proceeding",
          ],
          [
            "Optimised financial reporting: clearer insights, better cash flow visibility",
            "Local regulations across jurisdictions must be carefully assessed",
          ],
          [
            "Operational efficiency: simpler invoicing, payroll, and procurement",
            "Legal, tax, and accounting advice is required before any merger",
          ],
        ],
      },
      {
        type: "heading",
        text: "2.3 Who decides what: board, general meeting and approvals",
        level: 2,
      },
      {
        type: "paragraph",
        text: "This section sets out where each type of decision is taken: what the board of New-Co can decide on its own, what goes to the general meeting, which resolutions need a qualified majority to protect minority shareholders, and which board decisions need prior approval from Alma Capital Partners under the Shareholders Agreement.",
      },
      { type: "heading", text: "Board of New-Co", level: 3 },
      {
        type: "list",
        items: [
          "The New-Co board (statutair bestuur) consists of at least two directors.",
          "Each statutory director is individually authorised to represent the company.",
          "New-Co is appointed director of all group companies at closing.",
          "Alma Capital Partners sits on the steering committee, not on the board.",
          "Appointment, removal, and suspension of directors require a shareholders' resolution adopted by a simple majority.",
          "The company arranges Directors & Officers (D&O) liability insurance.",
        ],
      },
      { type: "heading", text: "Annual General Meeting", level: 3 },
      {
        type: "paragraph",
        text: "A physical general meeting of shareholders is held at least once a year, unless otherwise agreed by all shareholders.",
      },
      { type: "heading", text: "Reserved matters requiring qualified majority", level: 3 },
      {
        type: "paragraph",
        text: "To protect minority shareholders, the following resolutions require a qualified majority at the General Meeting (the threshold is typically a percentage not achieved by Alma Capital Partners' vote alone):",
      },
      {
        type: "list",
        items: [
          "Exclusion or restriction of pre-emptive rights (except for management/employee share schemes or add-on acquisitions)",
          "Reduction in capital or repurchase of own shares",
          "Legal merger, demerger, conversion into another legal form",
          "Dissolution, application for bankruptcy or payment moratorium",
          "Amendment to articles of association that disproportionately affects a particular shareholder",
        ],
      },
      { type: "heading", text: "Alma Capital Partners standard reserved matters", level: 3 },
      {
        type: "paragraph",
        text: "Key board decisions require prior approval from Alma Capital Partners as defined in the Shareholders Agreement (SHA). Common reserved matters include (financial thresholds are set per transaction in the SHA):",
      },
      {
        type: "list",
        items: [
          "approving and amending the Business Plan;",
          "entering into agreements under which a (bank) credit facility is granted to the Company and/or the Subsidiaries;",
          "lending and borrowing money, other than (i) drawing funds under an existing credit facility granted to the Company by a bank and (ii) any Emergency Funding;",
          "making capital expenditure or commitments to that effect, including investments and divestments, in an amount exceeding the threshold set in the SHA;",
          "entering into agreements whereby the Company binds itself as surety or as joint and several co-debtor, or otherwise provides security or binds itself as debtor, for a debt of a third party;",
          "providing bank guarantees or similar instruments involving an amount exceeding the threshold set in the SHA;",
          "entering into any long-term direct or indirect cooperation with another company and terminating any such cooperation, as well as directly or indirectly participating in the capital of another company and terminating or changing the size of any such participation;",
          "acquiring, disposing of, encumbering, leasing out, leasing in, and in any other way obtaining or granting the use of, or otherwise conferring the benefit of, (registered) property and assets;",
          "selling all or substantially all of the assets of the Company;",
          "opening and closing offices and/or branches;",
          "filing for a suspension of payments (surseance van betaling) in respect of the Company;",
          "entering into settlement agreements within the meaning of Article 7:900 of the Dutch Civil Code involving an amount exceeding the threshold set in the SHA;",
          "initiating legal proceedings, including arbitration proceedings, with the exception of taking legal measures (i) which cannot be postponed and (ii) the purpose of which is the collection of monetary or other claims in respect of goods supplied or services rendered by the Company;",
          "conducting a defence on the merits in legal proceedings, including arbitration proceedings, that are of material importance to the Company’s business operations;",
          "hiring or engaging employees or consultants, and setting or amending their terms of employment or engagement, where the gross salary/fee exceeds the annual or monthly threshold set in the SHA;",
          "to the extent this authority is vested in the management, amending the terms of employment/remuneration of directors and granting bonuses or similar compensation to directors;",
          "establishing pension plans and granting pension rights, to the extent these fall outside the scope of existing arrangements;",
          "appointing authorised signatories (procuratiehouders) and/or other attorneys-in-fact and determining their authority and title;",
          "entering into any transaction or arrangement with a party affiliated with a Manager, save in the case of Emergency Funding;",
          "repurchasing Shares;",
          "exercising voting rights attached to shares held by the Company.",
        ],
      },
      {
        type: "paragraph",
        text: "This list is indicative. The reserved matters that apply to your company are those set out in your own SHA: always read your own SHA and check the applicable thresholds before a board decision. Where this handbook and your SHA differ, the SHA prevails.",
      },
      { type: "heading", text: "2.4 KYC & UBO declarations", level: 2 },
      {
        type: "paragraph",
        text: "Under Dutch law every legal entity must register its ultimate beneficial owners (UBOs) with the Chamber of Commerce (KvK). A UBO is a natural person who, directly or indirectly, holds more than 25% of the shares, voting rights or profit entitlement, or who otherwise exercises effective control.",
      },
      {
        type: "paragraph",
        text: "In an Alma Capital Partners structure, Alma Capital Partners is typically the majority shareholder through its fund entities, and the remaining shares are held by New-Co and the management participation vehicle. As a result, no single natural person exceeds the 25% threshold on shares, voting rights, profits or special control rights. The questions in the KYC questionnaire can therefore normally all be answered \"No\", and the company has no actual UBO.",
      },
      {
        type: "table",
        columns: ["Question in the KYC questionnaire", "Standard answer"],
        rows: [
          [
            "Are there natural persons who hold more than 25% of the shares in the entity, directly or through another legal entity?",
            "No",
          ],
          [
            "Are there natural persons who can exercise more than 25% of the voting rights in the general meeting?",
            "No",
          ],
          [
            "Are there natural persons entitled to more than 25% of the profits of the entity?",
            "No",
          ],
          [
            "Are there natural persons with special control rights over more than 25% of the assets of the entity?",
            "No",
          ],
        ],
      },
      {
        type: "paragraph",
        text: "Where there is no UBO, the law requires the statutory directors to be registered instead, as so-called pseudo-UBOs. Every statutory director is registered, irrespective of whether they hold any shares. Check the cap table before submitting: if a manager holds more than 25% in your specific structure, the answers change and that person must be registered as an actual UBO.",
      },
      {
        type: "callout",
        title: "Change from 10 July 2027.",
        text: "Under the European anti-money laundering regulation (Regulation (EU) 2024/1624) the threshold moves from more than 25% to 25% or more, so a shareholder holding exactly 25% becomes a UBO. Reassess any structure in which a manager or the participation vehicle sits at exactly 25% before that date. Supervision of the register was also tightened from 1 January 2026, and access is no longer public but tiered by type of user following the Court of Justice ruling. Confirm the current position with the notary before filing.",
      },
      {
        type: "callout",
        title: "UBO registration",
        text: "After closing, the notary submits the new directors and pseudo-UBOs to the Dutch Chamber of Commerce (KvK). The portfolio company is responsible for all subsequent changes in UBO registrations. Because there is no UBO, a change of director also means a change of pseudo-UBOs.",
      },
      {
        type: "callout",
        title: "AML letter",
        text: "Alma Capital Partners can provide a personalised AML letter upon request. Include the recipient's details in your request. The AML letter is confidential and must not be stored locally.",
      },
      { type: "heading", text: "2.5 Insurance", level: 2 },
      {
        type: "paragraph",
        text: "The acquisition changes the insured entity. Policies taken out by the former owner or in the name of the old holding company do not automatically follow the new structure, and a policy naming an entity that no longer exists, or omitting New-Co, leaves the group without cover at the moment it is needed. Review the full set of policies after closing and re-register them under the new top holding.",
      },
      { type: "heading", text: "Review after closing", level: 3 },
      {
        type: "list",
        items: [
          "Build a register of all current policies: type of cover, insurer, policy number, insured entities, sum insured, deductible, premium and renewal date.",
          "Check per policy which entity is the policyholder and which entities are co-insured, and have the new top holding and all group companies added.",
          "Cancel or transfer policies that stay with the seller or with an entity that leaves the group.",
          "Arrange D&O cover for the newly appointed directors and confirm run-off cover for the departing directors (see section 2.3).",
          "Add every acquired entity to the group policies from the date of legal transfer, so that cover follows the group after each add-on.",
        ],
      },
      { type: "heading", text: "Renewal cycle", level: 3 },
      {
        type: "list",
        items: [
          "Treat the renewal date of each policy as a fixed annual item and diarise it.",
          "Request renewal terms at least two months before expiry and test the sums insured against the current size of the group: revenue growth, a larger workforce and acquired entities all change the exposure.",
          "Report a material change in cover, a gap in cover, or an uninsured claim to the deal team as a special event (chapter 3).",
        ],
      },
    ],
  },
  {
    id: "special-events",
    number: "03",
    title: "Special Events",
    summary: "Events that need proactive notification to the deal team, grouped into transactions, financing, people and systems, and operations.",
    icon: Zap,
    category: "governance",
    readTime: "8 min read",
    blocks: [
      {
        type: "paragraph",
        text: "Certain events require additional communication or a change in your submission. They are grouped into four categories: transactions and structure (3.1), financing and balance sheet (3.2), people, systems and process (3.3), and operations and continuity (3.4). Each event below carries its own protocol: when to notify, what to submit, and who to contact. The rule of thumb is that the deal team is informed before the event appears in the figures.",
      },
      {
        type: "callout",
        title: "Proactive communication is always required",
        text: "For special events: notify the deal team before the event appears in the figures, so the platform can be configured in time. For accounting positions: apply the guidelines consistently from period one; reclassifications require prior alignment because they affect historical comparability.",
      },
      { type: "heading", text: "3.1 Transactions & structure", level: 2 },
      {
        type: "paragraph",
        text: "Events that change what the group owns or how it is structured; notify the deal team before the transaction closes, so the reporting scope can be adjusted in time.",
      },
      {
        type: "protocol",
        title: "What to do when your company makes an acquisition",
        items: [
          {
            label: "When",
            text: "as soon as the acquisition is confirmed, ideally before closing.",
          },
          {
            label: "What to submit",
            text: "opening balance sheet of the target, transaction data, updated cap table, and any PPA items (purchase price allocation). Submit the LTM and historical figures of the acquired company as early as possible. See section 6.3 for the add-on reporting rules (Actuals, LTM, LE, Budget) and chapter 9, Acquisition Accounting for the full PPA and opening balance treatment.",
          },
        ],
      },
      {
        type: "protocol",
        title: "What to do when part of the group is sold or carved out",
        items: [
          {
            label: "When",
            text: "as soon as a sale or carve-out of an entity or business line is contemplated, and again at signing.",
          },
          {
            label: "What to submit",
            text: "the perimeter of what is being sold, historical figures for that perimeter (P&L, balance sheet, headcount), the expected closing date, and the treatment of stranded costs. Discontinued operations are reported separately, and the LE and budget are rebased from the closing date.",
          },
        ],
      },
      {
        type: "protocol",
        title: "What to do when the group structure or fiscal unity changes",
        items: [
          {
            label: "When",
            text: "on incorporation, merger, liquidation or renaming of a group entity, or on any change in the corporate income tax or VAT fiscal unity.",
          },
          {
            label: "What to submit",
            text: "updated group structure chart, Chamber of Commerce extracts, effective dates, and the impact on consolidation scope and eliminations.",
          },
          {
            label: "Note",
            text: "see section 2.2 for the governance and legal merger process. Entities are only added to or removed from the reporting scope after alignment with the deal team.",
          },
        ],
      },
      {
        type: "protocol",
        title: "What to do when intercompany or transfer pricing arrangements change",
        items: [
          {
            label: "When",
            text: "when management fees, intercompany interest rates, cost allocations or intercompany agreements are introduced or amended.",
          },
          {
            label: "What to submit",
            text: "the new agreement or pricing basis, the effective date, and the entities affected.",
          },
          {
            label: "Note",
            text: "see section 8.7 for the applicable standards, including the standard templates for intercompany and management agreements. Changes shift EBITDA between entities and must be applied consistently from the effective date, never retrospectively.",
          },
        ],
      },
      {
        type: "protocol",
        title: "What to do when a tax audit or additional assessment arises",
        items: [
          {
            label: "When",
            text: "on notification of a tax audit, an information request, or an additional assessment.",
          },
          {
            label: "Action",
            text: "inform the deal team and share the report or correspondence. No further action is required from your side for reporting purposes.",
          },
        ],
      },
      { type: "heading", text: "3.2 Financing & balance sheet", level: 2 },
      {
        type: "paragraph",
        text: "Events that change the financing, the net debt position or the cap table, all of which feed straight into covenant headroom and valuation.",
      },
      {
        type: "protocol",
        title: "What to do when debt terms change",
        items: [
          {
            label: "When",
            text: "upon signing a new facility, a debt restructuring, or a covenant amendment.",
          },
          {
            label: "What to submit",
            text: "updated net debt reconciliation, new loan terms (principal, margin, maturity, covenants), and an updated cash flow LE.",
          },
          {
            label: "Note",
            text: "the net debt definition may change if the new facility includes instruments treated differently (e.g. PIK, revolvers, lease reclassification).",
          },
        ],
      },
      {
        type: "protocol",
        title: "What to do when a covenant is breached or a waiver is needed",
        items: [
          {
            label: "When",
            text: "as soon as headroom on any covenant is expected to fall below the required level, and before any request is made to the lender.",
          },
          {
            label: "What to submit",
            text: "the covenant calculation for the current and next test date, the underlying assumptions, and a cash flow LE.",
          },
          {
            label: "Contact",
            text: "notify the deal team first. Communication with the lender is aligned with Alma Capital Partners before it takes place.",
          },
        ],
      },
      {
        type: "protocol",
        title: "What to do when factoring, a working capital facility or a sale-and-leaseback is introduced",
        items: [
          { label: "When", text: "before the facility or transaction is signed." },
          {
            label: "What to submit",
            text: "the contract terms, the receivables or assets involved, the effective date, and the expected effect on working capital and net debt.",
          },
          {
            label: "Note",
            text: "these structures change net debt, DSO and free cash flow. The definitions used in the performance sheet are agreed with the deal team before the first reporting period.",
          },
        ],
      },
      {
        type: "protocol",
        title: "What to do when capital is injected or the cap table changes",
        items: [
          {
            label: "When",
            text: "on an equity injection, a new or amended shareholder loan, a change in the management participation, or any change in the cap table.",
          },
          {
            label: "What to submit",
            text: "the updated cap table, the instrument terms (interest, PIK, ranking, conversion), and the effective date.",
          },
          {
            label: "Note",
            text: "see chapter 9, Acquisition Accounting for cap table accounting. Align with the deal team how the instrument is to be entered in the performance sheet. Changes in the management participation may also require alignment on the incentive accrual.",
          },
        ],
      },
      {
        type: "protocol",
        title: "What to do when an earn-out or deferred consideration is remeasured or settled",
        items: [
          {
            label: "When",
            text: "at each reporting date where the expected pay-out changes, and on settlement.",
          },
          {
            label: "What to submit",
            text: "the revised expected pay-out, the basis for the change, and the accounting treatment applied.",
          },
          {
            label: "Note",
            text: "remeasurements affect both the P&L and net debt. Align the treatment with the deal team before it is reflected in the figures; do not adjust prior periods.",
          },
        ],
      },
      { type: "heading", text: "3.3 People, systems & process", level: 2 },
      {
        type: "paragraph",
        text: "Changes in the finance function itself: who runs it, which systems it uses, and which accounting policies it applies.",
      },
      {
        type: "protocol",
        title: "What to do when the CFO or finance lead changes",
        items: [
          { label: "When", text: "upon announcement or effective date of the transition." },
          {
            label: "Action",
            text: "notify the deal team. The incoming CFO will receive an onboarding session and platform access will be transferred.",
          },
          {
            label: "Note",
            text: "ensure a proper handover of the performance sheet process, including open items, outstanding validation queries, and the mapping file, so the monthly rhythm is not interrupted. The incoming CFO or finance lead works through this handbook in full during the first 90 days and raises open questions with the finance team.",
          },
        ],
      },
      {
        type: "protocol",
        title: "What to do when the ERP or chart of accounts changes",
        items: [
          {
            label: "When",
            text: "before the system or restructuring is chosen, and again as soon as the go-live date is set.",
          },
          {
            label: "What to share",
            text: "at the decision stage, the business case, the shortlist and the expected investment; once the choice is made, the planned go-live date, the old-to-new account mapping, and a test submission from the new environment.",
          },
          {
            label: "Contact",
            text: "involve the deal team before the selection decision is made. The deal team has experience with these implementations, and the choice has a significant impact on the business, depending on the investment size it may be subject to IC approval.",
          },
        ],
      },
      {
        type: "protocol",
        title: "What to do when the auditor or the financial year changes",
        items: [
          {
            label: "When",
            text: "on appointment of a new audit firm or a change in the financial year end.",
          },
          {
            label: "What to submit",
            text: "the name of the firm and the engagement partner, the audit timetable, and the new reporting periods.",
          },
          { label: "Note", text: "see chapter 4 for the audit process." },
        ],
      },
      {
        type: "protocol",
        title: "What to do when an accounting policy changes",
        items: [
          {
            label: "When",
            text: "before a change in policy is applied, for example on software capitalisation, revenue recognition, provisioning or lease treatment.",
          },
          {
            label: "What to submit",
            text: "the current and proposed policy, the reason for the change, and the quantified effect on EBITDA, net debt and equity.",
          },
          {
            label: "Note",
            text: "policy changes affect comparability across the portfolio. See chapter 8 for the positions that are set at portfolio level and cannot be changed unilaterally.",
          },
        ],
      },
      { type: "heading", text: "3.4 Operations & continuity", level: 2 },
      {
        type: "paragraph",
        text: "Items that disturb the normal run of the business and have to be classified correctly before they reach the figures.",
      },
      {
        type: "protocol",
        title: "What to do for one-off or exceptional items",
        items: [
          {
            label: "When",
            text: "for reorganisation costs, exceptional income or expenses, impairments, or a change in segment structure.",
          },
          {
            label: "What to submit",
            text: "a normalisation note in the comment row; explicitly identify the split between recurring and non-recurring (see Definition in section 6.1).",
          },
          {
            label: "Note",
            text: "check the definitions in the performance sheet carefully before you classify an item. The recurring versus non-recurring split and the normalisation lines are defined there, and applying your own interpretation breaks comparability. Normalisations are validated by the deal team before being reflected in the valuation. Do not apply normalisations unilaterally; align first.",
          },
        ],
      },
      {
        type: "protocol",
        title: "What to do when an impairment trigger arises",
        items: [
          {
            label: "When",
            text: "on any indication that goodwill, capitalised software or fixed assets may not be recoverable, for example a lost customer, a discontinued product or persistent underperformance versus plan.",
          },
          {
            label: "What to submit",
            text: "the asset concerned, the carrying amount, the trigger, and the estimated impairment.",
          },
          {
            label: "Note",
            text: "impairments are reported as non-recurring and are validated by the deal team before being reflected in the valuation.",
          },
        ],
      },
      {
        type: "protocol",
        title: "What to do when a legal claim, dispute or provision arises",
        items: [
          {
            label: "When",
            text: "as soon as a claim, dispute or arbitration is filed or received, or a provision becomes probable.",
          },
          {
            label: "What to submit",
            text: "the nature of the matter, the estimated exposure, the provision recognised, and any insurance cover.",
          },
          {
            label: "Contact",
            text: "notify the deal team. Legal or arbitration proceedings are a reserved matter under the SHA; see section 2.3.",
          },
        ],
      },
      {
        type: "protocol",
        title: "What to do after a cyber incident or a case of fraud",
        items: [
          {
            label: "When",
            text: "immediately on discovery, also where the financial impact is not yet quantifiable.",
          },
          {
            label: "What to submit",
            text: "what happened, which systems or data are affected, the effect on continuity and on the reliability of the reported figures, and the remediation steps.",
          },
          {
            label: "Contact",
            text: "notify the deal team immediately. Where the incident affects the closing process, the reporting deadline is agreed separately.",
          },
        ],
      },
    ],
  },
  {
    id: "external-audit",
    number: "04",
    title: "External Audit Guide",
    summary: "Aligning the annual audit with monthly reporting: audit firm, the reporting bridge, the audit timeline, 403/408 declarations and ledger adjustments.",
    icon: FileSearch,
    category: "governance",
    readTime: "4 min read",
    blocks: [
      {
        type: "paragraph",
        text: "The annual statutory audit intersects with the monthly reporting process. This chapter explains how to align the two, what to submit and when, how audit adjustments are processed in the ledger, and how the finance team supports you.",
      },
      { type: "heading", text: "Audit firm & annual report", level: 2 },
      {
        type: "paragraph",
        text: "Alma Capital Partners requires New-Co to conduct a statutory audit even if not legally obligated. The deal team can recommend audit firms; please contact the deal team for an introduction.",
      },
      {
        type: "callout",
        title: "Advantages of an Alma Capital Partners-aligned auditor",
        items: [
          "Alma Capital Partners knows the quality and pricing of these firms",
          "Unified procedures already in place (PPA, valuations, structures)",
          "Alma Capital Partners can assist if timelines slip",
          "Planning can be coordinated with other portfolio companies",
        ],
      },
      { type: "heading", text: "Alma Capital Partners involvement in the annual report", level: 2 },
      {
        type: "list",
        items: [
          "Alma Capital Partners does not sign the annual report but must officially approve the final draft including the management letter.",
          "The Alma Capital Partners team joins the closing call with the auditor and receives the report",
        ],
      },
      { type: "heading", text: "Statutory adjustments: reporting bridge", level: 2 },
      {
        type: "list",
        items: [
          "After the annual report is signed, provide a bridge between year-end management figures and audited figures. Send to reporting@almacapital.com.",
          "Include the final signed annual report with management summary in the same email.",
        ],
      },
      { type: "heading", text: "Timeline: what to do when", level: 2 },
      {
        type: "paragraph",
        text: "The audit year in six steps, with the action expected from you at each point.",
      },
      {
        type: "table",
        columns: ["Phase", "Timing", "Your action towards the finance team"],
        rows: [
          [
            "Audit planning",
            "May (current year)",
            "Agree the audit planning with the auditor before the summer: when the interim audit takes place, when the field work for the year-end audit is scheduled, the date the closing figures and the draft annual accounts have to be ready, the request list, materiality and the contact persons on both sides. Share that planning with the finance team and put the dates in the diary.",
          ],
          [
            "Preparation",
            "Nov–Dec (current year)",
            "Inform the finance team of the planned audit period and the external auditor, so the Audit dimension can be configured in time.",
          ],
          [
            "Preliminary year-end figures",
            "Within 10 working days after 31 Dec",
            "Submit December figures as Actual (management accounts). Note in the comment row: \"preliminary, audit in progress.\"",
          ],
          [
            "Interim review",
            "Q4 or Q1 of following year",
            "No separate submission required. Notify the finance team of any adjustments the auditor proposes.",
          ],
          [
            "Final year-end figures",
            "After signing of audit opinion",
            "Submit audited figures as the Audit dimension in the performance sheet. The finance team automatically compares these with previously submitted management accounts.",
          ],
          [
            "Management letter",
            "Within 2 weeks of receipt",
            "Forward the management letter to the finance team. Findings that affect previously reported KPIs will be discussed.",
          ],
        ],
      },
      { type: "heading", text: "403/408 declarations (Dutch regulatory)", level: 2 },
      {
        type: "paragraph",
        text: "Two Dutch statutory exemptions that come up in group structures, and the position Alma Capital Partners takes on each.",
      },
      {
        type: "callout",
        title: "403 declaration: exemption from subsidiary audit",
        text: "Article 403 of the Dutch Civil Code enables an exemption from individual subsidiary audits, consolidating obligations at parent level. Note: this increases the liability of the parent entity. Alma Capital Partners is generally reluctant to use 403 declarations for this reason.",
      },
      {
        type: "callout",
        title: "408 declaration: holding company exemption",
        text: "Article 2:408 Dutch Civil Code exempts an intermediate holding company from the obligation to prepare consolidated accounts, provided that its parent consolidates it, that the parent consolidated accounts are filed, and that no shareholder objects within the applicable period. Both 403 and 408 statements may require permission from the financing bank; check the loan terms and conditions.",
      },
      { type: "heading", text: "Audit adjustments in the ledger", level: 2 },
      {
        type: "paragraph",
        text: "Audit adjustments are processed in the accounting records, not only in the annual accounts. Without this the management reporting drifts structurally away from the statutory figures.",
      },
      {
        type: "list",
        items: [
          "All adjustments agreed with the auditor are posted in the ledger. For this purpose the closed period may be reopened and the entries made in the financial year to which they relate; close the period again once the entries are booked.",
          "After the audit, the closing balance in the ledger equals the balance sheet in the annual accounts; any remaining difference is explained item by item.",
          "The performance sheet is not restated for these entries. The monthly figures as submitted stay as they are; the effect becomes visible in the following year as a movement in equity.",
          "Once the annual accounts are finalised they are submitted, and the final statutory figures are entered in the performance sheet under the dimension \"AUDIT\". That keeps the reported figures and the audited figures side by side in one data set, which is what the reporting bridge is built on.",
          "The opening balance of the new financial year is locked once the annual accounts are adopted and is not changed afterwards.",
        ],
      },
      {
        type: "paragraph",
        text: "Note: the differences between reported and statutory figures are set out in the reporting bridge described above.",
      },
    ],
  },
  {
    id: "reporting-calendar",
    number: "05",
    title: "Reporting Calendar",
    summary: "The annual reporting rhythm in one place: monthly, annual and filing deliverables and their deadlines.",
    icon: CalendarClock,
    category: "accounting",
    readTime: "1 min read",
    blocks: [
      {
        type: "paragraph",
        text: "This chapter sets out the annual reporting rhythm in one place: what you deliver monthly, quarterly and annually, when each deliverable is due, and in which format. The standard cadence applies across the portfolio; confirm the exact dates and any deal-specific obligations against the shareholders' agreement.",
      },
      {
        type: "table",
        columns: ["Frequency", "Deliverable", "Deadline"],
        rows: [
          [
            "Monthly",
            "Performance sheet in Alma Capital Partners format",
            "Month-end + 10 working days",
          ],
          ["Monthly", "Reporting package", "Per steering committee schedule"],
          ["Annually", "Audited annual statements", "Per SHA"],
          ["Annually", "Bridge: annual accounts → performance sheet", "30 June"],
          ["Annually", "Revised long term plan", "30 June"],
          ["Annually", "ESG reporting", "30 April"],
          ["Annually", "Strategic initiatives (VCP) for budget", "31 October"],
          [
            "Annually",
            "Budget",
            "15 January: completed performance sheet with the budget approved by the deal team",
          ],
          ["Annually", "Annual meeting: adoption of annual report", "—"],
          ["Annually", "Filing at Chamber of Commerce", "Within 8 days of adoption"],
        ],
      },
    ],
  },
  {
    id: "performance-sheet",
    number: "06",
    title: "Performance Sheet",
    summary: "How the performance sheet works: the monthly process, common errors, the ARR and MRR bridge, and add-on reporting rules.",
    icon: BarChart3,
    category: "accounting",
    readTime: "8 min read",
    blocks: [
      {
        type: "paragraph",
        text: "The performance sheet is the Excel template you submit each month. It is the central instrument with which Alma Capital Partners monitors the financial performance of your company.",
      },
      {
        type: "callout",
        title: "One data model. One process. One source of truth.",
        text: "Process: a fixed deadline for every portfolio company. Data model: all portfolio companies use the same structure and definitions. Goal: value creation through improved steering information.",
      },
      {
        type: "paragraph",
        text: "The finance team supports you throughout this process. You do not need to figure out the reporting process yourself: we configure your company in the platform, validate your submissions, and are your first point of contact for any questions. This handbook and the team together form the basis for a smooth, predictable monthly rhythm.",
      },
      {
        type: "paragraph",
        lead: "Better steering information makes companies perform better.",
        text: "That is the core belief behind the entire programme.",
      },
      { type: "heading", text: "6.1 How the performance sheet works", level: 2 },
      {
        type: "paragraph",
        text: "Why the performance sheet exists, what the template contains, how the monthly process runs, what is expected of you each month, and the definitions that apply.",
      },
      {
        type: "table",
        columns: ["Reason", "What it means for you"],
        rows: [
          [
            "Better decisions",
            "Better financial and operational data leads to better management decisions for your company, not just for the fund.",
          ],
          [
            "Portfolio-wide oversight",
            "As the portfolio grows, fund-level oversight requires a common standard. Timely, correct, and complete reporting from every company makes it possible to manage and learn across the portfolio.",
          ],
          [
            "Efficiency",
            "Uniform reporting, ways of working, and definitions reduce manual work, errors, and inconsistencies on both sides, which frees up time for analysis instead of data cleanup.",
          ],
          [
            "Compliance & governance",
            "Structured, auditable, and consistently maintained data across the portfolio is increasingly a baseline expectation from stakeholders.",
          ],
          [
            "Foundation for AI",
            "AI only works on clean, structured, and securely stored data. Getting the foundation right now is also an investment in more advanced analytical capabilities down the line.",
          ],
          [
            "Common belief",
            "The starting point is much the same everywhere: reporting has grown organically in spreadsheets, definitions differ per company, and month-end is largely manual. The shared belief across the portfolio is that this is a one-off investment with a lasting return: once definitions, structure, and process are fixed, every subsequent month costs less effort, and the same data set serves budgeting, the bank, the auditor, benchmarking, and later automation. The outlook is that data quality shifts from a reporting topic to a management topic: stakeholders, lenders, and buyers will increasingly assume it is in place rather than ask for it.",
          ],
        ],
      },
      { type: "paragraph", text: "The template has four mandatory sections:" },
      {
        type: "list",
        items: [
          "P&L: income statement",
          { lead: "Balance Sheet:", text: "assets, liabilities, and equity" },
          { lead: "Cash Flow:", text: "cash flow statement" },
          { lead: "KPIs:", text: "other business drivers" },
        ],
      },
      {
        type: "paragraph",
        text: "Within the template, multiple dimensions are tracked, each offering a different perspective on the same data:",
      },
      {
        type: "table",
        columns: ["Dimension", "Definition", "When relevant"],
        rows: [
          [
            "Actual",
            "Realised figures for the closed period.",
            "Every month; the core of the submission.",
          ],
          [
            "Budget",
            "The approved plan set at the start of the year.",
            "From year-start; fixed reference point for the full fiscal year.",
          ],
          [
            "LTM",
            "Last Twelve Months: the sum of the most recent 12 calendar months.",
            "Ongoing; used for trend analysis and valuation.",
          ],
          [
            "LE",
            "Latest Estimate: the most recent full-year forecast.",
            "When updating the annual outlook during the year.",
          ],
          [
            "IC",
            "Investment case on which the investment was made: the original underwriting figures.",
            "Reference basis for performance against the underwriting case. Set once at entry and not changed thereafter.",
          ],
          [
            "Exit",
            "Figures prepared in the context of a sale or exit.",
            "During exit processes or due diligence.",
          ],
          [
            "Audit",
            "Final year-end figures as audited by the external auditor.",
            "After completion of the statutory audit.",
          ],
        ],
      },
      { type: "heading", text: "The monthly process and what is expected of you", level: 3 },
      {
        type: "paragraph",
        text: "The process is designed to take as little of your time as possible. You fill in the performance sheet once a month; the rest is largely automated:",
      },
      {
        type: "steps",
        items: [
          {
            title: "You submit the performance sheet",
            detail: "Monthly, within 10 working days after month-end. See the reporting calendar in chapter 5 for full details.",
          },
          {
            title: "Automatic import into the platform",
            detail: "No further action is needed; the file is processed automatically.",
          },
          {
            title: "Validation by the finance team",
            detail: "We check completeness and consistency, and contact you if anything needs correction.",
          },
          {
            title: "Dashboards go live",
            detail: "Your data is available for Alma Capital Partners portfolio monitoring and LP reporting.",
          },
        ],
      },
      {
        type: "list",
        items: [
          {
            lead: "On time & complete:",
            text: "full submission within 10 working days after month-end.",
          },
          {
            lead: "All three statements:",
            text: "P&L, balance sheet, and cash flow are each mandatory; a submission missing any one of them is incomplete.",
          },
          {
            lead: "KPIs per definition:",
            text: "complete KPIs in line with the agreed definitions (see section 6.1), not your own interpretation.",
          },
          {
            lead: "Commentary on deviations:",
            text: "always use the comment row in the template for unusual items or deviations.",
          },
        ],
      },
      {
        type: "callout",
        title: "Direct upload",
        text: "Upload the sheet directly via the portal. You can track the status of your submission there immediately.",
      },
      {
        type: "paragraph",
        text: "Upon receipt you will receive an automatic confirmation. The finance team then performs a validation check for completeness and consistency. If any issues arise, we will contact you.",
      },
      { type: "heading", text: "Common errors", level: 3 },
      {
        type: "paragraph",
        text: "The four errors that cause most rejected submissions; check each one before you upload.",
      },
      {
        type: "callout",
        title: "Balance sheet does not reconcile to cash flow",
        text: "The movement in cash per the balance sheet does not match the net cash position in the cash flow statement. Check the reconciliation before submitting; this is the most common reason for rejection.",
        tone: "warning",
      },
      {
        type: "callout",
        title: "Budget column left empty after year-start",
        text: "From the first submission of the new financial year, the Budget column must be populated. An empty Budget column makes plan comparison impossible and blocks variance analysis.",
        tone: "warning",
      },
      {
        type: "callout",
        title: "LTM manually overridden instead of using the formula",
        text: "LTM values are automatically calculated in the template. Manual overrides cause inconsistencies with the underlying monthly data. Leave the formulas intact and only adjust the source data.",
        tone: "warning",
      },
      {
        type: "callout",
        title: "Prior-month adjustments break the YTD total",
        text: "Adjustments made to previously reported months cause the year-to-date figures to stop reconciling. Do not restate closed months; report the correction in the current month, so that the YTD total continues to tie back to the sum of the monthly submissions.",
        tone: "warning",
      },
      { type: "heading", text: "6.2 ARR & MRR bridge", level: 2 },
      {
        type: "paragraph",
        text: "How Annual Recurring Revenue moves from opening to closing balance, and the mutation types used to explain it; applicable to SaaS and software companies with own-IP recurring revenue only.",
      },
      {
        type: "callout",
        title: "ARR definition",
        text: "ARR = Annual Recurring Revenue from own-IP software only. Excludes managed services, reselling, and third-party revenue. MRR = Monthly Recurring Revenue = ARR / 12.",
      },
      {
        type: "paragraph",
        text: "The ARR bridge explains how Annual Recurring Revenue moved from the opening to the closing balance over a period. Every change is classified into a mutation type, so growth and churn can be read at a glance and always reconcile back to closing ARR.",
      },
      {
        type: "paragraph",
        text: "The bridge walks from opening to closing ARR through the following mutation types:",
      },
      {
        type: "table",
        columns: ["Mutation type", "Definition"],
        rows: [
          [
            "New clients",
            "First-time customers that move from zero to positive ARR (on an LTM basis, treated as new only for their first 12 months).",
          ],
          [
            "Cross-sell",
            "An existing customer starts buying from a product group that was previously zero.",
          ],
          [
            "Upsell (price / product / volume)",
            "Higher ARR within an existing product group, driven by a price increase, additional products, or more volume.",
          ],
          [
            "Downsell (price / product / volume)",
            "Lower ARR within an existing product group, driven by price cuts, lost products, or lower volume.",
          ],
          [
            "Label churn",
            "A product group falls to zero ARR while the customer keeps other products.",
          ],
          ["Churn", "The customer falls to zero ARR entirely."],
          ["ARR adjustments & corrections", "Manual corrections and subscription harmonisations."],
          ["Closing ARR", "Opening ARR plus all changes in the period."],
        ],
      },
      {
        type: "paragraph",
        text: "Retention metrics fall out of the bridge: GRR (Gross Revenue Retention) reflects the opening base after churn and downsell only; NRR (Net Revenue Retention) also includes upsell and cross-sell. New-client ARR is excluded from both.",
      },
      {
        type: "paragraph",
        text: "Methodology: because most ERP systems keep no history of subscription changes, subscription data is logged on the first of each month and the movement between logging dates is classified into the mutation types above. Revenue is recognised from the subscription line's start date: retroactive lines in the month before first logging, mid-period changes at the logging date minus one day, and recognition stops at the line's end date.",
      },
      {
        type: "callout",
        title: "Not all portfolio companies report ARR",
        text: "ARR and the MRR bridge are only applicable for SaaS and software-as-a-service companies with own-IP recurring revenue. For other business models, this section is not required. Align with the finance team at onboarding.",
      },
      { type: "heading", text: "6.3 Add-on reporting rules", level: 2 },
      {
        type: "paragraph",
        text: "These rules govern how an add-on acquisition is reflected in the performance sheet. See section 3.1 for what to notify and submit when an acquisition is confirmed.",
      },
      { type: "heading", text: "Actuals: never restate history", level: 3 },
      {
        type: "list",
        items: [
          "Historical data in management reporting must never be retrospectively adjusted.",
          "Any necessary adjustments are processed in the current reporting month, not in prior months, to ensure YTD figures remain consistent.",
          "For material differences in older months, consult the deal team before making adjustments.",
          "For add-on consolidation: the effective date (first day of the fiscal year) is leading for management reporting. Process any delta in the current month.",
        ],
      },
      { type: "heading", text: "LTM: include the full twelve months of the add-on", level: 3 },
      {
        type: "list",
        items: [
          "Include the full LTM of the add-on in the LTM figures reported. Calculated and Reported LTM will differ because of this.",
        ],
      },
      { type: "heading", text: "LE: update from the effective date", level: 3 },
      {
        type: "list",
        items: [
          "The LE is adjustable each month and shows the projected full-year result.",
          "For add-ons: include the LE from the effective date (from the month it is also reflected in Actuals).",
        ],
      },
      { type: "heading", text: "Budget: fixed for the year, with one exception", level: 3 },
      {
        type: "list",
        items: [
          "The approved budget is submitted once a year and is not adjusted thereafter.",
          "Exception: after an add-on acquisition, update the Budget for the remaining months to the original budget plus the budget or expectation of the add-on.",
        ],
      },
    ],
  },
  {
    id: "cash-treasury",
    number: "07",
    title: "Cash & Treasury",
    summary: "The treasury basics expected in any financed group: bank mandates, payment controls, liquidity forecasting, the credit facility and currency exposure.",
    icon: Banknote,
    category: "accounting",
    readTime: "1 min read",
    underConstruction: true,
    blocks: [
      {
        type: "paragraph",
        text: "Cash is where a financed deal is won or lost, and it is the first thing the fund wants sight of. This chapter sets out the basics that should be in place around bank mandates, payment authorisation, liquidity forecasting, the credit facility and currency exposure, and how Alma Capital Partners can help you set them up.",
      },
      {
        type: "callout",
        title: "Under construction",
        text: "This chapter is being built out. The highlights below show what it will cover. In the meantime, raise anything on cash, payment authorisation or liquidity with the finance team.",
      },
      { type: "heading", text: "The basics we expect in place", level: 2 },
      {
        type: "paragraph",
        text: "Six items that should be arranged in any financed group, whatever its size.",
      },
      {
        type: "list",
        items: [
          "Bank mandates: who can commit the company to a payment, with limits per person and per account, and how the mandate is updated when a director changes.",
          "Four-eyes principle on outgoing payments, on changes to supplier bank details, and on credit notes.",
          "A rolling short-term liquidity forecast, weekly or on a thirteen-week horizon for a financed deal, reconciled to the actual bank balance.",
          "A minimum cash position, and the level at which the deal team is informed before the position is reached.",
          "Use of the credit facility: available headroom, drawdown and repayment conditions, and who approves a drawdown.",
          "Currency exposure: which currencies the group runs, the size of the exposure, and whether any hedging is in place.",
        ],
      },
    ],
  },
  {
    id: "accounting-positions",
    number: "08",
    title: "Accounting Position Guidelines",
    summary: "Software capitalisation, COGS, revenue recognition, leases, personnel accruals, goodwill, consolidation and intercompany.",
    icon: Calculator,
    category: "accounting",
    readTime: "13 min read",
    blocks: [
      {
        type: "paragraph",
        text: "The guidelines below are authoritative for how specific items must be classified in the performance sheet, and for how the group is consolidated and intercompany positions are handled. Apply them consistently; reclassifications require prior alignment with the deal team because they affect historical comparability.",
      },
      { type: "heading", text: "8.1 Software Capitalisation", level: 2 },
      {
        type: "paragraph",
        text: "Whether software should be capitalised, and if so how to classify it, is a common source of error.",
      },
      { type: "heading", text: "CapEx criteria under Dutch GAAP (RJ)", level: 3 },
      {
        type: "list",
        items: [
          {
            lead: "Future benefit:",
            text: "it is probable that the future economic benefits or cash flows will flow to the company (general recognition criteria, RJ 115).",
          },
          {
            lead: "Useful life:",
            text: "the asset or durable cost item has an economic useful life of more than one financial year.",
          },
        ],
      },
      {
        type: "paragraph",
        text: "RJ reference: RJ 210.224. Research costs are always expensed directly (OpEx). Development costs may only be capitalised as CapEx if technical feasibility, the intent to complete and use, and the future economic benefits are cumulatively demonstrated.",
      },
      { type: "heading", text: "What counts as 'development'? (RJ 210.0)", level: 3 },
      {
        type: "paragraph",
        text: "Development costs are capitalised only if the work meets the RJ 210.0 definition: applying knowledge obtained through research or otherwise in a new way, leading to a plan or design for the production of new or substantially improved materials, devices, products, processes, systems or services, before the start of commercial production or use.",
      },
      { type: "paragraph", text: "In practice this means:" },
      {
        type: "list",
        items: [
          "Internally developed (maatwerk) software that meets this definition qualifies, even if reported under the balance sheet line 'software' rather than 'development costs'.",
          "External costs on an internal development project (e.g. third-party developers) that meet this definition must also be included.",
          "Film and media production companies using existing technology to produce commercial content do not meet this definition: no capitalisation obligation.",
        ],
      },
      {
        type: "table",
        columns: ["Situation", "Capitalise?", "Explanation"],
        rows: [
          [
            "External software purchase (perpetual licence)",
            "YES",
            "Capitalise if useful life > 1 year and amount is material. Depreciate over economic life (typically 3–5 years).",
          ],
          [
            "SaaS subscription",
            "NO",
            "Not an asset: you do not control the underlying software. Recognise as operating expense in the P&L.",
          ],
          [
            "Internally developed software: development phase",
            "YES",
            "Capitalise costs once technical feasibility is established and there is clear intent to complete and use the software. Both internal labour and directly attributable external costs may be capitalised.",
          ],
          [
            "Internally developed software: research phase",
            "NO",
            "Research-phase costs are always expensed. Do not capitalise, even if they later lead to a successful product.",
          ],
          [
            "Standard software tailored for internal use ('tailoring')",
            "NO",
            "Internal tailoring costs are not development costs as defined under RJ 210.0. They are part of the acquisition price of the standard software and carry no legal reserve obligation.",
          ],
          [
            "Maintenance & bug fixes",
            "NO",
            "Direct expense. Only significant enhancements that demonstrably extend the useful life or add new functionality may be capitalised.",
          ],
          [
            "IP transfer or software acquired in an acquisition",
            "YES",
            "Capitalise at fair value on acquisition date. Align with PPA and notify the deal team (see section 3.1).",
          ],
        ],
      },
      {
        type: "heading",
        text: "Legal reserve: mandatory under Dutch GAAP (art. 2:365 lid 2 BW)",
        level: 3,
      },
      {
        type: "paragraph",
        text: "Once development costs are capitalised, a statutory legal reserve (wettelijke reserve geactiveerde ontwikkelingskosten) must be formed. This is a non-distributable reserve in equity, equal in principle to the net carrying amount of capitalised development costs at year-end.",
      },
      { type: "paragraph", text: "Key points for the annual accounts:" },
      {
        type: "list",
        items: [
          "The legal reserve is formed at year-end and reduces distributable equity by the same amount.",
          "If a government subsidy has been received for the development project, the legal reserve is reduced accordingly; the subsidy is treated as an investment subsidy (RJ 274) or deferred income (RJ 29.6.2), not as a reduction of the activated amount.",
          "The legal reserve must be disclosed separately in the notes. Failure to form the reserve is a compliance issue; flag this to the auditor before signing.",
        ],
      },
      { type: "heading", text: "WBSO and the capitalised base", level: 3 },
      {
        type: "paragraph",
        text: "The WBSO is granted as a reduction of the payroll tax remittance, so it lands as a credit against the wage costs of the R&D hours it relates to, not as revenue or other income. Where those hours are capitalised as development costs, capitalise them net of the credit: the capitalised base is the gross labour cost less the WBSO attributable to the capitalised hours. Because the legal reserve follows the net carrying amount of capitalised development costs, a lower base also means a lower legal reserve. Keep the WBSO hour administration reconcilable with the hours capitalised per project; the same hours have to support both, and the auditor tests them together. The finance team can help you set up the treatment and the reconciliation between the WBSO administration and the capitalised hours; contact them before the first year in which you capitalise.",
      },
      { type: "heading", text: "Classification: IFA or FA?", level: 3 },
      {
        type: "paragraph",
        text: "How capitalised software is classified depends on whether it can be separated from a related tangible asset:",
      },
      {
        type: "list",
        items: [
          "Separately identifiable software, such as a financial system, ERP, CRM, or internally developed application, is an intangible fixed asset. Report it on the IFA line in the performance sheet.",
          "Software that is integral to a tangible asset and cannot function independently (e.g. embedded machine control software) is reported as part of that tangible fixed asset on the FA line.",
        ],
      },
      {
        type: "paragraph",
        text: "The distinction follows RJ 210.107: if the software has a material component that is inseparable from the related hardware, it is processed as part of that tangible asset. If the software can be separately named and valued, it is an IFA.",
      },
      { type: "heading", text: "8.2 What Belongs in COGS?", level: 2 },
      {
        type: "paragraph",
        text: "The COGS definition determines the gross margin line, and therefore the benchmarks and valuation by Alma Capital Partners. Consistency is critical: do not change the definition from one month to the next without prior alignment.",
      },
      {
        type: "paragraph",
        lead: "The rule of thumb:",
        text: "COGS contains all costs that are directly necessary to produce and deliver the product or service. Costs that would exist even if there were no customers belong in OPEX, not COGS.",
      },
      {
        type: "paragraph",
        lead: "SaaS and software.",
        text: "In COGS: hosting and infrastructure, third-party licences resold or embedded in the product, support and customer success attributable to delivery, implementation and onboarding labour. In OPEX: sales and marketing, research, general and administrative, and product management.",
      },
      {
        type: "paragraph",
        lead: "Services and consultancy.",
        text: "In COGS: billable staff costs including employer charges, subcontractors and freelancers on client work, project travel and project-specific tooling. In OPEX: non-billable time, bench capacity, and central overhead.",
      },
      {
        type: "paragraph",
        lead: "Product and distribution.",
        text: "In COGS: materials, purchase value of goods sold, inbound and outbound freight, warehousing and packaging, and production labour. In OPEX: sales organisation and central functions.",
      },
      {
        type: "paragraph",
        lead: "Two decisions to record explicitly.",
        text: "First, where the amortisation of capitalised software sits: above the gross margin line as part of delivery cost, or below it as amortisation. Second, where research and development sits, and whether any part of it is treated as COGS. Both choices change the gross margin materially, so record them once at onboarding and apply them unchanged.",
      },
      {
        type: "callout",
        title: "Definition changes require prior alignment",
        text: "Never change the COGS definition mid-year without consulting the deal team. A change makes historical gross margin comparisons unreliable. If a reclassification is necessary, we will restate all prior periods accordingly.",
        tone: "warning",
      },
      {
        type: "callout",
        title: "Document borderline cases",
        text: "Unsure whether a cost belongs in COGS or OPEX? Note your reasoning in the comment row of the first relevant performance sheet and align with the deal team. Once agreed, it is recorded as the reference for all future periods.",
        tone: "tip",
      },
      { type: "heading", text: "8.3 Revenue recognition", level: 2 },
      {
        type: "paragraph",
        text: "Revenue recognition is the single largest source of non-comparable EBITDA across the portfolio. The position below applies to all portfolio companies unless a different treatment is agreed in writing with the deal team.",
      },
      {
        type: "list",
        items: [
          "Subscription and licence revenue is recognised over the contract term, on a straight-line basis, from the start date of the subscription line.",
          "One-off implementation, onboarding and setup fees are recognised over the expected customer life where the service has no stand-alone value, and at delivery where it does. Document which of the two applies.",
          "Project and services revenue is recognised as the work is performed (percentage of completion) where the outcome can be measured reliably; otherwise on completion.",
          "Work in progress follows the recognition method: unbilled revenue already earned is presented as work in progress (contract asset), and amounts invoiced ahead of the work performed as deferred revenue. Cost incurred plus recognised margin, never at expected selling price.",
          "Gross versus net: revenue is reported gross only where the company is principal and bears inventory, pricing and credit risk. Resold third-party licences, hardware or marketplace transactions where the company acts as agent are reported net, at the commission earned.",
          "Invoicing is never a recognition trigger. Amounts invoiced ahead of delivery sit in deferred revenue and are reported as such in the balance sheet.",
          "Discounts, rebates and credit notes are deducted from revenue, not presented as costs.",
        ],
      },
      {
        type: "paragraph",
        text: "RJ reference: RJ 270 (revenue). Deferred revenue is excluded from the net debt definition unless explicitly agreed; see section 6.1.",
      },
      {
        type: "callout",
        title: "Write down which treatment applies",
        text: "For implementation and setup fees, and for the gross versus net assessment, document the reasoning once and keep it with the mapping file. That note is what the auditor asks for, and it keeps the treatment stable when the finance team changes.",
        tone: "tip",
      },
      { type: "heading", text: "8.4 Leases", level: 2 },
      {
        type: "paragraph",
        text: "Lease classification changes both EBITDA and net debt without changing a single euro of cash flow, which makes it a recurring source of confusion in comparisons and covenant calculations.",
      },
      {
        type: "table",
        columns: ["Aspect", "Operating lease", "Finance lease"],
        rows: [
          [
            "P&L",
            "Lease payments recognised as a cost in the relevant line (COGS or OPEX) over the lease term.",
            "Depreciation of the capitalised asset, plus the interest portion in financial expenses.",
          ],
          [
            "EBITDA",
            "Reduced by the lease cost; never added back.",
            "Not affected: depreciation and interest sit below EBITDA.",
          ],
          [
            "Balance sheet",
            "No asset and no liability recognised.",
            "Asset capitalised with a corresponding lease liability.",
          ],
          ["Net debt", "No effect.", "Lease liability forms part of net debt; see section 6.1."],
        ],
      },
      {
        type: "list",
        items: [
          "Management reporting follows Dutch GAAP (RJ 292): operating leases are recognised as a cost in the P&L over the lease term; finance leases are capitalised with a corresponding lease liability.",
          "Classification is based on economic substance: term relative to useful life, purchase options, residual value risk, and the present value of the lease payments.",
          "Operating lease costs belong in the relevant cost line (COGS or OPEX) and are not added back to EBITDA.",
          "Finance lease liabilities form part of net debt; the interest portion sits in financial expenses, the depreciation in depreciation.",
          "Sale-and-leaseback transactions are aligned with the deal team before signing; see section 3.2.",
          "Where the group also reports under IFRS 16 for financing or audit purposes, both bases are reconciled once a year in the reporting bridge; see chapter 4.",
        ],
      },
      {
        type: "paragraph",
        text: "RJ reference: RJ 292 (leasing). Do not apply IFRS 16 treatment in the performance sheet without prior written alignment; it inflates EBITDA and net debt simultaneously.",
      },
      {
        type: "callout",
        title: "Do not mix IFRS 16 into the performance sheet",
        text: "Management reporting follows RJ 292. Applying IFRS 16 treatment without prior written alignment inflates EBITDA and net debt at the same time, which breaks both portfolio benchmarking and covenant calculations.",
        tone: "warning",
      },
      { type: "heading", text: "8.5 Personnel accruals & incentives", level: 2 },
      {
        type: "paragraph",
        text: "Personnel accruals are the most common cause of a gap between the monthly figures and the annual accounts. They are built up monthly, not booked in December.",
      },
      {
        type: "list",
        items: [
          "Holiday pay and untaken holiday days are accrued monthly on the basis of the actual balance per employee, not on an estimate at year-end. The holiday-day provision is recalculated every month from the leave administration at current salary levels, so the balance in the books always reflects the actual entitlement; a year-end catch-up entry distorts the monthly result.",
          "Bonus and commission schemes are accrued monthly at the expected pay-out for the year to date, adjusted as expectations change; the change goes through the current month.",
          "Employer social charges and pension contributions are accrued on the same basis as the underlying salary or bonus.",
          "Management incentive plans (options, SARs, phantom shares) follow the treatment agreed with the deal team; the accrual is disclosed separately in the comment row and treated as non-recurring only where explicitly agreed.",
          "Capitalised own labour is only recognised where the software capitalisation criteria in section 8.1 are met, and at cost including employer charges.",
          "Severance and redundancy costs are recognised when the obligation arises and reported as non-recurring; see section 3.4.",
        ],
      },
      {
        type: "paragraph",
        text: "RJ reference: RJ 271 (employee benefits). A change in a bonus scheme or incentive plan is notified in advance; see section 3.2 for cap table effects.",
      },
      {
        type: "callout",
        title: "Accrue monthly, not in December",
        text: "The check: at every month-end the holiday and bonus balances in the ledger should tie back to the leave administration and to the year-to-date pay-out expectation. If closing December requires a large correction entry, the monthly accrual was not maintained.",
      },
      { type: "heading", text: "8.6 Goodwill & impairment", level: 2 },
      {
        type: "paragraph",
        text: "Relevant for every company that has completed an acquisition; goodwill and capitalised software are the assets most often carried for too long. How goodwill arises on an acquisition, and how it is measured and allocated in the purchase price allocation, is set out in chapter 9, Acquisition Accounting. This section covers what happens after recognition: amortisation, impairment testing and reporting.",
      },
      {
        type: "list",
        items: [
          "Goodwill is amortised over its expected useful life. Under Dutch GAAP this does not exceed 20 years; for the portfolio the standard is 10 years unless agreed otherwise.",
          "Goodwill amortisation is presented separately and excluded from EBITDA.",
          "An impairment test is performed as soon as a trigger arises: a lost major customer, a discontinued product, structural underperformance versus plan, or a materially higher discount rate.",
          "The test is performed at the level of the cash-generating unit to which the goodwill was allocated in the purchase price allocation; see chapter 9, Acquisition Accounting.",
          "An impairment is reported as non-recurring and is validated by the deal team before it is reflected in the valuation; see section 3.4.",
          "Goodwill impairments are not reversed in later periods.",
        ],
      },
      {
        type: "paragraph",
        text: "RJ reference: RJ 210 / RJ 216 (intangible assets and business combinations) and RJ 121 (impairment of fixed assets).",
      },
      {
        type: "callout",
        title: "Ten years is the portfolio standard",
        text: "Goodwill is amortised over ten years unless agreed otherwise, and the amortisation is presented separately and excluded from EBITDA. Impairment testing is event-driven, not calendar-driven: a lost major customer, a discontinued product, structural underperformance versus plan, or a materially higher discount rate.",
        tone: "warning",
      },
      { type: "heading", text: "8.7 Consolidation, eliminations & intercompany", level: 2 },
      {
        type: "paragraph",
        text: "As the group structure becomes more complex, consolidation software is recommended to ensure the consolidated balance sheet is always accurate.",
      },
      {
        type: "callout",
        title: "Recommended consolidation software",
        text: "Alma Capital Partners can recommend consolidation tooling on request; contact reporting@almacapital.com. Some tools integrate directly with the performance sheet, so the monthly file is produced from the consolidation rather than compiled by hand. The submission route is unchanged in either case: the sheet is uploaded via the portal, see section 6.1.",
      },
      { type: "heading", text: "Intercompany transactions", level: 3 },
      {
        type: "callout",
        title: "Policy on intercompany positions",
        text: "Alma Capital Partners discourages intercompany positions without clear repayment expectations. Instead, use a share premium contribution (agio-storting) for transfers between group entities with no expectation of repayment. The deal team maintains standard templates for this documentation and provides them on request.",
      },
      { type: "heading", text: "Intercompany interest rates", level: 3 },
      {
        type: "table",
        columns: ["Situation", "Rate", "Notes"],
        rows: [
          [
            "Within fiscal unity (VPB)",
            "0% is common practice",
            "Interest is eliminated for corporate income tax within the fiscal unity. The statutory accounts and the arm's length requirement still apply, so document the basis.",
          ],
          [
            "Outside fiscal unity",
            "At arm's length, determined per loan",
            "The rate follows from the terms of the loan and the credit standing of the borrower, not from a statutory percentage. The tax interest rate charged by the Dutch tax authority (6.5% in 2025, 5% in 2026) is not a transfer pricing benchmark. Agree the rate and its substantiation with your tax adviser.",
          ],
        ],
      },
      {
        type: "callout",
        title: "Intercompany agreements",
        text: "A formal intercompany current account agreement is required for loans between entities. The deal team maintains standard templates for intercompany agreements and for management (fee) agreements between New-Co and the working companies; request these before drafting your own, so the documentation is consistent across the portfolio.",
      },
    ],
  },
  {
    id: "acquisition-accounting",
    number: "09",
    title: "Acquisition Accounting",
    summary: "Opening balance and PPA, transaction costs, Dutch fiscal rules, add-on consolidation and cap table accounting.",
    icon: Combine,
    category: "accounting",
    readTime: "3 min read",
    blocks: [
      {
        type: "paragraph",
        text: "This chapter covers the accounting for an acquisition: the opening balance and the purchase price allocation, the classification of transaction costs, the Dutch fiscal rules, the consolidation of an add-on, and the cap table.",
      },
      { type: "heading", text: "Opening balance & purchase price allocation (PPA)", level: 2 },
      {
        type: "paragraph",
        text: "What to prepare and check when the opening balance of the acquisition is drawn up.",
      },
      {
        type: "list",
        items: [
          "Read the Share Purchase Agreement (SPA) carefully before preparing the opening balance.",
          "Use the final Sources & Uses table, cap table, and notary letter as the starting point and backup.",
          "Account for the opening balance on the share acquisition date.",
          "Have the opening balance checked by your auditor to ensure completeness and accuracy.",
        ],
      },
      {
        type: "paragraph",
        text: "Alma Capital Partners has standard models for PPA allocation and goodwill justification; contact the deal team.",
      },
      { type: "heading", text: "Transaction costs", level: 2 },
      {
        type: "paragraph",
        text: "How each type of transaction cost is treated in the books, and how it is treated for VAT and corporate income tax.",
      },
      {
        type: "table",
        columns: ["Cost type", "Accounting treatment"],
        rows: [
          ["Notary costs", "Part of the acquisition price of the participation"],
          ["Financing costs (bank-related)", "Capitalised and amortised over the term of the loan"],
          ["Debt advisory", "P&L"],
          [
            "Due diligence (financial, legal, tax, impact, commercial)",
            "Part of the acquisition price of the participation",
          ],
          ["Buy/sell advisory costs", "Handled by the sell side"],
          ["Valuation costs", "Part of the acquisition price of the participation"],
          ["Fiscal or accounting advice", "P&L"],
          ["Broken deal fees (failed acquisition costs)", "P&L"],
        ],
      },
      { type: "heading", text: "Fiscal rules (Netherlands)", level: 2 },
      {
        type: "table",
        columns: ["Cost type", "VAT treatment", "CIT treatment"],
        rows: [
          ["Notary costs", "No VAT", "Not deductible"],
          ["Financing costs (bank-related)", "No VAT", "Deductible"],
          ["Debt advisory", "VAT deductible", "CIT deductible"],
          [
            "Due diligence costs",
            "VAT deductible only where the acquiring entity performs VAT-taxable activities",
            "Not CIT deductible",
          ],
          ["Valuation costs", "VAT deductible", "Not CIT deductible"],
          ["Fiscal or accounting advice", "VAT deductible", "Deductible"],
        ],
      },
      {
        type: "paragraph",
        lead: "Condition for VAT recovery.",
        text: "Input VAT on acquisition costs is only recoverable where the acquiring entity performs VAT-taxable activities, for example because it charges a management fee to the working company and forms part of the VAT group. That is the mechanism described in section 2.2. In a pure holding company without such activities the VAT is not recoverable. Broken deal costs are a separate discussion, because recovery is often contested where no acquisition took place. Confirm the position with your tax adviser before reclaiming.",
      },
      {
        type: "paragraph",
        lead: "Interest deduction limits.",
        text: "For a New-Co carrying bank debt and a shareholder loan, the question that decides whether the interest is actually deductible is not the classification of the transaction costs but the interest deduction limits: the earnings stripping rule (article 15b Corporate Income Tax Act, 24.5% of fiscal EBITDA with a EUR 1 million threshold from 2025) and article 10a for group loans connected to the acquisition. Model the expected deductible interest with your tax adviser before the first budget, because a limitation feeds through to the tax charge, the cash flow forecast and the covenant headroom.",
      },
      { type: "heading", text: "Add-on consolidation", level: 2 },
      {
        type: "paragraph",
        text: "Which date governs the consolidation of an add-on, and what the cap table has to record.",
      },
      {
        type: "callout",
        title: "Integration date: which date is leading?",
        text: "For the annual report audit: the SPA date (official share transfer date) is leading. For consolidated management reporting: the effective date (usually 1 January of the fiscal year) is leading. As it is policy never to adjust historical data, any delta is processed in the current month.",
      },
      { type: "heading", text: "Cap table accounting", level: 2 },
      {
        type: "list",
        items: [
          "The cap table records the details of different share classes per shareholder.",
          "Alma Capital Partners has a standard cap table model; log historical distribution and all movements.",
          "The board of the company holds end responsibility for an accurate cap table.",
        ],
      },
    ],
  },
  {
    id: "budget-guidelines",
    number: "10",
    title: "Budget Guidelines: Sales & Costs",
    summary: "What we ask, the four-step budget process, revenue and the MRR bridge, drivers, costs, the deal team presentation and pre-submission checks.",
    icon: TrendingUp,
    category: "accounting",
    readTime: "5 min read",
    blocks: [
      {
        type: "paragraph",
        text: "The budget is the fixed reference point for the year. Once approved it does not change, and revised expectations go into the Latest Estimate. This chapter sets out what we ask, the four steps from ambition to submission, and how to build the revenue, KPI and cost parts of the budget.",
      },
      { type: "heading", text: "What we ask", level: 2 },
      {
        type: "paragraph",
        text: "We ask for three things: a budget built from your operational plan, starting with a clear goal and the key drivers behind it; a complete performance sheet, including your key drivers, the MRR bridge and FTE per department; and a budget presentation for your deal team, covering the strategic projects or battles to win for the year and your AI initiatives.",
      },
      {
        type: "callout",
        title: "Deadline: 15 January",
        text: "Submit the completed performance sheet, with the budget approved by your deal team, by 15 January. Send it to your deal team and reporting@almacapital.com. Once approved, the budget is fixed; revisions go in the Latest Estimate.",
      },
      { type: "heading", text: "The budget process in four steps", level: 2 },
      {
        type: "paragraph",
        text: "The budget is built in four steps. The first step usually starts before the budget season itself, as part of the regular contact with your deal team.",
      },
      {
        type: "list",
        items: [
          {
            lead: "Align on the budget ambition (step 1):",
            text: "hold a pre-budget meeting with your deal team to discuss the ambition for the year, such as ARR growth and profitability, and to agree on the operational drivers.",
          },
          {
            lead: "Build a bottom-up budget (step 2):",
            text: "build the budget from the bottom up, with drivers and key assumptions, as described in the sections below.",
          },
          {
            lead: "Approve the final draft (step 3):",
            text: "present and discuss the final draft with your deal team, including the strategic projects or battles to win for the year and your AI initiatives and their impact.",
          },
          {
            lead: "Submit the performance sheet (step 4):",
            text: "submit the completed performance sheet, including the KPIs and the MRR bridge, by 15 January.",
          },
        ],
      },
      { type: "heading", text: "Revenue and the MRR bridge", level: 2 },
      {
        type: "paragraph",
        text: "Use the same three revenue lines as in your actuals. Each line has its own build-up.",
      },
      {
        type: "list",
        items: [
          {
            lead: "Recurring Revenue own IP:",
            text: "subscriptions on your own software. Budget this line through the MRR bridge; the realised EoP MRR equals this line every month.",
          },
          {
            lead: "Recurring Revenue other:",
            text: "third-party or resold licences. Budget licences × price from the contracts, with the licence costs in COGS.",
          },
          {
            lead: "Non Recurring Revenue:",
            text: "services, implementation fees and other. Phase this line on pipeline and capacity.",
          },
        ],
      },
      {
        type: "paragraph",
        text: "Phase every line monthly on seasonality rather than as 1/12 of the annual total, and include indexation in the month it applies.",
      },
      {
        type: "paragraph",
        text: "The MRR bridge in the budget tab runs from the opening to the closing MRR for every month:",
      },
      {
        type: "list",
        items: [
          { lead: "BoP MRR:", text: "the MRR at the beginning of the month." },
          {
            lead: "Additions:",
            text: "new logos and upsell, with upsell split into price (indexation), volume and product or cross-sell.",
          },
          { lead: "Reductions:", text: "churn and downsell." },
          { lead: "Other MRR movements:", text: "anything that does not fit the categories above." },
          {
            lead: "EoP MRR:",
            text: "the MRR at the end of the month, which is the starting point for the next month.",
          },
          {
            lead: "GRR % and NRR %:",
            text: "gross and net revenue retention, calculated from the bridge.",
          },
        ],
      },
      {
        type: "paragraph",
        text: "A check line below the bridge compares EoP MRR with Recurring Revenue own IP in the P&L. The difference must be zero every month.",
      },
      {
        type: "callout",
        title: "MRR bridge not yet possible in your actuals?",
        text: "Budget the bridge anyway, and agree a short plan with your deal team: what is missing, the actions and the owner, and the month from which you will report it.",
      },
      { type: "heading", text: "Key drivers and KPIs", level: 2 },
      {
        type: "paragraph",
        text: "Apart from the MRR bridge, select the strategic drivers behind your financial budget. Choose the ones that explain how your business performs, agree on them with your deal team in step 1 and budget them for every month. Examples are weighted pipeline, number of new logos, churn or GRR %, billability %, sickness rate, revenue per FTE, NPS and new features live.",
      },
      { type: "heading", text: "Personnel and other costs", level: 2 },
      {
        type: "paragraph",
        text: "Staff costs are usually the largest cost driver, so build them per person. The HR KPIs in the budget tab show FTE and personnel cost per department for every month, for example implementation & consultancy, product & development, sales & marketing, customer success & service, and overhead & G&A. The total personnel cost ties to Personnel Costs in the P&L.",
      },
      {
        type: "list",
        items: [
          { lead: "One line per employee:", text: "department, FTE and salary." },
          {
            lead: "Full cost:",
            text: "salary, employer charges, holiday allowance, pension and bonus.",
          },
          {
            lead: "Contractors and freelancers:",
            text: "included in the cost per department, not in FTE.",
          },
          {
            lead: "Planned hires:",
            text: "with their start month, following the actions agreed in step 1.",
          },
        ],
      },
      { type: "paragraph", text: "For other costs and capex:" },
      {
        type: "list",
        items: [
          {
            lead: "COGS:",
            text: "variable COGS as a percentage of revenue; fixed COGS based on the contract.",
          },
          {
            lead: "Marketing:",
            text: "for budgets above €10K a year, specify the campaigns or channels.",
          },
          {
            lead: "Capex:",
            text: "presented separately, including capitalised software development.",
          },
        ],
      },
      { type: "heading", text: "Budget presentation for the deal team", level: 2 },
      {
        type: "paragraph",
        text: "In step 3 you present the final draft to your deal team. The presentation covers five elements:",
      },
      {
        type: "list",
        items: [
          {
            lead: "Goal and multi-year plan:",
            text: "the goal for the year, with a high-level P&L and capex for the two years that follow.",
          },
          {
            lead: "Financial budget:",
            text: "P&L, balance sheet, cash flow, MRR bridge and FTE plan.",
          },
          {
            lead: "Covenants:",
            text: "headroom per quarter. An expected breach is discussed with the deal team first.",
          },
          {
            lead: "Operational plan and battles to win:",
            text: "the priorities and quarterly actions, each with an owner.",
          },
          {
            lead: "AI initiatives:",
            text: "per initiative the costs (opex and capex), the upside (revenue or savings, for example in FTE) and the timing, as included in the budget.",
          },
        ],
      },
      {
        type: "paragraph",
        text: "Present the battles to win per value lever: commerce & GTM (onboarding new clients, migrating existing clients, entering new markets), team (sales, marketing, branding, strategy), product & tech (team set-up, product roadmap, processes), operational excellence (finance, reporting, support chains, cost control) and funding & buy-and-build (funding, M&A pipeline). For each lever, show the goal or impact, the key projects with their timing, the owner at the company, the Alma Capital Partners sponsor and the status: on track, ahead or behind.",
      },
      { type: "heading", text: "Pre-submission checks", level: 2 },
      {
        type: "paragraph",
        text: "Before you submit, check the performance sheet on the following points.",
      },
      {
        type: "table",
        columns: ["Check", "Expected"],
        rows: [
          [
            "Budget tab complete",
            "P&L, balance sheet and cash flow are populated for all twelve months.",
          ],
          ["KPIs every month", "The KPIs agreed in step 1 are budgeted for every month."],
          [
            "MRR bridge ties",
            "EoP MRR in the MRR bridge equals Recurring Revenue own IP in the P&L every month.",
          ],
          [
            "FTE and personnel cost",
            "FTE and personnel cost are budgeted per department and tie to Personnel Costs in the P&L.",
          ],
          [
            "Balance sheet and cash flow",
            "The balance sheet balances and the cash flow ties to it.",
          ],
        ],
      },
    ],
  },
  {
    id: "esg-reporting",
    number: "11",
    title: "ESG Reporting",
    summary: "The annual ESG data submission and its 30 April deadline; the template and instructions are still to be added.",
    icon: Leaf,
    category: "accounting",
    readTime: "1 min read",
    underConstruction: true,
    blocks: [
      {
        type: "paragraph",
        text: "This chapter covers the annual ESG data submission: which data is collected, in which template, and when it is due. The ESG framework is set at fund level and is confirmed per deal before the first submission.",
      },
      {
        type: "callout",
        text: "Portfolio companies are required to submit ESG data annually. The ESG reporting deadline is 30 April each year.",
      },
      {
        type: "callout",
        title: "Content to be added",
        text: "This chapter will contain:",
        items: [
          "The ESG data template and required metrics",
          "Instructions on how to complete the ESG reporting",
          "Submission format and contact details",
          "Applicability by company size and structure (CSRD thresholds)",
        ],
      },
      {
        type: "paragraph",
        text: "Contact reporting@almacapital.com for the current ESG template and guidance.",
      },
    ],
  },
]
