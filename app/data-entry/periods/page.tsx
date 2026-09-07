import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { PeriodsTable } from "@/components/key-data/periods-table"

export default function PeriodsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/data-entry/key-data"
            className="mb-3 inline-flex items-center gap-1 text-[13px] text-[#6B6963] transition-colors hover:text-[#2C2C2A]"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Key Data
          </Link>
          <h1 className="text-xl font-medium text-[#2C2C2A]">Reporting Periods</h1>
          <p className="text-[13px] text-[#6B6963]">
            Close monthly and quarterly periods to lock reported figures, while keeping the valuation adjustable
          </p>
        </div>

        {/* Periods */}
        <PeriodsTable />
      </div>
    </div>
  )
}
