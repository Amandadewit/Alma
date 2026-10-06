"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, CheckCircle2, AlertCircle, FileSpreadsheet, Loader2, Check, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  CASES, MONTHS, CURRENT, SECTION_LABEL, buildCase, nl, fmtAmt,
  type IntakeRow, type Section, type Decision,
} from "@/lib/monthly-report-intake-data"

type Outcome = "Pass" | "Verwacht" | "Waarschuwing" | "Blokkerend"
type Tab = "selectie" | "mapping" | "controles" | "oude" | "toelichting" | "opslaan"

const OUT_CLS: Record<Outcome, string> = {
  Pass: "bg-[#DDEFE5] text-[#2F6B4F]",
  Verwacht: "bg-[#E3EDF7] text-[#2E5F8F]",
  Waarschuwing: "bg-[#FAEEDA] text-[#854F0B]",
  Blokkerend: "bg-[#FCEBEB] text-[#A32D2D]",
}

interface Signal {
  id: string
  test: string
  found: string
  outcome: Outcome
  note: string
  code?: number
  action?: "note" | "mapping" | "oude"
}

const KEY_LINES = [1000000, 1100000, 1300000, 1300300, 1600000]

function Pill({ outcome, children }: { outcome: Outcome; children: React.ReactNode }) {
  return <span className={cn("inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-semibold", OUT_CLS[outcome])}>{children}</span>
}

function SectionRows({ s, span, children }: { s: Section; span: number; children: React.ReactNode }) {
  return (
    <>
      <tr>
        <td colSpan={span} className="sticky left-0 border-b border-t border-[#E8E6E0] bg-[#F1F4F2] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#1B4D45]">{SECTION_LABEL[s]}</td>
      </tr>
      {children}
    </>
  )
}

