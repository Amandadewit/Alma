"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { Briefcase, Building2, ChevronLeft, Clock, GitBranch, Pencil, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { funds, currentUser } from "@/lib/mock-data"
import {
  ADDON_STATUSES, ADDON_TYPES, COMPANY_FIELDS, HOLDING_STATUSES, defaultMaster, diffMaster, fundLabel,
  type Addon, type CompanyMaster, type FundHolding, type HistoryEntry,
} from "@/lib/company-master-data"

const STORE = "alma-company-master:"
const inputCls = "w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-[13px] text-ink outline-none focus:border-brand"

const fmtDate = (iso: string) => {
  if (!iso) return "—"
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("nl-NL", { day: "2-digit", month: "2-digit", year: "numeric" })
}
const fmtStamp = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}
const dash = (v: string | number) => (v === "" || v === undefined || v === null ? "—" : String(v))

function CardHead({ icon, title, right }: { icon: React.ReactNode; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-line px-6 py-4">
      <div className="flex items-center gap-2.5 text-[15px] font-medium text-ink">{icon}{title}</div>
      {right}
    </div>
  )
}

function Detail() {
  const { companyId } = useParams<{ companyId: string }>()
  const search = useSearchParams()
  const [master, setMaster] = useState<CompanyMaster | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [draft, setDraft] = useState<CompanyMaster | null>(null)
  const [reason, setReason] = useState("")
  const [ready, setReady] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    const base = defaultMaster(companyId)
    if (!base) { setNotFound(true); setReady(true); return }
    let m = base.master, h = base.history
    try {
      const raw = window.localStorage.getItem(STORE + companyId)
      if (raw) { const p = JSON.parse(raw); m = p.master; h = p.history }
    } catch { /* storage unavailable: start from defaults */ }
    setMaster(m)
    setHistory(h)
    if (search.get("adjust") === "1") setDraft(structuredClone(m))
    setReady(true)
  }, [companyId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) return null
  if (notFound || !master) {
    return (
      <div className="p-8 text-[14px] text-ink-2">
        Company not found. <Link href="/data-entry/key-data" className="text-brand underline">Back to Key Data</Link>
      </div>
    )
  }

  const editing = draft !== null
  const view = draft ?? master
  const pending = draft ? diffMaster(master, draft, currentUser.name, reason) : []
  const changeCount = pending.reduce((a, e) => a + e.changes.length, 0)
  const incomplete = !!draft && (draft.addons.some((a) => !a.name.trim()) || !draft.name.trim())

  const setField = (k: keyof CompanyMaster, v: string) => setDraft((d) => (d ? { ...d, [k]: v } : d))
  const setHolding = (id: string, patch: Partial<FundHolding>) => setDraft((d) => d && { ...d, holdings: d.holdings.map((h) => (h.id === id ? { ...h, ...patch } : h)) })
  const setAddon = (id: string, patch: Partial<Addon>) => setDraft((d) => d && { ...d, addons: d.addons.map((a) => (a.id === id ? { ...a, ...patch } : a)) })

  function save() {
    if (!draft || changeCount === 0 || incomplete) return
    const next = [...pending].reverse().concat(history)
    setMaster(draft)
    setHistory(next)
    try { window.localStorage.setItem(STORE + companyId, JSON.stringify({ master: draft, history: next })) } catch { /* ignore */ }
    setDraft(null)
    setReason("")
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 4000)
  }
  function cancel() { setDraft(null); setReason("") }
  function reset() {
    const base = defaultMaster(companyId)!
    try { window.localStorage.removeItem(STORE + companyId) } catch { /* ignore */ }
    setMaster(base.master); setHistory(base.history); setDraft(null)
  }

  return (
    <div className="min-h-screen bg-surface-2">
      <div className="mx-auto max-w-[1000px] px-6 py-6">
        <Link href="/data-entry/key-data" className="flex w-fit items-center gap-1 text-[12px] text-ink-2 hover:text-ink">
          <ChevronLeft className="h-3.5 w-3.5" />Back to Key Data
        </Link>
        <div className="mt-3 flex items-center justify-between gap-4">
          <h1 className="text-[26px] font-medium text-ink">{view.name || "Company"}</h1>
          {!editing ? (
            <Button variant="outline" onClick={() => setDraft(structuredClone(master))} className="gap-2 border-ink bg-white text-ink hover:bg-bg">
              <Pencil className="h-3.5 w-3.5" />Adjust
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={cancel} className="border-line bg-white">Cancel</Button>
              <Button onClick={save} disabled={changeCount === 0 || incomplete} className="bg-brand text-white hover:bg-action-hover disabled:opacity-40">
                Save changes{changeCount > 0 ? ` (${changeCount})` : ""}
              </Button>
            </div>
          )}
        </div>

        {justSaved && <div className="mt-3 rounded-lg bg-[#E1F5EE] px-4 py-2.5 text-[13px] text-[#1B4D45]">Saved. The changes are in the history below.</div>}
        {editing && (
          <div className="mt-3 rounded-lg border border-[#EBD9B5] bg-[#FFFDF8] px-4 py-3">
            <div className="text-[13px] font-medium text-ink">You are adjusting {master.name}</div>
            <p className="mt-0.5 text-[12.5px] text-ink-2">Change any of the data below. Every change is recorded in the history with who changed it, when, and the old and new value.</p>
            <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for the change (optional, saved in the history)" className={cn(inputCls, "mt-2")} />
            <div className="mt-1.5 text-[12px] text-ink-2">{incomplete ? "Give every add-on and the company a name before saving." : changeCount === 0 ? "No changes yet." : `${changeCount} change${changeCount === 1 ? "" : "s"} to save.`}</div>
          </div>
        )}

        {/* Company details */}
        <Card className="mt-5 gap-0 border-line py-0 shadow-sm">
          <CardHead icon={<Building2 className="h-4 w-4 text-ink-2" />} title="Company details" />
          <div className="grid grid-cols-2 gap-x-8 gap-y-5 px-6 py-6">
            {COMPANY_FIELDS.map((f) => (
              <div key={f.key} className={f.wide ? "col-span-2" : ""}>
                <div className="text-[12px] text-ink-2">{f.label}</div>
                {editing ? (
                  f.options ? (
                    <select value={view[f.key] as string} onChange={(e) => setField(f.key, e.target.value)} className={cn(inputCls, "mt-1")}>
                      {!f.options.includes(view[f.key] as string) && <option value={view[f.key] as string}>{dash(view[f.key] as string)}</option>}
                      {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input value={view[f.key] as string} onChange={(e) => setField(f.key, e.target.value)} className={cn(inputCls, "mt-1")} />
                  )
                ) : (
                  <div className="mt-1 text-[14px] text-ink">{dash(view[f.key] as string)}</div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Held by funds */}
        <Card className="mt-5 gap-0 border-line py-0 shadow-sm">
          <CardHead
            icon={<Briefcase className="h-4 w-4 text-ink-2" />} title="Held by funds"
            right={editing && (
              <button onClick={() => setDraft((d) => d && { ...d, holdings: [...d.holdings, { id: `h-${Date.now()}`, fundId: funds[0].id, entryDate: "", type: "", status: "Portfolio", generalStatus: "" }] })} className="flex items-center gap-1 text-[12.5px] font-medium text-brand hover:underline">
                <Plus className="h-3.5 w-3.5" />Add fund
              </button>
            )}
          />
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="border-b border-line text-left text-[12.5px] text-ink-2">
                <th className="px-6 py-2.5 font-medium">Fund</th><th className="py-2.5 font-medium">Entry date</th><th className="py-2.5 font-medium">Type</th><th className="py-2.5 font-medium">Status</th><th className="py-2.5 font-medium">General status</th>{editing && <th className="w-10" />}
              </tr>
            </thead>
            <tbody>
              {view.holdings.length === 0 && <tr><td colSpan={6} className="px-6 py-4 text-ink-2">Not held by any fund.</td></tr>}
              {view.holdings.map((h) => (
                <tr key={h.id} className="border-b border-line last:border-0">
                  {editing ? (
                    <>
                      <td className="px-6 py-2"><select value={h.fundId} onChange={(e) => setHolding(h.id, { fundId: e.target.value })} className={inputCls}>{funds.map((f) => <option key={f.id} value={f.id}>{f.shortName}</option>)}</select></td>
                      <td className="py-2 pr-2"><input type="date" value={h.entryDate} onChange={(e) => setHolding(h.id, { entryDate: e.target.value })} className={inputCls} /></td>
                      <td className="py-2 pr-2"><input value={h.type} onChange={(e) => setHolding(h.id, { type: e.target.value })} className={inputCls} /></td>
                      <td className="py-2 pr-2"><select value={h.status} onChange={(e) => setHolding(h.id, { status: e.target.value })} className={inputCls}>{HOLDING_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></td>
                      <td className="py-2 pr-2"><input value={h.generalStatus} onChange={(e) => setHolding(h.id, { generalStatus: e.target.value })} className={inputCls} /></td>
                      <td className="py-2 pr-4"><button title="Remove" onClick={() => setDraft((d) => d && { ...d, holdings: d.holdings.filter((x) => x.id !== h.id) })} className="rounded p-1 text-ink-2 hover:bg-bg hover:text-ink"><Trash2 className="h-4 w-4" /></button></td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-3 font-medium text-ink">{fundLabel(h.fundId)}</td>
                      <td className="py-3 text-ink-2">{fmtDate(h.entryDate)}</td>
                      <td className="py-3 text-ink-2">{dash(h.type)}</td>
                      <td className="py-3"><span className={cn("rounded-full px-2.5 py-0.5 text-[12px] font-medium", h.status === "Exited" ? "bg-gray-100 text-gray-600" : "bg-[#E8EDFB] text-[#3B4FC4]")}>{h.status}</span></td>
                      <td className="py-3 text-ink-2">{dash(h.generalStatus)}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Add-ons */}
        <Card className="mt-5 gap-0 border-line py-0 shadow-sm">
          <CardHead
            icon={<GitBranch className="h-4 w-4 text-ink-2" />} title="Add-ons"
            right={editing && (
              <button onClick={() => setDraft((d) => d && { ...d, addons: [...d.addons, { id: `a-${Date.now()}`, name: "", type: "Acquisition", effectiveDate: "", entryEbitda: 0, status: "In process" }] })} className="flex items-center gap-1 text-[12.5px] font-medium text-brand hover:underline">
                <Plus className="h-3.5 w-3.5" />Add add-on
              </button>
            )}
          />
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="border-b border-line text-left text-[12.5px] text-ink-2">
                <th className="px-6 py-2.5 font-medium">Add-on</th><th className="py-2.5 font-medium">Type</th><th className="py-2.5 font-medium">Effective date</th><th className="py-2.5 text-right font-medium">Entry norm. EBITDA</th><th className="py-2.5 pl-6 font-medium">Status</th>{editing && <th className="w-10" />}
              </tr>
            </thead>
            <tbody>
              {view.addons.length === 0 && <tr><td colSpan={6} className="px-6 py-4 text-ink-2">No add-ons.</td></tr>}
              {view.addons.map((a) => (
                <tr key={a.id} className="border-b border-line last:border-0">
                  {editing ? (
                    <>
                      <td className="px-6 py-2"><input value={a.name} onChange={(e) => setAddon(a.id, { name: e.target.value })} placeholder="Name" className={inputCls} /></td>
                      <td className="py-2 pr-2"><select value={a.type} onChange={(e) => setAddon(a.id, { type: e.target.value })} className={inputCls}>{ADDON_TYPES.map((t) => <option key={t}>{t}</option>)}</select></td>
                      <td className="py-2 pr-2"><input type="date" value={a.effectiveDate} onChange={(e) => setAddon(a.id, { effectiveDate: e.target.value })} className={inputCls} /></td>
                      <td className="py-2 pr-2"><input type="number" step="0.1" value={a.entryEbitda} onChange={(e) => setAddon(a.id, { entryEbitda: Number(e.target.value) })} className={cn(inputCls, "text-right")} /></td>
                      <td className="py-2 pl-4 pr-2"><select value={a.status} onChange={(e) => setAddon(a.id, { status: e.target.value })} className={inputCls}>{ADDON_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></td>
                      <td className="py-2 pr-4"><button title="Remove" onClick={() => setDraft((d) => d && { ...d, addons: d.addons.filter((x) => x.id !== a.id) })} className="rounded p-1 text-ink-2 hover:bg-bg hover:text-ink"><Trash2 className="h-4 w-4" /></button></td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-3 font-medium text-ink">{a.name}</td>
                      <td className="py-3 text-ink-2">{a.type}</td>
                      <td className="py-3 text-ink-2">{fmtDate(a.effectiveDate)}</td>
                      <td className="py-3 text-right text-ink">{a.entryEbitda}</td>
                      <td className="py-3 pl-6"><span className="rounded-full bg-[#E1F5EE] px-2.5 py-0.5 text-[12px] font-medium text-[#1B6B3A]">{a.status}</span></td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* History */}
        <Card className="mt-5 gap-0 border-line py-0 shadow-sm">
          <CardHead icon={<Clock className="h-4 w-4 text-ink-2" />} title="History" right={history.length > 1 && !editing ? <button onClick={reset} className="text-[12px] text-ink-2 underline underline-offset-2 hover:text-ink">Reset demo data</button> : undefined} />
          <div className="space-y-3 px-6 py-5">
            {history.map((e) => (
              <div key={e.id} className="rounded-lg border border-line px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-[14px]">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-[12px] font-medium", e.action === "Created" ? "bg-[#E1F5EE] text-[#1B6B3A]" : "bg-[#FBEBDD] text-[#C2570C]")}>{e.action}</span>
                    <span className="text-[12px] tracking-wide text-ink-2">{e.entity}</span>
                    <span className="font-semibold text-ink">{e.name}</span>
                  </div>
                  <span className="shrink-0 text-[12.5px] text-ink-2">{fmtStamp(e.at)}</span>
                </div>
                <div className="mt-1.5 text-[13px] text-ink-2">by {e.by}</div>
                {e.reason && <div className="mt-1 text-[13px] italic text-ink-2">Reason: {e.reason}</div>}
                {e.changes.length > 0 && (
                  <ul className="mt-2 space-y-1 text-[13px]">
                    {e.changes.map((c, i) => (
                      <li key={i} className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-medium text-ink">{c.field}</span>
                        <span className="text-ink-2 line-through decoration-[#C9C5BA]">{c.from}</span>
                        <span className="text-ink-2">{"→"}</span>
                        <span className="text-ink">{c.to}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function CompanyKeyDataPage() {
  return (
    <Suspense fallback={null}>
      <Detail />
    </Suspense>
  )
}
