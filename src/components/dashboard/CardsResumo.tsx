"use client"

import * as React from "react"
import { Building, DollarSign, FileText } from "lucide-react"

import {
  DashboardResumo,
  PeriodoDashboard,
  getDashboardResumo,
} from "@/services/api"
import { BlocoErro, Skeleton, formatarBRL, useDadosDashboard } from "./BlocoEstado"

const PERIODOS: { valor: PeriodoDashboard; label: string }[] = [
  { valor: "dia", label: "Dia" },
  { valor: "mes", label: "Mês" },
  { valor: "ano", label: "Ano" },
]

const cardCls =
  "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm relative pt-5 pb-3 px-4 flex flex-col"

function Card({
  icone,
  corIcone,
  titulo,
  valor,
  legenda,
  carregando,
}: {
  icone: React.ReactNode
  corIcone: string
  titulo: string
  valor: string
  legenda: string
  carregando: boolean
}) {
  return (
    <div className={cardCls}>
      <div className={`absolute -top-4 left-4 w-10 h-10 ${corIcone} rounded flex items-center justify-center text-white shadow-md`}>
        {icone}
      </div>
      <div className="text-right flex-1 flex flex-col justify-end mt-2">
        <p className="text-xs text-zinc-400">{titulo}</p>
        {carregando ? (
          <Skeleton className="h-7 w-24 ml-auto mt-1" />
        ) : (
          <p className="text-xl font-bold text-zinc-700 dark:text-zinc-200">{valor}</p>
        )}
      </div>
      <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
        {carregando ? (
          <Skeleton className="h-3 w-32" />
        ) : (
          <p className="text-[10px] text-zinc-400">{legenda}</p>
        )}
      </div>
    </div>
  )
}

export function CardsResumo({
  onResumo,
}: {
  onResumo: (resumo: DashboardResumo | null) => void
}) {
  const [periodo, setPeriodo] = React.useState<PeriodoDashboard>("mes")

  const { dados, carregando, erro, recarregar } = useDadosDashboard<DashboardResumo>(
    () => getDashboardResumo(periodo),
    periodo
  )

  React.useEffect(() => {
    onResumo(dados)
  }, [dados, onResumo])

  const rotulo = dados?.periodo.rotulo ?? ""

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <h2 className="text-brand-red font-light tracking-wide text-lg uppercase">
          Visão Geral
        </h2>
        <div className="flex items-center gap-1">
          {PERIODOS.map((p) => (
            <button
              key={p.valor}
              onClick={() => setPeriodo(p.valor)}
              className={`px-4 py-1 text-xs rounded-md border shadow-sm transition-colors ${
                periodo === p.valor
                  ? "bg-brand-red text-white border-brand-red"
                  : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {erro ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
          <BlocoErro mensagem={erro} onRetry={recarregar} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card
            icone={<DollarSign className="size-5" />}
            corIcone="bg-green-500"
            titulo="Produção"
            valor={formatarBRL(dados?.producao)}
            legenda={`Produção de ${rotulo}`}
            carregando={carregando}
          />
          <Card
            icone={<FileText className="size-5" />}
            corIcone="bg-brand-red"
            titulo="Apólices"
            valor={String(dados?.apolices ?? 0)}
            legenda={`Emissões de ${rotulo}`}
            carregando={carregando}
          />
          <Card
            icone={<Building className="size-5" />}
            corIcone="bg-cyan-500"
            titulo="Tomadores"
            valor={`${dados?.tomadores.periodo ?? 0}/${dados?.tomadores.total ?? 0}`}
            legenda={`Cadastrados em ${rotulo} / total`}
            carregando={carregando}
          />
        </div>
      )}
    </div>
  )
}
