"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { funds, companies } from "@/lib/mock-data"
import {
  FileText,
  Mail,
  LayoutGrid,
  FileSpreadsheet,
  TrendingUp,
  Pencil,
  FileType,
  FileDown,
  Share2,
  ExternalLink,
} from "lucide-react"

type TemplateId = "lp-letter" | "board-pack" | "management-summary" | "exit-memo"

const templates: {
  id: TemplateId
  title: string
  description: string
  icon: typeof Mail
}[] = [
  { id: "lp-letter", title: "LP Quarterly Letter", description: "Investor update with portfolio highlights", icon: Mail },
  { id: "board-pack", title: "Board Pack", description: "Full board package with tables and commentary", icon: LayoutGrid },
  { id: "management-summary", title: "Management Summary", description: "One-pager per company for internal review", icon: FileSpreadsheet },
  { id: "exit-memo", title: "Exit Memo", description: "Investment narrative and return analysis", icon: TrendingUp },
]

const periods = ["Q1 2026", "Q2 2026", "FY 2025", "FY 2024"]

const defaultOptions = {
  financialTables: true,
  kpiSummary: true,
  commentary: false,
  covenantStatus: false,
  sourceReferences: false,
}

type OptionKey = keyof typeof defaultOptions

const optionLabels: { key: OptionKey; label: string }[] = [
  { key: "financialTables", label: "Include financial tables" },
  { key: "kpiSummary", label: "Include KPI summary" },
  { key: "commentary", label: "Include management commentary" },
  { key: "covenantStatus", label: "Covenant status" },
  { key: "sourceReferences", label: "Append source references" },
]

