"use client"

import * as React from "react"
import { X, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AsyncComboboxOption {
  value: string | number
  label: string
  hint?: string
}

interface AsyncComboboxProps {
  /** Currently selected value (controlled). */
  value: string | number | null
  onChange: (option: AsyncComboboxOption | null) => void
  /** Fetches matching options for the given search term (server-side). */
  fetchOptions: (search: string) => Promise<AsyncComboboxOption[]>
  placeholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
  /** Debounce for the search request, in ms. */
  debounceMs?: number
}

const inputCls = cn(
  "w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60",
  "px-3.5 py-2.5 text-[13px] text-zinc-900 dark:text-zinc-100",
  "placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60",
  "transition-all duration-150 disabled:opacity-50"
)

export function AsyncCombobox({
  value,
  onChange,
  fetchOptions,
  placeholder = "Buscar...",
  emptyMessage = "Nenhum resultado encontrado.",
  disabled = false,
  className,
  debounceMs = 300,
}: AsyncComboboxProps) {
  const [query, setQuery] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [options, setOptions] = React.useState<AsyncComboboxOption[]>([])
  const [loading, setLoading] = React.useState(false)
  const [selectedLabel, setSelectedLabel] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)
  const requestId = React.useRef(0)

  // Keep the displayed text in sync with the selected label when the popup is closed.
  const displayValue = open ? query : selectedLabel

  // Debounced fetch whenever the popup is open and the query changes.
  React.useEffect(() => {
    if (!open) return
    const id = ++requestId.current
    const handle = setTimeout(async () => {
      try {
        const results = await fetchOptions(query.trim())
        if (id === requestId.current) setOptions(results)
      } catch {
        if (id === requestId.current) setOptions([])
      } finally {
        if (id === requestId.current) setLoading(false)
      }
    }, debounceMs)
    return () => clearTimeout(handle)
  }, [query, open, fetchOptions, debounceMs])

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function handleSelect(option: AsyncComboboxOption) {
    onChange(option)
    setSelectedLabel(option.label)
    setQuery("")
    setOpen(false)
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange(null)
    setSelectedLabel("")
    setQuery("")
    setOpen(false)
  }

  function handleFocus() {
    // Ao abrir mantém o rótulo já selecionado no input (não limpa a seleção;
    // limpar só pelo botão X). A busca parte do texto atual.
    setOpen(true)
    setQuery(selectedLabel)
    setOptions([])
    setLoading(true)
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <input
          className={cn(inputCls, "pr-9")}
          placeholder={placeholder}
          value={displayValue}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setLoading(true)
          }}
          onFocus={handleFocus}
          autoComplete="off"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={value != null ? handleClear : () => (open ? setOpen(false) : handleFocus())}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
        >
          {value != null ? (
            <X className="size-3.5" />
          ) : (
            <ChevronsUpDown className="size-3.5" />
          )}
        </button>
      </div>

      {open && !disabled && (
        <div
          className={cn(
            "absolute z-50 top-full mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700",
            "bg-white dark:bg-zinc-900 shadow-lg overflow-hidden"
          )}
        >
          {loading ? (
            <p className="flex items-center gap-2 px-4 py-3 text-[12.5px] text-zinc-400">
              <Loader2 className="size-3.5 animate-spin" />
              Buscando...
            </p>
          ) : options.length === 0 ? (
            <p className="px-4 py-3 text-[12.5px] text-zinc-400">{emptyMessage}</p>
          ) : (
            <ul className="max-h-52 overflow-y-auto">
              {options.map((option) => (
                <li
                  key={option.value}
                  onMouseDown={() => handleSelect(option)}
                  className={cn(
                    "px-4 py-2.5 text-[13px] cursor-pointer transition-colors",
                    option.value === value
                      ? "bg-brand-red/10 text-brand-red font-semibold"
                      : "text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  )}
                >
                  <span className="block truncate">{option.label}</span>
                  {option.hint && (
                    <span className="block truncate font-mono text-[11px] text-zinc-400">
                      {option.hint}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
