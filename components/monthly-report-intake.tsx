"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, CheckCircle2, AlertCircle, FileSpreadsheet, Loader2, Check, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { saveImportedComment } from "@/lib/imported-comments"
import {
  CASES, MONTHS, CURRENT, SECTION_LABEL, buildCase, num, fmtAmt,
  type IntakeRow, type Section, type Decision,
} from "@/lib/monthly-report-intake-data"

type Outcome = "Pass" | "Expected" | "Warning" | "Blocking"
type Tab = "selection" | "checks" | "historical" | "comments" | "save"

const OUT_CLS: Record<Outcome, string> = {
  Pass: "bg-brand-soft text-ok",
  Expected: "bg-line text-data-3",
  Warning: "bg-watch-soft text-watch",
  Blocking: "bg-alert-soft text-alert",
}

interface Signal {
  id: string
  test: string
  found: string
  outcome: Outcome
  note: string
  code?: number
  action?: "note" | "request" | "historical"
}

const KEY_LINES = [1000000, 1100000, 1300000, 1300300, 1600000]

function Pill({ outcome, children }: { outcome: Outcome; children: React.ReactNode }) {
  return <span className={cn("inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-semibold", OUT_CLS[outcome])}>{children}</span>
}

function SectionRows({ s, span, children }: { s: Section; span: number; children: React.ReactNode }) {
  return (
    <>
      <tr>
        <td colSpan={span} className="sticky left-0 border-b border-t border-line bg-surface-2 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand">{SECTION_LABEL[s]}</td>
      </tr>
      {children}
    </>
  )
}

interface IntakeProps {
  caseId: "A" | "B"
  onBack?: () => void
  backLabel?: string
  /** Opens an already submitted and imported upload: everything is confirmed and read-only. */
  readOnly?: boolean
  /** Shown in the header for a read-only upload, e.g. "Submitted by … on …". */
  submittedLabel?: string
}