export default function ReportBuilderPage() {
  const [template, setTemplate] = useState<TemplateId>("lp-letter")
  const [fund, setFund] = useState(funds[0].shortName)
  const [company, setCompany] = useState("All companies")
  const [period, setPeriod] = useState(periods[0])
  const [options, setOptions] = useState(defaultOptions)

  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generated, setGenerated] = useState<TemplateId | null>(null)

  const handleGenerate = () => {
    setGenerated(null)
    setGenerating(true)
    setProgress(0)
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min(100, Math.round((elapsed / 1200) * 100))
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(timer)
        setGenerating(false)
        setGenerated(template)
      }
    }, 60)
  }

  const toggleOption = (key: OptionKey) =>
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }))

  const activeTemplate = templates.find((t) => t.id === template)!

  return (
    <div className="flex h-screen flex-col font-sans">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-[#E8E6E0] px-6 py-4">
        <div>
          <h1 className="text-xl font-medium text-[#2C2C2A]">Report Builder</h1>
          <p className="text-[13px] text-[#6B6963]">Generate board documents from your portfolio data</p>
        </div>
        <Link
          href="/data-entry/lp-reporting/portfolio-portal"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#1B4D45]/20 bg-[#EAF1EF] px-4 py-2 text-[13px] font-medium text-[#1B4D45] transition-colors hover:bg-[#E0EBE8]"
        >
          <ExternalLink className="h-4 w-4" />
          Portfolio Portal
        </Link>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: config panel */}
        <div className="w-[300px] shrink-0 overflow-y-auto border-r border-[#E8E6E0] px-5 py-5">
          {/* 1. Template */}
          <div>
            <h2 className="text-[13px] font-medium text-[#2C2C2A]">1. Choose template</h2>
            <div className="mt-3 space-y-2">
              {templates.map((t) => {
                const Icon = t.icon
                const selected = template === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-[10px] border px-3 py-3 text-left transition-all",
                      selected
                        ? "border-l-[3px] border-l-[#1B4D45] border-y-[#D9E8E3] border-r-[#D9E8E3] bg-[#E1F5EE]"
                        : "border-[#E8E6E0] bg-white hover:border-[#D4C5A9]"
                    )}
                  >
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      selected ? "bg-[#1B4D45]" : "bg-[#F7F6F3]"
                    )}>
                      <Icon className={cn("h-4 w-4", selected ? "text-white" : "text-[#6B6963]")} />
                    </div>
                    <div className="min-w-0">
                      <div className={cn("text-[13px] font-medium", selected ? "text-[#1B4D45]" : "text-[#2C2C2A]")}>
                        {t.title}
                      </div>
                      <div className="text-[11px] leading-snug text-[#6B6963]">{t.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. Scope */}
          <div className="mt-5 border-t border-[#E8E6E0] pt-5">
            <h2 className="text-[13px] font-medium text-[#2C2C2A]">2. Scope</h2>
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-[11px] font-medium text-[#6B6963]">Fund</label>
                <select
                  value={fund}
                  onChange={(e) => setFund(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#E8E6E0] bg-white px-3 py-2 text-[13px] text-[#2C2C2A] outline-none focus:border-[#1B4D45]"
                >
                  {funds.map((f) => (
                    <option key={f.id} value={f.shortName}>{f.shortName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-[#6B6963]">Company</label>
                <select
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#E8E6E0] bg-white px-3 py-2 text-[13px] text-[#2C2C2A] outline-none focus:border-[#1B4D45]"
                >
                  <option value="All companies">All companies</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-[#6B6963]">Period</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#E8E6E0] bg-white px-3 py-2 text-[13px] text-[#2C2C2A] outline-none focus:border-[#1B4D45]"
                >
                  {periods.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 3. Options */}
          <div className="mt-5 border-t border-[#E8E6E0] pt-5">
            <h2 className="text-[13px] font-medium text-[#2C2C2A]">3. Options</h2>
            <div className="mt-3 space-y-2.5">
              {optionLabels.map(({ key, label }) => (
                <label key={key} className="flex cursor-pointer items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => toggleOption(key)}
                    className={cn(
                      "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border transition-colors",
                      options[key] ? "border-[#1B4D45] bg-[#1B4D45]" : "border-[#D4C5A9] bg-white"
                    )}
                  >
                    {options[key] && (
                      <svg viewBox="0 0 12 12" className="h-3 w-3 text-white" fill="none">
                        <path d="M2.5 6.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <span className="text-[12px] text-[#2C2C2A]">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="mt-6 w-full bg-[#1B4D45] text-white hover:bg-[#164039]"
          >
            {generating ? "Generating…" : "Generate report"}
          </Button>
        </div>

        {/* RIGHT: preview panel */}
        <div className="flex flex-1 flex-col overflow-hidden bg-[#F7F6F3]">
          {/* Toolbar */}
          {generated && !generating && (
            <div className="flex items-center gap-1 border-b border-[#E8E6E0] bg-white px-6 py-2">
              {[
                { icon: Pencil, label: "Edit" },
                { icon: FileType, label: "Export Word" },
                { icon: FileDown, label: "Export PDF" },
                { icon: Share2, label: "Share" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium text-[#6B6963] transition-colors hover:bg-[#F7F6F3] hover:text-[#2C2C2A]"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-1 items-center justify-center overflow-y-auto p-8">
            {generating ? (
              <div className="w-full max-w-sm text-center">
                <p className="mb-3 text-[13px] font-medium text-[#2C2C2A]">
                  Generating {activeTemplate.title}…
                </p>
                <Progress value={progress} className="h-1.5" />
                <p className="mt-2 text-[11px] text-[#6B6963]">Compiling portfolio data for {fund} · {period}</p>
              </div>
            ) : generated ? (
              <ReportPreview template={generated} fund={fund} company={company} period={period} options={options} />
            ) : (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EDEBE5]">
                  <FileText className="h-7 w-7 text-[#A8A49C]" />
                </div>
                <h3 className="mt-4 text-[15px] font-medium text-[#2C2C2A]">Your report will appear here</h3>
                <p className="mt-1 text-[13px] text-[#6B6963]">
                  Choose a template and scope, then generate to preview your document.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ReportPreview({
  template,
  fund,
  company,
  period,
  options,
}: {
  template: TemplateId
  fund: string
  company: string
  period: string
  options: typeof defaultOptions
}) {
  const ph = "text-[#1B4D45] font-medium"
  const scopeLabel = company === "All companies" ? fund : company

  return (
    <div className="mx-auto w-full max-w-[640px] rounded-[6px] border border-[#E8E6E0] bg-white px-10 py-9 shadow-sm">
      {/* Letterhead */}
      <div className="flex items-center justify-between border-b border-[#E8E6E0] pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1B4D45]">
            <span className="text-xs font-semibold text-white">A</span>
          </div>
          <span className="text-[15px] font-medium text-[#2C2C2A]">
            Alma <span className="text-[#B8975A]">Capital</span>
          </span>
        </div>
        <span className="text-[11px] text-[#6B6963]">{period}</span>
      </div>

      {/* Title */}
      <div className="mt-6">
        <div className="text-[11px] font-medium uppercase tracking-wider text-[#B8975A]">
          {template === "lp-letter" && "LP Quarterly Letter"}
          {template === "board-pack" && "Board Pack"}
          {template === "management-summary" && "Management Summary"}
          {template === "exit-memo" && "Exit Memo"}
        </div>
        <h2 className="mt-1 text-[20px] font-medium text-[#2C2C2A]">
          {scopeLabel} — {period}
        </h2>
      </div>

      {/* Narrative */}
      <div className="mt-5 space-y-3 text-[12px] leading-relaxed text-[#3A3A37]">
        <p>
          Dear Limited Partners, we are pleased to share the {period} update for{" "}
          <span className={ph}>{scopeLabel}</span>. During the period the portfolio delivered a
          gross IRR of <span className={ph}>[24.3%]</span> and a net MOIC of{" "}
          <span className={ph}>[2.1x]</span>, supported by continued revenue momentum across the
          core holdings and disciplined cost management at the operating level.
        </p>
        <p>
          Aggregate portfolio revenue grew <span className={ph}>[+12.4%]</span> year-on-year to{" "}
          <span className={ph}>[€248.6m]</span>, with blended EBITDA margins expanding to{" "}
          <span className={ph}>[22.8%]</span>. <span className={ph}>[3 of 8]</span> companies are
          tracking ahead of budget, and we expect <span className={ph}>[2]</span> realisations to
          complete within the next twelve months.
        </p>
      </div>

      {/* Performance table */}
      {options.financialTables && (
        <div className="mt-6">
          <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B6963]">
            Performance summary
          </div>
          <table className="mt-2 w-full text-[11px]">
            <thead>
              <tr className="border-b border-[#E8E6E0] text-left text-[#6B6963]">
                <th className="py-1.5 font-medium">Metric</th>
                <th className="py-1.5 text-right font-medium">{period}</th>
                <th className="py-1.5 text-right font-medium">Prior</th>
                <th className="py-1.5 text-right font-medium">Δ</th>
              </tr>
            </thead>
            <tbody className="tabular-nums text-[#2C2C2A]">
              {[
                ["Revenue (€m)", "248.6", "221.2", "+12.4%"],
                ["EBITDA (€m)", "56.7", "48.9", "+15.9%"],
                ["EBITDA margin", "22.8%", "22.1%", "+0.7pp"],
                ["Net debt (€m)", "112.4", "118.0", "-4.7%"],
                ["Net MOIC", "2.1x", "1.9x", "+0.2x"],
              ].map((row) => (
                <tr key={row[0]} className="border-b border-[#F2F0EB]">
                  <td className="py-1.5">{row[0]}</td>
                  <td className="py-1.5 text-right">{row[1]}</td>
                  <td className="py-1.5 text-right text-[#6B6963]">{row[2]}</td>
                  <td className="py-1.5 text-right text-[#3B6D11]">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {options.kpiSummary && (
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            ["Gross IRR", "24.3%"],
            ["Net MOIC", "2.1x"],
            ["DPI", "0.6x"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-[#E8E6E0] px-3 py-2">
              <div className="text-[10px] text-[#6B6963]">{label}</div>
              <div className="text-[15px] font-medium tabular-nums text-[#2C2C2A]">{value}</div>
            </div>
          ))}
        </div>
      )}

      {options.commentary && (
        <div className="mt-6">
          <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B6963]">
            Management commentary
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-[#3A3A37]">
            Management remains focused on margin expansion and selective bolt-on M&A. Trading in the
            current quarter is in line with the latest estimate, with pipeline conversion at{" "}
            <span className={ph}>[68%]</span>.
          </p>
        </div>
      )}

      {options.covenantStatus && (
        <div className="mt-6 flex items-center justify-between rounded-lg bg-[#EAF3DE] px-3 py-2">
          <span className="text-[11px] font-medium text-[#3B6D11]">Covenant status</span>
          <span className="text-[11px] text-[#3B6D11]">All covenants in compliance · headroom [18%]</span>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 border-t border-[#E8E6E0] pt-4 text-[10px] text-[#A8A49C]">
        <div className="flex items-center justify-between">
          <span>Alma Capital · Strictly private &amp; confidential</span>
          <span>Page 1 of 1</span>
        </div>
        {options.sourceReferences && (
          <p className="mt-1.5">
            Sources: Monthly reports (M01–M04 2026), Valuation models (FY2026), IC memos.
          </p>
        )}
      </div>
    </div>
  )
}
