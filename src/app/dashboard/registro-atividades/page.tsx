"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, History, Search, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { listAtividadesAction, Atividade } from "@/app/actions/atividades"

function ActionBadge({ acao }: { acao: Atividade["acao"] }) {
  const styles = {
    LOGIN: "bg-violet-50 dark:bg-violet-950/30 border-violet-100 dark:border-violet-800/50 text-violet-700 dark:text-violet-400",
    "CRIAÇÃO": "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400",
    "ATUALIZAÇÃO": "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400",
    "EXCLUSÃO": "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400",
  }

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
      styles[acao] || "bg-zinc-50 dark:bg-zinc-950/30 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400"
    )}>
      {acao}
    </span>
  )
}

function formatDate(isoString: string) {
  try {
    const d = new Date(isoString)
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  } catch {
    return isoString
  }
}

function renderDetalhes(detalhes: string) {
  if (!detalhes) return "—"

  if (detalhes.includes("Status: sucesso")) {
    return (
      <span className="text-zinc-500 dark:text-zinc-400 font-medium text-[12px]">
        Sucesso (web)
      </span>
    )
  }

  if (detalhes.startsWith("Campos alterados: ")) {
    const fieldsStr = detalhes.replace("Campos alterados: ", "")
    const fields = fieldsStr.split(",").map(f => f.trim())
    return (
      <div className="flex flex-wrap gap-1 max-w-[280px]">
        {fields.map(f => (
          <span key={f} className="inline-flex items-center px-1.5 py-0.5 rounded bg-zinc-150/60 dark:bg-zinc-800 text-[11px] font-medium text-zinc-650 dark:text-zinc-350 border border-zinc-200 dark:border-zinc-700/60">
            {f}
          </span>
        ))}
      </div>
    )
  }

  return <span className="text-zinc-500 dark:text-zinc-400 text-[12px]">{detalhes}</span>
}

export default function RegistroAtividadesPage() {
  const router = useRouter()
  const [atividades, setAtividades] = React.useState<Atividade[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")

  async function load() {
    setLoading(true)
    setError(null)
    const res = await listAtividadesAction()
    setLoading(false)
    if (res.error) {
      setError(res.error)
    } else {
      setAtividades(res.data || [])
    }
  }

  React.useEffect(() => { load() }, []) // eslint-disable-line react-hooks/set-state-in-effect

  const filteredAtividades = React.useMemo(() => {
    if (!search) return atividades
    const q = search.toLowerCase()
    return atividades.filter(
      a =>
        a.usuario_nome.toLowerCase().includes(q) ||
        a.usuario_username.toLowerCase().includes(q) ||
        a.acao.toLowerCase().includes(q) ||
        a.entidade.toLowerCase().includes(q) ||
        a.item.toLowerCase().includes(q) ||
        a.detalhes.toLowerCase().includes(q)
    )
  }, [atividades, search])

  return (
    <div className="flex-1 flex flex-col gap-5 p-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer shrink-0">
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Registro de Atividades</h1>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Histórico geral das principais ações realizadas no sistema.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
        <input
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-3.5 py-2.5 pl-10 text-[13px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60 transition-all duration-150"
          placeholder="Buscar atividades..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Content Table */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-brand-red opacity-60" />
            <span className="text-[13px] text-zinc-500 ml-2">Carregando atividades...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-red-500 gap-2">
            <AlertCircle className="size-8" />
            <p className="text-[13px] font-medium">{error}</p>
            <button onClick={load} className="text-brand-red text-[12px] font-bold hover:underline">
              Tentar novamente
            </button>
          </div>
        ) : filteredAtividades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-2">
            <History className="size-10 opacity-30" />
            <p className="text-[13px]">Nenhuma atividade encontrada.</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col p-4 gap-3">
              {filteredAtividades.map((a) => (
                <div key={a.id} className="flex flex-col p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 shadow-sm gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400 font-medium">{formatDate(a.criado_em)}</span>
                    <ActionBadge acao={a.acao} />
                  </div>
                  <div className="flex flex-col gap-1 mt-1 text-[13px]">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {a.usuario_nome} <span className="text-[11px] text-zinc-400 font-normal">({a.usuario_username})</span>
                    </p>
                    <p className="text-zinc-650 dark:text-zinc-400">
                      <strong className="text-zinc-700 dark:text-zinc-300">Entidade:</strong> {a.entidade}
                    </p>
                    <p className="text-zinc-650 dark:text-zinc-400 truncate">
                      <strong className="text-zinc-700 dark:text-zinc-300">Item:</strong> {a.item}
                    </p>
                    {a.detalhes && (
                      <div className="mt-1">
                        {renderDetalhes(a.detalhes)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-[13px] border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/40 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    <th className="text-left px-5 py-3.5">Data/Hora</th>
                    <th className="text-left px-5 py-3.5">Usuário</th>
                    <th className="text-left px-5 py-3.5">Ação</th>
                    <th className="text-left px-5 py-3.5">Entidade</th>
                    <th className="text-left px-5 py-3.5">Item</th>
                    <th className="text-left px-5 pr-12 py-3.5">Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAtividades.map((a, i) => (
                    <tr
                      key={a.id}
                      className={cn(
                        "border-b border-zinc-100 dark:border-zinc-800/60 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40",
                        i % 2 === 0 ? "" : "bg-zinc-50/40 dark:bg-zinc-800/20"
                      )}
                    >
                      <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                        {formatDate(a.criado_em)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{a.usuario_nome}</span>
                          <span className="text-[11px] text-zinc-400">{a.usuario_username}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <ActionBadge acao={a.acao} />
                      </td>
                      <td className="px-5 py-4 text-zinc-700 dark:text-zinc-300 font-medium">
                        {a.entidade}
                      </td>
                      <td className="px-5 py-4 text-zinc-800 dark:text-zinc-200">
                        {a.item}
                      </td>
                      <td className="px-5 pr-12 py-4">
                        {renderDetalhes(a.detalhes)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
