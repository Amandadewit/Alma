"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { funds, companies } from "@/lib/mock-data"
import { Download, FileSpreadsheet, FileText, FileType, Settings2 } from "lucide-react"

export default function ExportPage() {
  const [selectedFund, setSelectedFund] = useState(funds[0])
  const [exportFormat, setExportFormat] = useState<"excel" | "pdf" | "csv">("excel")
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [selectedSections, setSelectedSections] = useState<string[]>([
    "financials",
    "valuations",
    "kpis",
  ])

  const fundCompanies = companies.filter((c) => c.fundId === selectedFund.id)

  const sections = [
    { id: "financials", name: "Financial Performance", description: "Revenue, EBITDA, margins" },
    { id: "valuations", name: "Valuations", description: "Current and exit valuations" },
    { id: "kpis", name: "KPIs", description: "Operational metrics" },
    { id: "comments", name: "Deal Team Comments", description: "Latest commentary" },
    { id: "priorities", name: "Value Creation Priorities", description: "Status updates" },
    { id: "charts", name: "Charts & Visualizations", description: "Performance graphs" },
  ]

  const formats = [
    { id: "excel", name: "Excel", icon: FileSpreadsheet, description: "Full data with formatting" },
    { id: "pdf", name: "PDF", icon: FileText, description: "Formatted report" },
    { id: "csv", name: "CSV", icon: FileType, description: "Raw data export" },
  ]

  const toggleCompany = (id: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const toggleSection = (id: string) => {
    setSelectedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const selectAllCompanies = () => {
    setSelectedCompanies(fundCompanies.map((c) => c.id))
  }

  return (
    <div className="flex min-h-screen flex-col font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <div>
          <h1 className="text-xl font-medium text-ink">Export</h1>
          <p className="text-[13px] text-ink-2">Export portfolio data in various formats</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-line bg-white text-ink hover:bg-bg"
          >
            <Settings2 className="h-4 w-4" />
            Export Templates
          </Button>
        </div>
      </div>

      {/* Fund Tabs */}
      <div className="flex items-center gap-2 border-b border-line px-6 py-3">
        <span className="text-[13px] text-ink-2">Fund:</span>
        {funds.map((fund) => (
          <button
            key={fund.id}
            onClick={() => setSelectedFund(fund)}
            className={cn(
              "rounded-lg px-4 py-2 text-[13px] font-medium transition-colors",
              selectedFund.id === fund.id
                ? "bg-brand text-white"
                : "bg-bg text-ink-2 hover:bg-line"
            )}
          >
            {fund.shortName}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-1 gap-6 p-6">
        {/* Left Column - Selection */}
        <div className="flex-1 space-y-6">
          {/* Companies */}
          <div className="rounded-[10px] border border-line bg-white">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="text-[13px] font-medium text-ink">Select Companies</h2>
              <button
                onClick={selectAllCompanies}
                className="text-[11px] text-brand hover:underline"
              >
                Select all
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 p-4">
              {fundCompanies.map((company) => (
                <label
                  key={company.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                    selectedCompanies.includes(company.id)
                      ? "border-brand bg-brand-soft"
                      : "border-line hover:border-ai-soft"
                  )}
                >
                  <Checkbox
                    checked={selectedCompanies.includes(company.id)}
                    onCheckedChange={() => toggleCompany(company.id)}
                    className="border-line data-[state=checked]:border-brand data-[state=checked]:bg-brand"
                  />
                  <div>
                    <div className="text-[12px] font-medium text-ink">{company.name}</div>
                    <div className="text-[10px] text-ink-2">Entry: {company.entryDate}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="rounded-[10px] border border-line bg-white">
            <div className="border-b border-line px-4 py-3">
              <h2 className="text-[13px] font-medium text-ink">Select Data Sections</h2>
            </div>
            <div className="grid grid-cols-2 gap-2 p-4">
              {sections.map((section) => (
                <label
                  key={section.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                    selectedSections.includes(section.id)
                      ? "border-brand bg-brand-soft"
                      : "border-line hover:border-ai-soft"
                  )}
                >
                  <Checkbox
                    checked={selectedSections.includes(section.id)}
                    onCheckedChange={() => toggleSection(section.id)}
                    className="border-line data-[state=checked]:border-brand data-[state=checked]:bg-brand"
                  />
                  <div>
                    <div className="text-[12px] font-medium text-ink">{section.name}</div>
                    <div className="text-[10px] text-ink-2">{section.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Format & Export */}
        <div className="w-80 space-y-4">
          {/* Format Selection */}
          <div className="rounded-[10px] border border-line bg-white">
            <div className="border-b border-line px-4 py-3">
              <h2 className="text-[13px] font-medium text-ink">Export Format</h2>
            </div>
            <div className="space-y-2 p-3">
              {formats.map((format) => (
                <label
                  key={format.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                    exportFormat === format.id
                      ? "border-brand bg-brand-soft"
                      : "border-line hover:border-ai-soft"
                  )}
                >
                  <input
                    type="radio"
                    name="format"
                    value={format.id}
                    checked={exportFormat === format.id}
                    onChange={() => setExportFormat(format.id as typeof exportFormat)}
                    className="sr-only"
                  />
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    exportFormat === format.id ? "bg-brand" : "bg-bg"
                  )}>
                    <format.icon className={cn(
                      "h-4 w-4",
                      exportFormat === format.id ? "text-white" : "text-ink-2"
                    )} />
                  </div>
                  <div>
                    <div className="text-[12px] font-medium text-ink">{format.name}</div>
                    <div className="text-[10px] text-ink-2">{format.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Export Summary */}
          <div className="rounded-[10px] border border-line bg-white p-4">
            <h3 className="text-[13px] font-medium text-ink">Export Summary</h3>
            <div className="mt-3 space-y-2 text-[12px]">
              <div className="flex justify-between">
                <span className="text-ink-2">Fund</span>
                <span className="font-medium text-ink">{selectedFund.shortName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-2">Companies</span>
                <span className="font-medium text-ink">{selectedCompanies.length} selected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-2">Sections</span>
                <span className="font-medium text-ink">{selectedSections.length} selected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-2">Format</span>
                <span className="font-medium text-ink">{exportFormat.toUpperCase()}</span>
              </div>
            </div>
            
            <Button
              className="mt-4 w-full gap-2 bg-brand text-white hover:bg-action-hover"
              disabled={selectedCompanies.length === 0 || selectedSections.length === 0}
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>

          {/* Recent Exports */}
          <div className="rounded-[10px] border border-line bg-white">
            <div className="border-b border-line px-4 py-3">
              <h3 className="text-[13px] font-medium text-ink">Recent Exports</h3>
            </div>
            <div className="space-y-1 p-2">
              {[
                { name: "Fund_IV_Q1_2026.xlsx", date: "Today, 10:32" },
                { name: "MedTech_Analysis.pdf", date: "Yesterday" },
                { name: "Portfolio_Data.csv", date: "Apr 25, 2026" },
              ].map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-bg"
                >
                  <div>
                    <div className="text-[11px] font-medium text-ink">{file.name}</div>
                    <div className="text-[10px] text-ink-2">{file.date}</div>
                  </div>
                  <Download className="h-3.5 w-3.5 text-ink-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
