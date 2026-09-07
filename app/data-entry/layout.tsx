"use client"

import { useEffect } from "react"
import { useViewMode } from "@/contexts/view-mode-context"

export default function DataEntryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { setViewMode } = useViewMode()

  // Ensure we're in data-entry mode when visiting these pages
  useEffect(() => {
    setViewMode('data-entry')
  }, [setViewMode])

  return <>{children}</>
}
