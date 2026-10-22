"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { companies } from "@/lib/mock-data"
import {
  ArrowLeft,
  Loader2,
  BarChart3,
  MessageSquare,
  FileText,
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Link2,
} from "lucide-react"

type Confidence = "high" | "medium" | "low"

interface ExtractField {
  label: string
  value: string
  confidence: Confidence
  note?: string
}

interface ExtractGroup {
  title: string
  toComment?: boolean
  fields: ExtractField[]
}

interface ProposedRecord {
  id: string
  kind: "audit" | "comment" | "context"
  title: string
  meta: string
  detail: string
  source?: string
  fields: { label: string; value: string }[]
}

interface DetectionInfo {
  docType: string
  company: string
  period: string
  confidence: Confidence
}

interface FilingInfo {
  folder: string[]
  dataPoint: string
  dataPointDetail: string
  confidence: Confidence
}

interface DocConfig {
  detection: DetectionInfo
  groups: ExtractGroup[]
  records: ProposedRecord[]
  filing: FilingInfo
}

const documentTypeLabels: Record<string, string> = {
  "ic-memo": "IC memo",
  "credit-agreement": "Credit agreement",
  "annual-accounts": "Annual accounts",
  "monthly-report": "Performance sheet",
  spa: "SPA",
  other: "Other",
}

const badgeColors: Record<string, string> = {
  "ic-memo": "bg-ai-soft text-ai-text",
  "credit-agreement": "bg-ai-soft text-ai-text",
  "annual-accounts": "bg-ai-soft text-ai-text",
  "monthly-report": "bg-ai-soft text-ai-text",
  spa: "bg-ai-soft text-ai-text",
  other: "bg-ai-soft text-ai-text",
}

const confidenceLabel: Record<Confidence, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
}

