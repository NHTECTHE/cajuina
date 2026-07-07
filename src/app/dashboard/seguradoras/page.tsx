"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Building2, Plus, Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { type Seguradora, listSeguradorasAction } from "@/app/actions/seguradoras"
import { formatBRL, inputCls } from "./_components"

export default function SeguradorasPage() {
  const router = useRouter()
  const [seguradoras, setSeguradoras] = React.useState<Seguradora[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")

  async function load(q = search) {
    setLoading(true)
    const res = await listSeguradorasAction(q)
    if (res.data) setSeguradoras(res.data)
    setLoading(false)
  }

  React.useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    load(search)
  }

  return (
    <div className="flex-1 flex flex-col gap-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Seguradoras</h1>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              {seguradoras.length} {seguradoras.length === 1 ? "seguradora cadastrada" : "seguradoras cadastradas"}
            </p>
          </div>
        </div>
        <Link href="/dashboard/seguradoras/novo"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold bg-brand-red text-white hover:bg-brand-red/90 active:scale-[0.98] transition-all cursor-pointer shadow-sm shadow-brand-red/20 self-start sm:self-auto">
          <Plus className="size-4" /> Nova Seguradora
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
        <input
          className={cn(inputCls, "pl-10 pr-4")}
          placeholder="Buscar por nome..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </form>

      {/* Table */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-brand-red opacity-60" />
          </div>
        ) : seguradoras.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-400">
            <Building2 className="size-10 opacity-30" />
            <p className="text-[13px]">Nenhuma seguradora encontrada.</p>
            <Link href="/dashboard/seguradoras/novo"
              className="text-[12px] font-semibold text-brand-red hover:underline cursor-pointer">
              Cadastrar a primeira seguradora
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/40">
                  {["", "Nome", "Meta", "Prêmio Mínimo", "Taxa Comissão", "Dia Venc."].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {seguradoras.map((s, i) => (
                  <tr key={s.id}
                    onClick={() => router.push(`/dashboard/seguradoras/${s.id}`)}
                    className={cn(
                      "border-b border-zinc-100 dark:border-zinc-800/60 transition-colors cursor-pointer",
                      i % 2 === 0 ? "" : "bg-zinc-50/40 dark:bg-zinc-800/20",
                      "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                    )}>
                    <td className="px-4 py-3">
                      <div className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 flex items-center justify-center overflow-hidden">
                        {s.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.logo} alt={s.nome} className="w-full h-full object-contain" />
                        ) : (
                          <Building2 className="size-4 text-zinc-300 dark:text-zinc-600" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">{s.nome}</td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{formatBRL(s.meta)}</td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{formatBRL(s.premio_minimo)}</td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {s.taxa_comissao ? `${Number(s.taxa_comissao).toFixed(2)}%` : "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {s.dia_vencimento ? `Dia ${s.dia_vencimento}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
