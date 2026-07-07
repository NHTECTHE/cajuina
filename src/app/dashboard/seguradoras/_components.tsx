"use client"

import * as React from "react"
import { AlertCircle, CheckCircle2, Building2, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatBRL(v: string | null) {
  if (!v) return "—"
  return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

// Converte centavos (string de dígitos) para valor decimal "1234.56"
function digitsToDecimal(digits: string): string {
  const cents = digits.replace(/\D/g, "").replace(/^0+(?=\d)/, "")
  if (!cents) return ""
  const padded = cents.padStart(3, "0")
  const reais = padded.slice(0, -2)
  const centavos = padded.slice(-2)
  return `${reais}.${centavos}`
}

// Exibe um valor decimal "1234.56" como "R$ 1.234,56"
function decimalToDisplay(decimal: string): string {
  if (!decimal) return ""
  return Number(decimal).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

// ─── Sub-components ──────────────────────────────────────────────────────────

export function Feedback({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div role="alert" aria-live="polite" className={cn(
      "flex items-center gap-2.5 rounded-xl px-4 py-3 text-[13px] font-medium border",
      type === "success"
        ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400"
        : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400"
    )}>
      {type === "success" ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
      {message}
    </div>
  )
}

export function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12.5px] font-semibold text-zinc-600 dark:text-zinc-400">
        {label}{required && <span className="text-brand-red ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

export const inputCls = cn(
  "w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60",
  "px-3.5 py-2.5 text-[13px] text-zinc-900 dark:text-zinc-100",
  "placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60",
  "transition-all duration-150 disabled:opacity-50"
)

export function CurrencyInput({ value, onChange, required, placeholder }: {
  value: string | null
  onChange: (decimal: string | null) => void
  required?: boolean
  placeholder?: string
}) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "")
    const decimal = digitsToDecimal(digits)
    onChange(decimal || null)
  }

  return (
    <input
      className={inputCls}
      inputMode="numeric"
      placeholder={placeholder ?? "R$ 0,00"}
      value={decimalToDisplay(value ?? "")}
      onChange={handleChange}
      required={required}
    />
  )
}

export function LogoPicker({ currentUrl, onChange }: {
  currentUrl: string | null
  onChange: (file: File | null) => void
}) {
  const [preview, setPreview] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    onChange(file)
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    } else {
      setPreview(null)
    }
  }

  const displayUrl = preview ?? currentUrl

  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 flex items-center justify-center overflow-hidden shrink-0">
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={displayUrl} alt="Logo da seguradora" className="w-full h-full object-contain" />
        ) : (
          <Building2 className="size-6 text-zinc-300 dark:text-zinc-600" />
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <button type="button" onClick={() => inputRef.current?.click()}
          className="px-3.5 py-2 rounded-xl text-[12.5px] font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer self-start">
          {displayUrl ? "Trocar logo" : "Enviar logo"}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      </div>
    </div>
  )
}

export function LogoAvatar({ currentUrl, onChange, size = 56 }: {
  currentUrl: string | null
  onChange: (file: File | null) => void
  size?: number
}) {
  const [preview, setPreview] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    onChange(file)
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    } else {
      setPreview(null)
    }
  }

  const displayUrl = preview ?? currentUrl

  return (
    <button type="button" onClick={() => inputRef.current?.click()}
      title="Alterar logo"
      style={{ width: size, height: size }}
      className="group relative shrink-0 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 flex items-center justify-center overflow-hidden cursor-pointer">
      {displayUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={displayUrl} alt="Logo da seguradora" className="w-full h-full object-contain" />
      ) : (
        <Building2 className="size-6 text-zinc-300 dark:text-zinc-600" />
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
        <Pencil className="size-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
    </button>
  )
}
