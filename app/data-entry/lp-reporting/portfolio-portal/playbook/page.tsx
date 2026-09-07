"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import {
  handbookMeta,
  playbookChapters,
  categoryMeta,
  type PlaybookChapter,
  type PlaybookCategory,
} from "@/lib/playbook-content"
import { PlaybookChapterView } from "@/components/portfolio-portal/playbook-chapter"

function ChapterCard({ chapter, onOpen }: { chapter: PlaybookChapter; onOpen: () => void }) {
  const Icon = chapter.icon
  return (
    <button
      onClick={onOpen}
      className="group flex flex-col overflow-hidden rounded-[10px] border border-[#E8E6E0] bg-white text-left transition-all hover:-translate-y-0.5 hover:border-[#1B4D45]/30 hover:shadow-[0_8px_24px_rgba(27,77,69,0.08)]"
    >
      {/* Icon header */}
      <div className="relative flex h-24 items-center justify-center border-b border-[#E8E6E0] bg-gradient-to-b from-[#EAF1EF] to-[#F4F8F6]">
        <span className="absolute left-3 top-2.5 text-[12px] font-semibold text-[#9A988F]">{chapter.number}</span>
        {chapter.underConstruction && (
          <span className="absolute right-3 top-2.5 rounded bg-[#B8975A] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
            Under construction
          </span>
        )}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
          <Icon className="h-6 w-6 text-[#1B4D45]" />
        </div>
      </div>
      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[15px] font-semibold text-[#2C2C2A]">{chapter.title}</h3>
        <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-[#6B6963]">{chapter.summary}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-[#1B4D45] transition-colors group-hover:text-[#164039]">
          Read chapter
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </span>
      </div>
    </button>
  )
}

export default function ReportingPlaybookPage() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const activeChapter = playbookChapters.find((c) => c.id === activeId) ?? null

  if (activeChapter) {
    return <PlaybookChapterView chapter={activeChapter} onBack={() => setActiveId(null)} />
  }

  const categoryOrder: PlaybookCategory[] = ["general", "governance", "accounting"]

  return (
    <div className="min-h-screen bg-[#F7F6F3] font-sans">
      {/* Top bar */}
      <div className="flex items-center justify-between bg-[#123B34] px-8 py-4">
        <div className="flex items-center gap-3">
          <span className="text-[15px] font-semibold text-white">{handbookMeta.fund}</span>
          <span className="h-4 w-px bg-white/25" />
          <span className="text-[13px] text-white/70">
            {handbookMeta.title} · {handbookMeta.edition}
          </span>
        </div>
        <span className="rounded border border-white/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/80">
          Confidential
        </span>
      </div>

      {/* Hero */}
      <header className="bg-gradient-to-br from-[#1B4D45] to-[#123B34] px-8 py-12">
        <Link
          href="/data-entry/lp-reporting/portfolio-portal/company"
          className="mb-6 inline-flex items-center gap-1.5 text-[12px] font-medium text-white/70 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Portfolio Portal
        </Link>
        <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/50">
          Reporting Playbook · Portfolio Company Finance
        </p>
        <h1 className="mt-3 max-w-3xl text-balance text-[38px] font-bold leading-tight text-white">
          {handbookMeta.fund} — {handbookMeta.title}
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/75">{handbookMeta.intro}</p>
        <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-white/15 pt-5 text-[12px]">
          <span className="text-white/60">{handbookMeta.audience}</span>
          <span className="text-white/60">{handbookMeta.edition}</span>
          <span className="font-semibold uppercase tracking-wider text-[#D9B978]">Confidential</span>
        </div>
      </header>

      {/* Chapter grids */}
      <main className="mx-auto max-w-6xl px-8 py-10">
        {/* Welcome / Introduction */}
        <section className="mb-12 rounded-[10px] border border-[#E8E6E0] bg-white p-8">
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9A988F]">Introduction</span>
          <h2 className="mt-2 text-[22px] font-bold text-[#2C2C2A]">{handbookMeta.welcome.heading}</h2>
          <div className="mt-4 max-w-3xl space-y-4">
            {handbookMeta.welcome.paragraphs.map((paragraph, i) => (
              <p key={i} className="text-[14px] leading-relaxed text-[#4A4842]">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        {categoryOrder.map((category, index) => {
          const chapters = playbookChapters.filter((c) => c.category === category)
          if (chapters.length === 0) return null
          return (
            <section key={category} className={index > 0 ? "mt-12" : ""}>
              <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9A988F]">
                {categoryMeta[category].label}
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {chapters.map((chapter) => (
                  <ChapterCard key={chapter.id} chapter={chapter} onOpen={() => setActiveId(chapter.id)} />
                ))}
              </div>
            </section>
          )
        })}
      </main>
    </div>
  )
}
