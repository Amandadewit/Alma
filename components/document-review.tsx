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

type Confidence = "hoog" | "middel" | "laag"

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
  "annual-accounts": "Jaarrekening",
  "monthly-report": "Monthly report",
  spa: "SPA",
  other: "Other",
}

const badgeColors: Record<string, string> = {
  "ic-memo": "bg-[#F1ECF7] text-[#7B5EA7]",
  "credit-agreement": "bg-[#F1ECF7] text-[#7B5EA7]",
  "annual-accounts": "bg-[#F1ECF7] text-[#7B5EA7]",
  "monthly-report": "bg-[#F1ECF7] text-[#7B5EA7]",
  spa: "bg-[#F1ECF7] text-[#7B5EA7]",
  other: "bg-[#F1ECF7] text-[#7B5EA7]",
}

const confidenceLabel: Record<Confidence, string> = {
  hoog: "Hoog",
  middel: "Middel",
  laag: "Laag",
}

// ---- Per-document extraction configs ----
const docConfigs: Record<string, DocConfig> = {
  "ic-memo": {
    detection: { docType: "IC memo", company: "FreshBox Logistics", period: "Dec 2022", confidence: "hoog" },
    groups: [
      {
        title: "Bedrijfsprofiel",
        fields: [
          { label: "Sector", value: "B2B SaaS", confidence: "hoog" },
          { label: "FTE", value: "~120", confidence: "middel", note: "Niet eenduidig gevonden in document — controleer" },
          { label: "ARR", value: "€8M", confidence: "hoog" },
        ],
      },
      {
        title: "Value creation",
        fields: [
          { label: "Lever 1", value: "Internationalisatie DACH", confidence: "hoog" },
          { label: "Lever 2", value: "Cross-sell", confidence: "hoog" },
          { label: "Lever 3", value: "Pricing enterprise", confidence: "middel", note: "Niet eenduidig gevonden in document — controleer" },
        ],
      },
      {
        title: "Exit case",
        fields: [
          { label: "Type", value: "Trade sale / PE", confidence: "hoog" },
          { label: "EV range", value: "€120–156M", confidence: "hoog" },
          { label: "Multiple", value: "10–13x", confidence: "hoog" },
          { label: "Jaar", value: "2029", confidence: "hoog" },
        ],
      },
    ],
    records: [
      {
        id: "r1",
        kind: "audit",
        title: "METRIC / FreshBox Logistics / IC Case",
        meta: "Revenue €8.0M · EBITDA €2.0M · Net Debt €18.0M · Valuation €120M",
        detail: "Dimensie: IC Case · Bron: FreshBox_IC_Memo.pdf",
        source: "FreshBox_IC_Memo.pdf",
        fields: [
          { label: "Dimensie", value: "IC Case" },
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
        meta: "'Drie waardecreatie-hefbomen: DACH-expansie, cross-sell, enterprise pricing.'",
        detail: "Bron: FreshBox_IC_Memo.pdf",
        fields: [
          { label: "Categorie", value: "Value creation" },
          { label: "Tekst", value: "DACH-expansie, cross-sell, enterprise pricing." },
        ],
      },
    ],
    filing: {
      folder: ["FreshBox Logistics", "Investment", "IC memos"],
      dataPoint: "IC Case — FreshBox Logistics",
      dataPointDetail: "Koppelt aan datapunt 'IC Case' (Dec 2022) onder Fund Valuation",
      confidence: "hoog",
    },
  },
  "annual-accounts": {
    detection: { docType: "Jaarrekening", company: "FreshBox Logistics", period: "FY2025", confidence: "hoog" },
    groups: [
      {
        title: "Audit records",
        fields: [
          { label: "Revenue", value: "€36.5M", confidence: "hoog" },
          { label: "EBITDA", value: "€5.85M", confidence: "hoog" },
          { label: "Net Debt", value: "€13.7M", confidence: "hoog" },
          { label: "Equity", value: "€11.2M", confidence: "hoog" },
          { label: "Auditor", value: "Mazars", confidence: "hoog" },
          { label: "Sign-off date", value: "2026-04-28", confidence: "hoog" },
        ],
      },
      {
        title: "Toelichting",
        toComment: true,
        fields: [
          {
            label: "Accountantsverklaring",
            value: "Goedgekeurd zonder voorbehoud. Goodwill afschrijving €1.4M (noot 12).",
            confidence: "hoog",
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
        title: "Comment / FreshBox Logistics / FY2025 / algemeen",
        meta: "'Goedgekeurd zonder voorbehoud. Goodwill afschrijving €1.4M.'",
        detail: "Bron: FreshBox_Jaarrekening_2025.pdf",
        fields: [
          { label: "Categorie", value: "Algemeen" },
          { label: "Tekst", value: "Goedgekeurd zonder voorbehoud. Goodwill afschrijving €1.4M." },
        ],
      },
      {
        id: "r3",
        kind: "context",
        title: "Context document / FreshBox Logistics",
        meta: "'Jaarrekening FY2025' — samenvatting + full text (RAG-indexed)",
        detail: "Auto-meegestuurd bij analyses op FreshBox",
        source: "FreshBox_Jaarrekening_2025.pdf",
        fields: [
          { label: "Titel", value: "Jaarrekening FY2025" },
        ],
      },
    ],
    filing: {
      folder: ["FreshBox Logistics", "Financials", "Jaarrekeningen"],
      dataPoint: "Audit record — FreshBox Logistics FY2025",
      dataPointDetail: "Koppelt aan audit-datapunt (Revenue, EBITDA, Net Debt) FY2025",
      confidence: "hoog",
    },
  },
  "credit-agreement": {
    detection: { docType: "Credit agreement", company: "Nordic Health Group", period: "Mar 2023", confidence: "middel" },
    groups: [
      {
        title: "Bank faciliteit",
        fields: [
          { label: "Type", value: "TLA", confidence: "hoog" },
          { label: "Bedrag", value: "€14.6M", confidence: "hoog" },
          { label: "Marge", value: "EURIBOR+2.75%", confidence: "middel", note: "Niet eenduidig gevonden in document — controleer" },
          { label: "Looptijd", value: "2028-03", confidence: "hoog" },
        ],
      },
      {
        title: "Covenanten",
        fields: [
          { label: "Leverage", value: "Net Debt/EBITDA ≤4.50x (Q)", confidence: "hoog" },
          { label: "Interest cover", value: "EBITDA/fin. charges ≥3.00x", confidence: "hoog" },
        ],
      },
      {
        title: "EBITDA-definitie",
        toComment: true,
        fields: [
          {
            label: "Definitie",
            value: "Excl. one-offs >€250k en mgmt fees...",
            confidence: "middel",
            note: "Niet eenduidig gevonden in document — controleer",
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
        detail: "Faciliteit: TLA €14.6M · EURIBOR+2.75% · 2028-03",
        fields: [
          { label: "Type", value: "TLA" },
          { label: "Bedrag", value: "€14.6M" },
          { label: "Marge", value: "EURIBOR+2.75%" },
          { label: "Looptijd", value: "2028-03" },
          { label: "Leverage", value: "Net Debt/EBITDA ≤4.50x" },
          { label: "Interest cover", value: "EBITDA/fin. charges ≥3.00x" },
        ],
      },
      {
        id: "r2",
        kind: "comment",
        title: "Comment / Nordic Health Group / Mar 2023 / EBITDA-definitie",
        meta: "'Excl. one-offs >€250k en mgmt fees...'",
        detail: "Bron: NordicHealth_Krediet.pdf",
        fields: [
          { label: "Categorie", value: "EBITDA-definitie" },
          { label: "Tekst", value: "Excl. one-offs >€250k en mgmt fees..." },
        ],
      },
      {
        id: "r3",
        kind: "context",
        title: "Context document / Nordic Health Group",
        meta: "'Credit agreement Mar 2023' — samenvatting + full text (RAG-indexed)",
        detail: "Auto-meegestuurd bij analyses op Nordic Health Group",
        source: "NordicHealth_Krediet.pdf",
        fields: [{ label: "Titel", value: "Credit agreement Mar 2023" }],
      },
    ],
    filing: {
      folder: ["Nordic Health Group", "Financing", "Credit agreements"],
      dataPoint: "Covenant set — Nordic Health Group Mar 2023",
      dataPointDetail: "Koppelt aan covenant-datapunt (Leverage, Interest cover)",
      confidence: "middel",
    },
  },
}

function ConfidenceDots({ level }: { level: Confidence }) {
  const filled = level === "hoog" ? 3 : level === "middel" ? 2 : 1
  const color = level === "hoog" ? "bg-[#3B6D11]" : level === "middel" ? "bg-[#B8975A]" : "bg-[#A32D2D]"
  return (
    <span className="flex items-center gap-1.5">
      <span className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn("h-1.5 w-1.5 rounded-full", i < filled ? color : "bg-[#E8E6E0]")}
          />
        ))}
      </span>
      <span
        className={cn(
          "text-[11px]",
          level === "hoog" ? "text-[#3B6D11]" : level === "middel" ? "text-[#B8975A]" : "text-[#A32D2D]"
        )}
      >
        {confidenceLabel[level]}
      </span>
    </span>
  )
}

function StepBadge({ status }: { status: "done" | "verify" | "pending" }) {
  const map = {
    done: { label: "Done", cls: "bg-[#E1F5EE] text-[#3B6D11]" },
    verify: { label: "Verify", cls: "bg-[#FDF8F0] text-[#B8975A]" },
    pending: { label: "Pending", cls: "bg-[#F7F6F3] text-[#9A988F]" },
  }[status]
  return <span className={cn("rounded px-2 py-0.5 text-[10px] font-medium", map.cls)}>{map.label}</span>
}

const recordIcon = {
  audit: { Icon: BarChart3, tint: "bg-[#E1F5EE]", color: "text-[#1B4D45]" },
  comment: { Icon: MessageSquare, tint: "bg-[#E6EEF5]", color: "text-[#3A6391]" },
  context: { Icon: FileText, tint: "bg-[#F1ECF7]", color: "text-[#7B5EA7]" },
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

  // editable detection (for "Aanpassen")
  const [detType, setDetType] = useState(config.detection.docType)
  const [detCompany, setDetCompany] = useState(config.detection.company)
  const [detPeriod, setDetPeriod] = useState(config.detection.period)

  // editable filing (Stap 4)
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
    ? { label: "Geïmporteerd", cls: "bg-[#E1F5EE] text-[#3B6D11]" }
    : processing
    ? { label: "Processing…", cls: "bg-[#FDF8F0] text-[#B8975A]" }
    : { label: "Awaiting approval", cls: "bg-[#FDF8F0] text-[#B8975A]" }

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
      <div className="border-b border-[#E8E6E0] px-6 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[12px] font-medium text-[#1B4D45] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Upload Data
        </button>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[16px] font-semibold text-[#2C2C2A]">{file.name}</span>
            <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-medium", badgeColors[docType])}>
              {documentTypeLabels[docType]}
            </span>
            <span className="text-[12px] text-[#6B6963]">
              {file.company} · {file.period}
            </span>
          </div>
          <span className={cn("rounded-full px-3 py-1 text-[11px] font-medium", chip.cls)}>{chip.label}</span>
        </div>
      </div>

      {/* document preview (compact) / approval actions (primary) */}
      <div className="flex flex-1">
        {/* LEFT — document viewer (compact preview) */}
        <div className="relative flex w-[34%] flex-col border-r border-[#E8E6E0] bg-[#F2F1ED]">
          <div className="flex-1 overflow-y-auto p-5">
            <div className="mx-auto max-w-[360px] space-y-4">
              <DocumentPage docType={docType} company={file.company} period={file.period} />
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-4 right-4 rounded-md bg-[#2C2C2A]/80 px-2.5 py-1 text-[11px] font-medium text-white">
            Page 3 of {file.pages ?? 47}
          </div>
        </div>

        {/* RIGHT — extraction + approval (primary focus) */}
        <div className="flex w-[66%] flex-col">
          {processing ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#1B4D45]" />
              <div className="text-[14px] font-medium text-[#2C2C2A]">Bezig met verwerken…</div>
              <div className="text-[12px] text-[#6B6963]">Dit duurt ca. 30 seconden.</div>
              <div className="text-[11px] text-[#9A988F]">Ververst automatisch elke 5 seconden.</div>
            </div>
          ) : (
            <>
              <div className="grid flex-1 grid-cols-1 content-start gap-5 overflow-y-auto px-6 py-5 lg:grid-cols-2">
                {/* STEP 1 — Detectie */}
                <section>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-[#9A988F]">
                      Stap 1 · Detectie
                    </span>
                    <StepBadge status={step1Status} />
                  </div>
                  <div className="mt-3 rounded-[10px] border border-[#E8E6E0] bg-white p-4">
                    {!editing ? (
                      <dl className="space-y-2 text-[13px]">
                        <Row label="Document type" value={detType} />
                        <Row label="Company" value={detCompany} />
                        <Row label="Period / date" value={detPeriod} />
                        <div className="flex items-center justify-between">
                          <dt className="text-[#6B6963]">Confidence</dt>
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
                            className="w-full rounded-lg border border-[#E8E6E0] bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-[#1B4D45]"
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
                            className="w-full rounded-lg border border-[#E8E6E0] bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-[#1B4D45]"
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
                            className="w-full rounded-lg border border-[#E8E6E0] bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-[#1B4D45]"
                          />
                        </EditRow>
                      </div>
                    )}

                    {!step1Confirmed && (
                      <div className="mt-4">
                        {config.detection.confidence !== "hoog" && !editing && (
                          <div className="mb-3 flex items-start gap-2 rounded-lg bg-[#FDF8F0] p-2.5">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B8975A]" />
                            <span className="text-[12px] text-[#6B6963]">
                              Detectie niet zeker. Klopt dit?
                            </span>
                          </div>
                        )}
                        {editing ? (
                          <Button
                            className="w-full bg-[#1B4D45] text-white hover:bg-[#164039]"
                            onClick={() => {
                              setEditing(false)
                              setStep1Confirmed(true)
                            }}
                          >
                            Opslaan & bevestigen →
                          </Button>
                        ) : config.detection.confidence === "hoog" ? (
                          <Button
                            variant="outline"
                            className="w-full border-[#1B4D45] text-[#1B4D45] hover:bg-[#E1F5EE]"
                            onClick={() => setStep1Confirmed(true)}
                          >
                            Klopt dit? Bevestigen →
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              className="flex-1 bg-[#1B4D45] text-white hover:bg-[#164039]"
                              onClick={() => setStep1Confirmed(true)}
                            >
                              Ja, klopt
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 border-[#E8E6E0] text-[#2C2C2A]"
                              onClick={() => setEditing(true)}
                            >
                              Aanpassen
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </section>

                {/* STEP 2 — Extractie */}
                <section>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-[#9A988F]">
                      Stap 2 · Extractie
                    </span>
                    <StepBadge status={step2Status} />
                  </div>
                  <div
                    className={cn(
                      "mt-3 rounded-[10px] border border-[#E8E6E0] bg-white",
                      !step1Confirmed && "pointer-events-none opacity-50"
                    )}
                  >
                    {config.groups.map((group, gi) => (
                      <div key={group.title} className={cn(gi > 0 && "border-t border-[#E8E6E0]")}>
                        <div className="flex items-center gap-2 px-4 pt-3">
                          <span className="text-[11px] font-medium uppercase tracking-wide text-[#9A988F]">
                            {group.title}
                          </span>
                          {group.toComment && (
                            <span className="rounded bg-[#E6EEF5] px-1.5 py-0.5 text-[9px] font-medium text-[#3A6391]">
                              → comment
                            </span>
                          )}
                        </div>
                        <div className="px-4 py-2">
                          {group.fields.map((f) => (
                            <div key={f.label} className="border-b border-[#F2F1ED] py-2 last:border-0">
                              <div className="flex items-start justify-between gap-3">
                                <span className="text-[13px] text-[#6B6963]">{f.label}</span>
                                <span className="flex items-center gap-2 text-right">
                                  <span className="text-[13px] font-medium text-[#2C2C2A]">{f.value}</span>
                                  <ConfidenceDots level={f.confidence} />
                                  {f.note && <AlertTriangle className="h-3.5 w-3.5 text-[#B8975A]" />}
                                </span>
                              </div>
                              {f.note && <p className="mt-1 text-[11px] text-[#9A988F]">{f.note}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {step1Confirmed && !step2Reviewed && (
                      <div className="border-t border-[#E8E6E0] p-3">
                        <Button
                          variant="outline"
                          className="w-full border-[#1B4D45] text-[#1B4D45] hover:bg-[#E1F5EE]"
                          onClick={() => setStep2Reviewed(true)}
                        >
                          Gecontroleerd →
                        </Button>
                      </div>
                    )}
                  </div>
                </section>

                {/* STEP 3 — Record voorstel */}
                <section>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-[#9A988F]">
                      Stap 3 · Record voorstel
                    </span>
                    <StepBadge status={step3Status} />
                  </div>
                  <div className={cn("mt-3 space-y-2", !step2Reviewed && "pointer-events-none opacity-50")}>
                    {config.records.map((rec) => {
                      const { Icon, tint, color } = recordIcon[rec.kind]
                      const isOpen = expanded === rec.id
                      return (
                        <div key={rec.id} className="rounded-[10px] border border-[#E8E6E0] bg-white">
                          <div className="flex items-start gap-3 p-3">
                            <input
                              type="checkbox"
                              checked={checked[rec.id]}
                              onChange={(e) => setChecked({ ...checked, [rec.id]: e.target.checked })}
                              className="mt-0.5 h-4 w-4 accent-[#1B4D45]"
                            />
                            <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", tint)}>
                              <Icon className={cn("h-4 w-4", color)} />
                            </div>
                            <button
                              onClick={() => setExpanded(isOpen ? null : rec.id)}
                              className="flex-1 text-left"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[12px] font-medium text-[#2C2C2A]">{rec.title}</span>
                                <ChevronDown
                                  className={cn("h-4 w-4 text-[#9A988F] transition-transform", isOpen && "rotate-180")}
                                />
                              </div>
                              <p className="mt-0.5 text-[12px] text-[#6B6963]">{rec.meta}</p>
                              <p className="text-[11px] text-[#9A988F]">{rec.detail}</p>
                              {rec.source && <p className="text-[11px] text-[#9A988F]">Bron: {rec.source}</p>}
                            </button>
                          </div>
                          {isOpen && (
                            <div className="space-y-2 border-t border-[#E8E6E0] p-3">
                              {rec.fields.map((field) => (
                                <div key={field.label} className="flex items-center gap-3">
                                  <span className="w-28 shrink-0 text-[12px] text-[#6B6963]">{field.label}</span>
                                  <input
                                    defaultValue={field.value}
                                    className="flex-1 rounded-lg border border-[#E8E6E0] bg-white px-2.5 py-1.5 text-[12px] outline-none focus:border-[#1B4D45]"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {!saved && <p className="px-1 text-[11px] text-[#9A988F]">Nog geen records opgeslagen</p>}
                  </div>
                </section>

                {/* STEP 4 — Archivering & koppeling */}
                <section>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-[#9A988F]">
                      Stap 4 · Archivering &amp; koppeling
                    </span>
                    <StepBadge status={step4Status} />
                  </div>
                  <div
                    className={cn(
                      "mt-3 rounded-[10px] border border-[#E8E6E0] bg-white p-4",
                      !step2Reviewed && "pointer-events-none opacity-50"
                    )}
                  >
                    {/* Folder structure */}
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-[#1B4D45]" />
                      <span className="text-[11px] font-medium uppercase tracking-wide text-[#9A988F]">
                        Opslaglocatie
                      </span>
                    </div>
                    {!filingEditing ? (
                      <div className="mt-2 flex flex-wrap items-center gap-1 rounded-lg bg-[#F7F6F3] px-3 py-2.5">
                        {folderPath.split(" / ").map((seg, i, arr) => (
                          <span key={i} className="flex items-center gap-1">
                            <Folder className="h-3.5 w-3.5 text-[#9A988F]" />
                            <span className="text-[12px] font-medium text-[#2C2C2A]">{seg}</span>
                            {i < arr.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-[#9A988F]" />}
                          </span>
                        ))}
                        <span className="ml-1 flex items-center gap-1 text-[12px] text-[#6B6963]">
                          <ChevronRight className="h-3.5 w-3.5 text-[#9A988F]" />
                          <FileText className="h-3.5 w-3.5 text-[#7B5EA7]" />
                          {file.name}
                        </span>
                      </div>
                    ) : (
                      <input
                        value={folderPath}
                        onChange={(e) => setFolderPath(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-[#E8E6E0] bg-white px-2.5 py-1.5 text-[12px] outline-none focus:border-[#1B4D45]"
                      />
                    )}

                    {/* Linked data point */}
                    <div className="mt-4 flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-[#1B4D45]" />
                      <span className="text-[11px] font-medium uppercase tracking-wide text-[#9A988F]">
                        Gekoppeld datapunt
                      </span>
                    </div>
                    {!filingEditing ? (
                      <div className="mt-2 rounded-lg border border-[#E8E6E0] px-3 py-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-medium text-[#2C2C2A]">{dataPoint}</span>
                          <ConfidenceDots level={config.filing.confidence} />
                        </div>
                        <p className="mt-0.5 text-[11px] text-[#9A988F]">{config.filing.dataPointDetail}</p>
                      </div>
                    ) : (
                      <input
                        value={dataPoint}
                        onChange={(e) => setDataPoint(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-[#E8E6E0] bg-white px-2.5 py-1.5 text-[12px] outline-none focus:border-[#1B4D45]"
                      />
                    )}

                    {!step4Confirmed && (
                      <div className="mt-4">
                        {config.filing.confidence !== "hoog" && !filingEditing && (
                          <div className="mb-3 flex items-start gap-2 rounded-lg bg-[#FDF8F0] p-2.5">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B8975A]" />
                            <span className="text-[12px] text-[#6B6963]">
                              Map of koppeling niet zeker. Controleer voor je bevestigt.
                            </span>
                          </div>
                        )}
                        {filingEditing ? (
                          <Button
                            className="w-full bg-[#1B4D45] text-white hover:bg-[#164039]"
                            onClick={() => {
                              setFilingEditing(false)
                              setStep4Confirmed(true)
                            }}
                          >
                            Opslaan &amp; bevestigen →
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              className="flex-1 bg-[#1B4D45] text-white hover:bg-[#164039]"
                              onClick={() => setStep4Confirmed(true)}
                            >
                              Bevestig archivering
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 border-[#E8E6E0] text-[#2C2C2A]"
                              onClick={() => setFilingEditing(true)}
                            >
                              Aanpassen
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Approve bar */}
              <div className="border-t border-[#E8E6E0] bg-[#F7F6F3] px-6 py-4">
                {saved ? (
                  <div className="flex items-start gap-2 rounded-lg bg-[#E1F5EE] px-3 py-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#3B6D11]" />
                    <span className="text-[12px] text-[#3B6D11]">
                      Opgeslagen: {savedCounts.audit} financiële records, {savedCounts.comment} comments,{" "}
                      {savedCounts.context} context documenten. Document gearchiveerd in {folderPath} en gekoppeld aan{" "}
                      {dataPoint}.
                    </span>
                  </div>
                ) : (
                  <>
                    <p className="mb-2.5 text-[11px] text-[#9A988F]">
                      Nóóit automatisch opgeslagen — bevestig hieronder.
                    </p>
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={onBack}
                        className="text-[13px] font-medium text-[#6B6963] hover:text-[#2C2C2A]"
                      >
                        Annuleren
                      </button>
                      <Button
                        disabled={!canSave || saving}
                        onClick={handleSave}
                        className="bg-[#1B4D45] text-white hover:bg-[#164039] disabled:opacity-40"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                            Opslaan…
                          </>
                        ) : (
                          "Opslaan →"
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
      <dt className="text-[#6B6963]">{label}</dt>
      <dd className="font-medium text-[#2C2C2A]">{value}</dd>
    </div>
  )
}

function EditRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-[#6B6963]">{label}</label>
      {children}
    </div>
  )
}

// Faux read-only document preview (no real PDF available)
function DocumentPage({ docType, company, period }: { docType: string; company: string; period: string }) {
  const title =
    docType === "annual-accounts"
      ? `Jaarrekening ${period}`
      : docType === "credit-agreement"
      ? `Senior Facilities Agreement`
      : `Investment Committee Memo`
  return (
    <div className="rounded-sm border border-[#E2E0DA] bg-white px-10 py-12 text-[#2C2C2A] shadow-sm">
      <p className="text-[10px] uppercase tracking-widest text-[#9A988F]">{documentTypeLabels[docType]}</p>
      <h2 className="mt-2 text-[18px] font-semibold">{title}</h2>
      <p className="mt-1 text-[12px] text-[#6B6963]">
        {company} · {period}
      </p>
      <div className="mt-6 space-y-3 text-[11px] leading-relaxed text-[#4A4844]">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-2 w-2/5 rounded bg-[#EDEBE5]" />
            <div className="h-2 w-full rounded bg-[#F2F1ED]" />
            <div className="h-2 w-11/12 rounded bg-[#F2F1ED]" />
            <div className="h-2 w-4/5 rounded bg-[#F2F1ED]" />
          </div>
        ))}
      </div>
    </div>
  )
}
