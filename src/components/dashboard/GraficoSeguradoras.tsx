"use client"

import * as React from "react"

import { PremioSeguradora, getPremioSeguradoras } from "@/services/api"
import {
  BlocoErro,
  BlocoVazio,
  Skeleton,
  formatarBRL,
  useDadosDashboard,
} from "./BlocoEstado"

/** Largura relativa de cada barra, usando o maior valor da tela como 100%. */
function largura(valor: string | null, maximo: number): string {
  if (valor == null || maximo <= 0) return "0%"
  const pct = (Number(valor) / maximo) * 100
  return `${Math.max(0, Math.min(100, pct))}%`
}

export function GraficoSeguradoras() {
  const ano = new Date().getFullYear()

  const { dados, carregando, erro, recarregar } = useDadosDashboard<PremioSeguradora[]>(
    () => getPremioSeguradoras(ano),
    String(ano)
  )

  const maximo = React.useMemo(() => {
    if (!dados?.length) return 0
    return Math.max(
      ...dados.map((d) => Math.max(Number(d.valor_atual), Number(d.meta ?? 0)))
    )
  }, [dados])

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm p-6">
      <h3 className="text-brand-red font-light tracking-wide text-lg uppercase mb-6">
        Seguradora - Prêmio {ano}
      </h3>

      {carregando ? (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 flex-1" />
            </div>
          ))}
        </div>
      ) : erro ? (
        <BlocoErro mensagem={erro} onRetry={recarregar} />
      ) : !dados?.length ? (
        <BlocoVazio mensagem="Nenhuma seguradora ativa cadastrada." />
      ) : (
        <>
          <div className="flex flex-col gap-4 text-xs">
            {dados.map((linha) => (
              <div key={linha.id} className="flex items-center gap-4">
                <span className="w-24 shrink-0 text-right text-zinc-500 truncate" title={linha.seguradora}>
                  {linha.seguradora}
                </span>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded overflow-hidden flex">
                    <div
                      className="bg-zinc-400 h-full"
                      style={{ width: largura(linha.valor_atual, maximo) }}
                      title={`Valor atual: ${formatarBRL(linha.valor_atual)}`}
                    />
                    {linha.falta != null && (
                      <div
                        className="bg-blue-400 h-full"
                        style={{ width: largura(linha.falta, maximo) }}
                        title={`Falta: ${formatarBRL(linha.falta)}`}
                      />
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400">
                    {formatarBRL(linha.valor_atual)}
                    {linha.meta != null && ` de ${formatarBRL(linha.meta)}`}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 mt-8 text-[10px] text-zinc-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-zinc-400" />
              Valor Atual
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              Falta para a meta
            </div>
          </div>
        </>
      )}
    </div>
  )
}
