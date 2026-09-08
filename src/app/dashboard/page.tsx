"use client"

import * as React from "react"
import { Calendar } from "lucide-react"

import { DashboardResumo, getDashboardResumo } from "@/services/api"
import { CardsResumo } from "@/components/dashboard/CardsResumo"
import { GraficoPremioLinha } from "@/components/dashboard/GraficoPremioLinha"
import { GraficoCotacoesStatus } from "@/components/dashboard/GraficoCotacoesStatus"
import { Pendencias } from "@/components/dashboard/Pendencias"
import { AcoesRapidas } from "@/components/dashboard/AcoesRapidas"
import { ApolicesPorUsuario } from "@/components/dashboard/ApolicesPorUsuario"
import { ListaUltimosTomadores } from "@/components/dashboard/ListaUltimosTomadores"

export default function DashboardPage() {
  const [resumo, setResumo] = React.useState<DashboardResumo | null>(null)
  const [carregando, setCarregando] = React.useState(true)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    setCarregando(true)
    getDashboardResumo("mes")
      .then(setResumo)
      .catch(console.error)
      .finally(() => setCarregando(false))
  }, [])

  const dataAtual = mounted ? new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date()) : ""

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            Seja bem-vindo {resumo?.usuario?.nome} 👋
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Aqui está o resumo da sua operação de hoje.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white dark:bg-[#1a1c23] border border-zinc-200 dark:border-zinc-800/60 rounded-lg px-4 py-2 text-sm text-zinc-600 dark:text-zinc-300 shadow-sm">
            <Calendar className="w-4 h-4" />
            <span>{dataAtual ? `Hoje, ${dataAtual}` : "Hoje, ..."}</span>
          </div>
        </div>
      </div>

      <CardsResumo resumo={resumo} carregando={carregando} />

      {/* Grid Layout Principal */}
      <div className="flex flex-col gap-6 mt-2">
        
        {/* ROW 2: Linha (55%) + Donut (22%) + Pendencias (23%) */}
        <div className="grid grid-cols-1 lg:grid-cols-[55fr_22fr_23fr] gap-6">
          <div className="flex flex-col min-w-0">
            <GraficoPremioLinha />
          </div>
          <div className="bg-white dark:bg-[#1a1c23] border border-zinc-200 dark:border-zinc-800/60 rounded-xl shadow-sm p-6 flex flex-col min-w-0">
            <GraficoCotacoesStatus resumo={resumo} />
          </div>
          <div className="bg-white dark:bg-[#1a1c23] border border-zinc-200 dark:border-zinc-800/60 rounded-xl shadow-sm p-6 flex flex-col h-fit min-w-0">
            <Pendencias />
          </div>
        </div>

        {/* ROW 3: Ações Rápidas */}
        <div className="w-full">
          <AcoesRapidas />
        </div>

        {/* ROW 4: Meio a Meio - Barras (50%) + Últimos Tomadores (50%) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#1a1c23] border border-zinc-200 dark:border-zinc-800/60 rounded-xl shadow-sm p-6 flex flex-col min-w-0">
            <ApolicesPorUsuario />
          </div>
          <div className="bg-white dark:bg-[#1a1c23] border border-zinc-200 dark:border-zinc-800/60 rounded-xl shadow-sm p-6 flex flex-col min-w-0">
            <ListaUltimosTomadores />
          </div>
        </div>

      </div>

    </div>
  )
}