export function MonthlyReportIntake({ caseId, onBack }: { caseId: "A" | "B"; onBack?: () => void }) {
  const D = useMemo(() => buildCase(CASES[caseId]), [caseId])
  const { raw, ROWS, ROW_BY_CODE, LTM_ROWS, NORM_ROWS, CHANGED_MONTHS, isPct, isStoredRow, isUnmapped, isFlow, hasData, cellRef, stored, recalc, almaAt, diffAt, ytdAfter, ltmAfter, balanceDiff, fmtVal } = D
  const FILE_NAME = raw.fileName, COMPANY = raw.company, PERIOD = raw.period

  const [sheet, setSheet] = useState<string>(raw.tabs[0].name)
  const [filter, setFilter] = useState<"ALL" | Section | "KPIS">("ALL")
  const [showEmpty, setShowEmpty] = useState(false)
  const [tab, setTab] = useState<Tab>("selectie")
  const [selected, setSelected] = useState<number>(1000000)
  const [step1, setStep1] = useState(false)
  const [decisions, setDecisions] = useState<Record<number, Decision>>({})
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
  const [saved, setSaved] = useState(false)
  // records the CFO linked to an existing metric: code -> metric name
  const [added, setAdded] = useState<Record<number, string>>({})
  // records for which a new metric code was requested from Alma: code -> reason
  const [requested, setRequested] = useState<Record<number, string>>({})
  const [skipped, setSkipped] = useState(false)
  const [addOpen, setAddOpen] = useState<number | null>(null)
  const [addMode, setAddMode] = useState<"link" | "request">("link")
  const [addName, setAddName] = useState("")
  const [addExisting, setAddExisting] = useState("")
  const [wide, setWide] = useState(false)

  const mainTab = raw.tabs.find((t) => t.kind === "main")!
  const activeKind = raw.tabs.find((t) => t.name === sheet)?.kind ?? "main"
  const hasLtm = LTM_ROWS.length > 0

  // ---------- derived ----------
  const dataRows = useMemo(() => ROWS.filter(hasData), [ROWS]) // eslint-disable-line react-hooks/exhaustive-deps
  const storedRows = useMemo(() => dataRows.filter((r) => isStoredRow(r) && (!isUnmapped(r) || added[r.code] !== undefined)), [dataRows, added]) // eslint-disable-line react-hooks/exhaustive-deps
  const unmappedRows = useMemo(() => dataRows.filter(isUnmapped), [dataRows]) // eslint-disable-line react-hooks/exhaustive-deps
  const aliasRows = ROWS.filter((r) => r.alias && hasData(r))
  const emptyCount = ROWS.length - dataRows.length
  const flipCount = storedRows.filter((r) => r.flip && r.kind === "DATA").length
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
    { id: "period", test: "Periode in bestand klopt met je keuze", found: `Kolomkop "${PERIOD}" in tabblad ${mainTab.name}, laatst ingevulde maand = ${MONTHS[CURRENT]}`, outcome: "Pass", note: "Het is geen ander maandrapport onder de verkeerde maand." },
    { id: "read", test: "Complete sheet gelezen", found: `${mainTab.name}: ${dataRows.length} regels (income statement, balans, kasstroom${raw.id === "B" ? ", KPI's" : ""}) · ${MONTHS.length} maanden${hasLe ? ", YTD en LE" : ""}${hasLtm ? ` · LTM: ${LTM_ROWS.length} regels` : ""}${raw.id === "A" ? " · plus de management summary" : ""}`, outcome: "Pass", note: emptyCount > 0 ? `${emptyCount} lege regels zijn overgeslagen.` : "Alle regels hebben waarden." },
    ...(raw.id === "A" ? [{ id: "units", test: "Eenheid omgerekend", found: raw.unitNote, outcome: "Verwacht" as Outcome, note: "Alma slaat bedragen op in EUR k." }] : []),
    { id: "sign", test: "Tekenregel toegepast", found: `Opbrengsten +, kosten −${costCount ? ` (${costCount} kostenregels omgezet naar negatief)` : ""}${creditCount ? ` · ${creditCount} passiva- en eigen-vermogensregels op de balans omgezet naar negatief` : ""}`, outcome: "Pass", note: "Netto schuld en leverage blijven positief bij een schuldpositie (uitzondering)." },
    { id: "calc-ok", test: `Totalen nagerekend: ${okCalc} van ${calcResults.length} sluiten`, found: "Subtotalen, brutowinst, EBITDA, EBIT, resultaat, balans en kasstroom herberekend met de formules uit het metricbestand", outcome: "Pass", note: "Gerapporteerd totaal = herberekend." },
    ...badCalc.map((c): Signal => ({
      id: `calc-${c.r.code}`, code: c.r.code, action: "note",
      test: `${c.r.label} (${MONTHS[CURRENT]}): gerapporteerd versus herberekend`,
      found: `${nl(c.rep, 1)} in het bestand, ${nl(c.calc, 1)} herberekend (verschil ${nl(c.diff, 1)})`,
      outcome: "Waarschuwing",
      note: c.r.code === 1600000
        ? "Het resultaat in het bestand gebruikt de belasting met omgekeerd teken (de regel Tax toont −11,3, de optelling rekent met +11,3). Beide waarden blijven zichtbaar; bevestig welke geldt."
        : "Het gerapporteerde totaal komt niet overeen met zijn onderdelen. Beide waarden blijven zichtbaar; bevestig of toelicht.",
    })),
    ...(histBad.length > 0 ? [{
      id: "hist", action: "note" as const, code: histBad[0].r.code,
      test: `Het bestand is zelf niet sluitend in eerdere maanden (${histBad.length})`,
      found: histBad.map((h) => `${h.r.label} ${MONTHS[h.m]}: ${nl(h.rep, 1)} versus ${nl(h.calc, 1)}`).join(" · "),
      outcome: "Waarschuwing" as Outcome,
      note: "In juli staat de RCF van 80k in het totaal langlopende schulden, terwijl hij onder kortlopende schulden is opgenomen. Alleen relevant als je die maand overschrijft.",
    }] : []),
    ...(balBad.length > 0 ? [{
      id: "balance", action: "note" as const, code: raw.balance.assets,
      test: raw.balance.reported ? "Balance check wijkt af van activa minus passiva" : "Balans sluit niet: activa ≠ passiva",
      found: raw.balance.reported
        ? `Het bestand toont 0, maar activa − passiva = ${nl(balBad[balBad.length - 1].d, 2)} (${balBad.length} van ${MONTHS.length} maanden)`
        : balBad.map((b) => `${MONTHS[b.m]} ${nl(b.d, 1)}`).join(" · ") + " (EUR k)",
      outcome: "Waarschuwing" as Outcome,
      note: raw.balance.reported ? "Waarschijnlijk een afrondingsverschil. Bevestig of toelicht." : "In deze maanden komen totaal activa en totaal passiva niet overeen. Beide waarden blijven zichtbaar; bevestig of toelicht.",
    }] : []),
    {
      id: "unmapped", action: "mapping", code: unmappedRows[0]?.code,
      test: `${unmappedRows.length} nieuwe records niet herkend`,
      found: unmappedRows.map((r) => r.label).join(", "),
      outcome: "Blokkerend",
      note: "Deze regels staan nog niet in je koppeling. Koppel ze aan een bestaande metric, vraag een nieuwe metriccode aan bij Alma of sla ze nu over; de rest kan wel worden opgeslagen.",
    },
    {
      id: "ytd", action: "oude", test: raw.id === "A" ? "YTD-aansluiting op de management summary" : "YTD-aansluiting income statement",
      found: ytdDev.length === 0 ? `Alle ${ytdRows.filter((r) => r.sec === "IS").length} regels met een YTD-cijfer sluiten aan` : `${ytdDev.length} regels wijken af van het YTD-cijfer in het bestand`,
      outcome: ytdDev.length === 0 ? "Pass" : "Waarschuwing",
      note: ytdDev.length === 0 ? "Jan t/m Aug sluit aan op het YTD-cijfer in het maandrapport." : "Oude maanden zijn aangepast. Nooit stil corrigeren; kies bij 'Oude maanden' hoe we dit verwerken.",
    },
    ...(hasLtm ? [{
      id: "ltm", action: "oude" as const, test: "LTM-aansluiting (tabblad LTM)",
      found: ltmChecks.map((l) => `${ROW_BY_CODE[l.code].label} ${nl(l.after)} / ${nl(l.inFile)}`).join(" · "),
      outcome: (ltmDev.length === 0 ? "Pass" : "Waarschuwing") as Outcome,
      note: ltmDev.length === 0 ? "LTM Aug in het bestand = LTM uit Alma na verwerking." : "De LTM in het bestand bevat de aangepaste maanden; Alma heeft die nog niet.",
    }] : []),
    ...(raw.claims.length > 0 ? [{
      id: "claims", test: `Management summary klopt met de cijfers (${claimsOk.length} van ${raw.claims.length})`,
      found: raw.claims.map((c) => c.text).join(" · "), outcome: "Pass" as Outcome, note: "De bedragen in de toelichting van het bestuur zijn nagelopen tegen de gelezen cijfers.",
    }] : []),
    ...(normTotal ? [{
      id: "norm", test: `Normalisaties: specificatie sluit aan (${MONTHS.length - normBad.length} van ${MONTHS.length} maanden)`,
      found: `${normSpec.length} regels op het tabblad Normalizations tellen op tot EBITDA Normalizations (1300100)`, outcome: "Pass" as Outcome, note: "De Check-regel in het bestand is 0.",
    }] : []),
    { id: "margins", test: "Marges en ratio's", found: `${ROWS.filter((r) => isPct(r) && hasData(r)).length} regels (bruto-, EBITDA- en andere marges)`, outcome: "Verwacht", note: "Niet opgeslagen; het dashboard rekent ze na." },
    ...(hasLe ? [{ id: "le", test: "Latest estimate FY 2026", found: `LE-kolom gelezen voor ${dataRows.filter((r) => r.le !== null && isStoredRow(r)).length} regels`, outcome: "Verwacht" as Outcome, note: "Wordt opgeslagen als LE; historische maanden blijven ongewijzigd." }] : []),
  ]
  const unmappedOpen = unmappedRows.filter((r) => added[r.code] === undefined && requested[r.code] === undefined)
  const requestedCount = Object.keys(requested).length
  const mappingDone = skipped || unmappedOpen.length === 0
  const isDone = (s: Signal) => (s.id === "unmapped" ? mappingDone : handled[s.id] !== undefined)
  const attention = signals.filter((s) => (s.outcome === "Waarschuwing" || s.outcome === "Blokkerend") && !isDone(s))
  const blockingForSave = attention.filter((s) => s.id !== "ytd" && s.id !== "ltm" && s.id !== "unmapped")
  const counts = { pass: signals.filter((s) => s.outcome === "Pass").length, warn: attention.length }

  const controlsDone = step1 && blockingForSave.length === 0
  const oldDone = allDecided && (tied || uploadComment.trim().length > 0)
  const canSave = step1 && mappingDone && controlsDone && oldDone && !saved
  const fieldCount = Object.values(fieldComments).filter((v) => v.trim()).length
  const overwritten = CHANGED_MONTHS.filter((m) => decisions[m] === "overwrite")
  const corrected = CHANGED_MONTHS.filter((m) => decisions[m] === "current")

  function select(code: number, scroll = true) {
    setSelected(code)
    setSheet(mainTab.name)
    if (scroll) setTimeout(() => document.getElementById(`row-${code}`)?.scrollIntoView({ block: "center", behavior: "smooth" }), 50)
  }
  function openAdd(r: IntakeRow) {
    setAddOpen(r.code); setAddMode("link"); setAddName(""); setAddExisting(""); setSelected(r.code)
  }
  function confirmAdd(r: IntakeRow) {
    if (addMode === "link") {
      if (!addExisting) return
      setAdded((a) => ({ ...a, [r.code]: addExisting }))
    } else {
      setRequested((q) => ({ ...q, [r.code]: addName.trim() }))
    }
    setAddOpen(null)
  }
  function undoMapping(code: number) {
    setAdded((a) => { const n = { ...a }; delete n[code]; return n })
    setRequested((q) => { const n = { ...q }; delete n[code]; return n })
  }
  useEffect(() => {
    if (step1 && tab === "selectie") setTab("mapping")
  }, [step1]) // eslint-disable-line react-hooks/exhaustive-deps

  function setAll(d: Decision) {
    setDecisions(Object.fromEntries(CHANGED_MONTHS.map((m) => [m, d])))
  }
  function handleSave() {
    setSaving(true)
    setTimeout(() => { setSaving(false); setSaved(true) }, 1500)
  }

  // ---------- grid ----------
  const filterOk = (r: IntakeRow) => (filter === "ALL" ? true : filter === "KPIS" ? r.sec === "KPI" || r.sec === "HR" : r.sec === filter)
  const visible = ROWS.filter((r) => filterOk(r) && (showEmpty || hasData(r)))
  const sel = ROW_BY_CODE[selected]
  const filters = ([
    { id: "ALL", label: "Alles" }, { id: "IS", label: "Income statement" }, { id: "BS", label: "Balance sheet" },
    { id: "CF", label: "Cash flow" }, { id: "KPIS", label: "KPI's" },
  ] as { id: "ALL" | Section | "KPIS"; label: string }[]).filter((f) => f.id === "ALL" || f.id === "KPIS" ? (f.id === "ALL" || ROWS.some((r) => r.sec === "KPI" || r.sec === "HR")) : ROWS.some((r) => r.sec === f.id))
  const sections = Array.from(new Set(visible.map((r) => r.sec)))
  const gridSpan = 2 + MONTHS.length + raw.extra.length

  function rowStatus(r: IntakeRow): React.ReactNode {
    if (isUnmapped(r)) {
      return added[r.code] !== undefined
        ? <span className="text-[10px] font-semibold text-[#2F6B4F]">gekoppeld</span>
        : requested[r.code] !== undefined
          ? <span title="Nieuwe metriccode aangevraagd bij Alma" className="text-[10px] font-semibold text-[#2E5F8F]">aangevraagd</span>
          : <span title="Nieuw record, nog niet in je koppeling" className="rounded bg-[#FAEEDA] px-1 text-[10px] font-semibold text-[#854F0B]">nieuw</span>
    }
    if (badCalc.find((b) => b.r.code === r.code)) return <AlertCircle className="h-3.5 w-3.5 text-[#B8975A]" />
    if (isFlow(r) && Math.abs(ytdAfter(r, decisions) - (r.ytd ?? 0)) > ytdTol) return <AlertCircle className="h-3.5 w-3.5 text-[#B8975A]" />
    if (r.calc && r.calc.length > 0) return <Check className="h-3.5 w-3.5 text-[#3B6D11]" />
    return null
  }

  const selCalc = sel ? recalc(sel) : null
  const selBad = sel ? badCalc.find((b) => b.r.code === sel.code) : null
  const selYtdAfter = sel && isFlow(sel) ? ytdAfter(sel, decisions) : null

  const tabs: { id: Tab; label: string; badge?: React.ReactNode }[] = [
    { id: "selectie", label: "Selectie", badge: step1 ? <Check className="h-3 w-3 text-[#3B6D11]" /> : <span className="h-1.5 w-1.5 rounded-full bg-[#B8975A]" /> },
    { id: "mapping", label: "Koppeling", badge: !step1 ? null : mappingDone ? <Check className="h-3 w-3 text-[#3B6D11]" /> : <span className="rounded-full bg-[#B8975A] px-1.5 text-[10px] font-semibold text-white">{unmappedOpen.length}</span> },
    { id: "controles", label: "Controles", badge: !step1 ? null : blockingForSave.length === 0 ? <Check className="h-3 w-3 text-[#3B6D11]" /> : <span className="rounded-full bg-[#B8975A] px-1.5 text-[10px] font-semibold text-white">{blockingForSave.length}</span> },
    { id: "oude", label: "Oude maanden", badge: !step1 ? null : oldDone ? <Check className="h-3 w-3 text-[#3B6D11]" /> : <span className="rounded-full bg-[#B8975A] px-1.5 text-[10px] font-semibold text-white">{CHANGED_MONTHS.length}</span> },
    { id: "toelichting", label: "Toelichting" },
    { id: "opslaan", label: "Opslaan", badge: saved ? <Check className="h-3 w-3 text-[#3B6D11]" /> : null },
  ]

  const extraVal = (r: IntakeRow, key: "ytd" | "le" | "ly") => (key === "ytd" ? r.ytd : key === "le" ? r.le : r.ly)
  const keyLines = KEY_LINES.filter((c) => ROW_BY_CODE[c]?.ytd !== null && ROW_BY_CODE[c]?.ytd !== undefined)

  return (
    <div className="flex h-screen flex-col font-sans">
      {/* Header */}
      <div className="border-b border-[#E8E6E0] bg-white px-6 py-3">
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-1.5 text-[12px] font-medium text-[#1B4D45] hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Upload Data
          </button>
        )}
        <div className="mt-1.5 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="truncate text-[16px] font-semibold text-[#2C2C2A]">{FILE_NAME}</span>
            <span className="shrink-0 rounded bg-[#E1F5EE] px-1.5 py-0.5 text-[10px] font-medium text-[#1B4D45]">{raw.formatName}</span>
            <span className="shrink-0 text-[13px] text-[#6B6963]">{COMPANY} · {PERIOD}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-[12px]">
            <Pill outcome="Pass">{counts.pass} in orde</Pill>
            {counts.warn > 0 && <Pill outcome="Waarschuwing">{counts.warn} te beoordelen</Pill>}
            <span className={cn("rounded-full px-3 py-1 text-[12px] font-medium", saved ? "bg-[#E1F5EE] text-[#3B6D11]" : "bg-[#FDF8F0] text-[#B8975A]")}>
              {saved ? "Geïmporteerd" : "Awaiting approval"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* LEFT: the sheet */}
        <div className="flex min-w-0 flex-1 flex-col bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8E6E0] px-4 py-2">
            <div className="flex flex-wrap items-center gap-1">
              <FileSpreadsheet className="mr-1 h-4 w-4 text-[#1B4D45]" />
              {raw.tabs.map((t) => (
                <button key={t.name} onClick={() => setSheet(t.name)} className={cn("rounded-md px-3 py-1 text-[13px]", sheet === t.name ? "bg-[#1B4D45] font-medium text-white" : "text-[#6B6963] hover:bg-[#F7F6F3]")}>{t.name}</button>
              ))}
            </div>
            {activeKind === "main" && (
              <div className="flex flex-wrap items-center gap-1.5">
                {filters.map((f) => (
                  <button key={f.id} onClick={() => setFilter(f.id)} className={cn("rounded-full border px-2.5 py-0.5 text-[12px]", filter === f.id ? "border-[#1B4D45] bg-[#E1F5EE] font-medium text-[#1B4D45]" : "border-[#E8E6E0] text-[#6B6963] hover:border-[#D4C5A9]")}>{f.label}</button>
                ))}
                {emptyCount > 0 && (
                  <label className="ml-1 flex cursor-pointer items-center gap-1.5 text-[12px] text-[#6B6963]">
                    <input type="checkbox" checked={showEmpty} onChange={(e) => setShowEmpty(e.target.checked)} className="accent-[#1B4D45]" />
                    Lege regels ({emptyCount})
                  </label>
                )}
              </div>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            {activeKind === "main" && (
              <table className="w-full min-w-[640px] border-separate border-spacing-0 text-[11.5px] [font-variant-numeric:tabular-nums]">
                <thead className="sticky top-0 z-20">
                  <tr className="bg-[#F7F6F3] text-[11px] uppercase tracking-wide text-[#6B6963]">
                    <th className="sticky left-0 z-30 min-w-[200px] border-b border-[#E8E6E0] bg-[#F7F6F3] px-2 py-1.5 text-left font-medium">Regel · In EUR k</th>
                    {MONTHS.map((m, i) => (
                      <th key={m} className={cn("min-w-[48px] border-b border-[#E8E6E0] px-1.5 py-1.5 text-right font-medium", i === CURRENT && "bg-[#DDEFE5] text-[#2F6B4F]")}>{m}</th>
                    ))}
                    {raw.extra.map((e, i) => (
                      <th key={e.key} className={cn("min-w-[56px] border-b border-[#E8E6E0] px-1.5 py-1.5 text-right font-medium", i === 0 && "border-l")}>{e.label}</th>
                    ))}
                    <th className="w-14 border-b border-[#E8E6E0] px-2 py-1.5" />
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
                          <tr key={r.code} id={`row-${r.code}`} onClick={() => select(r.code, false)} className={cn("cursor-pointer", active ? "bg-[#EAF4EF]" : "hover:bg-[#FAF9F6]")}>
                            <td className={cn("sticky left-0 z-10 border-b border-[#F2F0EB] px-2 py-[3px]", active ? "bg-[#EAF4EF]" : "bg-white", total && "font-semibold")}>
                              <div className={cn("flex items-baseline gap-2", r.kind === "DATA" && "pl-3", pct && "pl-6 text-[11px] italic text-[#6B6963]")}>
                                <span className="truncate">{r.label}</span>
                                <span className="font-mono text-[10.5px] font-normal not-italic text-[#B5B2A8]">{r.code}</span>
                              </div>
                              {r.alias && <div className="pl-3 text-[11px] font-normal text-[#2E5F8F]">→ Alma: {r.alias}</div>}
                            </td>
                            {r.v.map((v, m) => {
                              const changed = r.alma?.[String(m)] !== undefined
                              return (
                                <td key={m} title={changed ? `In Alma: ${fmtVal(r, almaAt(r, m))}` : undefined} className={cn("border-b border-[#F2F0EB] px-1.5 py-[3px] text-right", total && "font-semibold", pct && "text-[11px] text-[#6B6963]", m === CURRENT && "bg-[#F1F9F4]", changed && "bg-[#FAEEDA]", active && m === CURRENT && "outline outline-2 outline-[#1B4D45] [outline-offset:-2px]")}>
                                  {fmtVal(r, v)}
                                </td>
                              )
                            })}
                            {raw.extra.map((e, i) => (
                              <td key={e.key} className={cn("border-b border-[#F2F0EB] px-1.5 py-[3px] text-right", i === 0 && "border-l", total && "font-semibold", e.key === "ytd" && ytdBad && "bg-[#FAEEDA] text-[#854F0B]", (pct || e.key !== "ytd") && "text-[#6B6963]")}>
                                {fmtVal(r, extraVal(r, e.key))}
                              </td>
                            ))}
                            <td className="border-b border-[#F2F0EB] px-2 py-[3px] text-center">{rowStatus(r)}</td>
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
                  <tr className="bg-[#F7F6F3] text-[11px] uppercase tracking-wide text-[#6B6963]">
                    <th className="sticky left-0 z-30 min-w-[200px] border-b border-[#E8E6E0] bg-[#F7F6F3] px-2 py-1.5 text-left font-medium">LTM · In EUR k</th>
                    {MONTHS.map((m, i) => <th key={m} className={cn("min-w-[52px] border-b border-[#E8E6E0] px-1.5 py-1.5 text-right font-medium", i === CURRENT && "bg-[#DDEFE5] text-[#2F6B4F]")}>{m}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {LTM_ROWS.filter((l) => l.v.some((x) => x)).map((l) => {
                    const total = l.kind !== "DATA"
                    const pct = l.label.includes("%")
                    return (
                      <tr key={l.code} className="hover:bg-[#FAF9F6]">
                        <td className={cn("sticky left-0 z-10 border-b border-[#F2F0EB] bg-white px-2 py-[3px]", total && "font-semibold")}>
                          <div className={cn("flex items-baseline gap-2", l.kind === "DATA" && "pl-3", pct && "pl-6 text-[11px] italic text-[#6B6963]")}>
                            <span className="truncate">{l.label}</span>
                            <span className="font-mono text-[10.5px] font-normal not-italic text-[#B5B2A8]">{l.code}</span>
                          </div>
                        </td>
                        {l.v.map((v, m) => (
                          <td key={m} className={cn("border-b border-[#F2F0EB] px-1.5 py-[3px] text-right", total && "font-semibold", m === CURRENT && "bg-[#F1F9F4]", pct && "text-[11px] text-[#6B6963]")}>
                            {v === null ? "" : pct ? nl(v, 1) + "%" : fmtAmt(v)}
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
                  <tr className="bg-[#F7F6F3] text-[11px] uppercase tracking-wide text-[#6B6963]">
                    <th className="sticky left-0 z-30 min-w-[260px] border-b border-[#E8E6E0] bg-[#F7F6F3] px-2 py-1.5 text-left font-medium">Normalizations specification · EUR k</th>
                    {MONTHS.map((m, i) => <th key={m} className={cn("min-w-[52px] border-b border-[#E8E6E0] px-1.5 py-1.5 text-right font-medium", i === CURRENT && "bg-[#DDEFE5] text-[#2F6B4F]")}>{m}</th>)}
                    <th className="min-w-[56px] border-b border-l border-[#E8E6E0] px-1.5 py-1.5 text-right font-medium">YTD</th>
                  </tr>
                </thead>
                <tbody>
                  {NORM_ROWS.map((n, i) => (
                    <tr key={i} className={cn(n.kind === "RANGE" && "font-semibold", n.kind === "CHECK" && "text-[#6B6963]")}>
                      <td className="sticky left-0 z-10 border-b border-[#F2F0EB] bg-white px-2 py-[3px]"><span className={cn(n.kind === "DATA" && "pl-3", n.kind === "SPEC" && "pl-3")}>{n.label}</span></td>
                      {n.v.map((v, m) => <td key={m} className={cn("border-b border-[#F2F0EB] px-1.5 py-[3px] text-right", m === CURRENT && "bg-[#F1F9F4]")}>{v === null || v === 0 ? "" : nl(v, 1)}</td>)}
                      <td className="border-b border-l border-[#F2F0EB] px-1.5 py-[3px] text-right text-[#6B6963]">{n.ytd === null || n.ytd === 0 ? "" : nl(n.ytd, 1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeKind === "summary" && (
              <div className="mx-auto max-w-[900px] space-y-4 p-5 text-[13.5px] leading-relaxed text-[#2C2C2A]">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-[#9A988F]">Comment of the board · Management summary!C4</div>
                  <p className="mt-1">{raw.board}</p>
                </div>
                <table className="w-full border-separate border-spacing-0 text-[13px]">
                  <thead><tr className="text-left text-[11px] uppercase tracking-wide text-[#9A988F]"><th className="w-[130px] pb-1 font-medium">Onderdeel</th><th className="pb-1 font-medium">Month performance</th><th className="pb-1 font-medium">YTD performance</th></tr></thead>
                  <tbody>
                    {(raw.summary ?? []).map((s) => (
                      <tr key={s.label} className="align-top"><td className="border-t border-[#F2F0EB] py-2 pr-3 font-semibold">{s.label}</td><td className="border-t border-[#F2F0EB] py-2 pr-3">{s.month}</td><td className="border-t border-[#F2F0EB] py-2">{s.ytd}</td></tr>
                    ))}
                  </tbody>
                </table>
                {(raw.summaryExtra ?? []).map((s) => (
                  <div key={s.label}><div className="text-[11px] font-semibold uppercase tracking-wide text-[#9A988F]">{s.label}</div><p className="mt-1">{s.text}</p></div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 border-t border-[#E8E6E0] bg-[#FBFAF7] px-4 py-2 text-[12px] text-[#6B6963]">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-[#F1F9F4] ring-1 ring-[#BFDCCB]" />Nieuwe maand ({PERIOD})</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-[#FAEEDA] ring-1 ring-[#E8CFA0]" />Verschilt van wat Alma al had</span>
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#3B6D11]" />Totaal nagerekend</span>
            <span className="flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5 text-[#B8975A]" />Aandacht nodig</span>
          </div>
        </div>

        {/* RIGHT: workflow */}
        <div className={cn("flex shrink-0 flex-col border-l border-[#E8E6E0] bg-[#FBFAF7]", wide ? "w-[68%]" : "w-[44%] min-w-[520px]")}>
          {sel && (
            <div className="border-b border-[#E8E6E0] bg-white px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[12px] font-medium uppercase tracking-wide text-[#9A988F]">Geselecteerde regel</div>
                  <div className="text-[15px] font-semibold text-[#2C2C2A]">{sel.label}</div>
                  <div className="text-[13px] text-[#6B6963]"><span className="font-mono">{sel.code}</span>{sel.alias ? ` · Alma: ${sel.alias}` : ""}</div>
                </div>
                <span className="rounded bg-[#F7F6F3] px-1.5 py-0.5 font-mono text-[12px] text-[#1B4D45]">{cellRef(sel, CURRENT)}</span>
              </div>
              <dl className="mt-2 space-y-1 text-[13.5px]">
                <div className="flex justify-between"><dt className="text-[#6B6963]">In het bestand ({MONTHS[CURRENT]})</dt><dd className="font-medium">{fmtVal(sel, sel.v[CURRENT])}</dd></div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#6B6963]">Opgeslagen in Alma</dt>
                  <dd className="text-right font-medium">
                    {isUnmapped(sel) ? (added[sel.code] !== undefined
                      ? <span className="text-[#2F6B4F]">gekoppeld aan {added[sel.code]}</span>
                      : requested[sel.code] !== undefined
                        ? <span className="text-[#2E5F8F]">metriccode aangevraagd bij Alma</span>
                        : <button onClick={() => { setTab("mapping"); openAdd(sel) }} className="rounded-md bg-[#FAEEDA] px-2 py-0.5 text-[13px] font-semibold text-[#854F0B]">Nieuw record, koppelen</button>)
                      : isPct(sel) ? <span className="font-normal text-[#6B6963]">niet opgeslagen, herberekend</span>
                      : <>{fmtAmt(stored(sel, sel.v[CURRENT] ?? 0))}{sel.flip ? <span className="font-normal text-[#6B6963]"> ({sel.flip === "credit" ? "passiva, negatief" : "teken omgedraaid"})</span> : null}</>}
                  </dd>
                </div>
                {selCalc !== null && !sel.pct && (
                  <div className="flex justify-between"><dt className="text-[#6B6963]">Herberekend</dt><dd className={cn("font-medium", selBad ? "text-[#854F0B]" : "text-[#2F6B4F]")}>{nl(selCalc, 1)} {selBad ? `(verschil ${nl(selBad.diff, 1)})` : "✓"}</dd></div>
                )}
                {selYtdAfter !== null && (
                  <div className="flex justify-between"><dt className="text-[#6B6963]">YTD Alma na verwerking / bestand</dt><dd className={cn("font-medium", Math.abs(selYtdAfter - (sel.ytd ?? 0)) > ytdTol ? "text-[#854F0B]" : "text-[#2F6B4F]")}>{fmtAmt(selYtdAfter)} / {fmtAmt(sel.ytd ?? 0)}</dd></div>
                )}
              </dl>
              {isStoredRow(sel) && !isUnmapped(sel) && (
                <input value={fieldComments[sel.code] ?? ""} onChange={(e) => setFieldComments((s) => ({ ...s, [sel.code]: e.target.value }))} placeholder="Opmerking bij dit datapunt (bedrijf, periode, metric)" className="mt-2 w-full rounded-md border border-[#E8E6E0] bg-[#F4F8FC] px-2.5 py-1.5 text-[13.5px] outline-none focus:border-[#2E6FB0]" />
              )}
            </div>
          )}

          <div className="flex border-b border-[#E8E6E0] bg-white px-2">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} disabled={!step1 && t.id !== "selectie"} className={cn("flex items-center gap-1.5 border-b-2 px-2.5 py-2.5 text-[13.5px] disabled:cursor-not-allowed disabled:opacity-40", tab === t.id ? "border-[#1B4D45] font-semibold text-[#1B4D45]" : "border-transparent text-[#6B6963] hover:text-[#2C2C2A]")}>
                {t.label}{t.badge}
              </button>
            ))}
            <button onClick={() => setWide((w) => !w)} title="Paneel groter of kleiner" className="ml-auto shrink-0 self-center whitespace-nowrap rounded-md px-2 py-1 text-[13px] text-[#6B6963] hover:bg-[#F7F6F3]">
              {wide ? "Kleiner ↔" : "Groter ↔"}
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 text-[14px] text-[#2C2C2A]">
            {saving && <div className="mb-3 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[13.5px] text-[#6B6963]"><Loader2 className="h-4 w-4 animate-spin" />Opslaan…</div>}

            {tab === "selectie" && (
              <div className="space-y-3">
                <div className="rounded-[10px] border border-[#E8E6E0] bg-white p-4">
                  <dl className="space-y-2">
                    <div className="flex justify-between"><dt className="text-[#6B6963]">Documentsoort</dt><dd>Maandrapportage (Excel)</dd></div>
                    <div className="flex justify-between"><dt className="text-[#6B6963]">Bedrijf</dt><dd>{COMPANY}</dd></div>
                    <div className="flex justify-between"><dt className="text-[#6B6963]">Periode</dt><dd>{PERIOD}</dd></div>
                    <div className="flex justify-between"><dt className="text-[#6B6963]">Indeling</dt><dd className="text-right">{raw.formatName}</dd></div>
                    <div className="flex justify-between"><dt className="text-[#6B6963]">Eenheid</dt><dd>{raw.unitNote}</dd></div>
                  </dl>
                  <p className="mt-2 text-[13px] text-[#9A988F]">Documentsoort en periode koos je voor het uploaden; het bedrijf volgt uit je login.</p>
                </div>
                <div className="flex items-start gap-2 rounded-lg bg-[#DDEFE5] px-3 py-2.5 text-[13.5px] text-[#2F6B4F]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>De AI controleert je keuze: kolomkop en laatst ingevulde maand in het bestand zijn {PERIOD}. Geen afwijking.</span>
                </div>
                {!step1 && <button onClick={() => setStep1(true)} className="w-full rounded-lg bg-[#1B4D45] px-4 py-2.5 text-[14px] font-medium text-white hover:bg-[#164039]">Selectie klopt, door naar de koppeling</button>}
              </div>
            )}

            {tab === "mapping" && (
              <div className="space-y-4">
                <div className="rounded-[10px] border border-[#E8E6E0] bg-white p-4">
                  <div className="text-[15px] font-semibold">Koppeling aan het datamodel</div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-[#DDEFE5] px-2 py-2.5"><div className="text-[22px] font-semibold text-[#2F6B4F]">{storedRows.length - Object.keys(added).length}</div><div className="text-[13px] text-[#2F6B4F]">herkend</div></div>
                    <div className="rounded-lg bg-[#E3EDF7] px-2 py-2.5"><div className="text-[22px] font-semibold text-[#2E5F8F]">{aliasRows.length}</div><div className="text-[13px] text-[#2E5F8F]">andere naam</div></div>
                    <div className={cn("rounded-lg px-2 py-2.5", mappingDone ? "bg-[#DDEFE5]" : "bg-[#FAEEDA]")}><div className={cn("text-[22px] font-semibold", mappingDone ? "text-[#2F6B4F]" : "text-[#854F0B]")}>{unmappedOpen.length}</div><div className={cn("text-[13px]", mappingDone ? "text-[#2F6B4F]" : "text-[#854F0B]")}>nieuw</div></div>
                  </div>
                  <p className="mt-3 text-[14px] leading-relaxed text-[#4A4A44]">De eerste keer controleer je de koppeling. Alma onthoudt die daarna: volgende maanden hoef je alleen nieuwe records te koppelen. Zie in het bestand links per regel waar elke waarde terechtkomt.</p>
                  <p className="mt-2 rounded-lg bg-[#F7F6F3] px-3 py-2 text-[13.5px] leading-relaxed text-[#4A4A44]">Een nieuw record koppel je aan een bestaande metric. Past er geen, dan vraag je een nieuwe metriccode aan bij Alma. Alleen Alma maakt metrics aan, zodat het datamodel voor iedereen hetzelfde blijft.</p>
                </div>

                {unmappedRows.length > 0 && (
                  <div>
                    <div className="mb-2 text-[15px] font-semibold">Nieuwe records, niet herkend</div>
                    <div className="space-y-2">
                      {unmappedRows.map((r) => {
                        const linked = added[r.code]
                        const asked = requested[r.code]
                        const done = linked !== undefined || asked !== undefined
                        const open = addOpen === r.code
                        return (
                          <div key={r.code} className={cn("rounded-[10px] border bg-white p-3", linked !== undefined ? "border-[#BFDCCB]" : asked !== undefined ? "border-[#C9D9EA]" : "border-[#EBD9B5]")}>
                            <div className="flex items-center justify-between gap-2">
                              <button onClick={() => select(r.code)} className="min-w-0 text-left">
                                <div className="truncate text-[14.5px] font-medium">{r.label}</div>
                                <div className="text-[13px] text-[#6B6963]"><span className="font-mono">{r.code}</span> · {MONTHS[CURRENT]}: {fmtVal(r, r.v[CURRENT])} · <span className="font-mono">{cellRef(r, CURRENT)}</span></div>
                              </button>
                              {done ? (
                                <div className="shrink-0 text-right">
                                  <div className={cn("text-[13.5px] font-medium", linked !== undefined ? "text-[#2F6B4F]" : "text-[#2E5F8F]")}>{linked !== undefined ? `✓ gekoppeld aan ${linked}` : "Aangevraagd bij Alma"}</div>
                                  <button onClick={() => undoMapping(r.code)} className="text-[12px] text-[#6B6963] underline underline-offset-2">Wijzig</button>
                                </div>
                              ) : (
                                <button onClick={() => (open ? setAddOpen(null) : openAdd(r))} className="shrink-0 rounded-md bg-[#1B4D45] px-3 py-1.5 text-[13.5px] font-medium text-white hover:bg-[#164039]">{open ? "Sluiten" : "Koppelen"}</button>
                              )}
                            </div>
                            {asked !== undefined && asked && <div className="mt-1.5 text-[13px] text-[#6B6963]">Je toelichting: {asked}</div>}
                            {open && !done && (
                              <div className="mt-3 space-y-2 border-t border-[#F2F0EB] pt-3 text-[13.5px]">
                                <label className="flex cursor-pointer items-center gap-2"><input type="radio" checked={addMode === "link"} onChange={() => setAddMode("link")} className="accent-[#1B4D45]" />Koppelen aan een bestaande metric</label>
                                {addMode === "link" && (
                                  <select value={addExisting} onChange={(e) => setAddExisting(e.target.value)} className="ml-6 w-[calc(100%-1.5rem)] rounded-md border border-[#E8E6E0] bg-white px-2.5 py-1.5 text-[13.5px] outline-none focus:border-[#1B4D45]">
                                    <option value="">Kies een metric…</option>
                                    {ROWS.filter((x) => isStoredRow(x) && !isUnmapped(x) && hasData(x) && x.kind === "DATA").map((x) => <option key={x.code} value={x.alias ?? x.label}>{x.alias ?? x.label} ({x.code})</option>)}
                                  </select>
                                )}
                                <label className="flex cursor-pointer items-center gap-2"><input type="radio" checked={addMode === "request"} onChange={() => setAddMode("request")} className="accent-[#1B4D45]" />Geen passende metric: nieuwe metriccode aanvragen bij Alma</label>
                                {addMode === "request" && (
                                  <div className="space-y-1.5 pl-6">
                                    <input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Waarvoor gebruik je deze regel? (optioneel)" className="w-full rounded-md border border-[#E8E6E0] px-2.5 py-1.5 text-[13.5px] outline-none focus:border-[#1B4D45]" />
                                    <p className="text-[13px] text-[#6B6963]">Alma beoordeelt het verzoek en kent de code toe. Tot die tijd wordt deze regel niet opgeslagen; zodra de code er is, wordt hij de volgende maand herkend.</p>
                                  </div>
                                )}
                                <div className="flex items-center justify-between pt-1">
                                  <span className="text-[13px] text-[#6B6963]">{addMode === "link" ? "Wordt onthouden voor volgende maanden." : "Er wordt een verzoek naar Alma gestuurd."}</span>
                                  <button onClick={() => confirmAdd(r)} disabled={addMode === "link" && !addExisting} className="rounded-md bg-[#1B4D45] px-3 py-1.5 text-[13.5px] font-medium text-white disabled:bg-[#B9C7C3]">{addMode === "link" ? "Koppelen en onthouden" : "Verzoek versturen"}</button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    {!mappingDone && (
                      <label className="mt-3 flex cursor-pointer items-center gap-2 text-[13.5px] text-[#6B6963]">
                        <input type="checkbox" checked={skipped} onChange={(e) => setSkipped(e.target.checked)} className="accent-[#1B4D45]" />
                        Voor nu overslaan: deze regels worden niet opgeslagen
                      </label>
                    )}
                  </div>
                )}

                {aliasRows.length > 0 && (
                  <div>
                    <div className="mb-2 text-[15px] font-semibold">Andere naam in het bestand</div>
                    <div className="divide-y divide-[#F2F0EB] rounded-[10px] border border-[#E8E6E0] bg-white">
                      {aliasRows.map((r) => (
                        <button key={r.code} onClick={() => select(r.code)} className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13.5px] hover:bg-[#FAF9F6]">
                          <span className="truncate">{r.label}</span>
                          <span className="shrink-0 text-[#2E5F8F]">→ {r.alias}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {mappingDone && <button onClick={() => setTab("controles")} className="w-full rounded-lg bg-[#1B4D45] px-4 py-2.5 text-[14.5px] font-medium text-white hover:bg-[#164039]">Koppeling klopt, door naar de controles</button>}
              </div>
            )}

            {tab === "controles" && (
              <div className="space-y-2.5">
                <p className="text-[13.5px] text-[#6B6963]">Eerst wat je moet beoordelen, daaronder wat in orde is. Klik op een controle om de regel in het bestand te zien.</p>
                {[...signals.filter((s) => s.outcome === "Blokkerend" || s.outcome === "Waarschuwing"), ...(showPass ? signals.filter((s) => s.outcome === "Pass" || s.outcome === "Verwacht") : [])].map((s) => {
                  const done = isDone(s)
                  const linkable = s.code !== undefined
                  return (
                    <div key={s.id} className={cn("rounded-[10px] border bg-white p-3", done ? "border-[#E8E6E0]" : s.outcome === "Blokkerend" ? "border-[#EFC9C4]" : s.outcome === "Waarschuwing" ? "border-[#EBD9B5]" : "border-[#E8E6E0]")}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-[14px] font-semibold leading-snug">{s.test}</div>
                        <Pill outcome={done ? "Pass" : s.outcome}>{done ? "Bevestigd" : s.outcome}</Pill>
                      </div>
                      <div className="mt-1 text-[13.5px] text-[#4A4A44]">{s.found}</div>
                      <div className="mt-1 text-[13px] text-[#6B6963]">{done ? `Toelichting CFO: ${handled[s.id] || "akkoord"}` : s.note}</div>
                      <div className="mt-2.5 flex flex-wrap items-center gap-3">
                        {linkable && s.action !== "mapping" && <button onClick={() => select(s.code!)} className="text-[13px] font-medium text-[#1B4D45] underline underline-offset-2">Toon in bestand</button>}
                        {s.action === "mapping" && !done && <button onClick={() => setTab("mapping")} className="rounded-md border border-[#1B4D45] px-3 py-1.5 text-[13px] font-medium text-[#1B4D45] hover:bg-[#E1F5EE]">Naar Koppeling</button>}
                        {s.action === "note" && !done && (openSignal === s.id ? (
                          <div className="flex w-full gap-2">
                            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Toelichting (optioneel)" className="min-w-0 flex-1 rounded-md border border-[#E8E6E0] px-2.5 py-1.5 text-[13.5px] outline-none focus:border-[#1B4D45]" />
                            <button onClick={() => { setHandled((h) => ({ ...h, [s.id]: draft.trim() })); setOpenSignal(null); setDraft("") }} className="rounded-md bg-[#1B4D45] px-3 py-1.5 text-[13.5px] font-medium text-white">Bevestig</button>
                          </div>
                        ) : <button onClick={() => { setOpenSignal(s.id); setDraft("") }} className="rounded-md border border-[#1B4D45] px-3 py-1 text-[13px] font-medium text-[#1B4D45] hover:bg-[#E1F5EE]">Akkoord of toelichten</button>)}
                        {s.action === "oude" && s.outcome === "Waarschuwing" && <button onClick={() => setTab("oude")} className="rounded-md border border-[#1B4D45] px-3 py-1 text-[13px] font-medium text-[#1B4D45] hover:bg-[#E1F5EE]">Naar Oude maanden</button>}
                      </div>
                    </div>
                  )
                })}
                <button onClick={() => setShowPass((v) => !v)} className="flex items-center gap-1.5 text-[13.5px] font-medium text-[#6B6963] hover:text-[#2C2C2A]">
                  {showPass ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  {showPass ? "Verberg" : "Toon"} {signals.filter((s) => s.outcome === "Pass" || s.outcome === "Verwacht").length} controles in orde of verwacht
                </button>
              </div>
            )}

            {tab === "oude" && (
              <div className="space-y-3">
                {CHANGED_MONTHS.length === 0 ? (
                  <div className="rounded-[10px] border border-[#E8E6E0] bg-white p-4 text-[14px]">Er zijn geen oude maanden aangepast.</div>
                ) : (
                  <>
                    <div className="rounded-[10px] border border-[#EBD9B5] bg-[#FFFDF8] p-3">
                      <div className="text-[14px] font-semibold">{CHANGED_MONTHS.map((m) => MONTHS[m]).join(" en ")} zijn aangepast door het bedrijf</div>
                      <p className="mt-1 text-[13.5px] text-[#6B6963]">De YTD uit dit bestand sluit daardoor niet meer aan op wat Alma had ({ytdDevBefore.length} regels wijken af). Alma corrigeert niets zonder jouw keuze.</p>
                      <button onClick={() => setAll("overwrite")} className="mt-2 rounded-lg border border-[#1B4D45] px-3 py-1.5 text-[13.5px] font-medium text-[#1B4D45] hover:bg-[#E1F5EE]">Hele maand overschrijven, voor alle aangepaste maanden</button>
                    </div>
                    {CHANGED_MONTHS.map((m) => {
                      const lines = ROWS.filter((r) => r.kind === "DATA" && r.alma?.[String(m)] !== undefined)
                      const totalsHit = ROWS.filter((r) => r.kind !== "DATA" && r.alma?.[String(m)] !== undefined && !isPct(r)).length
                      return (
                        <div key={m} className="rounded-[10px] border border-[#E8E6E0] bg-white p-3">
                          <div className="text-[14px] font-semibold">{MONTHS[m]} 2026</div>
                          <ul className="mt-1.5 space-y-0.5 text-[13.5px]">
                            {lines.map((r) => (
                              <li key={r.code} className="flex justify-between gap-2">
                                <button onClick={() => select(r.code)} className="truncate text-left text-[#2C2C2A] underline-offset-2 hover:underline">{r.label}</button>
                                <span className="shrink-0 tabular-nums text-[#6B6963]">{fmtAmt(almaAt(r, m))} → {fmtAmt(r.v[m] ?? 0)} <span className="text-[#854F0B]">({diffAt(r, m) > 0 ? "+" : ""}{fmtAmt(diffAt(r, m))})</span></span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-1 text-[13px] text-[#9A988F]">en {totalsHit} totaalregels die daarvan afhangen</div>
                          <div className="mt-2 space-y-1.5 border-t border-[#F2F0EB] pt-2">
                            {([
                              ["overwrite", `Hele maand ${MONTHS[m]} overschrijven met het bestand`],
                              ["current", `Verschil verwerken in ${MONTHS[CURRENT]} (oude maand blijft zoals hij was)`],
                              ["keep", "Alma-waarde laten staan"],
                            ] as [Decision, string][]).map(([d, label]) => (
                              <label key={d} className="flex cursor-pointer items-center gap-2 text-[13.5px]">
                                <input type="radio" name={`m-${m}`} checked={decisions[m] === d} onChange={() => setDecisions((s) => ({ ...s, [m]: d }))} className="accent-[#1B4D45]" />
                                {label}
                              </label>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                    <div className="rounded-[10px] border border-[#E8E6E0] bg-white">
                      <div className="border-b border-[#E8E6E0] px-3 py-2 text-[12px] font-medium uppercase tracking-wide text-[#9A988F]">YTD Jan–{MONTHS[CURRENT]} na verwerking{raw.id === "A" ? " (volgens management summary)" : ""}</div>
                      {keyLines.map((c) => {
                        const r = ROW_BY_CODE[c]; const a = ytdAfter(r, decisions); const d = a - (r.ytd ?? 0)
                        const ok = Math.abs(d) <= ytdTol
                        return (
                          <div key={c} className="flex items-center justify-between gap-2 border-b border-[#F7F6F3] px-3 py-1.5 text-[13.5px] tabular-nums">
                            <span className="min-w-0 flex-1 truncate font-medium">{r.label}</span>
                            <span className="text-[#6B6963]">Alma {fmtAmt(a)} · bestand {fmtAmt(r.ytd ?? 0)}</span>
                            <Pill outcome={ok ? "Pass" : "Waarschuwing"}>{ok ? "sluit aan" : nl(d, 1)}</Pill>
                          </div>
                        )
                      })}
                      <div className="px-3 py-1.5 text-[13px] text-[#6B6963]">{ytdRows.length - ytdDev.length} van {ytdRows.length} regels met een YTD-cijfer sluiten aan.</div>
                    </div>
                    {hasLtm && (
                      <div className="rounded-[10px] border border-[#E8E6E0] bg-white">
                        <div className="border-b border-[#E8E6E0] px-3 py-2 text-[12px] font-medium uppercase tracking-wide text-[#9A988F]">LTM {MONTHS[CURRENT]} (tabblad LTM)</div>
                        {ltmChecks.map((l) => {
                          const d = l.after - l.inFile
                          return (
                            <div key={l.code} className="flex items-center justify-between gap-2 border-b border-[#F7F6F3] px-3 py-1.5 text-[13.5px] tabular-nums">
                              <span className="min-w-0 flex-1 truncate font-medium">{ROW_BY_CODE[l.code].label}</span>
                              <span className="text-[#6B6963]">Alma {fmtAmt(l.after)} · bestand {fmtAmt(l.inFile)}</span>
                              <Pill outcome={Math.abs(d) < 0.05 ? "Pass" : "Waarschuwing"}>{Math.abs(d) < 0.05 ? "sluit aan" : nl(d, 1)}</Pill>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    {corrected.length > 0 && <div className="rounded-lg bg-[#FAEEDA] px-3 py-2 text-[13.5px] text-[#854F0B]">{MONTHS[CURRENT]} wordt in Alma anders opgeslagen dan in het bestand, omdat het verschil van {corrected.map((m) => MONTHS[m]).join(" en ")} daarin is verwerkt.</div>}
                    {allDecided && !tied && <div className="rounded-lg bg-[#FAEEDA] px-3 py-2 text-[13.5px] text-[#854F0B]">YTD sluit nog niet aan. Leg de reden vast bij Toelichting om door te kunnen.</div>}
                  </>
                )}
              </div>
            )}

            {tab === "toelichting" && (
              <div className="space-y-4">
                <div>
                  <div className="text-[14px] font-semibold">Bij een datapunt <span className="font-normal text-[#9A988F]">· {fieldCount} geplaatst{raw.id === "A" ? ", voorgesteld uit de management summary" : ""}</span></div>
                  <p className="text-[13.5px] text-[#6B6963]">Selecteer een regel in het bestand en typ de opmerking bovenaan dit paneel. Ze horen bij bedrijf, periode en metric.</p>
                  {Object.entries(fieldComments).filter(([, v]) => v.trim()).map(([k, v]) => (
                    <button key={k} onClick={() => select(Number(k))} className="mt-1.5 block w-full rounded-md bg-[#F4F8FC] px-2.5 py-1.5 text-left text-[13.5px]"><span className="font-medium">{ROW_BY_CODE[Number(k)].alias ?? ROW_BY_CODE[Number(k)].label}:</span> {v}</button>
                  ))}
                </div>
                <div>
                  <label className="text-[14px] font-semibold">Bij deze upload <span className="font-normal text-[#9A988F]">· voorgesteld uit het bestand</span></label>
                  <textarea value={uploadComment} onChange={(e) => setUploadComment(e.target.value)} rows={6} className="mt-1.5 w-full rounded-md border border-[#E8E6E0] bg-white px-3 py-2 text-[13.5px] leading-relaxed outline-none focus:border-[#1B4D45]" />
                </div>
                <div>
                  <label className="text-[14px] font-semibold">Context rond het bedrijf</label>
                  <textarea value={contextComment} onChange={(e) => setContextComment(e.target.value)} rows={4} className="mt-1.5 w-full rounded-md border border-[#E8E6E0] bg-white px-3 py-2 text-[13.5px] leading-relaxed outline-none focus:border-[#1B4D45]" />
                </div>
              </div>
            )}

            {tab === "opslaan" && (
              <div className="space-y-3">
                {saved ? (
                  <div className="space-y-2 rounded-[10px] border border-[#BFDCCB] bg-[#F1F9F4] p-4">
                    <div className="flex items-center gap-2 text-[15px] font-semibold text-[#3B6D11]"><CheckCircle2 className="h-5 w-5" />{PERIOD} staat in Alma</div>
                    <p className="text-[14px]">{storedRows.length} regels opgeslagen voor {COMPANY}{overwritten.length ? `, ${overwritten.map((m) => MONTHS[m]).join(" en ")} overschreven` : ""}{corrected.length ? `, verschil in ${MONTHS[CURRENT]} verwerkt` : ""}. {Object.keys(added).length > 0 ? `${Object.keys(added).length} nieuwe records zijn gekoppeld aan een bestaande metric en worden de volgende maand herkend. ` : ""}{requestedCount > 0 ? `${requestedCount} verzoeken om een nieuwe metriccode zijn naar Alma gestuurd. ` : ""}{unmappedOpen.length > 0 ? `${unmappedOpen.length} nieuwe records zijn overgeslagen. ` : ""}{fieldCount + 2} toelichtingen geplaatst.</p>
                    <p className="text-[13.5px] text-[#6B6963]">Het bestand is bewaard. Vanuit een datapunt open je het op de juiste cel, bijvoorbeeld <span className="font-mono">{cellRef(ROW_BY_CODE[1000000], CURRENT)}</span>. De performance sheet van {COMPANY} is bijgewerkt.</p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-[10px] border border-[#E8E6E0] bg-white p-4">
                      <div className="text-[14px] font-semibold">Dit gebeurt bij opslaan</div>
                      <ul className="mt-2 space-y-1 text-[13.5px] text-[#4A4A44]">
                        <li>{storedRows.length} regels voor {PERIOD} worden weggeschreven, met per waarde de bron-cel.</li>
                        <li>De performance sheet wordt automatisch bijgewerkt; de CFO hoeft niets te koppelen.</li>
                        {unmappedOpen.length > 0 && <li>{unmappedOpen.length} nieuwe records worden overgeslagen tot je ze koppelt.</li>}
                        {Object.keys(added).length > 0 && <li>{Object.keys(added).length} nieuwe records worden gekoppeld aan een bestaande metric en onthouden.</li>}
                        {requestedCount > 0 && <li>{requestedCount} regels worden niet opgeslagen tot Alma de aangevraagde metriccode heeft toegekend.</li>}
                      </ul>
                    </div>
                    <div className="rounded-[10px] border border-[#E8E6E0] bg-white p-4">
                      <div className="text-[14px] font-semibold">Voordat je kunt opslaan</div>
                      <ul className="mt-2 space-y-1.5 text-[13.5px]">
                        {([
                          ["Selectie bevestigd", step1],
                          ["Koppeling gecontroleerd, nieuwe records gekoppeld, aangevraagd of overgeslagen", mappingDone],
                          ["Controles beoordeeld", controlsDone],
                          ["Oude maanden verwerkt en YTD aangesloten of toegelicht", oldDone],
                        ] as [string, boolean][]).map(([t, ok]) => (
                          <li key={t} className="flex items-center gap-2">{ok ? <Check className="h-4 w-4 text-[#3B6D11]" /> : <AlertCircle className="h-4 w-4 text-[#B8975A]" />}<span className={ok ? "text-[#6B6963]" : "text-[#2C2C2A]"}>{t}</span></li>
                        ))}
                      </ul>
                    </div>
                    <button onClick={handleSave} disabled={!canSave || saving} className="w-full rounded-lg bg-[#1B4D45] px-4 py-2.5 text-[14px] font-medium text-white hover:bg-[#164039] disabled:cursor-not-allowed disabled:bg-[#B9C7C3]">Bevestigen en opslaan</button>
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
