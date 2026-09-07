"use client"

import { Fragment, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarDays, Check, ChevronLeft, ChevronRight, Lock, LockOpen, Pencil } from "lucide-react"

type PeriodType = "month" | "quarter"
type Temporal = "past" | "current" | "future"

interface Period {
  id: string
  label: string
  range: string
  year: number
  index: number
  temporal: Temporal
  // A period is either open (fully editable) or closed (reported figures locked).
  closed: boolean
  closedBy?: string
  closedOn?: string
  // Valuation is the one layer that stays adjustable after a period closes,
  // until it is explicitly marked final.
  valuationFinal: boolean
}

// "Now" anchor — before this is settled history, this is the live period, after is upcoming.
const TODAY = new Date(2026, 7, 24) // 24 Aug 2026
const TODAY_LABEL = "24 Aug 2026"
const CURRENT_YEAR = 2026
// Reporting horizon runs from the first tracked year out to 2035.
const START_YEAR = 2024
const END_YEAR = 2035
const YEARS = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i)
const CURRENT_USER = "Sanne Bakker"
const CLOSERS = ["Sanne Bakker", "Tom Jansen", "Eva de Vries"]

const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function fmt(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function classify(start: Date, end: Date): Temporal {
  if (TODAY >= start && TODAY <= end) return "current"
  if (end < TODAY) return "past"
  return "future"
}

function buildPeriods(kind: PeriodType): Period[] {
  const out: Period[] = []
  YEARS.forEach((y) => {
    const count = kind === "month" ? 12 : 4
    for (let i = 0; i < count; i++) {
      const startMonth = kind === "month" ? i : i * 3
      const endMonth = kind === "month" ? i : i * 3 + 2
      const start = new Date(y, startMonth, 1)
      const end = new Date(y, endMonth + 1, 0)
      const temporal = classify(start, end)
      // Past periods are closed; the valuation of settled history is final too.
      // The live period and the future stay open.
      const closed = temporal === "past"
      out.push({
        id: `${kind}-${y}-${i}`,
        label: kind === "month" ? `${MONTHS_LONG[i]} ${y}` : `Q${i + 1} ${y}`,
        range:
          kind === "month"
            ? `1 – ${end.getDate()} ${MONTHS_SHORT[i]} ${y}`
            : `1 ${MONTHS_SHORT[startMonth]} – ${end.getDate()} ${MONTHS_SHORT[endMonth]} ${y}`,
        year: y,
        index: i,
        temporal,
        closed,
        closedBy: closed ? CLOSERS[(i + y) % CLOSERS.length] : undefined,
        closedOn: closed ? fmt(new Date(y, endMonth + 1, 12)) : undefined,
        valuationFinal: closed,
      })
    }
  })
  return out
}

type YearState = "complete" | "in-progress" | "open"

export function PeriodsTable() {
  const [type, setType] = useState<PeriodType>("quarter")
  const [months, setMonths] = useState<Period[]>(() => buildPeriods("month"))
  const [quarters, setQuarters] = useState<Period[]>(() => buildPeriods("quarter"))
  const [pending, setPending] = useState<Period | null>(null)
  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR)

  const periods = type === "month" ? months : quarters
  const setPeriods = type === "month" ? setMonths : setQuarters

  // Per-year status drives the compact selector, so the whole 2024–2035 horizon
  // is legible at a glance without rendering every period.
  const yearSummary = useMemo(() => {
    const map = new Map<number, { total: number; closed: number; state: YearState; hasCurrent: boolean }>()
    YEARS.forEach((year) => {
      const items = periods.filter((p) => p.year === year)
      const closed = items.filter((p) => p.closed).length
      const state: YearState = closed === items.length ? "complete" : closed > 0 ? "in-progress" : "open"
      map.set(year, { total: items.length, closed, state, hasCurrent: items.some((p) => p.temporal === "current") })
    })
    return map
  }, [periods])

  const visiblePeriods = useMemo(
    () => periods.filter((p) => p.year === selectedYear),
    [periods, selectedYear],
  )

  const totalClosed = useMemo(() => periods.filter((p) => p.closed).length, [periods])

  const yearIdx = YEARS.indexOf(selectedYear)
  const gotoYear = (dir: -1 | 1) => {
    const next = YEARS[yearIdx + dir]
    if (next !== undefined) setSelectedYear(next)
  }

  const reopenPeriod = (p: Period) =>
    setPeriods((prev) =>
      prev.map((x) =>
        x.id === p.id ? { ...x, closed: false, closedBy: undefined, closedOn: undefined, valuationFinal: false } : x,
      ),
    )

  const confirmClose = () => {
    if (!pending) return
    setPeriods((prev) =>
      prev.map((x) =>
        x.id === pending.id ? { ...x, closed: true, closedBy: CURRENT_USER, closedOn: fmt(new Date()) } : x,
      ),
    )
    setPending(null)
  }

  const toggleValuation = (p: Period) =>
    setPeriods((prev) => prev.map((x) => (x.id === p.id ? { ...x, valuationFinal: !x.valuationFinal } : x)))

  return (
    <Card className="border-[#E5E4E0]">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-medium text-[#2C2C2A]">
              <CalendarDays className="h-4 w-4 text-[#1B4D45]" />
              Reporting periods
            </CardTitle>
            <p className="mt-1 text-[13px] text-[#6B6963]">
              Closing a period locks all reported figures. The valuation stays adjustable until you mark it final.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-[#6B6963]">
              <span className="font-medium text-[#2C2C2A]">{totalClosed}</span> of {periods.length} closed
            </span>
            <div className="inline-flex rounded-lg border border-[#E5E4E0] bg-[#F5F5F3] p-0.5">
              {(["month", "quarter"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`rounded-md px-3 py-1 text-[12px] font-medium transition-colors ${
                    type === t ? "bg-white text-[#2C2C2A] shadow-sm" : "text-[#6B6963] hover:text-[#2C2C2A]"
                  }`}
                >
                  {t === "month" ? "Months" : "Quarters"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Year selector — the full 2024–2035 horizon in one compact strip */}
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => gotoYear(-1)}
            disabled={yearIdx === 0}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#E5E4E0] text-[#6B6963] transition-colors hover:bg-[#F5F5F3] disabled:opacity-40 disabled:hover:bg-transparent"
            aria-label="Previous year"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex flex-1 gap-1.5 overflow-x-auto pb-1">
            {YEARS.map((year) => {
              const s = yearSummary.get(year)!
              const active = year === selectedYear
              const dot =
                s.state === "complete"
                  ? "bg-[#1B4D45]"
                  : s.state === "in-progress"
                    ? "bg-[#B8975A]"
                    : "bg-[#C9C7C0]"
              return (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-[12px] font-medium transition-colors ${
                    active
                      ? "border-[#1B4D45] bg-[#1B4D45] text-white"
                      : "border-[#E5E4E0] bg-white text-[#2C2C2A] hover:bg-[#F5F5F3]"
                  }`}
                  title={`${s.closed} of ${s.total} closed`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-white/80" : dot}`} />
                  {year}
                  {s.hasCurrent && (
                    <span
                      className={`h-1 w-1 rounded-full ${active ? "bg-[#B8975A]" : "bg-[#B8975A]"}`}
                      aria-hidden
                    />
                  )}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => gotoYear(1)}
            disabled={yearIdx === YEARS.length - 1}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#E5E4E0] text-[#6B6963] transition-colors hover:bg-[#F5F5F3] disabled:opacity-40 disabled:hover:bg-transparent"
            aria-label="Next year"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        {/* Legend */}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#6B6963]">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1B4D45]" /> All closed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#B8975A]" /> In progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C9C7C0]" /> Not started
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-y border-[#E5E4E0] bg-[#F5F5F3]">
              <TableHead className="text-[11px] font-medium text-[#6B6963]">Period</TableHead>
              <TableHead className="text-[11px] font-medium text-[#6B6963]">Date range</TableHead>
              <TableHead className="text-[11px] font-medium text-[#6B6963]">Status</TableHead>
              <TableHead className="text-[11px] font-medium text-[#6B6963]">Valuation</TableHead>
              <TableHead className="text-right text-[11px] font-medium text-[#6B6963]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visiblePeriods.map((p) => (
              <Fragment key={p.id}>
                {/* Today boundary sits at the start of the live period */}
                {p.temporal === "current" && (
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableCell colSpan={5} className="py-0">
                      <div className="flex items-center gap-2 py-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#1B4D45]" />
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-[#1B4D45]">
                          Today · {TODAY_LABEL}
                        </span>
                        <span className="h-px flex-1 bg-[#1B4D45]/20" />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                <TableRow
                  className={`border-b border-[#E5E4E0] ${
                    p.temporal === "current" ? "bg-[#1B4D45]/[0.04]" : "hover:bg-[#FAFAF8]"
                  }`}
                >
                  {/* Period */}
                  <TableCell className="text-sm font-medium text-[#2C2C2A]">
                    <span className="flex items-center gap-2">
                      {p.temporal === "current" && <span className="h-4 w-0.5 rounded bg-[#1B4D45]" />}
                      {p.label}
                      {p.temporal === "current" && (
                        <span className="rounded-full bg-[#B8975A]/15 px-2 py-0.5 text-[10px] font-medium text-[#8A6D2F]">
                          Current
                        </span>
                      )}
                    </span>
                  </TableCell>

                  {/* Date range */}
                  <TableCell className="whitespace-nowrap text-sm text-[#6B6963]">{p.range}</TableCell>

                  {/* Status */}
                  <TableCell>
                    {p.closed ? (
                      <span
                        className="inline-flex h-6 items-center gap-1 rounded-full bg-[#1B4D45]/10 px-2 text-[11px] font-medium text-[#1B4D45]"
                        title={`Closed${p.closedBy ? ` by ${p.closedBy}` : ""}${p.closedOn ? ` on ${p.closedOn}` : ""}`}
                      >
                        <Lock className="h-3 w-3" />
                        Closed
                      </span>
                    ) : (
                      <span className="inline-flex h-6 items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 text-[11px] font-medium text-amber-700">
                        <LockOpen className="h-3 w-3" />
                        Open
                      </span>
                    )}
                  </TableCell>

                  {/* Valuation */}
                  <TableCell>
                    {!p.closed ? (
                      <span className="text-[12px] text-[#B0AEA6]" title="Valuation edits happen while the period is open">
                        —
                      </span>
                    ) : p.valuationFinal ? (
                      <button
                        onClick={() => toggleValuation(p)}
                        title="Valuation is final · click to reopen for adjustments"
                        className="inline-flex h-6 items-center gap-1 rounded-full bg-[#1B4D45]/10 px-2 text-[11px] font-medium text-[#1B4D45] transition-colors hover:bg-[#1B4D45]/20"
                      >
                        <Check className="h-3 w-3" />
                        Final
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleValuation(p)}
                        title="Valuation still adjustable · click to mark final"
                        className="inline-flex h-6 items-center gap-1 rounded-full border border-[#B8975A]/40 bg-[#B8975A]/10 px-2 text-[11px] font-medium text-[#8A6D2F] transition-colors hover:bg-[#B8975A]/20"
                      >
                        <Pencil className="h-3 w-3" />
                        Adjustable
                      </button>
                    )}
                  </TableCell>

                  {/* Action */}
                  <TableCell className="text-right">
                    {p.closed ? (
                      <button
                        onClick={() => reopenPeriod(p)}
                        className="text-[12px] font-medium text-[#6B6963] underline-offset-2 transition-colors hover:text-[#2C2C2A] hover:underline"
                      >
                        Reopen period
                      </button>
                    ) : (
                      <button
                        onClick={() => setPending(p)}
                        className="inline-flex h-7 items-center gap-1.5 rounded-md bg-[#1B4D45] px-3 text-[12px] font-medium text-white transition-colors hover:bg-[#163d38]"
                      >
                        <Lock className="h-3 w-3" />
                        Close period
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <AlertDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close {pending?.label}?</AlertDialogTitle>
            <AlertDialogDescription>
              This locks all reported figures for {pending?.label}. The valuation stays adjustable — you can mark it
              final separately, and you can reopen the period later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClose} className="bg-[#1B4D45] hover:bg-[#163d38]">
              Close period
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
