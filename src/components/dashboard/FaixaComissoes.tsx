"use client"

import * as React from "react"
import { DollarSign } from "lucide-react"

import { DashboardComissoes, getDashboardComissoes } from "@/services/api"
import { BlocoErro, Skeleton, formatarBRL, useDadosDashboard } from "./BlocoEstado"

const CAMPOS: { chave: keyof DashboardComissoes; label: string }[] = [
  { chave: "a_receber", label: "Comissões A Receber" },
  { chave: "pago", label: "Valor Pago" },
  { chave: "a_pagar", label: "Valor a Pagar" },
  { chave: "em_atraso", label: "Valor em Atraso" },
]

export function FaixaComissoes() {
  const { dados, carregando, erro, recarregar } = useDadosDashboard<DashboardComissoes>(
    () => getDashboardComissoes(),
    "comissoes"
  )

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm relative p-6 mt-6">
      <div className="absolute -top-4 left-4 w-10 h-10 bg-green-500 rounded flex items-center justify-center text-white shadow-md">
        <DollarSign className="size-5" />
      </div>

      {erro ? (
        <BlocoErro mensagem={erro} onRetry={recarregar} />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 text-center">
            {CAMPOS.map((campo) => (
              <div key={campo.chave}>
                <p className="text-[10px] text-zinc-400 mb-2">{campo.label}</p>
                {carregando ? (
                  <Skeleton className="h-6 w-28 mx-auto" />
                ) : (
                  <p className="text-brand-red text-lg font-bold">
                    {formatarBRL(dados?.[campo.chave])}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <p className="text-[9px] text-zinc-300">Financeiro</p>
          </div>
        </>
      )}
    </div>
  )
}
