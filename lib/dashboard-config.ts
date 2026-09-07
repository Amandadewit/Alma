"use client"

import { useCallback, useEffect, useState } from "react"

// Existing metric codes that a custom row can reference. These map onto the
// financial metric objects on a Company (see lib/mock-data.ts).
export const METRIC_CODES = [
  { code: "REV", label: "Revenue" },
  { code: "GM", label: "Gross Margin" },
  { code: "OPEX", label: "OPEX" },
  { code: "EBITDA", label: "EBITDA" },
  { code: "NEBITDA", label: "N. EBITDA" },
  { code: "NEBITDA_PCT", label: "N. EBITDA %" },
  { code: "FCF", label: "Free Cash Flow" },
  { code: "NET_DEBT", label: "Net Debt" },
  { code: "LEVERAGE", label: "Leverage" },
] as const

export type MetricCode = (typeof METRIC_CODES)[number]["code"]

// Existing accumulation methods that determine how a metric is aggregated.
export const ACCUMULATIONS = [
  { code: "SUM", label: "Sum" },
  { code: "AVG", label: "Average" },
  { code: "CLOSING", label: "Closing (point in time)" },
  { code: "OPENING", label: "Opening" },
] as const

export type AccumulationCode = (typeof ACCUMULATIONS)[number]["code"]

export const metricLabel = (code: string) => METRIC_CODES.find((m) => m.code === code)?.label ?? code
export const accumulationLabel = (code: string) => ACCUMULATIONS.find((a) => a.code === code)?.label ?? code

// A user-added row: references an existing metric + accumulation.
export interface CustomRow {
  id: string
  metricCode: MetricCode
  accumulation: AccumulationCode
}

// A user-added column: a free label plus per-cell text values keyed by row key.
export interface CustomColumn {
  id: string
  label: string
  values: Record<string, string>
}

// A free datapoint / word added to any block.
export interface CustomNote {
  id: string
  text: string
}

export interface BlockConfig {
  titleOverride?: string
  customRows: CustomRow[]
  customColumns: CustomColumn[]
  notes: CustomNote[]
}

export type DashboardConfig = Record<string, BlockConfig>

const STORAGE_PREFIX = "dashboard-config:"

export const emptyBlock = (): BlockConfig => ({ customRows: [], customColumns: [], notes: [] })

function loadConfig(storageKey: string): DashboardConfig {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + storageKey)
    return raw ? (JSON.parse(raw) as DashboardConfig) : {}
  } catch {
    return {}
  }
}

function saveConfig(storageKey: string, config: DashboardConfig) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_PREFIX + storageKey, JSON.stringify(config))
  } catch {
    // storage full / unavailable — ignore for the demo
  }
}

const uid = () => Math.random().toString(36).slice(2, 9)

/**
 * Persistent per-environment dashboard configuration. Config is stored in
 * localStorage so each customer's edits survive refreshes without a backend.
 * `hydrated` is false during SSR + first client render to avoid mismatches.
 */
export function useDashboardConfig(storageKey: string) {
  const [config, setConfig] = useState<DashboardConfig>({})
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setConfig(loadConfig(storageKey))
    setHydrated(true)
  }, [storageKey])

  const update = useCallback(
    (next: DashboardConfig) => {
      setConfig(next)
      saveConfig(storageKey, next)
    },
    [storageKey],
  )

  const block = useCallback((blockId: string): BlockConfig => config[blockId] ?? emptyBlock(), [config])

  const mutateBlock = useCallback(
    (blockId: string, fn: (b: BlockConfig) => BlockConfig) => {
      const current = config[blockId] ?? emptyBlock()
      update({ ...config, [blockId]: fn(current) })
    },
    [config, update],
  )

  const addRow = useCallback(
    (blockId: string, metricCode: MetricCode, accumulation: AccumulationCode) =>
      mutateBlock(blockId, (b) => ({ ...b, customRows: [...b.customRows, { id: uid(), metricCode, accumulation }] })),
    [mutateBlock],
  )

  const removeRow = useCallback(
    (blockId: string, id: string) =>
      mutateBlock(blockId, (b) => ({ ...b, customRows: b.customRows.filter((r) => r.id !== id) })),
    [mutateBlock],
  )

  const addColumn = useCallback(
    (blockId: string, label: string) =>
      mutateBlock(blockId, (b) => ({ ...b, customColumns: [...b.customColumns, { id: uid(), label, values: {} }] })),
    [mutateBlock],
  )

  const removeColumn = useCallback(
    (blockId: string, id: string) =>
      mutateBlock(blockId, (b) => ({ ...b, customColumns: b.customColumns.filter((c) => c.id !== id) })),
    [mutateBlock],
  )

  const setColumnLabel = useCallback(
    (blockId: string, id: string, label: string) =>
      mutateBlock(blockId, (b) => ({
        ...b,
        customColumns: b.customColumns.map((c) => (c.id === id ? { ...c, label } : c)),
      })),
    [mutateBlock],
  )

  const setCell = useCallback(
    (blockId: string, columnId: string, rowKey: string, value: string) =>
      mutateBlock(blockId, (b) => ({
        ...b,
        customColumns: b.customColumns.map((c) =>
          c.id === columnId ? { ...c, values: { ...c.values, [rowKey]: value } } : c,
        ),
      })),
    [mutateBlock],
  )

  const setTitle = useCallback(
    (blockId: string, titleOverride: string) => mutateBlock(blockId, (b) => ({ ...b, titleOverride })),
    [mutateBlock],
  )

  const addNote = useCallback(
    (blockId: string, text: string) =>
      mutateBlock(blockId, (b) => ({ ...b, notes: [...b.notes, { id: uid(), text }] })),
    [mutateBlock],
  )

  const removeNote = useCallback(
    (blockId: string, id: string) =>
      mutateBlock(blockId, (b) => ({ ...b, notes: b.notes.filter((n) => n.id !== id) })),
    [mutateBlock],
  )

  const resetBlock = useCallback(
    (blockId: string) => {
      const { [blockId]: _removed, ...rest } = config
      update(rest)
    },
    [config, update],
  )

  return {
    hydrated,
    block,
    addRow,
    removeRow,
    addColumn,
    removeColumn,
    setColumnLabel,
    setCell,
    setTitle,
    addNote,
    removeNote,
    resetBlock,
  }
}