// ---- Per-document extraction configs ----
const docConfigs: Record<string, DocConfig> = {
  "ic-memo": {
    detection: { docType: "IC memo", company: "FreshBox Logistics", period: "Dec 2022", confidence: "high" },
    groups: [
      {
        title: "Company profile",
        fields: [
          { label: "Sector", value: "B2B SaaS", confidence: "high" },
          { label: "FTE", value: "~120", confidence: "medium", note: "Not found unambiguously in the document — please check" },
          { label: "ARR", value: "€8M", confidence: "high" },
        ],
      },
      {
        title: "Value creation",
        fields: [
          { label: "Lever 1", value: "International expansion DACH", confidence: "high" },
          { label: "Lever 2", value: "Cross-sell", confidence: "high" },
          { label: "Lever 3", value: "Pricing enterprise", confidence: "medium", note: "Not found unambiguously in the document — please check" },
        ],
      },
      {
        title: "Exit case",
        fields: [
          { label: "Type", value: "Trade sale / PE", confidence: "high" },
          { label: "EV range", value: "€120–156M", confidence: "high" },
          { label: "Multiple", value: "10–13x", confidence: "high" },
          { label: "Year", value: "2029", confidence: "high" },
        ],
      },
    ],
    records: [
      {
        id: "r1",
        kind: "audit",
        title: "METRIC / FreshBox Logistics / IC Case",
        meta: "Revenue €8.0M · EBITDA €2.0M · Net Debt €18.0M · Valuation €120M",
        detail: "Dimension: IC Case · Source: FreshBox_IC_Memo.pdf",
        source: "FreshBox_IC_Memo.pdf",
        fields: [
          { label: "Dimension", value: "IC Case" },
          { label: "Revenue", value: "€8.0M" },
          { label: "EBITDA", value: "€2.0M" },
          { label: "Net Debt", value: "€18.0M" },
          { label: "Valuation (EV)", value: "€120M" },
        ],
      },
      {
        id: "r2",
        kind: "comment",
        title: "Comment / FreshBox Logistics / Dec 2022 / value creation",
        meta: "'Three value creation levers: DACH expansion, cross-sell, enterprise pricing.'",
        detail: "Source: FreshBox_IC_Memo.pdf",
        fields: [
          { label: "Category", value: "Value creation" },
          { label: "Text", value: "DACH expansion, cross-sell, enterprise pricing." },
        ],
      },
    ],
    filing: {
      folder: ["FreshBox Logistics", "Investment", "IC memos"],
      dataPoint: "IC Case — FreshBox Logistics",
      dataPointDetail: "Linked to data point 'IC Case' (Dec 2022) under Fund Valuation",
      confidence: "high",
    },
  },
  "annual-accounts": {
    detection: { docType: "Annual accounts", company: "FreshBox Logistics", period: "FY2025", confidence: "high" },
    groups: [
      {
        title: "Audit records",
        fields: [
          { label: "Revenue", value: "€36.5M", confidence: "high" },
          { label: "EBITDA", value: "€5.85M", confidence: "high" },
          { label: "Net Debt", value: "€13.7M", confidence: "high" },
          { label: "Equity", value: "€11.2M", confidence: "high" },
          { label: "Auditor", value: "Mazars", confidence: "high" },
          { label: "Sign-off date", value: "2026-04-28", confidence: "high" },
        ],
      },
      {
        title: "Notes",
        toComment: true,
        fields: [
          {
            label: "Auditor's report",
            value: "Unqualified opinion. Goodwill amortisation €1.4M (note 12).",
            confidence: "high",
          },
        ],
      },
    ],
    records: [
      {
        id: "r1",
        kind: "audit",
        title: "AUDIT / FreshBox Logistics / FY2025",
        meta: "Revenue €36.5M · EBITDA €5.85M · Net Debt €13.7M",
        detail: "Auditor: Mazars · Sign-off: 2026-04-28",
        fields: [
          { label: "Revenue", value: "€36.5M" },
          { label: "EBITDA", value: "€5.85M" },
          { label: "Net Debt", value: "€13.7M" },
          { label: "Equity", value: "€11.2M" },
          { label: "Auditor", value: "Mazars" },
          { label: "Sign-off", value: "2026-04-28" },
        ],
      },
      {
        id: "r2",
        kind: "comment",
        title: "Comment / FreshBox Logistics / FY2025 / general",
        meta: "'Unqualified opinion. Goodwill amortisation €1.4M.'",
        detail: "Source: FreshBox_Annual_Accounts_2025.pdf",
        fields: [
          { label: "Category", value: "General" },
          { label: "Text", value: "Unqualified opinion. Goodwill amortisation €1.4M." },
        ],
      },
      {
        id: "r3",
        kind: "context",
        title: "Context document / FreshBox Logistics",
        meta: "'Annual accounts FY2025' — summary + full text (RAG-indexed)",
        detail: "Automatically included in analyses on FreshBox",
        source: "FreshBox_Annual_Accounts_2025.pdf",
        fields: [
          { label: "Title", value: "Annual accounts FY2025" },
        ],
      },
    ],
    filing: {
      folder: ["FreshBox Logistics", "Financials", "Annual accounts"],
      dataPoint: "Audit record — FreshBox Logistics FY2025",
      dataPointDetail: "Linked to audit data point (Revenue, EBITDA, Net Debt) FY2025",
      confidence: "high",
    },
  },
  "credit-agreement": {
    detection: { docType: "Credit agreement", company: "Nordic Health Group", period: "Mar 2023", confidence: "medium" },
    groups: [
      {
        title: "Bank facility",
        fields: [
          { label: "Type", value: "TLA", confidence: "high" },
          { label: "Amount", value: "€14.6M", confidence: "high" },
          { label: "Margin", value: "EURIBOR+2.75%", confidence: "medium", note: "Not found unambiguously in the document — please check" },
          { label: "Maturity", value: "2028-03", confidence: "high" },
        ],
      },
      {
        title: "Covenants",
        fields: [
          { label: "Leverage", value: "Net Debt/EBITDA ≤4.50x (Q)", confidence: "high" },
          { label: "Interest cover", value: "EBITDA/fin. charges ≥3.00x", confidence: "high" },
        ],
      },
      {
        title: "EBITDA definition",
        toComment: true,
        fields: [
          {
            label: "Definition",
            value: "Excl. one-offs >€250k and mgmt fees...",
            confidence: "medium",
            note: "Not found unambiguously in the document — please check",
          },
        ],
      },
    ],
    records: [
      {
        id: "r1",
        kind: "audit",
        title: "COVENANT / Nordic Health Group / Mar 2023",
        meta: "Leverage ≤4.50x (Q) · Interest cover ≥3.00x",
        detail: "Facility: TLA €14.6M · EURIBOR+2.75% · 2028-03",
        fields: [
          { label: "Type", value: "TLA" },
          { label: "Amount", value: "€14.6M" },
          { label: "Margin", value: "EURIBOR+2.75%" },
          { label: "Maturity", value: "2028-03" },
          { label: "Leverage", value: "Net Debt/EBITDA ≤4.50x" },
          { label: "Interest cover", value: "EBITDA/fin. charges ≥3.00x" },
        ],
      },
      {
        id: "r2",
        kind: "comment",
        title: "Comment / Nordic Health Group / Mar 2023 / EBITDA definition",
        meta: "'Excl. one-offs >€250k and mgmt fees...'",
        detail: "Source: NordicHealth_Credit_Agreement.pdf",
        fields: [
          { label: "Category", value: "EBITDA definition" },
          { label: "Text", value: "Excl. one-offs >€250k and mgmt fees..." },
        ],
      },
      {
        id: "r3",
        kind: "context",
        title: "Context document / Nordic Health Group",
        meta: "'Credit agreement Mar 2023' — summary + full text (RAG-indexed)",
        detail: "Automatically included in analyses on Nordic Health Group",
        source: "NordicHealth_Credit_Agreement.pdf",
        fields: [{ label: "Title", value: "Credit agreement Mar 2023" }],
      },
    ],
    filing: {
      folder: ["Nordic Health Group", "Financing", "Credit agreements"],
      dataPoint: "Covenant set — Nordic Health Group Mar 2023",
      dataPointDetail: "Linked to covenant data point (Leverage, Interest cover)",
      confidence: "medium",
    },
  },
}

