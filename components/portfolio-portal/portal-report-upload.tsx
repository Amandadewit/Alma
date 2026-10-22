"use client"

import { useRef, useState } from "react"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  Leaf,
  TrendingUp,
  Target,
  CheckCircle2,
  X,
  Download,
  Send,
  Loader2,
} from "lucide-react"
import type { PendingReport } from "@/lib/portfolio-portal-config"

interface UploadedDoc {
  name: string
  size: string
  rows: number
}

const kindIcon = {
  performance: TrendingUp,
  budget: Target,
  esg: Leaf,
}

/** A sample file suggested per report kind, used to simulate a browse/drop. */
const sampleFile: Record<PendingReport["kind"], UploadedDoc> = {
  performance: { name: "FreshBox_Performance_May2026.xlsx", size: "412 KB", rows: 72 },
  budget: { name: "FreshBox_Budget_FY2027.xlsx", size: "268 KB", rows: 96 },
  esg: { name: "FreshBox_ESG_FY2025.xlsx", size: "196 KB", rows: 48 },
}

export function PortalReportUpload({
  report,
  onBack,
  onSubmit,
}: {
  report: PendingReport
  onBack: () => void
  onSubmit: () => void
}) {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<UploadedDoc | null>(null)
  const [validating, setValidating] = useState(false)
  const [validated, setValidated] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const Icon = kindIcon[report.kind]

  const attach = () => {
    setFile(sampleFile[report.kind])
    setValidating(true)
    setValidated(false)
    // Simulate server-side parsing + validation.
    setTimeout(() => {
      setValidating(false)
      setValidated(true)
    }, 1400)
  }

  const removeFile = () => {
    setFile(null)
    setValidating(false)
    setValidated(false)
  }

  return (
    <div className="min-h-screen font-sans">
      {/* Sub-header */}
      <div className="border-b border-line bg-white px-8 py-4">
        <button
          onClick={onBack}
          className="mb-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-2 transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Portfolio Portal
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-[16px] font-semibold text-ink">{report.title}</h1>
            <p className="text-[12px] text-ink-2">
              {report.cadence} · Due {report.deadline}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 px-8 py-6 lg:grid-cols-[1fr_300px]">
        {/* Upload column */}
        <div>
          {/* Drop zone / attached file */}
          {!file ? (
            <div
              onDragEnter={() => setDragActive(true)}
              onDragLeave={() => setDragActive(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                setDragActive(false)
                attach()
              }}
              className={cn(
                "flex h-64 flex-col items-center justify-center rounded-[10px] border-2 border-dashed transition-colors",
                dragActive ? "border-brand bg-brand-soft" : "border-line bg-white",
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft">
                <Upload className="h-5 w-5 text-brand" />
              </div>
              <h3 className="mt-3 text-[14px] font-medium text-ink">Drop your {report.title.toLowerCase()} here</h3>
              <p className="mt-1 text-[12px] text-ink-2">or click to browse from your computer</p>
              <p className="mt-1 text-[11px] text-ink-3">Supported: {report.accepts}</p>
              <button
                onClick={() => {
                  inputRef.current?.click()
                }}
                className="mt-4 rounded-lg bg-brand px-5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-action-hover"
              >
                Browse Files
              </button>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={() => attach()}
              />
            </div>
          ) : (
            <div className="rounded-[10px] border border-line bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft">
                  <FileSpreadsheet className="h-5 w-5 text-brand" />
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-medium text-ink">{file.name}</div>
                  <div className="text-[11px] text-ink-2">
                    {file.size}
                    {file.rows > 0 && ` · ${file.rows} rows`}
                  </div>
                </div>
                {validating ? (
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Validating…
                  </span>
                ) : validated ? (
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ok">
                    <CheckCircle2 className="h-4 w-4" />
                    {file.rows > 0 ? `${file.rows} rows validated` : "Validated"}
                  </span>
                ) : null}
                <button
                  onClick={removeFile}
                  className="ml-1 flex h-7 w-7 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-surface-2 hover:text-alert"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {validated && (
                <div className="mt-4 rounded-lg bg-surface-2 px-4 py-3">
                  <div className="flex items-center gap-2 text-[12px] font-medium text-ok">
                    <CheckCircle2 className="h-4 w-4" />
                    File parsed and mapped successfully
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-ok">
                    All required metrics were found and matched to the {report.title.toLowerCase()} schema. Review and
                    submit to send this to Alma Capital.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Submit bar */}
          <div className="mt-6 flex flex-col gap-3 rounded-[10px] border border-line bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[12px] text-ink-2">
              {validated
                ? "Validated and ready to submit to Alma Capital."
                : "Upload your file to run validation before submitting."}
            </div>
            <button
              type="button"
              onClick={onSubmit}
              disabled={!validated}
              className={cn(
                "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-[13px] font-medium transition-colors",
                validated
                  ? "bg-brand text-white hover:bg-action-hover"
                  : "cursor-not-allowed bg-line text-ink-3",
              )}
            >
              <Send className="h-4 w-4" />
              Submit for Verification
            </button>
          </div>
        </div>

        {/* Instructions sidebar */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-[10px] border border-line bg-white p-5">
            <h3 className="text-[13px] font-semibold text-ink">Upload instructions</h3>
            <ol className="mt-3 flex flex-col gap-3">
              {[
                "Use the standard template provided by Alma Capital.",
                report.kind === "esg"
                  ? "Complete all mandatory SFDR PAI indicators."
                  : "Include all required metrics (Revenue, EBITDA, Net Debt).",
                "Figures are automatically validated against prior periods.",
                "Resolve any flags, then submit for verification.",
              ].map((step, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-medium text-brand">
                    {i + 1}
                  </span>
                  <span className="text-[12px] leading-relaxed text-ink-2">{step}</span>
                </li>
              ))}
            </ol>

            {report.template && (
              <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-line px-4 py-2.5 text-[12px] font-medium text-ink transition-colors hover:bg-bg">
                <Download className="h-4 w-4 text-brand" />
                Download Template
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
