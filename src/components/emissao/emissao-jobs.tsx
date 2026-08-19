"use client"

import * as React from "react"
import { toast } from "sonner"
import { emissaoApi, type EmissaoResponse } from "@/services/api"

/** Uma geração de minuta em curso. Identificada pelo par cotação × seguradora,
 *  que é a mesma granularidade da `EmissaoSeguradora` no backend. */
export interface JobMinuta {
  cotacaoId: number
  seguradoraId: number
  cotacaoRotulo: string
  seguradoraNome: string
}

/** Resultado da última geração concluída. A página em cima decide o que fazer
 *  com ele — atualizar o card, abrir o modal de pendências, ou nada, se o
 *  usuário já saiu da cotação. */
export interface ResultadoMinuta {
  cotacaoId: number
  seguradoraId: number
  emissao: EmissaoResponse
}

export const chaveJob = (cotacaoId: number, seguradoraId: number) =>
  `${cotacaoId}:${seguradoraId}`

export function comJob(lista: JobMinuta[], novo: JobMinuta): JobMinuta[] {
  const chave = chaveJob(novo.cotacaoId, novo.seguradoraId)
  if (lista.some(j => chaveJob(j.cotacaoId, j.seguradoraId) === chave)) return lista
  return [...lista, novo]
}

export function semJob(
  lista: JobMinuta[],
  cotacaoId: number,
  seguradoraId: number
): JobMinuta[] {
  const chave = chaveJob(cotacaoId, seguradoraId)
  return lista.filter(j => chaveJob(j.cotacaoId, j.seguradoraId) !== chave)
}

type OuvinteConclusao = (resultado: ResultadoMinuta) => void

interface EmissaoJobsContexto {
  jobs: JobMinuta[]
  gerandoMinuta: (cotacaoId: number, seguradoraId: number) => boolean
  gerarMinuta: (job: JobMinuta, forcar?: boolean) => void
  /** Registra quem quer saber que uma minuta terminou. Devolve a função de
   *  cancelamento. É assinatura, e não um estado `resultado` que a página
   *  copia: copiar exigiria `setState` dentro de efeito, que dispara render em
   *  cascata — aqui o `setState` acontece no callback do evento externo. */
  aoConcluir: (ouvinte: OuvinteConclusao) => () => void
}

const Contexto = React.createContext<EmissaoJobsContexto | null>(null)

export function useEmissaoJobs() {
  const ctx = React.useContext(Contexto)
  if (!ctx) throw new Error("useEmissaoJobs precisa do EmissaoJobsProvider")
  return ctx
}

export function EmissaoJobsProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = React.useState<JobMinuta[]>([])
  const ouvintes = React.useRef(new Set<OuvinteConclusao>())

  const aoConcluir = React.useCallback((ouvinte: OuvinteConclusao) => {
    ouvintes.current.add(ouvinte)
    return () => {
      ouvintes.current.delete(ouvinte)
    }
  }, [])

  const gerarMinuta = React.useCallback((job: JobMinuta, forcar = false) => {
    setJobs(atual => comJob(atual, job))
    const aviso = toast.loading(`Gerando minuta na ${job.seguradoraNome}...`, {
      description: `Cotação ${job.cotacaoRotulo}`,
      // O `<Toaster>` do layout define `duration={5000}`; sem isto o aviso de
      // carregando sumiria muito antes de uma minuta de 80s terminar.
      duration: Infinity,
    })

    // Sem await de propósito: quem chamou não espera, é isso que libera a tela.
    emissaoApi
      .minuta(job.cotacaoId, job.seguradoraId, forcar)
      .then(emissao => {
        ouvintes.current.forEach(ouvinte =>
          ouvinte({
            cotacaoId: job.cotacaoId,
            seguradoraId: job.seguradoraId,
            emissao,
          })
        )
        if (emissao.url_minuta) {
          toast.success(`Minuta da ${job.seguradoraNome} pronta.`, {
            id: aviso,
            description: `Cotação ${job.cotacaoRotulo}`,
            duration: 5000,
          })
        } else {
          toast.warning(`${job.seguradoraNome} apontou pendências.`, {
            id: aviso,
            description: `Cotação ${job.cotacaoRotulo}`,
            duration: 5000,
          })
        }
      })
      .catch(err => {
        toast.error(
          err instanceof Error ? err.message : "Não foi possível gerar a minuta.",
          { id: aviso, description: `Cotação ${job.cotacaoRotulo}`, duration: 5000 }
        )
      })
      .finally(() => {
        setJobs(atual => semJob(atual, job.cotacaoId, job.seguradoraId))
      })
  }, [])

  const gerandoMinuta = React.useCallback(
    (cotacaoId: number, seguradoraId: number) =>
      jobs.some(j => j.cotacaoId === cotacaoId && j.seguradoraId === seguradoraId),
    [jobs]
  )

  const valor = React.useMemo(
    () => ({ jobs, gerandoMinuta, gerarMinuta, aoConcluir }),
    [jobs, gerandoMinuta, gerarMinuta, aoConcluir]
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}
