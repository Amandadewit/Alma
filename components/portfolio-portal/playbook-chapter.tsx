"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react"
import type { PlaybookBlock, PlaybookChapter } from "@/lib/playbook-content"

type CalloutBlock = Extract<PlaybookBlock, { type: "callout" }>

const calloutTone: Record<NonNullable<CalloutBlock["tone"]>, string> = {
  note: "border-ai bg-ai-soft text-ai-text",
  warning: "border-watch bg-watch-soft text-ink",
  tip: "border-ok bg-ok-soft text-ink",
}

export function PlaybookChapterView({
  chapter,
  onBack,
}: {
  chapter: PlaybookChapter
  onBack: () => void
}) {
  const Icon = chapter.icon

  // Split the chapter into sub-chapters at every level-2 heading; text before the first one is an introduction
  const sections = useMemo(() => {
    const out: { title: string; blocks: PlaybookBlock[] }[] = []
    for (const b of chapter.blocks) {
      if (b.type === "heading" && b.level === 2) out.push({ title: b.text, blocks: [b] })
      else if (out.length === 0) out.push({ title: "Introduction", blocks: [b] })
      else out[out.length - 1].blocks.push(b)
    }
    return out
  }, [chapter])
  const split = sections.length >= 2
  const [active, setActive] = useState(0)
  useEffect(() => {
    setActive(0)
  }, [chapter.id])
  const current = split ? sections[Math.min(active, sections.length - 1)] : null
  const visibleBlocks = current ? current.blocks : chapter.blocks
  const go = (i: number) => {
    setActive(i)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-bg font-sans">
      {/* Chapter header */}
      <header className="border-b border-line bg-white px-8 py-5">
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-2 transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Reporting Playbook
        </button>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-soft">
            <Icon className="h-6 w-6 text-brand" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-3">
              <span>Chapter {chapter.number}</span>
              <span className="h-1 w-1 rounded-full bg-ink-3" />
              <span>{chapter.readTime}</span>
            </div>
            <h1 className="mt-1 text-[22px] font-semibold text-ink">{chapter.title}</h1>
            <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-ink-2">{chapter.summary}</p>
          </div>
        </div>
      </header>

      {/* Chapter body */}
      <div className={split ? "mx-auto flex max-w-5xl items-start gap-6 px-8 py-8" : ""}>
      {split && (
        <nav className="sticky top-6 w-56 shrink-0 rounded-[10px] border border-line bg-white p-2.5">
          <div className="px-2 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wide text-ink-3">In this chapter</div>
          {sections.map((sec, i) => (
            <button
              key={sec.title}
              onClick={() => go(i)}
              className={
                "flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-[12px] leading-snug transition-colors " +
                (i === active ? "bg-brand-soft font-semibold text-brand-text" : "text-ink-2 hover:bg-surface-2 hover:text-ink")
              }
            >
              <span className="mt-px shrink-0 tabular-nums text-ink-3">{sec.title.match(/^\d+\.\d+/)?.[0] ?? i + 1}</span>
              <span>{sec.title.replace(/^\d+\.\d+\s+/, "")}</span>
            </button>
          ))}
        </nav>
      )}
      <article className={split ? "min-w-0 max-w-3xl flex-1" : "mx-auto max-w-3xl px-8 py-8"}>
        <div className="rounded-[10px] border border-line bg-white p-8">
          <div className="flex flex-col gap-5">
            {visibleBlocks.map((block, i) => {
              if (block.type === "heading") {
                if (block.level === 3) {
                  return (
                    <h3 key={i} className="-mb-1 mt-1 text-[14px] font-semibold text-brand-text">
                      {block.text}
                    </h3>
                  )
                }
                return (
                  <h2 key={i} className="mt-2 text-[15px] font-semibold text-ink">
                    {block.text}
                  </h2>
                )
              }
              if (block.type === "paragraph") {
                return (
                  <p key={i} className="text-[14px] leading-relaxed text-ink">
                    {block.lead && <strong className="font-semibold">{block.lead} </strong>}
                    {block.text}
                  </p>
                )
              }
              if (block.type === "list") {
                return (
                  <ul key={i} className="flex flex-col gap-2">
                    {block.items.map((item, j) => (
                      <li key={j} className="flex gap-2.5 text-[14px] leading-relaxed text-ink">
                        <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-ai" />
                        {typeof item === "string" ? (
                          <span>{item}</span>
                        ) : (
                          <span>
                            <strong className="font-semibold">{item.lead}</strong> {item.text}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )
              }
              if (block.type === "steps") {
                return (
                  <ol key={i} className="flex flex-col gap-3">
                    {block.items.map((item, j) => (
                      <li key={j} className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-semibold text-white">
                          {j + 1}
                        </span>
                        <div>
                          <p className="text-[14px] font-medium text-ink">{item.title}</p>
                          <p className="text-[13px] leading-relaxed text-ink-2">{item.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )
              }
              if (block.type === "table") {
                return (
                  <div key={i} className="overflow-x-auto rounded-lg border border-line">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-surface-2">
                          {block.columns.map((col) => (
                            <th
                              key={col}
                              className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink-3"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {block.rows.map((row, r) => (
                          <tr key={r}>
                            {row.map((cell, c) => (
                              <td
                                key={c}
                                className={`px-4 py-3 align-top text-[13px] leading-relaxed ${
                                  c === 0 ? "font-medium text-ink" : "text-ink-2"
                                }`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              }
              if (block.type === "callout") {
                return (
                  <div
                    key={i}
                    className={`rounded-lg border-l-2 px-4 py-3 text-[13px] leading-relaxed ${
                      calloutTone[block.tone ?? "note"]
                    }`}
                  >
                    {block.title && <p className="font-semibold">{block.title}</p>}
                    {block.text && <p className={block.title ? "mt-1" : ""}>{block.text}</p>}
                    {block.items && (
                      <ul className="mt-1.5 flex flex-col gap-1">
                        {block.items.map((item, j) => (
                          <li key={j} className="flex gap-2">
                            <ChevronRight className="mt-[3px] h-3.5 w-3.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              }
              if (block.type === "protocol") {
                return (
                  <div key={i} className="overflow-hidden rounded-lg border border-line">
                    <div className="bg-surface-2 px-4 py-2.5 text-[13px] font-semibold text-ink">
                      {block.title}
                    </div>
                    <dl className="divide-y divide-line">
                      {block.items.map((item, j) => (
                        <div key={j} className="grid grid-cols-[104px_1fr] gap-3 px-4 py-3">
                          <dt className="pt-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-3">
                            {item.label}
                          </dt>
                          <dd className="text-[13px] leading-relaxed text-ink-2">{item.text}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )
              }
              if (block.type === "image") {
                return (
                  <figure key={i} className="overflow-hidden rounded-lg border border-line bg-white p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={block.src} alt={block.alt} className="mx-auto h-auto max-w-full" />
                  </figure>
                )
              }
              return null
            })}
          </div>
        </div>

        {split && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              onClick={() => go(active - 1)}
              disabled={active === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-[12px] font-medium text-ink-2 transition-colors hover:text-brand disabled:opacity-40"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Previous
            </button>
            <span className="text-[11px] text-ink-3">{active + 1} of {sections.length}</span>
            <button
              onClick={() => go(active + 1)}
              disabled={active === sections.length - 1}
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-[12px] font-medium text-ink-2 transition-colors hover:text-brand disabled:opacity-40"
            >
              Next
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <button
          onClick={onBack}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-action-hover"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reporting Playbook
        </button>
      </article>
      </div>
    </div>
  )
}
