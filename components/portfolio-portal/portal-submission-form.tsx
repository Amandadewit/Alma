"use client"

import { useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Info, Upload, Paperclip, X } from "lucide-react"
import { portalSections, priorPeriod, type FieldDef } from "@/lib/portfolio-portal-config"

interface Props {
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  showErrors: boolean
}

function FieldRow({
  field,
  value,
  onChange,
  showErrors,
}: {
  field: FieldDef
  value: string
  onChange: (v: string) => void
  showErrors: boolean
}) {
  const [touched, setTouched] = useState(false)
  const empty = value.trim() === ""
  const requiredError = field.required && empty && (touched || showErrors)

  const inputBase =
    "w-full rounded-lg border bg-white px-3 py-2 text-[13px] text-[#2C2C2A] outline-none transition-colors placeholder:text-[#B8B6AE] focus:border-[#1B4D45]"

  return (
    <div className={field.type === "textarea" ? "sm:col-span-2" : ""}>
      <div className="mb-1.5 flex items-center gap-1.5">
        <label className="text-[12px] font-medium text-[#2C2C2A]">
          {field.label}
          {field.required && <span className="ml-0.5 text-[#A32D2D]">*</span>}
        </label>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" aria-label={`About ${field.label}`} className="text-[#9A988F] hover:text-[#1B4D45]">
              <Info className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[260px] leading-snug">
            {field.tooltip}
          </TooltipContent>
        </Tooltip>
        {field.prior !== undefined && (
          <span className="ml-auto text-[10px] tabular-nums text-[#9A988F]">
            {priorPeriod}: {field.prior}
            {field.unit === "€M" ? "" : field.unit === "%" ? "%" : ""}
          </span>
        )}
      </div>

      {field.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={field.placeholder}
          rows={3}
          className={cn(inputBase, "resize-none", requiredError ? "border-[#A32D2D]" : "border-[#E8E6E0]")}
        />
      ) : (
        <div className="relative">
          <input
            inputMode="decimal"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder={field.placeholder}
            className={cn(
              inputBase,
              "tabular-nums",
              field.unit ? "pr-11" : "",
              requiredError ? "border-[#A32D2D]" : "border-[#E8E6E0]",
            )}
          />
          {field.unit && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-[#9A988F]">
              {field.unit}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function FileUpload() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<string[]>([])

  const addFiles = (list: FileList | null) => {
    if (!list) return
    setFiles((prev) => [...prev, ...Array.from(list).map((f) => f.name)])
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#D6D3CB] bg-[#FAFAF8] px-4 py-6 text-center transition-colors hover:border-[#1B4D45] hover:bg-[#F2F1ED]"
      >
        <Upload className="h-5 w-5 text-[#1B4D45]" />
        <span className="text-[12px] font-medium text-[#2C2C2A]">Attach supporting documents</span>
        <span className="text-[11px] text-[#9A988F]">Management accounts, board deck, bank statements · PDF, XLSX</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />
      {files.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5">
          {files.map((name, i) => (
            <li
              key={`${name}-${i}`}
              className="flex items-center gap-2 rounded-lg border border-[#E8E6E0] bg-white px-3 py-2"
            >
              <Paperclip className="h-3.5 w-3.5 shrink-0 text-[#9A988F]" />
              <span className="flex-1 truncate text-[12px] text-[#2C2C2A]">{name}</span>
              <button
                type="button"
                aria-label={`Remove ${name}`}
                onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-[#9A988F] hover:text-[#A32D2D]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function PortalSubmissionForm({ values, onChange, showErrors }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {portalSections.map((section) => {
        const Icon = section.icon
        return (
          <section key={section.id} className="rounded-[10px] border border-[#E8E6E0] bg-white">
            <div className="flex items-center gap-3 border-b border-[#E8E6E0] px-5 py-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF1EF]">
                <Icon className="h-4 w-4 text-[#1B4D45]" />
              </div>
              <div>
                <h2 className="text-[13px] font-semibold text-[#2C2C2A]">{section.title}</h2>
                <p className="text-[11px] text-[#9A988F]">{section.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-x-5 gap-y-4 p-5 sm:grid-cols-2">
              {section.fields.map((field) => (
                <FieldRow
                  key={field.key}
                  field={field}
                  value={values[field.key] ?? ""}
                  onChange={(v) => onChange(field.key, v)}
                  showErrors={showErrors}
                />
              ))}
              {section.id === "comments" && (
                <div className="sm:col-span-2">
                  <FileUpload />
                </div>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