function ConfidenceDots({ level }: { level: Confidence }) {
  const filled = level === "high" ? 3 : level === "medium" ? 2 : 1
  const color = level === "high" ? "bg-ok" : level === "medium" ? "bg-ai" : "bg-alert"
  return (
    <span className="flex items-center gap-1.5">
      <span className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn("h-1.5 w-1.5 rounded-full", i < filled ? color : "bg-line")}
          />
        ))}
      </span>
      <span
        className={cn(
          "text-[11px]",
          level === "high" ? "text-ok" : level === "medium" ? "text-ai" : "text-alert"
        )}
      >
        {confidenceLabel[level]}
      </span>
    </span>
  )
}

function StepBadge({ status }: { status: "done" | "verify" | "pending" }) {
  const map = {
    done: { label: "Done", cls: "bg-brand-soft text-ok" },
    verify: { label: "Verify", cls: "bg-ai-soft text-ai" },
    pending: { label: "Pending", cls: "bg-bg text-ink-3" },
  }[status]
  return <span className={cn("rounded px-2 py-0.5 text-[10px] font-medium", map.cls)}>{map.label}</span>
}

const recordIcon = {
  audit: { Icon: BarChart3, tint: "bg-brand-soft", color: "text-brand" },
  comment: { Icon: MessageSquare, tint: "bg-surface-2", color: "text-data-3" },
  context: { Icon: FileText, tint: "bg-ai-soft", color: "text-ai-text" },
}

interface DocumentReviewProps {
  file: {
    id: string
    name: string
    company: string
    period: string
    documentType?: string
    status: "processing" | "validated" | "error"
    pages?: number
  }
  onBack: () => void
}

