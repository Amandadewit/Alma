"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { funds, companies } from "@/lib/mock-data"
import {
  Send,
  Paperclip,
  MessageSquare,
  TrendingUp,
  ShieldAlert,
  FileText,
  Pencil,
  CreditCard,
  LineChart,
  Plus,
  Bot,
} from "lucide-react"

interface SuggestionGroup {
  id: string
  label: string
  icon: typeof TrendingUp
  questions: string[]
}

interface LoadedDoc {
  id: string
  icon: typeof FileText
  title: string
  subtitle: string
  count: number
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: string[]
}

let messageCounter = 0
const nextId = () => `msg-${messageCounter++}`

function buildAnswer(question: string): { content: string; sources: string[] } {
  const q = question.toLowerCase()

  if (q.includes("covenant") || q.includes("breach") || q.includes("risk")) {
    return {
      content:
        "Two holdings are at elevated covenant risk over the next two quarters. Premium Retail Group is forecast to breach its net leverage covenant (5.0x cap) by Q3, driven by softer EBITDA and a seasonal working-capital draw. Nordic Health Group has limited headroom on its interest-cover covenant (1.5x) but is expected to stay compliant if the refinancing closes on schedule. All other portfolio companies maintain comfortable headroom.",
      sources: ["Credit agreements — covenant terms", "Monthly report M04-2026"],
    }
  }

  if (q.includes("ebitda") || q.includes("budget")) {
    return {
      content:
        "Three companies are tracking below their EBITDA budget year-to-date. Premium Retail Group is -12% versus plan on weaker like-for-like sales, Nordic Health Group is -6% on delayed reimbursement, and Pixel Trust Group is -4% on elevated sales & marketing spend. CloudTech Solutions, FreshBox Logistic and Green Energy Holdings are all at or above budget.",
      sources: ["Monthly report M04-2026", "Valuation models — FY2026"],
    }
  }

  if (q.includes("ic ") || q.includes("ic memo") || q.includes("freshbox") || q.includes("conditions")) {
    return {
      content:
        "The FreshBox Logistic IC memo set three principal conditions to approval: (1) maximum opening net leverage of 4.0x with a step-down to 3.5x by year two; (2) a management equity rollover of at least 15% of consideration; and (3) completion of confirmatory commercial and financial due diligence on the top-10 customer contracts. All conditions were satisfied prior to close.",
      sources: ["IC memos — FreshBox Logistic", "Credit agreements — facility terms"],
    }
  }

  if (q.includes("revenue") || q.includes("growth")) {
    return {
      content:
        "Portfolio revenue is up 11% year-on-year on a weighted basis. The strongest performers are CloudTech Solutions (+24%) and Green Energy Holdings (+19%), both ahead of their entry case. Premium Retail Group (-3%) is the only holding contracting versus prior year. Versus entry, the median holding has grown revenue 1.4x.",
      sources: ["Monthly report M04-2026", "Valuation models — FY2026"],
    }
  }

  if (q.includes("bank") || q.includes("reporting") || q.includes("obligation")) {
    return {
      content:
        "Across the portfolio, lenders require quarterly compliance certificates within 45 days of quarter-end and audited annual accounts within 120 days of year-end. Premium Retail Group and Nordic Health Group additionally carry monthly management-accounts reporting given their tighter covenant headroom. No reporting obligations are currently overdue.",
      sources: ["Credit agreements — facility terms", "Monthly report M04-2026"],
    }
  }

  return {
    content:
      "Based on the reports, IC memos and credit agreements currently in scope, here is a summary of the relevant figures. For a precise breakdown by company or fund, narrow the scope above or ask about a specific metric such as EBITDA versus budget, covenant headroom, or revenue growth.",
    sources: ["Monthly report M04-2026"],
  }
}

