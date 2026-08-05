"use client"

import * as React from "react"

import { DashboardResumo } from "@/services/api"
import { Skeleton } from "./BlocoEstado"

const ITENS = [
  { chave: "iniciadas", titulo: "Iniciadas", legenda: "Cotações em aberto" },
  { chave: "aprovadas", titulo: "Aprovadas", legenda: "Aprovadas com sucesso" },
  { chave: "emitidas", titulo: "Emitidas", legenda: "Já viraram apólice" },
] as const

export function BlocoCotacoes({ resumo }: { resumo: DashboardResumo | null }) {
  const carregando = resumo === null

  return (
    <div className="flex flex-col gap-6 mt-6">
      <div className="flex items-center justify-start gap-4">
        <h2 className="text-brand-red font-light tracking-wide text-lg uppercase">
          Cotações
        </h2>
      </div>

      {/* Desktop / tablet */}
      <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-6 lg:w-[75%] self-start">
        {ITENS.map((item) => (
          <div
            key={item.chave}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm pt-4 pb-3 px-4 flex flex-col"
          >
            <div className="text-left flex-1 flex flex-col justify-end">
              <p className="text-xs text-zinc-400">{item.titulo}</p>
              {carregando ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <p className="text-xl font-bold text-zinc-700 dark:text-zinc-200">
                  {resumo.cotacoes[item.chave]}
                </p>
              )}
            </div>
            <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] text-zinc-400">{item.legenda}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile */}
      <div className="sm:hidden w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm p-4 flex flex-col">
        <div className="flex flex-col gap-3 text-xs text-zinc-600 dark:text-zinc-400 flex-1 justify-center">
          {ITENS.map((item, i) => (
            <div
              key={item.chave}
              className={`flex items-center justify-between py-1 ${
                i < ITENS.length - 1
                  ? "border-b border-zinc-100 dark:border-zinc-800"
                  : ""
              }`}
            >
              <span>{item.titulo}:</span>
              {carregando ? (
                <Skeleton className="h-4 w-10" />
              ) : (
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  {resumo.cotacoes[item.chave]}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
