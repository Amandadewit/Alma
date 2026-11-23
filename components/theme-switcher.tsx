"use client"

import { useEffect, useState } from "react"
import { Palette } from "lucide-react"

/** Colour schemes from the "Alma Refresh" design system. Ids match the [data-theme] blocks in app/globals.css. */
const THEMES = [
  { id: "current", label: "1 · Current (demo site)" },
  { id: "goud-light", label: "Goud (mock-up now)" },
  { id: "goud-calm", label: "Goud calm" },
  { id: "kobalt-calm", label: "Kobalt calm" },
  { id: "volt-calm", label: "Volt calm" },
  { id: "grafiet", label: "Grafiet" },
  { id: "kobalt-light", label: "Kobalt (original)" },
  { id: "volt-light", label: "Volt (original)" },
]

const STORAGE_KEY = "alma-theme"

const isKnown = (id: string | null): id is string => THEMES.some((t) => t.id === id)

/**
 * Theme switcher, bottom right. Shown in development, and on any build once the URL carries
 * ?theme=<id> (that choice is remembered in localStorage under "alma-theme").
 */
export function ThemeSwitcher() {
  const [theme, setTheme] = useState("")
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    let saved: string | null = null
    try {
      saved = window.localStorage.getItem(STORAGE_KEY)
    } catch {}
    const requested = params.get("theme") ?? saved
    if (isKnown(requested)) document.documentElement.dataset.theme = requested
    setTheme(document.documentElement.dataset.theme ?? "")
    setVisible(process.env.NODE_ENV === "development" || params.has("theme") || isKnown(saved))
  }, [])

  if (!visible) return null

  const choose = (id: string) => {
    document.documentElement.dataset.theme = id
    setTheme(id)
    try {
      window.localStorage.setItem(STORAGE_KEY, id)
    } catch {}
  }

  return (
    <label className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-[12px] text-ink-2 shadow-[var(--shadow-pop)]">
      <Palette className="h-4 w-4" strokeWidth={1.9} />
      <span className="font-medium">Theme</span>
      <select
        value={theme}
        onChange={(e) => choose(e.target.value)}
        className="rounded-md border border-line-strong bg-surface px-2 py-1 text-[12px] text-ink outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        {THEMES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
    </label>
  )
}