export default function AIAnalysisPage() {
  const [inputValue, setInputValue] = useState("")
  const [scope, setScope] = useState("all")
  const [citeSources, setCiteSources] = useState(true)
  const [showReasoning, setShowReasoning] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const threadEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const scopeOptions = [
    { id: "all", label: "All funds" },
    ...funds.map((f) => ({ id: f.id, label: f.shortName })),
  ]

  const statusColor: Record<string, string> = {
    "on-track": "bg-[#3B6D11]",
    watch: "bg-[#EF9F27]",
    alert: "bg-[#A32D2D]",
  }

  const suggestionGroups: SuggestionGroup[] = [
    {
      id: "performance",
      label: "Performance",
      icon: TrendingUp,
      questions: [
        "Which companies are tracking below budget on EBITDA?",
        "Summarise revenue growth across the portfolio",
      ],
    },
    {
      id: "risk",
      label: "Covenants & risk",
      icon: ShieldAlert,
      questions: [
        "Are any companies at risk of a covenant breach?",
        "What are our bank reporting obligations?",
      ],
    },
    {
      id: "documents",
      label: "Documents",
      icon: FileText,
      questions: [
        "What conditions were set in the FreshBox IC memo?",
        "Summarise the latest monthly reports",
      ],
    },
  ]

  const loadedDocs: LoadedDoc[] = [
    { id: "monthly", icon: FileText, title: "Monthly reports", subtitle: "M01–M04 2026", count: 32 },
    { id: "ic", icon: Pencil, title: "IC memos", subtitle: "Investment committee", count: 11 },
    { id: "credit", icon: CreditCard, title: "Credit agreements", subtitle: "Facility & covenant terms", count: 8 },
    { id: "valuation", icon: LineChart, title: "Valuation models", subtitle: "FY2026 fair value", count: 8 },
  ]

  const submitQuestion = (question: string) => {
    const trimmed = question.trim()
    if (!trimmed) return
    const answer = buildAnswer(trimmed)
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: "user", content: trimmed },
      {
        id: nextId(),
        role: "assistant",
        content: answer.content,
        sources: citeSources ? answer.sources : undefined,
      },
    ])
    setInputValue("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submitQuestion(inputValue)
    }
  }

  const hasMessages = messages.length > 0

  return (
    <div className="flex h-screen font-sans">
      {/* Main column */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-8 pt-6 pb-4">
          <div>
            <h1 className="text-2xl font-medium text-[#2C2C2A]">Alma Intelligence</h1>
            <p className="mt-1 text-[13px] text-[#6B6963]">
              Ask questions across your portfolio, funds, and documents
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-[#E8E6E0] bg-white px-3 py-1.5 text-[11px] font-medium text-[#3B6D11]">
            <div className="h-1.5 w-1.5 rounded-full bg-[#3B6D11]" />
            Live session
          </div>
        </div>

        {/* Scope filters */}
        <div className="flex items-center gap-2 border-b border-[#E8E6E0] px-8 pb-4">
          <span className="text-[12px] text-[#6B6963]">Scope</span>
          {scopeOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setScope(opt.id)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors",
                scope === opt.id
                  ? "border-[#1B4D45] bg-[#E1F5EE] text-[#1B4D45]"
                  : "border-[#E8E6E0] bg-white text-[#6B6963] hover:border-[#D4C5A9]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Empty state OR message thread */}
        {hasMessages ? (
          <div className="flex flex-1 flex-col overflow-y-auto px-8 py-8">
            <div className="mx-auto w-full max-w-3xl space-y-6">
              {messages.map((msg) =>
                msg.role === "user" ? (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-[#1B4D45] px-4 py-3 text-[14px] text-white">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div key={msg.id} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E1F5EE]">
                      <Bot className="h-4 w-4 text-[#1B4D45]" />
                    </div>
                    <div className="max-w-[80%]">
                      <div className="rounded-2xl rounded-tl-sm bg-[#F7F6F3] px-4 py-3 text-[14px] leading-relaxed text-[#2C2C2A]">
                        {msg.content}
                      </div>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {msg.sources.map((src) => (
                            <span
                              key={src}
                              className="inline-flex items-center gap-1.5 rounded-full border border-[#E8E6E0] bg-white px-2.5 py-1 text-[11px] text-[#6B6963]"
                            >
                              <FileText className="h-3 w-3 text-[#1B4D45]" />
                              {src}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}
              <div ref={threadEndRef} />
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center overflow-y-auto px-8 py-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E1F5EE]">
              <MessageSquare className="h-6 w-6 text-[#1B4D45]" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-medium text-[#2C2C2A] text-balance">
              What would you like to know?
            </h2>
            <p className="mt-3 max-w-xl text-center text-[14px] text-[#6B6963] text-pretty">
              Alma analyses your reports, IC memos and credit agreements to answer in seconds.
            </p>

            {/* Suggestions */}
            <div className="mt-10 w-full max-w-3xl space-y-6">
              {suggestionGroups.map((group) => {
                const Icon = group.icon
                return (
                  <div key={group.id}>
                    <div className="mb-3 flex items-center gap-2">
                      <Icon className="h-4 w-4 text-[#1B4D45]" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6963]">
                        {group.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {group.questions.map((q) => (
                        <button
                          key={q}
                          onClick={() => submitQuestion(q)}
                          className="rounded-xl border border-[#E8E6E0] bg-white px-4 py-3 text-left text-[13px] text-[#2C2C2A] transition-colors hover:border-[#1B4D45] hover:bg-[#F7F6F3]"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-[#E8E6E0] px-8 py-4">
          <div className="mx-auto flex max-w-3xl items-center gap-2 rounded-xl border border-[#1B4D45] bg-white px-3 py-2 shadow-sm">
            <button className="text-[#6B6963] transition-colors hover:text-[#1B4D45]">
              <Paperclip className="h-4 w-4" />
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your portfolio..."
              className="flex-1 bg-transparent text-[14px] text-[#2C2C2A] placeholder:text-[#6B6963] focus:outline-none"
            />
            <button
              onClick={() => submitQuestion(inputValue)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B4D45] text-white transition-colors hover:bg-[#164039]"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-3 text-center text-[11px] text-[#D4C5A9]">
            Alma can make mistakes. Verify figures against source documents before acting.
          </p>
        </div>
      </div>

      {/* Right context panel */}
      <aside className="flex w-[300px] shrink-0 flex-col overflow-y-auto border-l border-[#E8E6E0] bg-[#FAFAF7] px-5 py-6">
        {/* Companies in scope */}
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6963]">
            Companies in scope
          </h3>
          <div className="mt-4 space-y-3">
            {companies.map((c) => (
              <div key={c.id} className="flex items-center gap-2.5">
                <div className={cn("h-2 w-2 shrink-0 rounded-full", statusColor[c.status])} />
                <span className="text-[13px] text-[#2C2C2A]">{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Loaded documents */}
        <div className="mt-8">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6963]">
            Loaded documents
          </h3>
          <div className="mt-4 space-y-4">
            {loadedDocs.map((doc) => {
              const Icon = doc.icon
              return (
                <div key={doc.id} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E8E6E0] bg-white">
                    <Icon className="h-4 w-4 text-[#6B6963]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium text-[#2C2C2A]">{doc.title}</div>
                    <div className="truncate text-[11px] text-[#6B6963]">{doc.subtitle}</div>
                  </div>
                  <span className="text-[12px] tabular-nums text-[#6B6963]">{doc.count}</span>
                </div>
              )
            })}
          </div>
          <button className="mt-4 flex items-center gap-2 text-[13px] font-medium text-[#1B4D45] transition-colors hover:text-[#164039]">
            <Plus className="h-4 w-4" />
            Add document
          </button>
        </div>

        {/* Settings */}
        <div className="mt-8">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6963]">
            Settings
          </h3>
          <div className="mt-4 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-medium text-[#2C2C2A]">Cite sources</div>
                <div className="text-[11px] text-[#6B6963]">Show document tags</div>
              </div>
              <Switch
                checked={citeSources}
                onCheckedChange={setCiteSources}
                className="data-[state=checked]:bg-[#1B4D45]"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-medium text-[#2C2C2A]">Show reasoning</div>
                <div className="text-[11px] text-[#6B6963]">Display how Alma answers</div>
              </div>
              <Switch
                checked={showReasoning}
                onCheckedChange={setShowReasoning}
                className="data-[state=checked]:bg-[#1B4D45]"
              />
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