export function DocumentReview({ file, onBack }: DocumentReviewProps) {
  const docType = file.documentType ?? "other"
  const config = docConfigs[docType] ?? docConfigs["ic-memo"]

  const [processing, setProcessing] = useState(file.status === "processing")
  const [step1Confirmed, setStep1Confirmed] = useState(false)
  const [editing, setEditing] = useState(false)
  const [step2Reviewed, setStep2Reviewed] = useState(false)
  const [step4Confirmed, setStep4Confirmed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // editable detection (for "Edit")
  const [detType, setDetType] = useState(config.detection.docType)
  const [detCompany, setDetCompany] = useState(config.detection.company)
  const [detPeriod, setDetPeriod] = useState(config.detection.period)

  // editable filing (Step 4)
  const [filingEditing, setFilingEditing] = useState(false)
  const [folderPath, setFolderPath] = useState(config.filing.folder.join(" / "))
  const [dataPoint, setDataPoint] = useState(config.filing.dataPoint)

  // record selection + expansion
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(config.records.map((r) => [r.id, true]))
  )
  const [expanded, setExpanded] = useState<string | null>(null)

  // simulate processing -> ready (auto-refresh)
  useEffect(() => {
    if (!processing) return
    const t = setTimeout(() => setProcessing(false), 6000)
    return () => clearTimeout(t)
  }, [processing])

  const checkedCount = config.records.filter((r) => checked[r.id]).length
  const canSave = step1Confirmed && step2Reviewed && checkedCount > 0 && step4Confirmed && !saved

  const step1Status: "done" | "verify" | "pending" = step1Confirmed ? "done" : "verify"
  const step2Status: "done" | "verify" | "pending" = !step1Confirmed ? "pending" : step2Reviewed ? "done" : "verify"
  const step3Status: "done" | "verify" | "pending" = !step2Reviewed ? "pending" : saved ? "done" : "verify"
  const step4Status: "done" | "verify" | "pending" = !step2Reviewed ? "pending" : step4Confirmed ? "done" : "verify"

  const chip = saved
    ? { label: "Imported", cls: "bg-brand-soft text-ok" }
    : processing
    ? { label: "Processing…", cls: "bg-ai-soft text-ai" }
    : { label: "Awaiting approval", cls: "bg-ai-soft text-ai" }

  function handleSave() {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
    }, 1600)
  }

  const savedCounts = {
    audit: config.records.filter((r) => checked[r.id] && r.kind === "audit").length,
    comment: config.records.filter((r) => checked[r.id] && r.kind === "comment").length,
    context: config.records.filter((r) => checked[r.id] && r.kind === "context").length,
  }

  return (
    <div className="flex min-h-screen flex-col font-sans">
      {/* Topbar */}
      <div className="border-b border-line px-6 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[12px] font-medium text-brand hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Upload Data
        </button>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[16px] font-semibold text-ink">{file.name}</span>
            <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-medium", badgeColors[docType])}>
              {documentTypeLabels[docType]}
            </span>
            <span className="text-[12px] text-ink-2">
              {file.company} · {file.period}
            </span>
          </div>
          <span className={cn("rounded-full px-3 py-1 text-[11px] font-medium", chip.cls)}>{chip.label}</span>
        </div>
      </div>

      {/* document preview (compact) / approval actions (primary) */}
      <div className="flex flex-1">
        {/* LEFT — document viewer (compact preview) */}
        <div className="relative flex w-[34%] flex-col border-r border-line bg-surface-2">
          <div className="flex-1 overflow-y-auto p-5">
            <div className="mx-auto max-w-[360px] space-y-4">
              <DocumentPage docType={docType} company={file.company} period={file.period} />
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-4 right-4 rounded-md bg-ink/80 px-2.5 py-1 text-[11px] font-medium text-white">
            Page 3 of {file.pages ?? 47}
          </div>
        </div>

        {/* RIGHT — extraction + approval (primary focus) */}
        <div className="flex w-[66%] flex-col">
          {processing ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
              <div className="text-[14px] font-medium text-ink">Processing…</div>
              <div className="text-[12px] text-ink-2">This takes about 30 seconds.</div>
              <div className="text-[11px] text-ink-3">Refreshes automatically every 5 seconds.</div>
            </div>
          ) : (
            <>
              <div className="grid flex-1 grid-cols-1 content-start gap-5 overflow-y-auto px-6 py-5 lg:grid-cols-2">
                {/* STEP 1 — Detection */}
                <section>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-ink-3">
                      Step 1 · Detection
                    </span>
                    <StepBadge status={step1Status} />
                  </div>
                  <div className="mt-3 rounded-[10px] border border-line bg-white p-4">
                    {!editing ? (
                      <dl className="space-y-2 text-[13px]">
                        <Row label="Document type" value={detType} />
                        <Row label="Company" value={detCompany} />
                        <Row label="Period / date" value={detPeriod} />
                        <div className="flex items-center justify-between">
                          <dt className="text-ink-2">Confidence</dt>
                          <dd>
                            <ConfidenceDots level={config.detection.confidence} />
                          </dd>
                        </div>
                      </dl>
                    ) : (
                      <div className="space-y-3 text-[13px]">
                        <EditRow label="Document type">
                          <select
                            value={detType}
                            onChange={(e) => setDetType(e.target.value)}
                            className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-brand"
                          >
                            {Object.values(documentTypeLabels).map((l) => (
                              <option key={l}>{l}</option>
                            ))}
                          </select>
                        </EditRow>
                        <EditRow label="Company">
                          <select
                            value={detCompany}
                            onChange={(e) => setDetCompany(e.target.value)}
                            className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-brand"
                          >
                            {companies.map((c) => (
                              <option key={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </EditRow>
                        <EditRow label="Period / date">
                          <input
                            value={detPeriod}
                            onChange={(e) => setDetPeriod(e.target.value)}
                            className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-brand"
                          />
                        </EditRow>
                      </div>
                    )}

                    {!step1Confirmed && (
                      <div className="mt-4">
                        {config.detection.confidence !== "high" && !editing && (
                          <div className="mb-3 flex items-start gap-2 rounded-lg bg-ai-soft p-2.5">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ai" />
                            <span className="text-[12px] text-ink-2">
                              Detection not certain. Is this correct?
                            </span>
                          </div>
                        )}
                        {editing ? (
                          <Button
                            className="w-full bg-brand text-white hover:bg-action-hover"
                            onClick={() => {
                              setEditing(false)
                              setStep1Confirmed(true)
                            }}
                          >
                            Save & confirm →
                          </Button>
                        ) : config.detection.confidence === "high" ? (
                          <Button
                            variant="outline"
                            className="w-full border-brand text-brand hover:bg-brand-soft"
                            onClick={() => setStep1Confirmed(true)}
                          >
                            Is this correct? Confirm →
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              className="flex-1 bg-brand text-white hover:bg-action-hover"
                              onClick={() => setStep1Confirmed(true)}
                            >
                              Yes, correct
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 border-line text-ink"
                              onClick={() => setEditing(true)}
                            >
                              Edit
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </section>

                {/* STEP 2 — Extraction */}
                <section>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-ink-3">
                      Step 2 · Extraction
                    </span>
                    <StepBadge status={step2Status} />
                  </div>
                  <div
                    className={cn(
                      "mt-3 rounded-[10px] border border-line bg-white",
                      !step1Confirmed && "pointer-events-none opacity-50"
                    )}
                  >
                    {config.groups.map((group, gi) => (
                      <div key={group.title} className={cn(gi > 0 && "border-t border-line")}>
                        <div className="flex items-center gap-2 px-4 pt-3">
                          <span className="text-[11px] font-medium uppercase tracking-wide text-ink-3">
                            {group.title}
                          </span>
                          {group.toComment && (
                            <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[9px] font-medium text-data-3">
                              → comment
                            </span>
                          )}
                        </div>
                        <div className="px-4 py-2">
                          {group.fields.map((f) => (
                            <div key={f.label} className="border-b border-surface-2 py-2 last:border-0">
                              <div className="flex items-start justify-between gap-3">
                                <span className="text-[13px] text-ink-2">{f.label}</span>
                                <span className="flex items-center gap-2 text-right">
                                  <span className="text-[13px] font-medium text-ink">{f.value}</span>
                                  <ConfidenceDots level={f.confidence} />
                                  {f.note && <AlertTriangle className="h-3.5 w-3.5 text-ai" />}
                                </span>
                              </div>
                              {f.note && <p className="mt-1 text-[11px] text-ink-3">{f.note}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {step1Confirmed && !step2Reviewed && (
                      <div className="border-t border-line p-3">
                        <Button
                          variant="outline"
                          className="w-full border-brand text-brand hover:bg-brand-soft"
                          onClick={() => setStep2Reviewed(true)}
                        >
                          Reviewed →
                        </Button>
                      </div>
                    )}
                  </div>
                </section>

                {/* STEP 3 — Proposed records */}
                <section>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-ink-3">
                      Step 3 · Proposed records
                    </span>
                    <StepBadge status={step3Status} />
                  </div>
                  <div className={cn("mt-3 space-y-2", !step2Reviewed && "pointer-events-none opacity-50")}>
                    {config.records.map((rec) => {
                      const { Icon, tint, color } = recordIcon[rec.kind]
                      const isOpen = expanded === rec.id
                      return (
                        <div key={rec.id} className="rounded-[10px] border border-line bg-white">
                          <div className="flex items-start gap-3 p-3">
                            <input
                              type="checkbox"
                              checked={checked[rec.id]}
                              onChange={(e) => setChecked({ ...checked, [rec.id]: e.target.checked })}
                              className="mt-0.5 h-4 w-4 accent-brand"
                            />
                            <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", tint)}>
                              <Icon className={cn("h-4 w-4", color)} />
                            </div>
                            <button
                              onClick={() => setExpanded(isOpen ? null : rec.id)}
                              className="flex-1 text-left"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[12px] font-medium text-ink">{rec.title}</span>
                                <ChevronDown
                                  className={cn("h-4 w-4 text-ink-3 transition-transform", isOpen && "rotate-180")}
                                />
                              </div>
                              <p className="mt-0.5 text-[12px] text-ink-2">{rec.meta}</p>
                              <p className="text-[11px] text-ink-3">{rec.detail}</p>
                              {rec.source && <p className="text-[11px] text-ink-3">Source: {rec.source}</p>}
                            </button>
                          </div>
                          {isOpen && (
                            <div className="space-y-2 border-t border-line p-3">
                              {rec.fields.map((field) => (
                                <div key={field.label} className="flex items-center gap-3">
                                  <span className="w-28 shrink-0 text-[12px] text-ink-2">{field.label}</span>
                                  <input
                                    defaultValue={field.value}
                                    className="flex-1 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] outline-none focus:border-brand"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {!saved && <p className="px-1 text-[11px] text-ink-3">No records saved yet</p>}
                  </div>
                </section>

                {/* STEP 4 — Filing & linking */}
                <section>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-ink-3">
                      Step 4 · Filing &amp; linking
                    </span>
                    <StepBadge status={step4Status} />
                  </div>
                  <div
                    className={cn(
                      "mt-3 rounded-[10px] border border-line bg-white p-4",
                      !step2Reviewed && "pointer-events-none opacity-50"
                    )}
                  >
                    {/* Folder structure */}
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-brand" />
                      <span className="text-[11px] font-medium uppercase tracking-wide text-ink-3">
                        Storage location
                      </span>
                    </div>
                    {!filingEditing ? (
                      <div className="mt-2 flex flex-wrap items-center gap-1 rounded-lg bg-bg px-3 py-2.5">
                        {folderPath.split(" / ").map((seg, i, arr) => (
                          <span key={i} className="flex items-center gap-1">
                            <Folder className="h-3.5 w-3.5 text-ink-3" />
                            <span className="text-[12px] font-medium text-ink">{seg}</span>
                            {i < arr.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-ink-3" />}
                          </span>
                        ))}
                        <span className="ml-1 flex items-center gap-1 text-[12px] text-ink-2">
                          <ChevronRight className="h-3.5 w-3.5 text-ink-3" />
                          <FileText className="h-3.5 w-3.5 text-ai-text" />
                          {file.name}
                        </span>
                      </div>
                    ) : (
                      <input
                        value={folderPath}
                        onChange={(e) => setFolderPath(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] outline-none focus:border-brand"
                      />
                    )}

                    {/* Linked data point */}
                    <div className="mt-4 flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-brand" />
                      <span className="text-[11px] font-medium uppercase tracking-wide text-ink-3">
                        Linked data point
                      </span>
                    </div>
                    {!filingEditing ? (
                      <div className="mt-2 rounded-lg border border-line px-3 py-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-medium text-ink">{dataPoint}</span>
                          <ConfidenceDots level={config.filing.confidence} />
                        </div>
                        <p className="mt-0.5 text-[11px] text-ink-3">{config.filing.dataPointDetail}</p>
                      </div>
                    ) : (
                      <input
                        value={dataPoint}
                        onChange={(e) => setDataPoint(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] outline-none focus:border-brand"
                      />
                    )}

                    {!step4Confirmed && (
                      <div className="mt-4">
                        {config.filing.confidence !== "high" && !filingEditing && (
                          <div className="mb-3 flex items-start gap-2 rounded-lg bg-ai-soft p-2.5">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ai" />
                            <span className="text-[12px] text-ink-2">
                              Folder or link not certain. Check before you confirm.
                            </span>
                          </div>
                        )}
                        {filingEditing ? (
                          <Button
                            className="w-full bg-brand text-white hover:bg-action-hover"
                            onClick={() => {
                              setFilingEditing(false)
                              setStep4Confirmed(true)
                            }}
                          >
                            Save &amp; confirm →
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              className="flex-1 bg-brand text-white hover:bg-action-hover"
                              onClick={() => setStep4Confirmed(true)}
                            >
                              Confirm filing
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 border-line text-ink"
                              onClick={() => setFilingEditing(true)}
                            >
                              Edit
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Approve bar */}
              <div className="border-t border-line bg-bg px-6 py-4">
                {saved ? (
                  <div className="flex items-start gap-2 rounded-lg bg-brand-soft px-3 py-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" />
                    <span className="text-[12px] text-ok">
                      Saved: {savedCounts.audit} financial records, {savedCounts.comment} comments,{" "}
                      {savedCounts.context} context documents. Document filed in {folderPath} and linked to{" "}
                      {dataPoint}.
                    </span>
                  </div>
                ) : (
                  <>
                    <p className="mb-2.5 text-[11px] text-ink-3">
                      Never saved automatically — confirm below.
                    </p>
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={onBack}
                        className="text-[13px] font-medium text-ink-2 hover:text-ink"
                      >
                        Cancel
                      </button>
                      <Button
                        disabled={!canSave || saving}
                        onClick={handleSave}
                        className="bg-brand text-white hover:bg-action-hover disabled:opacity-40"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                            Saving…
                          </>
                        ) : (
                          "Save →"
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-2">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  )
}

function EditRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-ink-2">{label}</label>
      {children}
    </div>
  )
}

// Faux read-only document preview (no real PDF available)
function DocumentPage({ docType, company, period }: { docType: string; company: string; period: string }) {
  const title =
    docType === "annual-accounts"
      ? `Annual accounts ${period}`
      : docType === "credit-agreement"
      ? `Senior Facilities Agreement`
      : `Investment Committee Memo`
  return (
    <div className="rounded-sm border border-line bg-white px-10 py-12 text-ink shadow-sm">
      <p className="text-[10px] uppercase tracking-widest text-ink-3">{documentTypeLabels[docType]}</p>
      <h2 className="mt-2 text-[18px] font-semibold">{title}</h2>
      <p className="mt-1 text-[12px] text-ink-2">
        {company} · {period}
      </p>
      <div className="mt-6 space-y-3 text-[11px] leading-relaxed text-ink">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-2 w-2/5 rounded bg-line" />
            <div className="h-2 w-full rounded bg-surface-2" />
            <div className="h-2 w-11/12 rounded bg-surface-2" />
            <div className="h-2 w-4/5 rounded bg-surface-2" />
          </div>
        ))}
      </div>
    </div>
  )
}
