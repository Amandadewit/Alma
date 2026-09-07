"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { companies } from "@/lib/mock-data"
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Clock, DollarSign, TrendingUp, Sparkles, FileText, Loader2 } from "lucide-react"
import { UploadReview } from "@/components/upload-review"
import { DocumentReview } from "@/components/document-review"

type UploadType = "financial" | "cashflow" | "document"

const documentTypeLabels: Record<string, string> = {
  "ic-memo": "IC memo",
  "credit-agreement": "Credit agreement",
  "annual-accounts": "Annual accounts",
  "monthly-report": "Monthly report",
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
  status: "processing" | "validated" | "error"
  rows?: number
  pages?: number
  uploadedAt: string
}

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false)
  const [uploadType, setUploadType] = useState<UploadType>("financial")
  const [docType, setDocType] = useState("ic-memo")
  const [docCompany, setDocCompany] = useState(companies[0]?.name ?? "")
  const [reviewFile, setReviewFile] = useState<UploadedFile | null>(null)

  const recentUploads: UploadedFile[] = [
    { id: "1", name: "MedTech_Mar2026.xlsx", company: "MedTech Group", period: "Mar 2026", type: "financial", status: "validated", rows: 142, uploadedAt: "10 min ago" },
    { id: "2", name: "Sure_Cashflow_Q1.xlsx", company: "Sure Operations", period: "Q1 2026", type: "cashflow", status: "validated", rows: 36, uploadedAt: "30 min ago" },
    { id: "3", name: "Sure_Mar2026.xlsx", company: "Sure Operations", period: "Mar 2026", type: "financial", status: "validated", rows: 98, uploadedAt: "1 hour ago" },
    { id: "4", name: "CleanFlow_Mar2026.xlsx", company: "CleanFlow", period: "Mar 2026", type: "financial", status: "processing", uploadedAt: "2 hours ago" },
    { id: "5", name: "LogiServe_Cashflow.xlsx", company: "LogiServe", period: "Q1 2026", type: "cashflow", status: "error", uploadedAt: "Yesterday" },
    { id: "6", name: "FreshBox_IC_Memo.pdf", company: "FreshBox Logistics", period: "Dec 2022", type: "document", documentType: "ic-memo", status: "validated", pages: 47, uploadedAt: "1 hr ago" },
    { id: "7", name: "FreshBox_Jaarrekening_2025.pdf", company: "FreshBox Logistics", period: "FY 2025", type: "document", documentType: "annual-accounts", status: "validated", pages: 68, uploadedAt: "2 hrs ago" },
    { id: "8", name: "NordicHealth_Krediet.pdf", company: "Nordic Health Group", period: "Mar 2023", type: "document", documentType: "credit-agreement", status: "processing", uploadedAt: "Processing…" },
  ]

  const visibleUploads =
    uploadType === "document"
      ? recentUploads.filter((f) => f.type === "document")
      : recentUploads.filter((f) => f.type !== "document")

  if (reviewFile) {
    if (reviewFile.type === "document") {
      return (
        <DocumentReview
          file={{
            id: reviewFile.id,
            name: reviewFile.name,
            company: reviewFile.company,
            period: reviewFile.period,
            documentType: reviewFile.documentType,
            status: reviewFile.status,
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
      <div className="flex items-center justify-between border-b border-[#E8E6E0] px-6 py-4">
        <div>
          <h1 className="text-xl font-medium text-[#2C2C2A]">Upload Data</h1>
          <p className="text-[13px] text-[#6B6963]">Upload financial and cashflow data from portfolio companies</p>
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
                  ? "border-[#1B4D45] border-[1.5px] bg-[#E1F5EE]"
                  : "border-[#E8E6E0] bg-white hover:border-[#D4C5A9]"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                uploadType === "financial" ? "bg-[#1B4D45]" : "bg-[#F7F6F3]"
              )}>
                <TrendingUp className={cn("h-5 w-5", uploadType === "financial" ? "text-white" : "text-[#6B6963]")} />
              </div>
              <div className="text-left">
                <div className={cn("text-[13px] font-medium", uploadType === "financial" ? "text-[#1B4D45]" : "text-[#2C2C2A]")}>
                  Financial Data
                </div>
                <div className="text-[11px] text-[#6B6963]">P&L, Balance Sheet, KPIs</div>
              </div>
            </button>
            <button
              onClick={() => setUploadType("cashflow")}
              className={cn(
                "flex flex-1 items-center gap-3 rounded-[10px] border p-4 transition-all",
                uploadType === "cashflow"
                  ? "border-[#B8975A] border-[1.5px] bg-[#FDF8F0]"
                  : "border-[#E8E6E0] bg-white hover:border-[#D4C5A9]"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                uploadType === "cashflow" ? "bg-[#B8975A]" : "bg-[#F7F6F3]"
              )}>
                <DollarSign className={cn("h-5 w-5", uploadType === "cashflow" ? "text-white" : "text-[#6B6963]")} />
              </div>
              <div className="text-left">
                <div className={cn("text-[13px] font-medium", uploadType === "cashflow" ? "text-[#B8975A]" : "text-[#2C2C2A]")}>
                  Cashflow Data
                </div>
                <div className="text-[11px] text-[#6B6963]">Cash movements, projections</div>
              </div>
            </button>
            <button
              onClick={() => setUploadType("document")}
              className={cn(
                "flex flex-1 items-center gap-3 rounded-[10px] border p-4 transition-all",
                uploadType === "document"
                  ? "border-[#1B4D45] border-[1.5px] bg-[#1B4D45]"
                  : "border-[#E8E6E0] bg-white hover:border-[#D4C5A9]"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                uploadType === "document" ? "bg-white/15" : "bg-[#F7F6F3]"
              )}>
                <Sparkles className={cn("h-5 w-5", uploadType === "document" ? "text-white" : "text-[#6B6963]")} />
              </div>
              <div className="text-left">
                <div className={cn("text-[13px] font-medium", uploadType === "document" ? "text-white" : "text-[#2C2C2A]")}>
                  Document Intake
                </div>
                <div className={cn("text-[11px]", uploadType === "document" ? "text-white/70" : "text-[#6B6963]")}>
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
                ? uploadType === "financial" ? "border-[#1B4D45] bg-[#E1F5EE]" 
                  : uploadType === "cashflow" ? "border-[#B8975A] bg-[#FDF8F0]"
                  : "border-[#1B4D45] bg-[#E1F5EE]"
                : "border-[#E8E6E0] bg-white"
            )}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => setDragActive(false)}
          >
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              uploadType === "financial" ? "bg-[#E1F5EE]" : uploadType === "cashflow" ? "bg-[#FDF8F0]" : "bg-[#E1F5EE]"
            )}>
              {uploadType === "document" ? (
                <Sparkles className="h-5 w-5 text-[#1B4D45]" />
              ) : (
                <Upload className={cn("h-5 w-5", uploadType === "financial" ? "text-[#1B4D45]" : "text-[#B8975A]")} />
              )}
            </div>
            <h3 className="mt-3 text-[14px] font-medium text-[#2C2C2A]">
              {uploadType === "document"
                ? "Drop documents here"
                : `Drop ${uploadType === "financial" ? "financial" : "cashflow"} files here`}
            </h3>
            <p className="mt-1 text-[12px] text-[#6B6963]">
              or click to browse from your computer
            </p>
            <p className="mt-2 text-[11px] text-[#D4C5A9]">
              {uploadType === "document" ? "Supported: PDF, Word (.docx)" : "Supported: Excel (.xlsx, .xls), CSV"}
            </p>
            <Button className={cn(
              "mt-3",
              uploadType === "cashflow"
                ? "bg-[#B8975A] hover:bg-[#A68548]"
                : "bg-[#1B4D45] hover:bg-[#164039]"
            )}>
              Browse Files
            </Button>
          </div>

          {/* Document pre-classification (Document Intake only) */}
          {uploadType === "document" && (
            <div className="mt-4 grid grid-cols-2 gap-4 rounded-[10px] border border-[#E8E6E0] bg-white p-4">
              <div>
                <label className="text-[12px] font-medium text-[#2C2C2A]">Document type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#E8E6E0] bg-white px-3 py-2 text-[13px] text-[#2C2C2A] outline-none focus:border-[#1B4D45]"
                >
                  {Object.entries(documentTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#2C2C2A]">Company</label>
                <select
                  value={docCompany}
                  onChange={(e) => setDocCompany(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#E8E6E0] bg-white px-3 py-2 text-[13px] text-[#2C2C2A] outline-none focus:border-[#1B4D45]"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Recent Uploads */}
          <div className="mt-6 rounded-[10px] border border-[#E8E6E0] bg-white">
            <div className="border-b border-[#E8E6E0] px-4 py-3">
              <h2 className="text-[13px] font-medium text-[#2C2C2A]">Recent Uploads</h2>
            </div>
            <div className="divide-y divide-[#E8E6E0]">
              {visibleUploads.map((file) => (
                <button
                  key={file.id}
                  onClick={() => setReviewFile(file)}
                  className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-[#F7F6F3]"
                >
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    file.type === "financial" ? "bg-[#E1F5EE]" : file.type === "cashflow" ? "bg-[#FDF8F0]" : "bg-[#F1ECF7]"
                  )}>
                    {file.type === "financial" ? (
                      <FileSpreadsheet className="h-5 w-5 text-[#1B4D45]" />
                    ) : file.type === "cashflow" ? (
                      <DollarSign className="h-5 w-5 text-[#B8975A]" />
                    ) : (
                      <FileText className="h-5 w-5 text-[#7B5EA7]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-[#2C2C2A]">{file.name}</span>
                      <span className={cn(
                        "rounded px-1.5 py-0.5 text-[9px] font-medium",
                        file.type === "financial" ? "bg-[#E1F5EE] text-[#1B4D45]"
                          : file.type === "cashflow" ? "bg-[#FDF8F0] text-[#B8975A]"
                          : "bg-[#F1ECF7] text-[#7B5EA7]"
                      )}>
                        {file.type === "financial" ? "Financial"
                          : file.type === "cashflow" ? "Cashflow"
                          : documentTypeLabels[file.documentType ?? "other"]}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6B6963]">
                      {file.company} · {file.period} · {file.uploadedAt}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.status === "validated" && (
                      <>
                        <span className="text-[11px] text-[#3B6D11]">
                          {file.type === "document" ? `Indexed · ${file.pages} pages` : `${file.rows} rows validated`}
                        </span>
                        <CheckCircle2 className="h-4 w-4 text-[#3B6D11]" />
                      </>
                    )}
                    {file.status === "processing" && (
                      <>
                        <span className="text-[11px] text-[#B8975A]">Processing…</span>
                        {file.type === "document" ? (
                          <Loader2 className="h-4 w-4 animate-spin text-[#B8975A]" />
                        ) : (
                          <Clock className="h-4 w-4 text-[#B8975A]" />
                        )}
                      </>
                    )}
                    {file.status === "error" && (
                      <>
                        <span className="text-[11px] text-[#A32D2D]">Validation failed</span>
                        <AlertCircle className="h-4 w-4 text-[#A32D2D]" />
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
          {uploadType === "document" ? (
            <div className="rounded-[10px] border border-[#E8E6E0] bg-white p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#1B4D45]" />
                <h3 className="text-[13px] font-medium text-[#2C2C2A]">AI processing</h3>
              </div>
              <div className="mt-3 space-y-3 text-[12px] text-[#6B6963]">
                <div className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E1F5EE] text-[10px] font-medium text-[#1B4D45]">1</span>
                  <span>Document is parsed and text extracted</span>
                </div>
                <div className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E1F5EE] text-[10px] font-medium text-[#1B4D45]">2</span>
                  <span>Type and company are verified against your selection</span>
                </div>
                <div className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E1F5EE] text-[10px] font-medium text-[#1B4D45]">3</span>
                  <span>Key data points are indexed for Insights and Report Builder</span>
                </div>
                <div className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E1F5EE] text-[10px] font-medium text-[#1B4D45]">4</span>
                  <span>Document becomes available in chat within ~30 seconds</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[10px] border border-[#E8E6E0] bg-white p-4">
              <h3 className="text-[13px] font-medium text-[#2C2C2A]">Upload Instructions</h3>
              <div className="mt-3 space-y-3 text-[12px] text-[#6B6963]">
                <div className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F7F6F3] text-[10px] font-medium text-[#2C2C2A]">1</span>
                  <span>Use the standard template provided by your deal team</span>
                </div>
                <div className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F7F6F3] text-[10px] font-medium text-[#2C2C2A]">2</span>
                  <span>Include all required metrics (Revenue, EBITDA, Net Debt)</span>
                </div>
                <div className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F7F6F3] text-[10px] font-medium text-[#2C2C2A]">3</span>
                  <span>For cashflow: include opening balance, inflows, outflows</span>
                </div>
                <div className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F7F6F3] text-[10px] font-medium text-[#2C2C2A]">4</span>
                  <span>Data will be automatically validated and mapped</span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Button variant="outline" className="w-full border-[#E8E6E0] text-[#2C2C2A]">
                  Download Financial Template
                </Button>
                <Button variant="outline" className="w-full border-[#E8E6E0] text-[#2C2C2A]">
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
