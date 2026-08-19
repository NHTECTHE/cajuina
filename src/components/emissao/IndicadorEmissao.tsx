"use client"

import { Loader2 } from "lucide-react"
import { chaveJob, useEmissaoJobs } from "./emissao-jobs"

/** Pílula fixa com o que está sendo gerado agora.
 *
 *  Fica no layout, e não na página, porque o ponto todo é continuar visível
 *  depois que o usuário sai de Cotações. Some sozinha quando não há job. */
export function IndicadorEmissao() {
  const { jobs } = useEmissaoJobs()
  if (jobs.length === 0) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {jobs.map(job => (
        <div
          key={chaveJob(job.cotacaoId, job.seguradoraId)}
          className="flex items-center gap-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3.5 py-2.5 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <Loader2 className="size-4 animate-spin text-brand-red dark:text-[#cf7458] shrink-0" />
          <div className="flex flex-col leading-tight">
            <span className="text-[12px] font-bold text-zinc-800 dark:text-zinc-100">
              Gerando minuta · {job.seguradoraNome}
            </span>
            <span className="text-[10.5px] text-zinc-500 dark:text-zinc-400">
              Cotação {job.cotacaoRotulo} · você pode continuar usando o sistema
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
