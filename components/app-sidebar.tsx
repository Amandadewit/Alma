"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { currentUser } from "@/lib/mock-data"
import {
  ArrowLeft,
  ArrowLeftRight,
  Calculator,
  CloudUpload,
  Database,
  FileDown,
  FileText,
  KeyRound,
  Landmark,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
  Table2,
  TrendingUp,
  UsersRound,
  type LucideIcon,
} from "lucide-react"
import { useViewMode } from "@/contexts/view-mode-context"

type NavItem = { title: string; href: string; icon: LucideIcon }

const dataViewItems: NavItem[] = [
  { title: "Performance Overview", href: "/", icon: LayoutDashboard },
  { title: "Portfolio Performance", href: "/portfolio", icon: TrendingUp },
  { title: "Fund Valuation", href: "/valuation", icon: Landmark },
  { title: "Alma Intelligence", href: "/ai-analysis", icon: Sparkles },
]

const dataEntryItems: NavItem[] = [
  { title: "Key Data", href: "/data-entry/key-data", icon: KeyRound },
  { title: "Upload Data", href: "/data-entry/upload", icon: CloudUpload },
  { title: "Data Viewer", href: "/data-entry/data-viewer", icon: Table2 },
  { title: "Valuation Entry", href: "/data-entry/valuation", icon: Calculator },
  { title: "Report Builder", href: "/data-entry/lp-reporting", icon: FileText },
  { title: "Portfolio Portal", href: "/data-entry/lp-reporting/portfolio-portal", icon: UsersRound },
  { title: "Export", href: "/data-entry/export", icon: FileDown },
]

/** The Alma A-mark, copied from the logo files (Alma Insights Liggend.pdf). */
export function AlmaMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 42.58 41.88" aria-hidden="true" className={cn("shrink-0 fill-nav-mark", className)}>
      <path d="M32.21,36.78 C29.44,32.04 20.42,16.54 18.29,12.80 C15.52,7.92 15.32,3.92 18.98,0.00 L42.58,40.94 C37.28,41.88 35.14,41.79 32.21,36.78" />
      <path d="M13.27,12.43 C10.75,15.13 10.82,18.20 12.51,21.68 C13.28,23.26 14.09,24.80 14.91,26.34 C13.39,25.60 11.82,25.52 10.28,26.23 C7.80,27.36 5.83,29.21 4.45,31.58 C2.65,34.55 1.27,37.60 0.00,40.97 C3.88,41.37 7.78,41.63 11.61,40.72 C14.34,39.97 16.35,38.19 17.48,35.67 C18.26,33.91 18.15,32.89 18.19,32.29 C19.32,34.29 20.50,36.26 21.79,38.21 C24.03,41.59 26.17,41.73 29.82,41.08 Z" />
    </svg>
  )
}

const itemClass = (active: boolean) =>
  cn(
    "group flex h-10 items-center gap-3 rounded-lg px-2 text-[13.5px] font-medium transition-colors",
    active ? "bg-nav-active-bg text-nav-active-ink" : "text-nav-ink-2 hover:bg-nav-line hover:text-nav-ink",
  )

// Rounded icon in a soft tile; lights up with the active item
function NavIcon({ icon: Icon, active }: { icon: LucideIcon; active: boolean }) {
  return (
    <span
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
        active ? "bg-nav-active-ink/15" : "bg-nav-line group-hover:bg-nav-line",
      )}
    >
      <Icon className="h-[15px] w-[15px]" strokeWidth={1.9} />
    </span>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { viewMode, setViewMode } = useViewMode()

  const navItems = viewMode === "data-view" ? dataViewItems : dataEntryItems

  const handleModeSwitch = () => {
    if (viewMode === "data-view") {
      setViewMode("data-entry")
      router.push("/data-entry/key-data")
    } else {
      setViewMode("data-view")
      router.push("/")
    }
  }

  return (
    <aside className="group/nav fixed left-0 top-0 z-40 flex h-screen w-[64px] flex-col overflow-hidden border-r border-nav-line bg-nav-bg transition-[width,box-shadow] duration-200 hover:w-[236px] hover:shadow-2xl focus-within:w-[236px]">
      {/* Logo: existing mark, new wordmark in Funnel Display */}
      <div className="flex items-center gap-2.5 border-b border-nav-line px-[19px] py-5">
        <AlmaMark className="h-[26px] w-[26px]" />
        <div className="whitespace-nowrap font-display text-[20px] font-bold leading-none tracking-[-0.035em] text-nav-ink opacity-0 transition-opacity duration-150 group-hover/nav:opacity-100 group-focus-within/nav:opacity-100">
          Alma <span className="font-normal">Insights</span>
        </div>
      </div>

      {/* Mode switch */}
      <div className="px-[10px] pb-1 pt-4">
        <button
          onClick={handleModeSwitch}
          className="flex h-[40px] w-full items-center justify-between overflow-hidden whitespace-nowrap rounded-lg border border-nav-line bg-nav-line px-[13px] text-[13px] font-medium text-nav-ink transition-colors hover:bg-white/15"
        >
          <span className="flex items-center gap-2.5">
            {viewMode === "data-view" ? (
              <>
                <Database className="h-4 w-4" strokeWidth={1.9} />
                Data Management
              </>
            ) : (
              <>
                <ArrowLeft className="h-4 w-4" strokeWidth={1.9} />
                Back to Data View
              </>
            )}
          </span>
          <ArrowLeftRight className="h-4 w-4 text-nav-ink-2" strokeWidth={1.9} />
        </button>
      </div>

      {/* Mode label */}
      <div className="eyebrow whitespace-nowrap px-[22px] pb-2 pt-4 text-nav-ink-2 opacity-0 transition-opacity duration-150 group-hover/nav:opacity-100 group-focus-within/nav:opacity-100">
        {viewMode === "data-view" ? "Data view" : "Data management"}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-[10px]">
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
            <Link key={item.href} href={item.href} className={itemClass(isActive)}>
              <NavIcon icon={item.icon} active={isActive} />
              <span className="truncate whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover/nav:opacity-100 group-focus-within/nav:opacity-100">{item.title}</span>
            </Link>
          )
        })}
      </nav>

      <div className="flex-1" />

      {/* Workspace */}
      <div className="flex flex-col gap-0.5 px-[10px] pb-2">
        <Link href="/settings" className={itemClass(pathname === "/settings")}>
          <NavIcon icon={Settings} active={pathname === "/settings"} />
          <span className="whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover/nav:opacity-100 group-focus-within/nav:opacity-100">Settings</span>
        </Link>
        <button className={cn(itemClass(false), "w-full")}>
          <NavIcon icon={LogOut} active={false} />
          <span className="whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover/nav:opacity-100 group-focus-within/nav:opacity-100">Sign Out</span>
        </button>
      </div>

      {/* User */}
      <div className="flex items-center gap-2.5 border-t border-nav-line px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-semibold text-on-brand">
          {currentUser.initials}
        </div>
        <div className="min-w-0 flex-1 whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover/nav:opacity-100 group-focus-within/nav:opacity-100">
          <div className="truncate text-[13px] font-medium text-nav-ink">{currentUser.name}</div>
          <div className="truncate text-xs text-nav-ink-2">Alma Insights</div>
        </div>
      </div>
    </aside>
  )
}
