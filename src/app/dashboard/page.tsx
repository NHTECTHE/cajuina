"use client"

import * as React from "react"

import { DashboardResumo } from "@/services/api"
import { BlocoCotacoes } from "@/components/dashboard/BlocoCotacoes"
import { CardsResumo } from "@/components/dashboard/CardsResumo"

import { GraficoSeguradoras } from "@/components/dashboard/GraficoSeguradoras"
import { TabelaNovosCadastros } from "@/components/dashboard/TabelaNovosCadastros"

export default function DashboardPage() {
  // O resumo é carregado uma vez por CardsResumo (que é dono do filtro de
  // período) e repassado para o bloco de cotações, que usa os mesmos números.
  const [resumo, setResumo] = React.useState<DashboardResumo | null>(null)

  const receberResumo = React.useCallback((dados: DashboardResumo | null) => {
    setResumo(dados)
  }, [])

  return (
    <div className="flex-1 flex flex-col gap-8 w-full pb-12 overflow-x-hidden px-4 md:px-8 pt-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-light tracking-tight text-zinc-600 dark:text-zinc-400">
          Página Inicial
        </h1>
      </div>

      <CardsResumo onResumo={receberResumo} />
      <BlocoCotacoes resumo={resumo} />
      <GraficoSeguradoras />
      <TabelaNovosCadastros />
    </div>
  )
}