export function MonthlyReportIntake({ caseId, onBack, backLabel = "Back to Upload Data", readOnly = false, submittedLabel }: IntakeProps) {
  const D = useMemo(() => buildCase(CASES[caseId]), [caseId])
  const { raw, ROWS, ROW_BY_CODE, LTM_ROWS, NORM_ROWS, CHANGED_MONTHS, isPct, isStoredRow, isUnmapped, isFlow, hasData, cellRef, stored, recalc, almaAt, diffAt, ytdAfter, ltmAfter, balanceDiff, fmtVal } = D
  const FILE_NAME = raw.fileName, COMPANY = raw.company, PERIOD = raw.period

  const [sheet, setSheet] = useState<string>(raw.tabs[0].name)
  const [filter, setFilter] = useState<"ALL" | Section | "KPIS">("ALL")
  const [showEmpty, setShowEmpty] = useState(false)
  const [tab, setTab] = useState<Tab>(readOnly ? "save" : "selection")
  const [selected, setSelected] = useState<number>(1000000)
  const [step1, setStep1] = useState(readOnly)
  const [decisions, setDecisions] = useState<Record<number, Decision>>(
    () => (readOnly ? Object.fromEntries(CHANGED_MONTHS.map((m) => [m, "overwrite" as Decision])) : {}),
  )
  const [handled, setHandled] = useState<Record<string, string>>({})
  const [openSignal, setOpenSignal] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [fieldComments, setFieldComments] = useState<Record<number, string>>(
    () => Object.fromEntries(Object.entries(raw.fieldComments).map(([k, v]) => [Number(k), v])),
  )
  const [uploadComment, setUploadComment] = useState(raw.uploadComment)
  const [contextComment, setContextComment] = useState(raw.contextComment)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(readOnly)
  // lines outside the standard performance sheet for which a new metric code was requested from Alma: code -> reason
  const [requested, setRequested] = useState<Record<number, string>>({})
  const [skipped, setSkipped] = useState(false)
  const [reqOpen, setReqOpen] = useState<number | null>(null)
  const [reqReason, setReqReason] = useState("")
  const [wide, setWide] = useState(false)

  const mainTab = raw.tabs.find((t) => t.kind === "main")!
  const activeKind = raw.tabs.find((t) => t.name === sheet)?.kind ?? "main"
  const hasLtm = LTM_ROWS.length > 0

  // ---------- derived ----------
  const dataRows = useMemo(() => ROWS.filter(hasData), [ROWS]) // eslint-disable-line react-hooks/exhaustive-deps
  const storedRows = useMemo(() => dataRows.filter((r) => isStoredRow(r) && !isUnmapped(r)), [dataRows]) // eslint-disable-line react-hooks/exhaustive-deps
  const unmappedRows = useMemo(() => dataRows.filter(isUnmapped), [dataRows]) // eslint-disable-line react-hooks/exhaustive-deps
  const emptyCount = ROWS.length - dataRows.length
  const costCount = storedRows.filter((r) => r.flip === "cost" && r.kind === "DATA").length
  const creditCount = storedRows.filter((r) => r.flip === "credit" && r.kind === "DATA").length

  const calcRows = useMemo(() => dataRows.filter((r) => r.calc && r.calc.length > 0 && r.code !== raw.balance.reported), [dataRows, raw.balance.reported]) // eslint-disable-line react-hooks/exhaustive-deps
  const calcResults = calcRows.map((r) => {
    const rep = r.v[CURRENT] ?? 0
    const calc = recalc(r) ?? 0
    return { r, rep, calc, diff: rep - calc }
  })
  const badCalc = calcResults.filter((c) => Math.abs(c.diff) > 0.05)
  const okCalc = calcResults.length - badCalc.length
  const histBad: { r: IntakeRow; m: number; rep: number; calc: number }[] = []
  calcRows.forEach((r) => {
    for (let m = 0; m < CURRENT; m++) {
      const rep = r.v[m]
      const c = recalc(r, m)
      if (rep !== null && c !== null && Math.abs(rep - c) > 0.05) histBad.push({ r, m, rep, calc: c })
    }
  })
  const balBad = MONTHS.map((_, m) => ({ m, d: balanceDiff(m) })).filter((x) => Math.abs(x.d) > raw.balance.tol)

  const ytdRows = useMemo(() => dataRows.filter(isFlow), [dataRows]) // eslint-disable-line react-hooks/exhaustive-deps
  const ytdTol = raw.ytdTol
  const ytdDev = ytdRows.filter((r) => Math.abs(ytdAfter(r, decisions) - (r.ytd ?? 0)) > ytdTol)
  const ytdDevBefore = ytdRows.filter((r) => Math.abs(ytdAfter(r, {}) - (r.ytd ?? 0)) > ytdTol)
  const ltmChecks = hasLtm ? [1000000, 1300000, 1300300].map((c) => ({ code: c, ...ltmAfter(c, decisions)! })) : []
  const ltmDev = ltmChecks.filter((l) => Math.abs(l.after - l.inFile) > 0.05)
  const claimsOk = raw.claims.filter((c) => Math.abs((ROW_BY_CODE[c.code].v[CURRENT] ?? 0) - c.expect) < 1)
  const normSpec = NORM_ROWS.filter((n) => n.kind === "SPEC")
  const normTotal = NORM_ROWS.find((n) => n.kind === "RANGE")
  const normBad = normTotal ? MONTHS.filter((_, m) => Math.abs(normSpec.reduce((a, n) => a + (n.v[m] ?? 0), 0) - (normTotal.v[m] ?? 0)) > 0.01) : []

  const allDecided = CHANGED_MONTHS.every((m) => decisions[m])
  const tied = ytdDev.length === 0 && ltmDev.length === 0
  const hasLe = raw.extra.some((e) => e.key === "le")

  const signals: Signal[] = [
    { id: "period", test: "Period in the file matches your selection", found: `Column header "${PERIOD}" on tab ${mainTab.name}, last filled month = ${MONTHS[CURRENT]}`, outcome: "Pass", note: "This is not a different monthly report uploaded under the wrong month." },
    { id: "read", test: "Complete sheet read", found: `${mainTab.name}: ${dataRows.length} lines (income statement, balance sheet, cash flow${raw.id === "B" ? ", KPIs" : ""}) · ${MONTHS.length} months${hasLe ? ", YTD and LE" : ""}${hasLtm ? ` · LTM: ${LTM_ROWS.length} lines` : ""}${raw.id === "A" ? " · plus the management summary" : ""}`, outcome: "Pass", note: emptyCount > 0 ? `${emptyCount} empty lines were skipped.` : "All lines have values." },
    ...(raw.id === "A" ? [{ id: "units", test: "Unit converted", found: raw.unitNote, outcome: "Expected" as Outcome, note: "Alma stores amounts in EUR k." }] : []),
    { id: "sign", test: "Sign rule applied", found: `Income +, costs −${costCount ? ` (${costCount} cost lines turned negative)` : ""}${creditCount ? ` · ${creditCount} liability and equity lines on the balance sheet turned negative` : ""}`, outcome: "Pass", note: "Net debt and leverage stay positive for a debt position (exception)." },
    { id: "calc-ok", test: `Totals recalculated: ${okCalc} of ${calcResults.length} tie`, found: "Subtotals, gross profit, EBITDA, EBIT, result, balance sheet and cash flow recalculated with the formulas from the metric file", outcome: "Pass", note: "Reported total = recalculated." },
    ...badCalc.map((c): Signal => ({
      id: `calc-${c.r.code}`, code: c.r.code, action: "note",
      test: `${c.r.label} (${MONTHS[CURRENT]}): reported versus recalculated`,
      found: `${num(c.rep, 1)} in the file, ${num(c.calc, 1)} recalculated (difference ${num(c.diff, 1)})`,
      outcome: "Warning",
      note: c.r.code === 1600000
        ? "The result in the file uses tax with the opposite sign (the Tax line shows −11.3, the sum uses +11.3). Both values stay visible; confirm which one applies."
        : "The reported total does not match its components. Both values stay visible; confirm or explain.",
    })),
    ...(histBad.length > 0 ? [{
      id: "hist", action: "note" as const, code: histBad[0].r.code,
      test: `The file itself does not tie in earlier months (${histBad.length})`,
      found: histBad.map((h) => `${h.r.label} ${MONTHS[h.m]}: ${num(h.rep, 1)} versus ${num(h.calc, 1)}`).join(" · "),
      outcome: "Warning" as Outcome,
      note: "In July the €80k RCF is included in total long-term liabilities, although it is reported under current liabilities. Only relevant if you overwrite that month.",
    }] : []),
    ...(balBad.length > 0 ? [{
      id: "balance", action: "note" as const, code: raw.balance.assets,
      test: raw.balance.reported ? "Balance check differs from assets minus liabilities" : "Balance sheet does not balance: assets ≠ liabilities",
      found: raw.balance.reported
        ? `The file shows 0, but assets − liabilities = ${num(balBad[balBad.length - 1].d, 2)} (${balBad.length} of ${MONTHS.length} months)`
        : balBad.map((b) => `${MONTHS[b.m]} ${num(b.d, 1)}`).join(" · ") + " (EUR k)",
      outcome: "Warning" as Outcome,
      note: raw.balance.reported ? "Probably a rounding difference. Confirm or explain." : "In these months total assets and total liabilities differ. Both values stay visible; confirm or explain.",
    }] : []),
    ...(unmappedRows.length > 0 ? [{
      id: "unmapped", action: "request" as const, code: unmappedRows[0]?.code,
      test: `${unmappedRows.length} lines are not part of the performance sheet`,
      found: unmappedRows.map((r) => r.label).join(", "),
      outcome: "Warning" as Outcome,
      note: "These lines are not in the standard performance sheet, so they are not stored. Request a new metric code from Alma if you need them, or continue without them. Only Alma creates metrics, so the data model stays the same for everyone.",
    }] : []),
    {
      id: "ytd", action: "historical", test: raw.id === "A" ? "YTD ties to the management summary" : "YTD ties on the income statement",
      found: ytdDev.length === 0 ? `All ${ytdRows.filter((r) => r.sec === "IS").length} lines with a YTD figure tie` : `${ytdDev.length} lines differ from the YTD figure in the file`,
      outcome: ytdDev.length === 0 ? "Pass" : "Warning",
      note: ytdDev.length === 0 ? "Jan to Aug ties to the YTD figure in the monthly report." : "Historical data was changed. Never correct silently; choose under 'Historical data' how we process this.",
    },
    ...(hasLtm ? [{
      id: "ltm", action: "historical" as const, test: "LTM ties (LTM tab)",
      found: ltmChecks.map((l) => `${ROW_BY_CODE[l.code].label} ${num(l.after)} / ${num(l.inFile)}`).join(" · "),
      outcome: (ltmDev.length === 0 ? "Pass" : "Warning") as Outcome,
      note: ltmDev.length === 0 ? "LTM Aug in the file = LTM from Alma after processing." : "The LTM in the file includes the changed months; Alma does not have those yet.",
    }] : []),
    ...(raw.claims.length > 0 ? [{
      id: "claims", test: `Management summary matches the figures (${claimsOk.length} of ${raw.claims.length})`,
      found: raw.claims.map((c) => c.text).join(" · "), outcome: "Pass" as Outcome, note: "The amounts in the board's commentary were checked against the figures read.",
    }] : []),
    ...(normTotal ? [{
      id: "norm", test: `Normalizations: specification ties (${MONTHS.length - normBad.length} of ${MONTHS.length} months)`,
      found: `${normSpec.length} lines on the Normalizations tab add up to EBITDA Normalizations (1300100)`, outcome: "Pass" as Outcome, note: "The Check line in the file is 0.",
    }] : []),
    { id: "margins", test: "Margins and ratios", found: `${ROWS.filter((r) => isPct(r) && hasData(r)).length} lines (gross, EBITDA and other margins)`, outcome: "Expected", note: "Not stored; the dashboard recalculates them." },
    ...(hasLe ? [{ id: "le", test: "Latest estimate FY 2026", found: `LE column read for ${dataRows.filter((r) => r.le !== null && isStoredRow(r)).length} lines`, outcome: "Expected" as Outcome, note: "Stored as LE; historical months remain unchanged." }] : []),
  ]
  const unmappedOpen = unmappedRows.filter((r) => requested[r.code] === undefined)
  const requestedCount = Object.keys(requested).length
  const unmappedDone = readOnly || unmappedOpen.length === 0 || skipped
  const isDone = (s: Signal) => readOnly || (s.id === "unmapped" ? unmappedDone : handled[s.id] !== undefined)
  const attention = signals.filter((s) => (s.outcome === "Warning" || s.outcome === "Blocking") && !isDone(s))
  const blockingForSave = attention.filter((s) => s.id !== "ytd" && s.id !== "ltm" && s.id !== "unmapped")
  const counts = { pass: signals.filter((s) => s.outcome === "Pass").length, warn: attention.length }

  const controlsDone = step1 && blockingForSave.length === 0
  const oldDone = readOnly || (allDecided && (tied || uploadComment.trim().length > 0))
  const canSave = step1 && unmappedDone && controlsDone && oldDone && !saved
  const fieldCount = Object.values(fieldComments).filter((v) => v.trim()).length
  const overwritten = CHANGED_MONTHS.filter((m) => decisions[m] === "overwrite")
  const corrected = CHANGED_MONTHS.filter((m) => decisions[m] === "current")

  function select(code: number, scroll = true) {
    setSelected(code)
    setSheet(mainTab.name)
    if (scroll) setTimeout(() => document.getElementById(`row-${code}`)?.scrollIntoView({ block: "center", behavior: "smooth" }), 50)
  }
  function openReq(r: IntakeRow) {
    setReqOpen(r.code); setReqReason(""); setSelected(r.code)
  }
  function confirmReq(r: IntakeRow) {
    setRequested((q) => ({ ...q, [r.code]: reqReason.trim() }))
    setReqOpen(null)
  }
  function undoReq(code: number) {
    setRequested((q) => { const n = { ...q }; delete n[code]; return n })
  }
  useEffect(() => {
    if (step1 && !readOnly && tab === "selection") setTab("checks")
  }, [step1]) // eslint-disable-line react-hooks/exhaustive-deps

  function setAll(d: Decision) {
    setDecisions(Object.fromEntries(CHANGED_MONTHS.map((m) => [m, d])))
  }
  function handleSave() {
    setSaving(true)
    setTimeout(() => { setSaving(false); setSaved(true); saveImportedComment(COMPANY, PERIOD, uploadComment) }, 1500)
  }

  // ---------- grid ----------
  const filterOk = (r: IntakeRow) => (filter === "ALL" ? true : filter === "KPIS" ? r.sec === "KPI" || r.sec === "HR" : r.sec === filter)
  const visible = ROWS.filter((r) => filterOk(r) && (showEmpty || hasData(r)))
  const sel = ROW_BY_CODE[selected]
  const filters = ([
    { id: "ALL", label: "All" }, { id: "IS", label: "Income statement" }, { id: "BS", label: "Balance sheet" },
    { id: "CF", label: "Cash flow" }, { id: "KPIS", label: "KPIs" },
  ] as { id: "ALL" | Section | "KPIS"; label: string }[]).filter((f) => f.id === "ALL" || f.id === "KPIS" ? (f.id === "ALL" || ROWS.some((r) => r.sec === "KPI" || r.sec === "HR")) : ROWS.some((r) => r.sec === f.id))
  const sections = Array.from(new Set(visible.map((r) => r.sec)))
  const gridSpan = 2 + MONTHS.length + raw.extra.length

  function rowStatus(r: IntakeRow): React.ReactNode {
    if (isUnmapped(r)) {
      return requested[r.code] !== undefined
        ? <span title="New metric code requested from Alma" className="text-[10px] font-semibold text-data-3">requested</span>
        : <span title="Not part of the performance sheet, not stored" className="rounded bg-watch-soft px-1 text-[10px] font-semibold text-watch">not stored</span>
    }
    if (badCalc.find((b) => b.r.code === r.code)) return <AlertCircle className="h-3.5 w-3.5 text-ai" />
    if (isFlow(r) && Math.abs(ytdAfter(r, decisions) - (r.ytd ?? 0)) > ytdTol) return <AlertCircle className="h-3.5 w-3.5 text-ai" />
    if (r.calc && r.calc.length > 0) return <Check className="h-3.5 w-3.5 text-ok" />
    return null
  }

  const selCalc = sel ? recalc(sel) : null
  const selBad = sel ? badCalc.find((b) => b.r.code === sel.code) : null
  const selYtdAfter = sel && isFlow(sel) ? ytdAfter(sel, decisions) : null

  const checksBadge = !step1 ? null : blockingForSave.length === 0 && unmappedDone
    ? <Check className="h-3 w-3 text-ok" />
    : <span className="rounded-full bg-ai px-1.5 text-[10px] font-semibold text-on-ai">{blockingForSave.length + (unmappedDone ? 0 : 1)}</span>
  const tabs: { id: Tab; label: string; badge?: React.ReactNode }[] = [
    { id: "selection", label: "Selection", badge: step1 ? <Check className="h-3 w-3 text-ok" /> : <span className="h-1.5 w-1.5 rounded-full bg-ai" /> },
    { id: "checks", label: "Checks", badge: checksBadge },
    { id: "historical", label: "Historical data", badge: !step1 ? null : oldDone ? <Check className="h-3 w-3 text-ok" /> : <span className="rounded-full bg-ai px-1.5 text-[10px] font-semibold text-on-ai">{CHANGED_MONTHS.length}</span> },
    { id: "comments", label: "Comments" },
    { id: "save", label: "Save", badge: saved ? <Check className="h-3 w-3 text-ok" /> : null },
  ]

  const extraVal = (r: IntakeRow, key: "ytd" | "le" | "ly") => (key === "ytd" ? r.ytd : key === "le" ? r.le : r.ly)
  const keyLines = KEY_LINES.filter((c) => ROW_BY_CODE[c]?.ytd !== null && ROW_BY_CODE[c]?.ytd !== undefined)

  return (
    <div className="flex h-screen flex-col font-sans">
      {/* Header */}
      <div className="border-b border-line bg-white px-6 py-3">
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-1.5 text-[12px] font-medium text-brand hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" />
            {backLabel}
          </button>
        )}
        <div className="mt-1.5 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="truncate text-[16px] font-semibold text-ink">{FILE_NAME}</span>
            <span className="shrink-0 rounded bg-brand-soft px-1.5 py-0.5 text-[10px] font-medium text-brand">{raw.formatName}</span>
            <span className="shrink-0 text-[13px] text-ink-2">{COMPANY} · {PERIOD}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-[12px]">
            <Pill outcome="Pass">{counts.pass} OK</Pill>
            {counts.warn > 0 && <Pill outcome="Warning">{counts.warn} to review</Pill>}
            <span className={cn("rounded-full px-3 py-1 text-[12px] font-medium", saved ? "bg-brand-soft text-ok" : "bg-ai-soft text-ai")}>
              {saved ? "Imported into Alma" : "Awaiting approval"}
            </span>
          </div>
        </div>
        {readOnly && submittedLabel && <div className="mt-1 text-[12px] text-ink-2">{submittedLabel} · read-only</div>}
      </div>
      <div className="flex min-h-0 flex-1">
        {/* LEFT: the sheet */}
        <div className="flex min-w-0 flex-1 flex-col bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2">
            <div className="flex flex-wrap items-center gap-1">
              <FileSpreadsheet className="mr-1 h-4 w-4 text-brand" />
              {raw.tabs.map((t) => (
                <button key={t.name} onClick={() => setSheet(t.name)} className={cn("rounded-md px-3 py-1 text-[13px]", sheet === t.name ? "bg-brand font-medium text-white" : "text-ink-2 hover:bg-bg")}>{t.name}</button>
              ))}
            </div>
            {activeKind === "main" && (
              <div className="flex flex-wrap items-center gap-1.5">
                {filters.map((f) => (
                  <button key={f.id} onClick={() => setFilter(f.id)} className={cn("rounded-full border px-2.5 py-0.5 text-[12px]", filter === f.id ? "border-brand bg-brand-soft font-medium text-brand" : "border-line text-ink-2 hover:border-ai-soft")}>{f.label}</button>
                ))}
                {emptyCount > 0 && (
                  <label className="ml-1 flex cursor-pointer items-center gap-1.5 text-[12px] text-ink-2">
                    <input type="checkbox" checked={showEmpty} onChange={(e) => setShowEmpty(e.target.checked)} className="accent-brand" />
                    Empty lines ({emptyCount})
                  </label>
                )}
              </div>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            {activeKind === "main" && (
              <table className="w-full min-w-[640px] border-separate border-spacing-0 text-[11.5px] [font-variant-numeric:tabular-nums]">
                <thead className="sticky top-0 z-20">
                  <tr className="bg-bg text-[11px] uppercase tracking-wide text-ink-2">
                    <th className="sticky left-0 z-30 min-w-[200px] border-b border-line bg-bg px-2 py-1.5 text-left font-medium">Line · In EUR k</th>
                    {MONTHS.map((m, i) => (
                      <th key={m} className={cn("min-w-[48px] border-b border-line px-1.5 py-1.5 text-right font-medium", i === CURRENT && "bg-brand-soft text-ok")}>{m}</th>
                    ))}
                    {raw.extra.map((e, i) => (
                      <th key={e.key} className={cn("min-w-[56px] border-b border-line px-1.5 py-1.5 text-right font-medium", i === 0 && "border-l")}>{e.label}</th>
                    ))}
                    <th className="w-14 border-b border-line px-2 py-1.5" />
                  </tr>
                </thead>
                <tbody>
                  {sections.map((s) => (
                    <SectionRows key={s} s={s} span={gridSpan + 1}>
                      {visible.filter((r) => r.sec === s).map((r) => {
                        const total = r.kind !== "DATA"
                        const pct = isPct(r)
                        const active = r.code === selected
                        const ytdBad = isFlow(r) && Math.abs(ytdAfter(r, decisions) - (r.ytd ?? 0)) > ytdTol
                        return (
                          <tr key={r.code} id={`row-${r.code}`} onClick={() => select(r.code, false)} className={cn("cursor-pointer", active ? "bg-brand-soft" : "hover:bg-surface-2")}>
                            <td className={cn("sticky left-0 z-10 border-b border-surface-2 px-2 py-[3px]", active ? "bg-brand-soft" : "bg-white", total && "font-semibold")}>
                              <div className={cn("flex items-baseline gap-2", r.kind === "DATA" && "pl-3", pct && "pl-6 text-[11px] italic text-ink-2")}>
                                <span className="truncate">{r.label}</span>
                                <span className="font-mono text-[10.5px] font-normal not-italic text-ink-3">{r.code}</span>
                              </div>
                              {r.alias && <div className="pl-3 text-[11px] font-normal text-data-3">→ Alma: {r.alias}</div>}
                            </td>
                            {r.v.map((v, m) => {
                              const changed = r.alma?.[String(m)] !== undefined
                              return (
                                <td key={m} title={changed ? `In Alma: ${fmtVal(r, almaAt(r, m))}` : undefined} className={cn("border-b border-surface-2 px-1.5 py-[3px] text-right", total && "font-semibold", pct && "text-[11px] text-ink-2", m === CURRENT && "bg-brand-soft", changed && "bg-watch-soft", active && m === CURRENT && "outline outline-2 outline-brand [outline-offset:-2px]")}>
                                  {fmtVal(r, v)}
                                </td>
                              )
                            })}
                            {raw.extra.map((e, i) => (
                              <td key={e.key} className={cn("border-b border-surface-2 px-1.5 py-[3px] text-right", i === 0 && "border-l", total && "font-semibold", e.key === "ytd" && ytdBad && "bg-watch-soft text-watch", (pct || e.key !== "ytd") && "text-ink-2")}>
                                {fmtVal(r, extraVal(r, e.key))}
                              </td>
                            ))}
                            <td className="border-b border-surface-2 px-2 py-[3px] text-center">{rowStatus(r)}</td>
                          </tr>
                        )
                      })}
                    </SectionRows>
                  ))}
                </tbody>
              </table>
            )}

            {activeKind === "ltm" && (
              <table className="w-full min-w-[600px] border-separate border-spacing-0 text-[11.5px] [font-variant-numeric:tabular-nums]">
                <thead className="sticky top-0 z-20">
                  <tr className="bg-bg text-[11px] uppercase tracking-wide text-ink-2">
                    <th className="sticky left-0 z-30 min-w-[200px] border-b border-line bg-bg px-2 py-1.5 text-left font-medium">LTM · In EUR k</th>
                    {MONTHS.map((m, i) => <th key={m} className={cn("min-w-[52px] border-b border-line px-1.5 py-1.5 text-right font-medium", i === CURRENT && "bg-brand-soft text-ok")}>{m}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {LTM_ROWS.filter((l) => l.v.some((x) => x)).map((l) => {
                    const total = l.kind !== "DATA"
                    const pct = l.label.includes("%")
                    return (
                      <tr key={l.code} className="hover:bg-surface-2">
                        <td className={cn("sticky left-0 z-10 border-b border-surface-2 bg-white px-2 py-[3px]", total && "font-semibold")}>
                          <div className={cn("flex items-baseline gap-2", l.kind === "DATA" && "pl-3", pct && "pl-6 text-[11px] italic text-ink-2")}>
                            <span className="truncate">{l.label}</span>
                            <span className="font-mono text-[10.5px] font-normal not-italic text-ink-3">{l.code}</span>
                          </div>
                        </td>
                        {l.v.map((v, m) => (
                          <td key={m} className={cn("border-b border-surface-2 px-1.5 py-[3px] text-right", total && "font-semibold", m === CURRENT && "bg-brand-soft", pct && "text-[11px] text-ink-2")}>
                            {v === null ? "" : pct ? num(v, 1) + "%" : fmtAmt(v)}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}

            {activeKind === "norm" && (
              <table className="w-full min-w-[600px] border-separate border-spacing-0 text-[11.5px] [font-variant-numeric:tabular-nums]">
                <thead className="sticky top-0 z-20">
                  <tr className="bg-bg text-[11px] uppercase tracking-wide text-ink-2">
                    <th className="sticky left-0 z-30 min-w-[260px] border-b border-line bg-bg px-2 py-1.5 text-left font-medium">Normalizations specification · EUR k</th>
                    {MONTHS.map((m, i) => <th key={m} className={cn("min-w-[52px] border-b border-line px-1.5 py-1.5 text-right font-medium", i === CURRENT && "bg-brand-soft text-ok")}>{m}</th>)}
                    <th className="min-w-[56px] border-b border-l border-line px-1.5 py-1.5 text-right font-medium">YTD</th>
                  </tr>
                </thead>
                <tbody>
                  {NORM_ROWS.map((n, i) => (
                    <tr key={i} className={cn(n.kind === "RANGE" && "font-semibold", n.kind === "CHECK" && "text-ink-2")}>
                      <td className="sticky left-0 z-10 border-b border-surface-2 bg-white px-2 py-[3px]"><span className={cn(n.kind === "DATA" && "pl-3", n.kind === "SPEC" && "pl-3")}>{n.label}</span></td>
                      {n.v.map((v, m) => <td key={m} className={cn("border-b border-surface-2 px-1.5 py-[3px] text-right", m === CURRENT && "bg-brand-soft")}>{v === null || v === 0 ? "" : num(v, 1)}</td>)}
                      <td className="border-b border-l border-surface-2 px-1.5 py-[3px] text-right text-ink-2">{n.ytd === null || n.ytd === 0 ? "" : num(n.ytd, 1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeKind === "summary" && (
              <div className="mx-auto max-w-[900px] space-y-4 p-5 text-[13.5px] leading-relaxed text-ink">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">Comment of the board · Management summary!C4</div>
                  <p className="mt-1">{raw.board}</p>
                </div>
                <table className="w-full border-separate border-spacing-0 text-[13px]">
                  <thead><tr className="text-left text-[11px] uppercase tracking-wide text-ink-3"><th className="w-[130px] pb-1 font-medium">Section</th><th className="pb-1 font-medium">Month performance</th><th className="pb-1 font-medium">YTD performance</th></tr></thead>
                  <tbody>
                    {(raw.summary ?? []).map((s) => (
                      <tr key={s.label} className="align-top"><td className="border-t border-surface-2 py-2 pr-3 font-semibold">{s.label}</td><td className="border-t border-surface-2 py-2 pr-3">{s.month}</td><td className="border-t border-surface-2 py-2">{s.ytd}</td></tr>
                    ))}
                  </tbody>
                </table>
                {(raw.summaryExtra ?? []).map((s) => (
                  <div key={s.label}><div className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">{s.label}</div><p className="mt-1">{s.text}</p></div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 border-t border-line bg-surface-2 px-4 py-2 text-[12px] text-ink-2">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-brand-soft ring-1 ring-ok-soft" />New month ({PERIOD})</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-watch-soft ring-1 ring-ai-soft" />Differs from what Alma already had</span>
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-ok" />Total recalculated</span>
            <span className="flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5 text-ai" />Needs attention</span>
          </div>
        </div>


        {/* RIGHT: workflow */}
        <div className={cn("flex shrink-0 flex-col border-l border-line bg-surface-2", wide ? "w-[68%]" : "w-[44%] min-w-[520px]")}>
          {sel && (
            <div className="border-b border-line bg-white px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[12px] font-medium uppercase tracking-wide text-ink-3">Selected line</div>
                  <div className="text-[15px] font-semibold text-ink">{sel.label}</div>
                  <div className="text-[13px] text-ink-2"><span className="font-mono">{sel.code}</span>{sel.alias ? ` · Alma: ${sel.alias}` : ""}</div>
                </div>
                <span className="rounded bg-bg px-1.5 py-0.5 font-mono text-[12px] text-brand">{cellRef(sel, CURRENT)}</span>
              </div>
              <dl className="mt-2 space-y-1 text-[13.5px]">
                <div className="flex justify-between"><dt className="text-ink-2">In the file ({MONTHS[CURRENT]})</dt><dd className="font-medium">{fmtVal(sel, sel.v[CURRENT])}</dd></div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-2">Stored in Alma</dt>
                  <dd className="text-right font-medium">
                    {isUnmapped(sel) ? (requested[sel.code] !== undefined
                      ? <span className="text-data-3">metric code requested from Alma</span>
                      : <span className="rounded-md bg-watch-soft px-2 py-0.5 text-[13px] font-semibold text-watch">Not stored, not in the performance sheet</span>)
                      : isPct(sel) ? <span className="font-normal text-ink-2">not stored, recalculated</span>
                      : <>{fmtAmt(stored(sel, sel.v[CURRENT] ?? 0))}{sel.flip ? <span className="font-normal text-ink-2"> ({sel.flip === "credit" ? "liability, negative" : "sign reversed"})</span> : null}</>}
                  </dd>
                </div>
                {selCalc !== null && !sel.pct && (
                  <div className="flex justify-between"><dt className="text-ink-2">Recalculated</dt><dd className={cn("font-medium", selBad ? "text-watch" : "text-ok")}>{num(selCalc, 1)} {selBad ? `(difference ${num(selBad.diff, 1)})` : "✓"}</dd></div>
                )}
                {selYtdAfter !== null && (
                  <div className="flex justify-between"><dt className="text-ink-2">YTD in Alma after processing / file</dt><dd className={cn("font-medium", Math.abs(selYtdAfter - (sel.ytd ?? 0)) > ytdTol ? "text-watch" : "text-ok")}>{fmtAmt(selYtdAfter)} / {fmtAmt(sel.ytd ?? 0)}</dd></div>
                )}
              </dl>
              {isStoredRow(sel) && !isUnmapped(sel) && (
                <input value={fieldComments[sel.code] ?? ""} readOnly={readOnly} onChange={(e) => setFieldComments((s) => ({ ...s, [sel.code]: e.target.value }))} placeholder="Comment on this data point (company, period, metric)" className="mt-2 w-full rounded-md border border-line bg-surface-2 px-2.5 py-1.5 text-[13.5px] outline-none focus:border-data-3" />
              )}
            </div>
          )}

          <div className="flex border-b border-line bg-white px-2">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} disabled={!step1 && t.id !== "selection"} className={cn("flex items-center gap-1.5 border-b-2 px-2.5 py-2.5 text-[13.5px] disabled:cursor-not-allowed disabled:opacity-40", tab === t.id ? "border-brand font-semibold text-brand" : "border-transparent text-ink-2 hover:text-ink")}>
                {t.label}{t.badge}
              </button>
            ))}
            <button onClick={() => setWide((w) => !w)} title="Make the panel larger or smaller" className="ml-auto shrink-0 self-center whitespace-nowrap rounded-md px-2 py-1 text-[13px] text-ink-2 hover:bg-bg">
              {wide ? "Smaller ↔" : "Larger ↔"}
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 text-[14px] text-ink">
            {saving && <div className="mb-3 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[13.5px] text-ink-2"><Loader2 className="h-4 w-4 animate-spin" />Saving…</div>}

            {tab === "selection" && (
              <div className="space-y-3">
                <div className="rounded-[10px] border border-line bg-white p-4">
                  <dl className="space-y-2">
                    <div className="flex justify-between"><dt className="text-ink-2">Document type</dt><dd>Performance sheet (Excel)</dd></div>
                    <div className="flex justify-between"><dt className="text-ink-2">Company</dt><dd>{COMPANY}</dd></div>
                    <div className="flex justify-between"><dt className="text-ink-2">Period</dt><dd>{PERIOD}</dd></div>
                    <div className="flex justify-between"><dt className="text-ink-2">Format</dt><dd className="text-right">{raw.formatName}</dd></div>
                    <div className="flex justify-between"><dt className="text-ink-2">Unit</dt><dd>{raw.unitNote}</dd></div>
                  </dl>
                  <p className="mt-2 text-[13px] text-ink-3">You chose the document type and period before uploading; the company follows from your login.</p>
                </div>
                <div className="flex items-start gap-2 rounded-lg bg-brand-soft px-3 py-2.5 text-[13.5px] text-ok">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>The AI checks your selection: the column header and the last filled month in the file are {PERIOD}. No deviation.</span>
                </div>
                {!step1 && <button onClick={() => setStep1(true)} className="w-full rounded-lg bg-brand px-4 py-2.5 text-[14px] font-medium text-white hover:bg-action-hover">Selection is correct, continue to the checks</button>}
              </div>
            )}

            {tab === "checks" && (
              <div className="space-y-2.5">
                <p className="text-[13.5px] text-ink-2">What needs your review first, below it what is fine. Click a check to see the line in the file.</p>
                {[...signals.filter((s) => s.outcome === "Blocking" || s.outcome === "Warning"), ...(showPass ? signals.filter((s) => s.outcome === "Pass" || s.outcome === "Expected") : [])].map((s) => {
                  const done = isDone(s)
                  const linkable = s.code !== undefined
                  return (
                    <div key={s.id} className={cn("rounded-[10px] border bg-white p-3", done ? "border-line" : s.outcome === "Blocking" ? "border-alert-soft" : s.outcome === "Warning" ? "border-ai-soft" : "border-line")}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-[14px] font-semibold leading-snug">{s.test}</div>
                        <Pill outcome={done ? "Pass" : s.outcome}>{done ? "Confirmed" : s.outcome}</Pill>
                      </div>
                      <div className="mt-1 text-[13.5px] text-ink-2">{s.found}</div>
                      <div className="mt-1 text-[13px] text-ink-2">{done ? (readOnly ? "Confirmed by the CFO." : `CFO comment: ${handled[s.id] || "agreed"}`) : s.note}</div>

                      {s.action === "request" && !readOnly && (
                        <div className="mt-2.5 space-y-2">
                          {unmappedRows.map((r) => {
                            const asked = requested[r.code]
                            const open = reqOpen === r.code
                            return (
                              <div key={r.code} className="rounded-lg border border-surface-2 bg-surface-2 p-2.5">
                                <div className="flex items-center justify-between gap-2">
                                  <button onClick={() => select(r.code)} className="min-w-0 text-left">
                                    <div className="truncate text-[13.5px] font-medium">{r.label}</div>
                                    <div className="text-[12.5px] text-ink-2"><span className="font-mono">{r.code}</span> · {MONTHS[CURRENT]}: {fmtVal(r, r.v[CURRENT])} · <span className="font-mono">{cellRef(r, CURRENT)}</span></div>
                                  </button>
                                  {asked !== undefined ? (
                                    <div className="shrink-0 text-right">
                                      <div className="text-[13px] font-medium text-data-3">Requested from Alma</div>
                                      <button onClick={() => undoReq(r.code)} className="text-[12px] text-ink-2 underline underline-offset-2">Change</button>
                                    </div>
                                  ) : (
                                    <button onClick={() => (open ? setReqOpen(null) : openReq(r))} className="shrink-0 rounded-md border border-brand bg-white px-3 py-1 text-[13px] font-medium text-brand hover:bg-brand-soft">{open ? "Close" : "Request metric code"}</button>
                                  )}
                                </div>
                                {asked !== undefined && asked && <div className="mt-1 text-[12.5px] text-ink-2">Your note: {asked}</div>}
                                {open && asked === undefined && (
                                  <div className="mt-2 space-y-1.5">
                                    <input value={reqReason} onChange={(e) => setReqReason(e.target.value)} placeholder="What do you use this line for? (optional)" className="w-full rounded-md border border-line bg-white px-2.5 py-1.5 text-[13.5px] outline-none focus:border-brand" />
                                    <p className="text-[12.5px] text-ink-2">Alma reviews the request and assigns the code. Until then this line is not stored; once the code exists it is picked up next month.</p>
                                    <button onClick={() => confirmReq(r)} className="rounded-md bg-brand px-3 py-1.5 text-[13.5px] font-medium text-white hover:bg-action-hover">Send request to Alma</button>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                          {unmappedOpen.length > 0 && (
                            <label className="flex cursor-pointer items-center gap-2 text-[13.5px] text-ink-2">
                              <input type="checkbox" checked={skipped} onChange={(e) => setSkipped(e.target.checked)} className="accent-brand" />
                              Continue without these lines: they are not stored
                            </label>
                          )}
                        </div>
                      )}

                      <div className="mt-2.5 flex flex-wrap items-center gap-3">
                        {linkable && s.action !== "request" && <button onClick={() => select(s.code!)} className="text-[13px] font-medium text-brand underline underline-offset-2">Show in file</button>}
                        {s.action === "note" && !done && (openSignal === s.id ? (
                          <div className="flex w-full gap-2">
                            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Comment (optional)" className="min-w-0 flex-1 rounded-md border border-line px-2.5 py-1.5 text-[13.5px] outline-none focus:border-brand" />
                            <button onClick={() => { setHandled((h) => ({ ...h, [s.id]: draft.trim() })); setOpenSignal(null); setDraft("") }} className="rounded-md bg-brand px-3 py-1.5 text-[13.5px] font-medium text-white">Confirm</button>
                          </div>
                        ) : <button onClick={() => { setOpenSignal(s.id); setDraft("") }} className="rounded-md border border-brand px-3 py-1 text-[13px] font-medium text-brand hover:bg-brand-soft">Agree or comment</button>)}
                        {s.action === "historical" && s.outcome === "Warning" && <button onClick={() => setTab("historical")} className="rounded-md border border-brand px-3 py-1 text-[13px] font-medium text-brand hover:bg-brand-soft">Go to Historical data</button>}
                      </div>
                    </div>
                  )
                })}
                <button onClick={() => setShowPass((v) => !v)} className="flex items-center gap-1.5 text-[13.5px] font-medium text-ink-2 hover:text-ink">
                  {showPass ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  {showPass ? "Hide" : "Show"} {signals.filter((s) => s.outcome === "Pass" || s.outcome === "Expected").length} checks that are fine or expected
                </button>
              </div>
            )}

            {tab === "historical" && (
              <div className="space-y-3">
                {CHANGED_MONTHS.length === 0 ? (
                  <div className="rounded-[10px] border border-line bg-white p-4 text-[14px]">No historical months were changed.</div>
                ) : (
                  <>
                    <div className="rounded-[10px] border border-ai-soft bg-surface-2 p-3">
                      <div className="text-[14px] font-semibold">Historical data changed: {CHANGED_MONTHS.map((m) => MONTHS[m]).join(" and ")} {CHANGED_MONTHS.length > 1 ? "were" : "was"} adjusted by the company</div>
                      <p className="mt-1 text-[13.5px] text-ink-2">The YTD in this file therefore no longer ties to what Alma held ({ytdDevBefore.length} lines differ). Alma corrects nothing without your choice.</p>
                      {!readOnly && <button onClick={() => setAll("overwrite")} className="mt-2 rounded-lg border border-brand px-3 py-1.5 text-[13.5px] font-medium text-brand hover:bg-brand-soft">Overwrite the whole month, for all changed months</button>}
                    </div>
                    {CHANGED_MONTHS.map((m) => {
                      const lines = ROWS.filter((r) => r.kind === "DATA" && r.alma?.[String(m)] !== undefined)
                      const totalsHit = ROWS.filter((r) => r.kind !== "DATA" && r.alma?.[String(m)] !== undefined && !isPct(r)).length
                      return (
                        <div key={m} className="rounded-[10px] border border-line bg-white p-3">
                          <div className="text-[14px] font-semibold">{MONTHS[m]} 2026</div>
                          <ul className="mt-1.5 space-y-0.5 text-[13.5px]">
                            {lines.map((r) => (
                              <li key={r.code} className="flex justify-between gap-2">
                                <button onClick={() => select(r.code)} className="truncate text-left text-ink underline-offset-2 hover:underline">{r.label}</button>
                                <span className="shrink-0 tabular-nums text-ink-2">{fmtAmt(almaAt(r, m))} → {fmtAmt(r.v[m] ?? 0)} <span className="text-watch">({diffAt(r, m) > 0 ? "+" : ""}{fmtAmt(diffAt(r, m))})</span></span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-1 text-[13px] text-ink-3">and {totalsHit} total lines that depend on it</div>
                          <div className="mt-2 space-y-1.5 border-t border-surface-2 pt-2">
                            {([
                              ["overwrite", `Overwrite the whole month ${MONTHS[m]} with the file`],
                              ["current", `Process the difference in ${MONTHS[CURRENT]} (the historical month stays as it was)`],
                              ["keep", "Keep the Alma value"],
                            ] as [Decision, string][]).map(([d, label]) => (
                              <label key={d} className={cn("flex items-center gap-2 text-[13.5px]", readOnly ? "cursor-default" : "cursor-pointer")}>
                                <input type="radio" name={`m-${m}`} disabled={readOnly} checked={decisions[m] === d} onChange={() => setDecisions((s) => ({ ...s, [m]: d }))} className="accent-brand" />
                                {label}
                              </label>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                    <div className="rounded-[10px] border border-line bg-white">
                      <div className="border-b border-line px-3 py-2 text-[12px] font-medium uppercase tracking-wide text-ink-3">YTD Jan–{MONTHS[CURRENT]} after processing{raw.id === "A" ? " (per management summary)" : ""}</div>
                      {keyLines.map((c) => {
                        const r = ROW_BY_CODE[c]; const a = ytdAfter(r, decisions); const d = a - (r.ytd ?? 0)
                        const ok = Math.abs(d) <= ytdTol
                        return (
                          <div key={c} className="flex items-center justify-between gap-2 border-b border-bg px-3 py-1.5 text-[13.5px] tabular-nums">
                            <span className="min-w-0 flex-1 truncate font-medium">{r.label}</span>
                            <span className="text-ink-2">Alma {fmtAmt(a)} · file {fmtAmt(r.ytd ?? 0)}</span>
                            <Pill outcome={ok ? "Pass" : "Warning"}>{ok ? "ties" : num(d, 1)}</Pill>
                          </div>
                        )
                      })}
                      <div className="px-3 py-1.5 text-[13px] text-ink-2">{ytdRows.length - ytdDev.length} of {ytdRows.length} lines with a YTD figure tie.</div>
                    </div>
                    {hasLtm && (
                      <div className="rounded-[10px] border border-line bg-white">
                        <div className="border-b border-line px-3 py-2 text-[12px] font-medium uppercase tracking-wide text-ink-3">LTM {MONTHS[CURRENT]} (LTM tab)</div>
                        {ltmChecks.map((l) => {
                          const d = l.after - l.inFile
                          return (
                            <div key={l.code} className="flex items-center justify-between gap-2 border-b border-bg px-3 py-1.5 text-[13.5px] tabular-nums">
                              <span className="min-w-0 flex-1 truncate font-medium">{ROW_BY_CODE[l.code].label}</span>
                              <span className="text-ink-2">Alma {fmtAmt(l.after)} · file {fmtAmt(l.inFile)}</span>
                              <Pill outcome={Math.abs(d) < 0.05 ? "Pass" : "Warning"}>{Math.abs(d) < 0.05 ? "ties" : num(d, 1)}</Pill>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    {corrected.length > 0 && <div className="rounded-lg bg-watch-soft px-3 py-2 text-[13.5px] text-watch">{MONTHS[CURRENT]} is stored differently in Alma than in the file, because the difference of {corrected.map((m) => MONTHS[m]).join(" and ")} has been processed in it.</div>}
                    {allDecided && !tied && <div className="rounded-lg bg-watch-soft px-3 py-2 text-[13.5px] text-watch">YTD does not tie yet. Record the reason under Comments to continue.</div>}
                  </>
                )}
              </div>
            )}

            {tab === "comments" && (
              <div className="space-y-4">
                <div>
                  <div className="text-[14px] font-semibold">On a data point <span className="font-normal text-ink-3">· {fieldCount} placed{raw.id === "A" ? ", suggested from the management summary" : ""}</span></div>
                  <p className="text-[13.5px] text-ink-2">Select a line in the file and type the comment at the top of this panel. They belong to company, period and metric.</p>
                  {Object.entries(fieldComments).filter(([, v]) => v.trim()).map(([k, v]) => (
                    <button key={k} onClick={() => select(Number(k))} className="mt-1.5 block w-full rounded-md bg-surface-2 px-2.5 py-1.5 text-left text-[13.5px]"><span className="font-medium">{ROW_BY_CODE[Number(k)].alias ?? ROW_BY_CODE[Number(k)].label}:</span> {v}</button>
                  ))}
                </div>
                <div>
                  <label className="text-[14px] font-semibold">On this upload <span className="font-normal text-ink-3">· suggested from the file</span></label>
                  <textarea value={uploadComment} readOnly={readOnly} onChange={(e) => setUploadComment(e.target.value)} rows={6} className="mt-1.5 w-full rounded-md border border-line bg-white px-3 py-2 text-[13.5px] leading-relaxed outline-none focus:border-brand" />
                </div>
                <div>
                  <label className="text-[14px] font-semibold">Context around the company</label>
                  <textarea value={contextComment} readOnly={readOnly} onChange={(e) => setContextComment(e.target.value)} rows={4} className="mt-1.5 w-full rounded-md border border-line bg-white px-3 py-2 text-[13.5px] leading-relaxed outline-none focus:border-brand" />
                </div>
              </div>
            )}

            {tab === "save" && (
              <div className="space-y-3">
                {saved ? (
                  <div className="space-y-2 rounded-[10px] border border-ok-soft bg-brand-soft p-4">
                    <div className="flex items-center gap-2 text-[15px] font-semibold text-ok"><CheckCircle2 className="h-5 w-5" />{PERIOD} is in Alma</div>
                    <p className="text-[14px]">{storedRows.length} lines stored for {COMPANY}{overwritten.length ? `, ${overwritten.map((m) => MONTHS[m]).join(" and ")} overwritten` : ""}{corrected.length ? `, difference processed in ${MONTHS[CURRENT]}` : ""}. {requestedCount > 0 ? `${requestedCount} requests for a new metric code were sent to Alma. ` : ""}{!readOnly && unmappedOpen.length > 0 ? `${unmappedOpen.length} lines outside the performance sheet were skipped. ` : ""}{fieldCount + 2} comments placed.</p>
                    <p className="text-[13.5px] text-ink-2">The file is kept. From a data point you open it at the right cell, for example <span className="font-mono">{cellRef(ROW_BY_CODE[1000000], CURRENT)}</span>. The performance sheet of {COMPANY} is updated.</p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-[10px] border border-line bg-white p-4">
                      <div className="text-[14px] font-semibold">This happens when you save</div>
                      <ul className="mt-2 space-y-1 text-[13.5px] text-ink-2">
                        <li>{storedRows.length} lines for {PERIOD} are written, with the source cell for each value.</li>
                        <li>The performance sheet is updated automatically; the CFO has nothing to link.</li>
                        {unmappedOpen.length > 0 && <li>{unmappedOpen.length} lines outside the performance sheet are skipped.</li>}
                        {requestedCount > 0 && <li>{requestedCount} lines are not stored until Alma has assigned the requested metric code.</li>}
                      </ul>
                    </div>
                    <div className="rounded-[10px] border border-line bg-white p-4">
                      <div className="text-[14px] font-semibold">Before you can save</div>
                      <ul className="mt-2 space-y-1.5 text-[13.5px]">
                        {([
                          ["Selection confirmed", step1],
                          ["Lines outside the performance sheet requested from Alma or skipped", unmappedDone],
                          ["Checks reviewed", controlsDone],
                          ["Historical data processed and YTD tied or explained", oldDone],
                        ] as [string, boolean][]).map(([t, ok]) => (
                          <li key={t} className="flex items-center gap-2">{ok ? <Check className="h-4 w-4 text-ok" /> : <AlertCircle className="h-4 w-4 text-ai" />}<span className={ok ? "text-ink-2" : "text-ink"}>{t}</span></li>
                        ))}
                      </ul>
                    </div>
                    <button onClick={handleSave} disabled={!canSave || saving} className="w-full rounded-lg bg-brand px-4 py-2.5 text-[14px] font-medium text-white hover:bg-action-hover disabled:cursor-not-allowed disabled:bg-ink-3">Confirm and save</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
