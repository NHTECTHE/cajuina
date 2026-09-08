"use client"

import * as React from "react"
import { DollarSign, FileText, FileSignature, Users, TrendingUp, TrendingDown } from "lucide-react"

import {
  DashboardResumo,
} from "@/services/api"
import { Skeleton, formatarBRL } from "./BlocoEstado"

const cardCls =
  "bg-white dark:bg-[#1a1c23] border border-zinc-200 dark:border-zinc-800/60 rounded-xl shadow-sm p-5 flex flex-col gap-3"

function Card({
  icone,
  titulo,
  valor,
  tendenciaPositiva,
  tendenciaValor,
  carregando,
}: {
  icone: React.ReactNode
  titulo: string
  valor: string
  tendenciaPositiva: boolean
  tendenciaValor: string
  carregando: boolean
}) {
  return (
    <div className={cardCls}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm shadow-red-500/20">
          {icone}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{titulo}</p>
          {carregando ? (
            <Skeleton className="h-8 w-24 mt-1" />
          ) : (
            <p className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">{valor}</p>
          )}
        </div>
      </div>
      <div className="mt-1 flex items-center gap-1.5">
        {carregando ? (
          <Skeleton className="h-4 w-32" />
        ) : (
          <>
            <div className={`flex items-center text-xs font-medium ${tendenciaPositiva ? 'text-green-500' : 'text-red-500'}`}>
              {tendenciaPositiva ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
              {tendenciaValor}
            </div>
            <span className="text-xs text-zinc-400">em relação ao mês anterior</span>
          </>
        )}
      </div>
    </div>
  )
}

export function CardsResumo({
  resumo,
  carregando
}: {
  resumo: DashboardResumo | null
  carregando: boolean
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
      <Card
        icone={<DollarSign className="w-6 h-6" />}
        titulo="Produção do mês"
        valor={resumo ? formatarBRL(resumo.producao) : "R$ 0,00"}
        tendenciaPositiva={true}
        tendenciaValor="12,4%"
        carregando={carregando}
      />
      <Card
        icone={<FileText className="w-6 h-6" />}
        titulo="Apólices emitidas"
        valor={String(resumo?.apolices ?? 0)}
        tendenciaPositiva={true}
        tendenciaValor="8,2%"
        carregando={carregando}
      />
      <Card
        icone={<FileSignature className="w-6 h-6" />}
        titulo="Cotações em andamento"
        valor={String(resumo?.cotacoes?.iniciadas ?? 0)}
        tendenciaPositiva={true}
        tendenciaValor="4,5%"
        carregando={carregando}
      />
      <Card
        icone={<Users className="w-6 h-6" />}
        titulo="Tomadores cadastrados"
        valor={String(resumo?.tomadores?.total ?? 0)}
        tendenciaPositiva={true}
        tendenciaValor="10,1%"
        carregando={carregando}
      />
    </div>
  )
}

