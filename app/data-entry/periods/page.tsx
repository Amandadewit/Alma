import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { PeriodsTable } from "@/components/key-data/periods-table"

export default function PeriodsPage() {
  return (
    <div className="min-h-screen bg-surface-2">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/data-entry/key-data"
            className="mb-3 inline-flex items-center gap-1 text-[13px] text-ink-2 transition-colors hover:text-ink"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Key Data
          </Link>
          <h1 className="text-xl font-medium text-ink">Reporting Periods</h1>
          <p className="text-[13px] text-ink-2">
            Close monthly and quarterly periods to lock reported figures, while keeping the valuation adjustable
          </p>
        </div>

        {/* Periods */}
        <PeriodsTable />
      </div>
    </div>
  )
}
