"use client"

import * as React from "react"
import { ChevronDown, User } from "lucide-react"
import { formatarBRL } from "./BlocoEstado"

import { apolicesApi, seguradorasApi, type SeguradoraResponse, type ApoliceResponse } from "@/services/api"
import { BlocoErro, Skeleton } from "./BlocoEstado"

const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#a855f7', '#06b6d4', '#f97316', '#ef4444', '#14b8a6']

export function ApolicesPorUsuario() {
  const [todasApolices, setTodasApolices] = React.useState<ApoliceResponse[]>([])
  const [seguradoras, setSeguradoras] = React.useState<SeguradoraResponse[]>([])
  const [carregando, setCarregando] = React.useState(true)
  const [erro, setErro] = React.useState<string | null>(null)

  const [mesFilter, setMesFilter] = React.useState("this_month")
  const [seguradoraFilter, setSeguradoraFilter] = React.useState("all")

  const recarregar = React.useCallback(() => {
    setCarregando(true)
    setErro(null)
    Promise.all([
      apolicesApi.list(),
      seguradorasApi.list({ ativo: true })
    ])
      .then(([apolices, segs]) => {
        setTodasApolices(apolices)
        setSeguradoras(segs)
      })
      .catch(err => setErro(err.message || 'Erro ao carregar'))
      .finally(() => setCarregando(false))
  }, [])

  React.useEffect(() => {
    setTimeout(() => recarregar(), 0)
  }, [recarregar])

  const { data, seguradorasDisponiveis } = React.useMemo(() => {
    // Usa diretamente a lista de seguradoras ativas vindas do banco
    const segs = seguradoras.map(s => s.nome)
    segs.sort()

    // Filtra as apólices
    let filtradas = todasApolices

    if (seguradoraFilter !== "all") {
      filtradas = filtradas.filter(a => a.seguradora_nome === seguradoraFilter)
    }

    if (mesFilter !== "all") {
      const now = new Date()
      filtradas = filtradas.filter(a => {
        if (!a.criado_em) return false
        const dataCriacao = new Date(a.criado_em)
        if (mesFilter === "this_month") {
          return dataCriacao.getMonth() === now.getMonth() && dataCriacao.getFullYear() === now.getFullYear()
        }
        if (mesFilter === "last_month") {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          return dataCriacao.getMonth() === lastMonth.getMonth() && dataCriacao.getFullYear() === lastMonth.getFullYear()
        }
        if (mesFilter === "this_year") {
          return dataCriacao.getFullYear() === now.getFullYear()
        }
        return true
      })
    }

    // Agrega os dados
    const aggregated: Record<string, number> = {}
    for (const apolice of filtradas) {
      const nome = apolice.emitido_por_nome || 'Sistema / Outros'
      const val = Number(apolice.valor_seguradora) || 0
      aggregated[nome] = (aggregated[nome] || 0) + val
    }
    
    const sorted = Object.entries(aggregated)
      .map(([name, value], index) => ({
        id: index,
        name,
        value,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8) // max 8 for dashboard
      
    return { data: sorted, seguradorasDisponiveis: segs }
  }, [todasApolices, mesFilter, seguradoraFilter, seguradoras])

  const max = data.length > 0 ? Math.max(...data.map(d => d.value)) : 0

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-zinc-600 dark:text-zinc-400 font-medium text-sm">
          Valor de apólices por usuário
        </h3>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <select 
              value={mesFilter}
              onChange={(e) => setMesFilter(e.target.value)}
              className="appearance-none outline-none flex items-center gap-2 pl-3 pr-8 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <option value="all">Todo o período</option>
              <option value="this_month">Este mês</option>
              <option value="last_month">Mês passado</option>
              <option value="this_year">Este ano</option>
            </select>
            <ChevronDown className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500" />
          </div>
          <div className="relative">
            <select 
              value={seguradoraFilter}
              onChange={(e) => setSeguradoraFilter(e.target.value)}
              className="appearance-none outline-none flex items-center gap-2 pl-3 pr-8 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer max-w-[160px] truncate"
            >
              <option value="all">Todas as seguradoras</option>
              {seguradorasDisponiveis.map(seg => (
                <option key={seg} value={seg}>{seg}</option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500" />
          </div>
        </div>
      </div>

      {erro ? (
        <BlocoErro mensagem={erro} onRetry={recarregar} />
      ) : carregando ? (
        <div className="flex flex-col gap-4 mt-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-5 h-5 rounded-full shrink-0" />
              <Skeleton className="w-32 h-4" />
              <Skeleton className="flex-1 h-2 rounded-full" />
              <Skeleton className="w-24 h-4" />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-zinc-500 py-6">
          Nenhuma apólice encontrada.
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 flex-1 relative mt-2">
            {data.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div 
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${item.color}20`, color: item.color }}
                >
                  <User className="w-3 h-3" />
                </div>
                
                <div className="w-32 shrink-0">
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate block" title={item.name}>
                    {item.name}
                  </span>
                </div>
                
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-transparent rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        width: max > 0 ? `${(item.value / max) * 100}%` : '0%',
                        backgroundColor: item.color 
                      }} 
                    />
                  </div>
                  <span className="text-xs text-zinc-500 w-24 text-right tabular-nums">
                    {formatarBRL(String(item.value))}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-[10px] text-zinc-400 mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 ml-40">
            <span>R$ 0</span>
            {max > 0 && <span>{formatarBRL(String(max))}</span>}
          </div>
        </>
      )}
    </div>
  )
}
