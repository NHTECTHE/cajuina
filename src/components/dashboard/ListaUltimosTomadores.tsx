"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getNovosCadastros, NovosCadastrosPagina } from "@/services/api"
import { BlocoErro, Skeleton, useDadosDashboard } from "./BlocoEstado"

function getInitials(name: string) {
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function ListaUltimosTomadores() {
  const { dados, carregando, erro, recarregar } = useDadosDashboard<NovosCadastrosPagina>(
    () => getNovosCadastros({ page: 1, pageSize: 4 }),
    "ultimos-tomadores"
  )

  const linhas = dados?.results ?? []

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-zinc-600 dark:text-zinc-400 font-medium text-sm">
          Últimos tomadores cadastrados
        </h3>
        <Link href="/dashboard/tomador" className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 transition-colors">
          Ver todos
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {erro ? (
        <BlocoErro mensagem={erro} onRetry={recarregar} />
      ) : (
        <div className="flex flex-col gap-0">
          {carregando ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-64" />
                </div>
              </div>
            ))
          ) : linhas.length === 0 ? (
            <div className="py-4 text-center text-sm text-zinc-500">
              Nenhum tomador cadastrado recentemente.
            </div>
          ) : (
            linhas.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors -mx-2 px-2 rounded-lg">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-medium text-xs shadow-sm bg-red-500`}>
                  {getInitials(item.nome)}
                </div>
                
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200 truncate">
                    {item.nome}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 truncate mt-0.5">
                    <span className="truncate">{item.email || "—"}</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 shrink-0" />
                    <span>{item.telefone || "—"}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="block text-xs text-zinc-500 whitespace-pre-line text-right">
                    {item.criado_em ? new Date(item.criado_em).toLocaleDateString() : "Recente"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
