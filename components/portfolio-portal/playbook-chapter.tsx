"use client"

import { ArrowLeft, ChevronRight } from "lucide-react"
import type { PlaybookChapter } from "@/lib/playbook-content"

export function PlaybookChapterView({
  chapter,
  onBack,
}: {
  chapter: PlaybookChapter
  onBack: () => void
}) {
  const Icon = chapter.icon

  return (
    <div className="min-h-screen bg-[#F7F6F3] font-sans">
      {/* Chapter header */}
      <header className="border-b border-[#E8E6E0] bg-white px-8 py-5">
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-medium text-[#6B6963] transition-colors hover:text-[#1B4D45]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Reporting Playbook
        </button>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF1EF]">
            <Icon className="h-6 w-6 text-[#1B4D45]" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[#9A988F]">
              <span>Chapter {chapter.number}</span>
              <span className="h-1 w-1 rounded-full bg-[#C9C7BF]" />
              <span>{chapter.readTime}</span>
            </div>
            <h1 className="mt-1 text-[22px] font-semibold text-[#2C2C2A]">{chapter.title}</h1>
            <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-[#6B6963]">{chapter.summary}</p>
          </div>
        </div>
      </header>

      {/* Chapter body */}
      <article className="mx-auto max-w-3xl px-8 py-8">
        <div className="rounded-[10px] border border-[#E8E6E0] bg-white p-8">
          <div className="flex flex-col gap-5">
            {chapter.blocks.map((block, i) => {
              if (block.type === "heading") {
                return (
                  <h2 key={i} className="mt-2 text-[15px] font-semibold text-[#2C2C2A]">
                    {block.text}
                  </h2>
                )
              }
              if (block.type === "paragraph") {
                return (
                  <p key={i} className="text-[14px] leading-relaxed text-[#4A4843]">
                    {block.text}
                  </p>
                )
              }
              if (block.type === "list") {
                return (
                  <ul key={i} className="flex flex-col gap-2">
                    {block.items.map((item, j) => (
                      <li key={j} className="flex gap-2.5 text-[14px] leading-relaxed text-[#4A4843]">
                        <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-[#B8975A]" />
                        <span>{item}</span>
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
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1B4D45] text-[11px] font-semibold text-white">
                          {j + 1}
                        </span>
                        <div>
                          <p className="text-[14px] font-medium text-[#2C2C2A]">{item.title}</p>
                          <p className="text-[13px] leading-relaxed text-[#6B6963]">{item.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )
              }
              if (block.type === "table") {
                return (
                  <div key={i} className="overflow-hidden rounded-lg border border-[#E8E6E0]">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-[#FAFAF8]">
                          {block.columns.map((col) => (
                            <th
                              key={col}
                              className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#9A988F]"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8E6E0]">
                        {block.rows.map((row, r) => (
                          <tr key={r}>
                            {row.map((cell, c) => (
                              <td
                                key={c}
                                className={`px-4 py-3 align-top text-[13px] leading-relaxed ${
                                  c === 0 ? "font-medium text-[#2C2C2A]" : "text-[#6B6963]"
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
                    className="rounded-lg border-l-2 border-[#B8975A] bg-[#FBF7EF] px-4 py-3 text-[13px] leading-relaxed text-[#5A4A2A]"
                  >
                    {block.text}
                  </div>
                )
              }
              return null
            })}
          </div>
        </div>

        <button
          onClick={onBack}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#1B4D45] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#164039]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reporting Playbook
        </button>
      </article>
    </div>
  )
}
