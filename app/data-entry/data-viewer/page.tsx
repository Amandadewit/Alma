"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { companies } from "@/lib/mock-data"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

// Generate mock metrics data
const generateMetricsData = () => {
  const metricTypes = [
    { code: "1000000", name: "Revenue (Total)" },
    { code: "1001020", name: "Revenue Line 1" },
    { code: "1010000", name: "Cost of Goods Sold (COGS)" },
    { code: "1011030", name: "Other Direct Costs" },
    { code: "1100000", name: "Gross Profit" },
    { code: "1100010", name: "Gross Profit Margin %" },
    { code: "1150000", name: "Contribution Margin" },
    { code: "1150010", name: "Contribution Margin %" },
    { code: "1200000", name: "Operating Expenses" },
    { code: "1250000", name: "EBITDA" },
    { code: "1250010", name: "EBITDA Margin %" },
    { code: "1300000", name: "Depreciation" },
    { code: "1350000", name: "EBIT" },
    { code: "1400000", name: "Interest Expense" },
    { code: "1450000", name: "Net Income" },
    { code: "2000000", name: "Total Assets" },
    { code: "2100000", name: "Current Assets" },
    { code: "2200000", name: "Fixed Assets" },
    { code: "3000000", name: "Total Liabilities" },
    { code: "3100000", name: "Current Liabilities" },
    { code: "3200000", name: "Long-term Debt" },
    { code: "4000000", name: "Net Debt" },
    { code: "5000000", name: "Free Cash Flow" },
    { code: "5100000", name: "Operating Cash Flow" },
  ]

  const dimensions = ["Actual", "Budget", "Forecast", "LY"]
  const data: Array<{
    id: string
    company: string
    code: string
    metric: string
    periodStart: string
    periodEnd: string
    dimension: string
    value: number
    currency: string
    version: number
  }> = []

  let id = 1
  companies.forEach((company) => {
    metricTypes.forEach((metric) => {
      dimensions.forEach((dimension) => {
        // Generate for multiple periods
        for (let year = 2021; year <= 2025; year++) {
          for (let month = 1; month <= 12; month++) {
            const startDate = new Date(year, month - 1, 1)
            const endDate = new Date(year, month, 0)
            
            data.push({
              id: `${id++}`,
              company: company.name,
              code: metric.code,
              metric: metric.name,
              periodStart: startDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
              periodEnd: endDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
              dimension,
              value: Math.random() * 1000,
              currency: "EUR",
              version: 1,
            })
          }
        }
      })
    })
  })

  return data
}

const allMetricsData = generateMetricsData()

export default function DataViewerPage() {
  const [selectedCompany, setSelectedCompany] = useState(companies[0].name)
  const [selectedYear, setSelectedYear] = useState("All years")
  const [selectedPeriod, setSelectedPeriod] = useState("All periods")
  const [selectedDimension, setSelectedDimension] = useState("Actual")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 50

  // Filter data
  const filteredData = useMemo(() => {
    return allMetricsData.filter((row) => {
      if (selectedCompany !== "All companies" && row.company !== selectedCompany) return false
      if (selectedYear !== "All years" && !row.periodStart.includes(selectedYear)) return false
      if (selectedDimension !== "All" && row.dimension !== selectedDimension) return false
      if (searchQuery && !row.metric.toLowerCase().includes(searchQuery.toLowerCase()) && !row.code.includes(searchQuery)) return false
      return true
    })
  }, [selectedCompany, selectedYear, selectedDimension, searchQuery])

  const totalPages = Math.ceil(filteredData.length / rowsPerPage)
  const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  const years = ["All years", "2025", "2024", "2023", "2022", "2021"]
  const periods = ["All periods", "Q1", "Q2", "Q3", "Q4"]
  const dimensions = ["All", "Actual", "Budget", "Forecast", "LY"]

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F6F3] font-sans">
      {/* Header */}
      <div className="border-b border-[#E8E6E0] bg-white px-6 py-5">
        <h1 className="text-2xl font-medium text-[#2C2C2A]">Metrics</h1>
        <p className="text-[13px] text-[#6B6963]">Raw metric data</p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="rounded-[10px] border border-[#E8E6E0] bg-white">
          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-4 border-b border-[#E8E6E0] px-4 py-4">
            {/* Company Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-[#6B6963]">Company</label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="h-9 w-44 border-[#E8E6E0] bg-white text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All companies">All companies</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-[#6B6963]">Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="h-9 w-28 border-[#E8E6E0] bg-white text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Period Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-[#6B6963]">Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="h-9 w-28 border-[#E8E6E0] bg-white text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dimension Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-[#6B6963]">Dimension</label>
              <Select value={selectedDimension} onValueChange={setSelectedDimension}>
                <SelectTrigger className="h-9 w-28 border-[#E8E6E0] bg-white text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dimensions.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-[#6B6963]">Metric code / name</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6963]" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-44 border-[#E8E6E0] pl-9 text-[12px] placeholder:text-[#6B6963]"
                />
              </div>
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between border-b border-[#E8E6E0] px-4 py-3">
            <div>
              <span className="text-[13px] font-medium text-[#2C2C2A]">Results</span>
              <span className="ml-2 text-[12px] text-[#6B6963]">{filteredData.length.toLocaleString()} rows</span>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-[#6B6963]">
              <span>Page {currentPage} of {totalPages}</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 border-[#E8E6E0]"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-3 border-[#E8E6E0] text-[12px]"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-[#E8E6E0] bg-[#F7F6F3]">
                  <th className="px-4 py-2.5 text-left font-medium text-[#6B6963]">Company</th>
                  <th className="px-4 py-2.5 text-left font-medium text-[#6B6963]">Code</th>
                  <th className="px-4 py-2.5 text-left font-medium text-[#6B6963]">Metric</th>
                  <th className="px-4 py-2.5 text-left font-medium text-[#6B6963]">Period start</th>
                  <th className="px-4 py-2.5 text-left font-medium text-[#6B6963]">Period end</th>
                  <th className="px-4 py-2.5 text-left font-medium text-[#6B6963]">Dimension</th>
                  <th className="px-4 py-2.5 text-right font-medium text-[#6B6963]">Value</th>
                  <th className="px-4 py-2.5 text-center font-medium text-[#6B6963]">Cur.</th>
                  <th className="px-4 py-2.5 text-center font-medium text-[#6B6963]">Ver.</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row) => (
                  <tr key={row.id} className="border-b border-[#E8E6E0] hover:bg-[#FAFAF7]">
                    <td className="px-4 py-2.5 text-[#2C2C2A]">{row.company}</td>
                    <td className="px-4 py-2.5 tabular-nums text-[#6B6963]">{row.code}</td>
                    <td className="px-4 py-2.5 text-[#2C2C2A]">{row.metric}</td>
                    <td className="px-4 py-2.5 text-[#6B6963]">{row.periodStart}</td>
                    <td className="px-4 py-2.5 text-[#6B6963]">{row.periodEnd}</td>
                    <td className="px-4 py-2.5 text-[#6B6963]">{row.dimension}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-medium text-[#B8975A]">
                      {row.value.toFixed(1)}
                    </td>
                    <td className="px-4 py-2.5 text-center text-[#6B6963]">{row.currency}</td>
                    <td className="px-4 py-2.5 text-center text-[#6B6963]">{row.version}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-[#E8E6E0] px-4 py-3">
            <span className="text-[11px] text-[#6B6963]">
              Showing {((currentPage - 1) * rowsPerPage) + 1} - {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length.toLocaleString()} results
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 border-[#E8E6E0] text-[11px]"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 border-[#E8E6E0] text-[11px]"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
