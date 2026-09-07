"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { StatusDot } from "@/components/status-dot"
import { PerformanceTab } from "@/components/portfolio/performance-tab"
import { StrategyTab } from "@/components/portfolio/strategy-tab"
import { ValueCreationTab } from "@/components/portfolio/value-creation-tab"
import { companies } from "@/lib/mock-data"

type TabType = "performance" | "strategy" | "value-creation"

function PortfolioDashboard() {
  const searchParams = useSearchParams()
  // Portfolio-company CFOs open this dashboard from the Portfolio Portal with
  // ?view=cfo. In that scoped view they may only see Performance — Strategy and
  // Value creation stay internal to the fund team.
  const isCfoView = searchParams.get("view") === "cfo"

  const [selectedCompanyId, setSelectedCompanyId] = useState(companies[1].id) // Default to Sure Operations
  const [activeTab, setActiveTab] = useState<TabType>("performance")

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId) || companies[1]

  const tabs = [
    { id: "performance" as TabType, label: "Performance" },
    { id: "strategy" as TabType, label: "Strategy" },
    { id: "value-creation" as TabType, label: "Value creation" },
  ].filter((tab) => !isCfoView || tab.id === "performance")

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF9]">
      {/* Header */}
      <div className="border-b border-[#E8E6E0] bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium text-[#2C2C2A]">Portfolio Performance</h1>
            <p className="text-[13px] text-[#6B6963]">Company-level performance analysis</p>
          </div>
        </div>
      </div>

      {/* Company Selector & Tabs */}
      <div className="flex items-center justify-between border-b border-[#E8E6E0] bg-white px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1B4D45]">
              <span className="text-[11px] font-semibold text-white">
                {selectedCompany.name.charAt(0)}
              </span>
            </div>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="rounded-lg border border-[#E8E6E0] bg-white px-3 py-2 text-[13px] font-medium text-[#2C2C2A] focus:border-[#1B4D45] focus:outline-none"
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-[#F7F6F3] px-3 py-1.5">
            <StatusDot status={selectedCompany.status} size="lg" />
            <span className="text-[11px] font-medium text-[#6B6963]">
              {selectedCompany.status === "on-track"
                ? "On track"
                : selectedCompany.status === "watch"
                ? "Watch"
                : "Alert"}
            </span>
          </div>
        </div>

        {/* Tabs — hidden in the CFO-scoped view where only Performance is available */}
        <div className={cn("flex gap-1 rounded-lg bg-[#F7F6F3] p-1", isCfoView && "hidden")}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-md px-4 py-2 text-[12px] font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-white text-[#2C2C2A] shadow-sm"
                  : "text-[#6B6963] hover:text-[#2C2C2A]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-6">
        {activeTab === "performance" && <PerformanceTab company={selectedCompany} />}
        {!isCfoView && activeTab === "strategy" && <StrategyTab company={selectedCompany} />}
        {!isCfoView && activeTab === "value-creation" && <ValueCreationTab company={selectedCompany} />}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[#E8E6E0] bg-white px-6 py-2 text-[10px] text-[#6B6963]">
        <span>Last refresh: 27/04/2026</span>
        <span>Most recent actuals are as of 03-2026</span>
      </div>
    </div>
  )
}

export default function PortfolioPage() {
  return (
    <Suspense fallback={null}>
      <PortfolioDashboard />
    </Suspense>
  )
}
