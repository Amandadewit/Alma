"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { StatusDot, StatusBadge } from "@/components/status-dot"
import type { Company, Priority, StatusType } from "@/lib/mock-data"
import { recentChanges } from "@/lib/mock-data"

interface ValueCreationTabProps {
  company: Company
}

const categories = [
  { id: "operations", label: "Operations" },
  { id: "go-to-market", label: "Go to market" },
  { id: "talent", label: "Talent" },
  { id: "other", label: "Other" },
] as const

export function ValueCreationTab({ company }: ValueCreationTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedPeriod, setSelectedPeriod] = useState("May 2025")
  const [formMode, setFormMode] = useState<"Add" | "Edit" | "Delete">("Add")
  const [newPriorityText, setNewPriorityText] = useState("")
  const [newPriorityStatus, setNewPriorityStatus] = useState<StatusType>("on-track")
  const [newPriorityCategory, setNewPriorityCategory] = useState("go-to-market")

  // Count priorities by status
  const statusCounts = {
    "on-track": company.priorities.filter((p) => p.status === "on-track").length,
    watch: company.priorities.filter((p) => p.status === "watch").length,
    alert: company.priorities.filter((p) => p.status === "alert").length,
  }

  // Group priorities by category
  const prioritiesByCategory = categories.map((cat) => ({
    ...cat,
    priorities: company.priorities.filter((p) => p.category === cat.id),
  }))

  return (
    <div className="flex flex-col gap-3.5">
      {/* Summary Bar */}
      <div className="flex items-center gap-5 rounded-[10px] border border-[#E8E6E0] bg-white px-4 py-3">
        <div className="text-xs text-[#6B6963]">
          Total priorities: <span className="font-medium text-[#2C2C2A]">{company.priorities.length}</span>
        </div>
        <StatusBadge status="on-track" count={statusCounts["on-track"]} label="on track" />
        <StatusBadge status="watch" count={statusCounts.watch} label="watch" />
        <StatusBadge status="alert" count={statusCounts.alert} label="alert" />
        <div className="flex-1" />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-md border border-[#E8E6E0] bg-white px-2.5 py-1.5 text-[11px] text-[#2C2C2A]"
        >
          <option value="all">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="rounded-md border border-[#E8E6E0] bg-white px-2.5 py-1.5 text-[11px] text-[#2C2C2A]"
        >
          <option>May 2025</option>
          <option>Apr 2025</option>
          <option>Mar 2025</option>
        </select>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-3.5">
        {/* Categories List */}
        <div className="flex flex-col gap-2.5">
          {prioritiesByCategory
            .filter((cat) => selectedCategory === "all" || cat.id === selectedCategory)
            .map((category) => (
              <div key={category.id} className="overflow-hidden rounded-[10px] border border-[#E8E6E0] bg-white">
                <div className="flex items-center justify-between px-4 py-3">
                  <h3 className="text-[13px] font-medium text-[#2C2C2A]">{category.label}</h3>
                  <span className="rounded-full bg-[#F7F6F3] px-2 py-0.5 text-[11px] text-[#6B6963]">
                    {category.priorities.length} items
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 px-3 pb-3">
                  {category.priorities.length > 0 ? (
                    category.priorities.map((priority) => (
                      <div
                        key={priority.id}
                        className="group flex items-center gap-2.5 rounded-lg bg-[#F7F6F3] px-3 py-2.5"
                      >
                        <StatusDot status={priority.status} size="lg" />
                        <span className="flex-1 text-xs leading-relaxed text-[#2C2C2A]">
                          {priority.text}
                        </span>
                        <span className="shrink-0 text-[10px] text-[#6B6963]">{priority.period}</span>
                        <button className="text-[11px] text-[#6B6963] opacity-0 transition-opacity hover:text-[#2C2C2A] group-hover:opacity-100">
                          edit
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-xs italic text-[#E8E6E0]">
                      No priorities in this category
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* Right Panel */}
        <div className="flex flex-col gap-3">
          {/* Add Priority Form */}
          <div className="rounded-[10px] border border-[#E8E6E0] bg-white p-4">
            <h3 className="mb-3.5 text-[13px] font-medium text-[#2C2C2A]">Add priority</h3>

            {/* Mode Buttons */}
            <div className="mb-4 flex gap-1.5">
              {(["Add", "Edit", "Delete"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFormMode(mode)}
                  className={cn(
                    "rounded-md border px-3.5 py-1.5 text-[11px] transition-colors",
                    formMode === mode
                      ? "border-[#1B4D45] bg-[#1B4D45] text-white"
                      : "border-[#E8E6E0] bg-white text-[#6B6963] hover:text-[#2C2C2A]"
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Step 1 */}
            <div className="mb-3.5">
              <div className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-[#1B4D45]">Step 1</div>
              <div className="mb-1.5 text-[11px] text-[#6B6963]">Select period and category</div>
              <div className="flex gap-2">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="flex-1 rounded-md border border-[#E8E6E0] bg-white px-2.5 py-2 text-xs text-[#2C2C2A]"
                >
                  <option>May 2025</option>
                  <option>Apr 2025</option>
                </select>
                <select
                  value={newPriorityCategory}
                  onChange={(e) => setNewPriorityCategory(e.target.value)}
                  className="flex-1 rounded-md border border-[#E8E6E0] bg-white px-2.5 py-2 text-xs text-[#2C2C2A]"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 2 */}
            <div className="mb-3.5">
              <div className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-[#1B4D45]">Step 2</div>
              <div className="mb-1.5 text-[11px] text-[#6B6963]">Type the priority</div>
              <input
                type="text"
                value={newPriorityText}
                onChange={(e) => setNewPriorityText(e.target.value)}
                placeholder="Describe the priority..."
                className="w-full rounded-md border border-[#E8E6E0] bg-white px-2.5 py-2 text-xs text-[#2C2C2A] placeholder:text-[#6B6963]"
              />
            </div>

            {/* Step 3 */}
            <div className="mb-4">
              <div className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-[#1B4D45]">Step 3</div>
              <div className="mb-1.5 text-[11px] text-[#6B6963]">Select status</div>
              <select
                value={newPriorityStatus}
                onChange={(e) => setNewPriorityStatus(e.target.value as StatusType)}
                className="w-full rounded-md border border-[#E8E6E0] bg-white px-2.5 py-2 text-xs text-[#2C2C2A]"
              >
                <option value="on-track">On track</option>
                <option value="watch">Watch</option>
                <option value="alert">Alert</option>
              </select>
            </div>

            <button className="w-full rounded-md bg-[#1B4D45] py-2 text-xs font-medium text-white hover:bg-[#163d38]">
              Submit priority
            </button>
          </div>

          {/* Recent Changes */}
          <div className="rounded-[10px] border border-[#E8E6E0] bg-white p-4">
            <h4 className="mb-2.5 text-xs font-medium text-[#2C2C2A]">Recent changes</h4>
            <div className="flex flex-col">
              {recentChanges.map((change) => (
                <div
                  key={change.id}
                  className="flex gap-2 border-b border-[#E8E6E0] py-1.5 last:border-b-0"
                >
                  <StatusDot
                    status={change.toStatus as StatusType}
                    size="sm"
                    className="mt-1.5 shrink-0"
                  />
                  <div className="text-[11px] leading-relaxed text-[#6B6963]">
                    <span className="font-medium text-[#2C2C2A]">{change.priority}</span>{" "}
                    {change.fromStatus ? (
                      <>
                        changed from {change.fromStatus.replace("-", " ")} → {change.toStatus.replace("-", " ")}
                      </>
                    ) : (
                      <>added</>
                    )}{" "}
                    by {change.user}, {change.timeAgo}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
