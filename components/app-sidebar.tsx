"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { currentUser } from "@/lib/mock-data"
import { LogOut, ArrowLeft, Database } from "lucide-react"
import { useViewMode } from "@/contexts/view-mode-context"

const dataViewItems = [
  {
    title: "Performance Overview",
    href: "/",
    shortcut: "P",
  },
  {
    title: "Portfolio Performance",
    href: "/portfolio",
    shortcut: "O",
  },
  {
    title: "Fund Valuation",
    href: "/valuation",
    shortcut: "V",
  },
  {
    title: "Alma Intelligence",
    href: "/ai-analysis",
    shortcut: "A",
  },
]

const dataEntryItems = [
  {
    title: "Key Data",
    href: "/data-entry/key-data",
    shortcut: "K",
  },
  {
    title: "Upload Data",
    href: "/data-entry/upload",
    shortcut: "U",
  },
  {
    title: "Data Viewer",
    href: "/data-entry/data-viewer",
    shortcut: "D",
  },
  {
    title: "Valuation Entry",
    href: "/data-entry/valuation",
    shortcut: "V",
  },
  {
    title: "Report Builder",
    href: "/data-entry/lp-reporting",
    shortcut: "R",
  },
  {
    title: "Portfolio Portal",
    href: "/data-entry/lp-reporting/portfolio-portal",
    shortcut: "F",
  },
  {
    title: "Export",
    href: "/data-entry/export",
    shortcut: "E",
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { viewMode, setViewMode } = useViewMode()

  const navItems = viewMode === 'data-view' ? dataViewItems : dataEntryItems

  const handleModeSwitch = () => {
    if (viewMode === 'data-view') {
      setViewMode('data-entry')
      router.push('/data-entry/key-data')
    } else {
      setViewMode('data-view')
      router.push('/')
    }
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[220px] flex-col bg-[#1B4D45]">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-6">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#B8975A]">
          <span className="text-xs font-semibold text-white">A</span>
        </div>
        <div className="text-base font-medium text-white">
          Alma <span className="text-[#B8975A]">Insights</span>
        </div>
      </div>

      {/* Mode Switch Button */}
      <div className="px-3 pt-4 pb-2">
        <button
          onClick={handleModeSwitch}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-medium transition-colors",
            viewMode === 'data-view'
              ? "bg-[#B8975A] text-white hover:bg-[#A68548]"
              : "bg-white/10 text-white hover:bg-white/15"
          )}
        >
          {viewMode === 'data-view' ? (
            <>
              <Database className="h-4 w-4" />
              Data Management
            </>
          ) : (
            <>
              <ArrowLeft className="h-4 w-4" />
              Back to Data View
            </>
          )}
        </button>
      </div>

      {/* Mode Label */}
      <div className="px-5 py-2">
        <div className="text-[10px] font-medium uppercase tracking-wider text-white/40">
          {viewMode === 'data-view' ? 'Data View' : 'Data Management'}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {navItems.map((item) => {
          // An item matches if the path equals or is nested under its href.
          const matches = (href: string) =>
            pathname === href || (href !== "/" && pathname.startsWith(href + "/"))
          // Only highlight the most specific matching item so parent routes
          // (e.g. Report Builder) aren't active on nested pages (Portfolio Portal).
          const isActive =
            matches(item.href) &&
            !navItems.some(
              (other) =>
                other.href !== item.href &&
                other.href.startsWith(item.href) &&
                matches(other.href),
            )

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] transition-colors",
                isActive
                  ? "bg-white/[0.12] font-medium text-white"
                  : "text-white/55 hover:bg-white/[0.06] hover:text-white/80"
              )}
            >
              <div
                className={cn(
                  "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border-[1.5px] text-[9px]",
                  isActive ? "border-white" : "border-current"
                )}
              >
                {item.shortcut}
              </div>
              {item.title}
            </Link>
          )
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Settings */}
      <div className="px-3 pb-2">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] transition-colors",
            pathname === "/settings"
              ? "bg-white/[0.12] font-medium text-white"
              : "text-white/55 hover:bg-white/[0.06] hover:text-white/80"
          )}
        >
          <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border-[1.5px] border-dashed border-current text-[9px]">
            S
          </div>
          Settings
        </Link>
      </div>

      {/* Sign Out */}
      <div className="px-3 pb-2">
        <button
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white/80"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Sign Out
        </button>
      </div>

      {/* User */}
      <div className="flex items-center gap-2.5 border-t border-white/10 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#B8975A] text-xs font-medium text-white">
          {currentUser.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-medium text-white">
            {currentUser.name}
          </div>
          <div className="truncate text-[11px] text-white/70">Alma Insights</div>
        </div>
      </div>
    </aside>
  )
}
