"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { companies } from "@/lib/mock-data"
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Clock, DollarSign, TrendingUp, Sparkles, FileText, Loader2 } from "lucide-react"
import { UploadReview } from "@/components/upload-review"
import { DocumentReview } from "@/components/document-review"
import { MonthlyReportIntake } from "@/components/monthly-report-intake"

type UploadType = "financial" | "cashflow" | "document"

const documentTypeLabels: Record<string, string> = {
  "ic-memo": "IC memo",
  "credit-agreement": "Credit agreement",
  "annual-accounts": "Annual accounts",
  "monthly-report": "Performance sheet",
  "spa": "SPA",
  "other": "Other",
}

interface UploadedFile {
  id: string
  name: string
  company: string
  period: string
  type: UploadType
  documentType?: string
  status: "processing" | "validated" | "error" | "review"
  rows?: number
  pages?: number
  uploadedAt: string
}

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false)
  const [uploadType, setUploadType] = useState<UploadType>("financial")
  const [docType, setDocType] = useState("ic-memo")
  const [docCompany, setDocCompany] = useState(companies[0]?.name ?? "")
  const [docPeriod, setDocPeriod] = useState("Aug 2026")
  const [reviewFile, setReviewFile] = useState<UploadedFile | null>(null)
  const isExcelDoc = docType === "monthly-report"

  const recentUploads: UploadedFile[] = [
    { id: "10", name: "Alma_Testcase_A_Lenderrapportage_2026-08.xlsx", company: "Fictus Capital Management", period: "Aug 2026", type: "document", documentType: "monthly-report", status: "review", rows: 92, uploadedAt: "5 min ago" },
    { id: "11", name: "Alma_Testcase_B_Maandsluiting_2026-08.xlsx", company: "Nordic Health Group", period: "Aug 2026", type: "document", documentType: "monthly-report", status: "review", rows: 95, uploadedAt: "8 min ago" },
    { id: "1", name: "MedTech_Mar2026.xlsx", company: "MedTech Group", period: "Mar 2026", type: "financial", status: "validated", rows: 142, uploadedAt: "10 min ago" },
    { id: "2", name: "Sure_Cashflow_Q1.xlsx", company: "Sure Operations", period: "Q1 2026", type: "cashflow", status: "validated", rows: 36, uploadedAt: "30 min ago" },
    { id: "3", name: "Sure_Mar2026.xlsx", company: "Sure Operations", period: "Mar 2026", type: "financial", status: "validated", rows: 98, uploadedAt: "1 hour ago" },
    { id: "4", name: "CleanFlow_Mar2026.xlsx", company: "CleanFlow", period: "Mar 2026", type: "financial", status: "processing", uploadedAt: "2 hours ago" },
    { id: "5", name: "LogiServe_Cashflow.xlsx", company: "LogiServe", period: "Q1 2026", type: "cashflow", status: "error", uploadedAt: "Yesterday" },
    { id: "6", name: "FreshBox_IC_Memo.pdf", company: "FreshBox Logistics", period: "Dec 2022", type: "document", documentType: "ic-memo", status: "validated", pages: 47, uploadedAt: "1 hr ago" },
    { id: "7", name: "FreshBox_Annual_Accounts_2025.pdf", company: "FreshBox Logistics", period: "FY 2025", type: "document", documentType: "annual-accounts", status: "validated", pages: 68, uploadedAt: "2 hrs ago" },
    { id: "8", name: "NordicHealth_Credit_Agreement.pdf", company: "Nordic Health Group", period: "Mar 2023", type: "document", documentType: "credit-agreement", status: "processing", uploadedAt: "Processing…" },
  ]

  const visibleUploads =
    uploadType === "document"
      ? recentUploads.filter((f) => f.type === "document")
      : recentUploads.filter((f) => f.type !== "document")

  if (reviewFile) {
    if (reviewFile.type === "document" && reviewFile.documentType === "monthly-report" && reviewFile.name.endsWith(".xlsx")) {
      return <MonthlyReportIntake key={reviewFile.id} caseId={reviewFile.name.includes("Testcase_A") ? "A" : "B"} onBack={() => setReviewFile(null)} />
    }
    if (reviewFile.type === "document") {
      return (
        <DocumentReview
          file={{
            id: reviewFile.id,
            name: reviewFile.name,
            company: reviewFile.company,
            period: reviewFile.period,
            documentType: reviewFile.documentType,
            status: reviewFile.status === "review" ? "validated" : reviewFile.status,
            pages: reviewFile.pages,
          }}
          onBack={() => setReviewFile(null)}
        />
      )
    }
    return (
      <UploadReview
        file={{
          id: reviewFile.id,
          name: reviewFile.name,
          company: reviewFile.company,
          period: reviewFile.period,
        }}
        onBack={() => setReviewFile(null)}
      />
    )
  }

  return (
    <div className="flex min-h-screen flex-col font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <div>
          <h1 className="text-xl font-medium text-ink">Upload Data</h1>
          <p className="text-[13px] text-ink-2">Upload financial and cashflow data from portfolio companies</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 gap-6 p-6">
        {/* Upload Area */}
        <div className="flex-1">
          {/* Upload Type Selection */}
          <div className="mb-4 flex gap-3">
            <button
              onClick={() => setUploadType("financial")}
              className={cn(
                "flex flex-1 items-center gap-3 rounded-[10px] border p-4 transition-all",
                uploadType === "financial"
                  ? "border-brand border-[1.5px] bg-brand-soft"
                  : "border-line bg-white hover:border-ai-soft"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                uploadType === "financial" ? "bg-brand" : "bg-bg"
              )}>
                <TrendingUp className={cn("h-5 w-5", uploadType === "financial" ? "text-white" : "text-ink-2")} />
              </div>
              <div className="text-left">
                <div className={cn("text-[13px] font-medium", uploadType === "financial" ? "text-brand" : "text-ink")}>
                  Financial Data
                </div>
                <div className="text-[11px] text-ink-2">P&L, Balance Sheet, KPIs</div>
              </div>
            </button>
            <button
              onClick={() => setUploadType("cashflow")}
              className={cn(
                "flex flex-1 items-center gap-3 rounded-[10px] border p-4 transition-all",
                uploadType === "cashflow"
                  ? "border-ai border-[1.5px] bg-ai-soft"
                  : "border-line bg-white hover:border-ai-soft"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                uploadType === "cashflow" ? "bg-ai" : "bg-bg"
              )}>
                <DollarSign className={cn("h-5 w-5", uploadType === "cashflow" ? "text-white" : "text-ink-2")} />
              </div>
              <div className="text-left">
                <div className={cn("text-[13px] font-medium", uploadType === "cashflow" ? "text-ai" : "text-ink")}>
                  Cashflow Data
                </div>
                <div className="text-[11px] text-ink-2">Cash movements, projections</div>
              </div>
            </button>
            <button
              onClick={() => setUploadType("document")}
              className={cn(
                "flex flex-1 items-center gap-3 rounded-[10px] border p-4 transition-all",
                uploadType === "document"
                  ? "border-brand border-[1.5px] bg-brand"
                  : "border-line bg-white hover:border-ai-soft"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                uploadType === "document" ? "bg-white/15" : "bg-bg"
              )}>
                <Sparkles className={cn("h-5 w-5", uploadType === "document" ? "text-white" : "text-ink-2")} />
              </div>
              <div className="text-left">
                <div className={cn("text-[13px] font-medium", uploadType === "document" ? "text-white" : "text-ink")}>
                  Document Intake
                </div>
                <div className={cn("text-[11px]", uploadType === "document" ? "text-white/70" : "text-ink-2")}>
                  IC memos, agreements, annual reports
                </div>
              </div>
            </button>
          </div>

          {/* Drop Zone */}
          <div
            className={cn(
              "flex h-56 flex-col items-center justify-center rounded-[10px] border-2 border-dashed transition-colors",
              dragActive 
                ? uploadType === "financial" ? "border-brand bg-brand-soft" 
                  : uploadType === "cashflow" ? "border-ai bg-ai-soft"
                  : "border-brand bg-brand-soft"
                : "border-line bg-white"
            )}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => setDragActive(false)}
          >
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              uploadType === "financial" ? "bg-brand-soft" : uploadType === "cashflow" ? "bg-ai-soft" : "bg-brand-soft"
            )}>
              {uploadType === "document" ? (
                <Sparkles className="h-5 w-5 text-brand" />
              ) : (
                <Upload className={cn("h-5 w-5", uploadType === "financial" ? "text-brand" : "text-ai")} />
              )}
            </div>
            <h3 className="mt-3 text-[14px] font-medium text-ink">
              {uploadType === "document"
                ? "Drop documents here"
                : `Drop ${uploadType === "financial" ? "financial" : "cashflow"} files here`}
            </h3>
            <p className="mt-1 text-[12px] text-ink-2">
              or click to browse from your computer
            </p>
            <p className="mt-2 text-[11px] text-ai-soft">
              {uploadType === "document"
                ? isExcelDoc ? "Performance sheet: Excel (.xlsx) only, no PDF" : "Supported: PDF, Word (.docx)"
                : "Supported: Excel (.xlsx, .xls), CSV"}
            </p>
            <Button className={cn(
              "mt-3",
              uploadType === "cashflow"
                ? "bg-ai hover:bg-ai-text"
                : "bg-brand hover:bg-action-hover"
            )}>
              Browse Files
            </Button>
          </div>

          {/* Document pre-classification (Document Intake only) */}
          {uploadType === "document" && (
            <div className={cn("mt-4 grid gap-4 rounded-[10px] border border-line bg-white p-4", isExcelDoc ? "grid-cols-3" : "grid-cols-2")}>
              <div>
                <label className="text-[12px] font-medium text-ink">Document type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-brand"
                >
                  {Object.entries(documentTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[12px] font-medium text-ink">Company</label>
                <select
                  value={docCompany}
                  onChange={(e) => setDocCompany(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-brand"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              {isExcelDoc && (
                <div>
                  <label className="text-[12px] font-medium text-ink">Period</label>
                  <select
                    value={docPeriod}
                    onChange={(e) => setDocPeriod(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-brand"
                  >
                    {["Jun 2026", "Jul 2026", "Aug 2026", "Sep 2026"].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              )}
              {isExcelDoc && (
                <p className="col-span-3 text-[11px] text-ink-2">
                  You choose type and period before uploading; the AI checks them against the file and warns on a mismatch (for example the May report uploaded as June).
                </p>
              )}
            </div>
          )}

          {/* Recent Uploads */}
          <div className="mt-6 rounded-[10px] border border-line bg-white">
            <div className="border-b border-line px-4 py-3">
              <h2 className="text-[13px] font-medium text-ink">Recent Uploads</h2>
            </div>
            <div className="divide-y divide-line">
              {visibleUploads.map((file) => (
                <button
                  key={file.id}
                  onClick={() => setReviewFile(file)}
                  className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-bg"
                >
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    file.type === "financial" ? "bg-brand-soft" : file.type === "cashflow" ? "bg-ai-soft" : "bg-ai-soft"
                  )}>
                    {file.type === "financial" ? (
                      <FileSpreadsheet className="h-5 w-5 text-brand" />
                    ) : file.type === "cashflow" ? (
                      <DollarSign className="h-5 w-5 text-ai" />
                    ) : (
                      <FileText className="h-5 w-5 text-ai-text" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-ink">{file.name}</span>
                      <span className={cn(
                        "rounded px-1.5 py-0.5 text-[9px] font-medium",
                        file.type === "financial" ? "bg-brand-soft text-brand"
                          : file.type === "cashflow" ? "bg-ai-soft text-ai"
                          : "bg-ai-soft text-ai-text"
                      )}>
                        {file.type === "financial" ? "Financial"
                          : file.type === "cashflow" ? "Cashflow"
                          : documentTypeLabels[file.documentType ?? "other"]}
                      </span>
                    </div>
                    <div className="text-[11px] text-ink-2">
                      {file.company} · {file.period} · {file.uploadedAt}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.status === "validated" && (
                      <>
                        <span className="text-[11px] text-ok">
                          {file.type === "document" ? `Indexed · ${file.pages} pages` : `${file.rows} rows validated`}
                        </span>
                        <CheckCircle2 className="h-4 w-4 text-ok" />
                      </>
                    )}
                    {file.status === "review" && (
                      <>
                        <span className="text-[11px] text-ai">{file.rows} values · needs your review</span>
                        <AlertCircle className="h-4 w-4 text-ai" />
                      </>
                    )}
                    {file.status === "processing" && (
                      <>
                        <span className="text-[11px] text-ai">Processing…</span>
                        {file.type === "document" ? (
                          <Loader2 className="h-4 w-4 animate-spin text-ai" />
                        ) : (
                          <Clock className="h-4 w-4 text-ai" />
                        )}
                      </>
                    )}
                    {file.status === "error" && (
                      <>
                        <span className="text-[11px] text-alert">Validation failed</span>
                        <AlertCircle className="h-4 w-4 text-alert" />
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="w-80">
          {uploadType === "document" && isExcelDoc ? (
            <div className="rounded-[10px] border border-line bg-white p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand" />
                <h3 className="text-[13px] font-medium text-ink">Performance sheet from Excel</h3>
              </div>
              <div className="mt-3 space-y-3 text-[12px] text-ink-2">
                {[
                  "The Excel is read directly, so no PDF and nothing for the CFO to link",
                  "One standard performance sheet: every row goes to the data model, with the source cell kept per value",
                  "Totals are recalculated and checked; costs are stored negative, income positive",
                  "YTD is compared with the report: changed earlier months are historical data, flagged for you to decide how to process them",
                  "Nothing is stored until you confirm",
                ].map((t, i) => (
                  <div key={t} className="flex gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[10px] font-medium text-brand">{i + 1}</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : uploadType === "document" ? (
            <div className="rounded-[10px] border border-line bg-white p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand" />
                <h3 className="text-[13px] font-medium text-ink">AI processing</h3>
              </div>
              <div className="mt-3 space-y-3 text-[12px] text-ink-2">
                <div className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[10px] font-medium text-brand">1</span>
                  <span>Document is parsed and text extracted</span>
                </div>
                <div className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[10px] font-medium text-brand">2</span>
                  <span>Type and company are verified against your selection</span>
                </div>
                <div className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[10px] font-medium text-brand">3</span>
                  <span>Key data points are indexed for Insights and Report Builder</span>
                </div>
                <div className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[10px] font-medium text-brand">4</span>
                  <span>Document becomes available in chat within ~30 seconds</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[10px] border border-line bg-white p-4">
              <h3 className="text-[13px] font-medium text-ink">Upload Instructions</h3>
              <div className="mt-3 space-y-3 text-[12px] text-ink-2">
                <div className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bg text-[10px] font-medium text-ink">1</span>
                  <span>Use the standard template provided by your deal team</span>
                </div>
                <div className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bg text-[10px] font-medium text-ink">2</span>
                  <span>Include all required metrics (Revenue, EBITDA, Net Debt)</span>
                </div>
                <div className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bg text-[10px] font-medium text-ink">3</span>
                  <span>For cashflow: include opening balance, inflows, outflows</span>
                </div>
                <div className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bg text-[10px] font-medium text-ink">4</span>
                  <span>Data will be automatically validated and mapped</span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Button variant="outline" className="w-full border-line text-ink">
                  Download Financial Template
                </Button>
                <Button variant="outline" className="w-full border-line text-ink">
                  Download Cashflow Template
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
