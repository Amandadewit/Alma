import Link from "next/link"
import { CheckCircle2, Mail, Calendar, LayoutDashboard, ArrowRight } from "lucide-react"
import { fundContact, submissionPeriod } from "@/lib/portfolio-portal-config"

export function PortalConfirmation({
  company,
  timestamp,
  reference,
}: {
  company: string
  timestamp: string
  reference: string
}) {
  return (
    <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-[14px] border border-[#E8E6E0] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF3DE]">
          <CheckCircle2 className="h-7 w-7 text-[#3B6D11]" />
        </div>
        <h1 className="mt-5 text-[20px] font-semibold text-[#2C2C2A]">Submission confirmed</h1>
        <p className="mt-1.5 text-pretty text-[13px] leading-relaxed text-[#6B6963]">
          Thank you. Your {submissionPeriod} data for <span className="font-medium text-[#2C2C2A]">{company}</span> has
          been submitted to Alma Capital and verified against our checks.
        </p>

        <div className="mt-6 flex flex-col gap-px overflow-hidden rounded-[10px] border border-[#E8E6E0] text-left">
          <div className="flex items-center gap-3 bg-[#FAFAF8] px-4 py-3">
            <Calendar className="h-4 w-4 shrink-0 text-[#1B4D45]" />
            <div className="flex-1">
              <div className="text-[11px] text-[#9A988F]">Submitted</div>
              <div className="text-[13px] font-medium text-[#2C2C2A]">{timestamp}</div>
            </div>
            <span className="rounded-md bg-[#EAF3DE] px-2 py-0.5 text-[11px] font-medium text-[#3B6D11]">
              {reference}
            </span>
          </div>
          <div className="flex items-center gap-3 bg-[#FAFAF8] px-4 py-3">
            <Mail className="h-4 w-4 shrink-0 text-[#1B4D45]" />
            <div>
              <div className="text-[11px] text-[#9A988F]">Your fund contact</div>
              <div className="text-[13px] font-medium text-[#2C2C2A]">{fundContact.name}</div>
              <div className="text-[11px] text-[#6B6963]">
                {fundContact.role} ·{" "}
                <a href={`mailto:${fundContact.email}`} className="text-[#1B4D45] underline underline-offset-2">
                  {fundContact.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        <Link
          href="/portfolio"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1B4D45] px-5 py-3 text-[13px] font-medium text-white transition-colors hover:bg-[#164039]"
        >
          <LayoutDashboard className="h-4 w-4" />
          View your Portfolio Dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-3 text-[11px] text-[#9A988F]">
          A copy of your submission has been emailed to your registered address.
        </p>
      </div>
    </div>
  )
}
