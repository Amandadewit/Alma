"use client"

import { useState } from "react"
import { Pencil, Check, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  METRIC_CODES,
  ACCUMULATIONS,
  type MetricCode,
  type AccumulationCode,
  type CustomNote,
} from "@/lib/dashboard-config"

export function EditToggle({ editing, onToggle }: { editing: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors",
        editing
          ? "border-[#1B4D45] bg-[#1B4D45] text-white"
          : "border-[#E8E6E0] bg-white text-[#2C2C2A] hover:bg-[#F7F6F3]",
      )}
    >
      {editing ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
      {editing ? "Done" : "Edit"}
    </button>
  )
}

export function EditableTitle({
  editing,
  value,
  defaultValue,
  onChange,
  className,
}: {
  editing: boolean
  value?: string
  defaultValue: string
  onChange: (v: string) => void
  className?: string
}) {
  if (editing) {
    return (
      <input
        value={value ?? defaultValue}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "rounded border border-dashed border-[#1B4D45]/40 bg-[#F7F6F3] px-1.5 py-0.5 text-[12px] font-medium text-[#2C2C2A] outline-none focus:border-[#1B4D45]",
          className,
        )}
      />
    )
  }
  return <span className={className}>{value ?? defaultValue}</span>
}

export function AddRowInline({
  onAdd,
}: {
  onAdd: (metricCode: MetricCode, accumulation: AccumulationCode) => void
}) {
  const [metric, setMetric] = useState<MetricCode>(METRIC_CODES[0].code)
  const [accumulation, setAccumulation] = useState<AccumulationCode>(ACCUMULATIONS[0].code)

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-dashed border-[#E8E6E0] bg-[#FBFAF7] px-3 py-2">
      <span className="text-[10px] font-medium uppercase tracking-wide text-[#6B6963]">Add row</span>
      <label className="flex items-center gap-1 text-[10px] text-[#6B6963]">
        Metric code
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value as MetricCode)}
          className="rounded border border-[#E8E6E0] bg-white px-1.5 py-0.5 text-[10px] text-[#2C2C2A]"
        >
          {METRIC_CODES.map((m) => (
            <option key={m.code} value={m.code}>
              {m.code} — {m.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-1 text-[10px] text-[#6B6963]">
        Accumulation
        <select
          value={accumulation}
          onChange={(e) => setAccumulation(e.target.value as AccumulationCode)}
          className="rounded border border-[#E8E6E0] bg-white px-1.5 py-0.5 text-[10px] text-[#2C2C2A]"
        >
          {ACCUMULATIONS.map((a) => (
            <option key={a.code} value={a.code}>
              {a.label}
            </option>
          ))}
        </select>
      </label>
      <button
        onClick={() => onAdd(metric, accumulation)}
        className="flex items-center gap-1 rounded bg-[#1B4D45] px-2 py-1 text-[10px] font-medium text-white hover:bg-[#153c36]"
      >
        <Plus className="h-3 w-3" />
        Add
      </button>
    </div>
  )
}

export function AddColumnInline({ onAdd }: { onAdd: (label: string) => void }) {
  const [label, setLabel] = useState("")
  return (
    <div className="flex items-center gap-2 border-t border-dashed border-[#E8E6E0] bg-[#FBFAF7] px-3 py-2">
      <span className="text-[10px] font-medium uppercase tracking-wide text-[#6B6963]">Add column</span>
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Column label"
        className="rounded border border-[#E8E6E0] bg-white px-1.5 py-0.5 text-[10px] text-[#2C2C2A] outline-none focus:border-[#1B4D45]"
      />
      <button
        onClick={() => {
          if (label.trim()) {
            onAdd(label.trim())
            setLabel("")
          }
        }}
        className="flex items-center gap-1 rounded bg-[#1B4D45] px-2 py-1 text-[10px] font-medium text-white hover:bg-[#153c36]"
      >
        <Plus className="h-3 w-3" />
        Add
      </button>
    </div>
  )
}

export function BlockNotes({
  editing,
  notes,
  onAdd,
  onRemove,
}: {
  editing: boolean
  notes: CustomNote[]
  onAdd: (text: string) => void
  onRemove: (id: string) => void
}) {
  const [text, setText] = useState("")
  if (!editing && notes.length === 0) return null
  return (
    <div className="flex flex-col gap-1.5 border-t border-[#E8E6E0] px-4 py-2.5">
      {notes.map((n) => (
        <div key={n.id} className="flex items-center justify-between gap-2 text-[11px] text-[#2C2C2A]">
          <span>{n.text}</span>
          {editing && (
            <button onClick={() => onRemove(n.id)} className="text-[#A32D2D] hover:opacity-70">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}
      {editing && (
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add datapoint or note"
            className="flex-1 rounded border border-[#E8E6E0] bg-white px-1.5 py-0.5 text-[10px] text-[#2C2C2A] outline-none focus:border-[#1B4D45]"
          />
          <button
            onClick={() => {
              if (text.trim()) {
                onAdd(text.trim())
                setText("")
              }
            }}
            className="flex items-center gap-1 rounded bg-[#1B4D45] px-2 py-1 text-[10px] font-medium text-white hover:bg-[#153c36]"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        </div>
      )}
    </div>
  )
}

export function RemoveRowButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="ml-1 inline-flex items-center text-[#A32D2D] hover:opacity-70"
      aria-label="Remove row"
    >
      <X className="h-3 w-3" />
    </button>
  )
}
