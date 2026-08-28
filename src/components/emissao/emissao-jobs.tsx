"use client"

import * as React from "react"
import { toast } from "sonner"
import { emissaoApi, type EmissaoResponse } from "@/services/api"

/** O que está em curso agora. São os dois passos lentos do wizard: a minuta,
 *  medida em 81s contra o sandbox, e a emissão, medida entre 20s e 40s. Os dois
 *  passam de qualquer paciência razoável na frente de um spinner, e por isso
 *  rodam aqui, fora da tela que os disparou. */
export type TipoJob = "minuta" | "emissao"

/** Um trabalho em curso. Identificado pelo par cotação × seguradora, que é a
 *  mesma granularidade da `EmissaoSeguradora` no backend. */
export interface JobEmissao {
  tipo: TipoJob
  cotacaoId: number
  seguradoraId: number
  cotacaoRotulo: string
  seguradoraNome: string
}

/** Resultado do último trabalho concluído. A página em cima decide o que fazer
 *  com ele — atualizar o card, abrir o modal de pendências, ou nada, se o
 *  usuário já saiu da cotação. */
export interface ResultadoEmissao {
  tipo: TipoJob
  cotacaoId: number
  seguradoraId: number
  emissao: EmissaoResponse
}

/** Um trabalho que não completou. Existe separado de `ResultadoEmissao` porque
 *  quem ouve o sucesso quer a emissão atualizada, e quem ouve a falha quer o
 *  motivo — é o que a tela de proposta mostra antes de oferecer o caminho
 *  manual. */
export interface FalhaEmissao {
  tipo: TipoJob
  cotacaoId: number
  seguradoraId: number
  motivo: string
}

export const chaveJob = (cotacaoId: number, seguradoraId: number) =>
  `${cotacaoId}:${seguradoraId}`

export function comJob(lista: JobEmissao[], novo: JobEmissao): JobEmissao[] {
  const chave = chaveJob(novo.cotacaoId, novo.seguradoraId)
  if (lista.some(j => chaveJob(j.cotacaoId, j.seguradoraId) === chave)) return lista
  return [...lista, novo]
}

export function semJob(
  lista: JobEmissao[],
  cotacaoId: number,
  seguradoraId: number
): JobEmissao[] {
  const chave = chaveJob(cotacaoId, seguradoraId)
  return lista.filter(j => chaveJob(j.cotacaoId, j.seguradoraId) !== chave)
}

/** Rótulo da pílula e do toast de carregando, por tipo de trabalho. */
export const ROTULO_JOB: Record<TipoJob, string> = {
  minuta: "Gerando minuta",
  emissao: "Emitindo apólice",
}

type OuvinteConclusao = (resultado: ResultadoEmissao) => void
type OuvinteFalha = (falha: FalhaEmissao) => void

interface EmissaoJobsContexto {
  jobs: JobEmissao[]
  /** Há trabalho em curso neste par. Um só por vez: minuta e emissão disputam
   *  o mesmo documento do lado da seguradora. */
  ocupado: (cotacaoId: number, seguradoraId: number) => boolean
  gerarMinuta: (job: Omit<JobEmissao, "tipo">, forcar?: boolean) => void
  emitirApolice: (job: Omit<JobEmissao, "tipo">, condicoesAdicionais?: string) => void
  /** Registra quem quer saber que um trabalho terminou. Devolve a função de
   *  cancelamento. É assinatura, e não um estado `resultado` que a página
   *  copia: copiar exigiria `setState` dentro de efeito, que dispara render em
   *  cascata — aqui o `setState` acontece no callback do evento externo. */
  aoConcluir: (ouvinte: OuvinteConclusao) => () => void
  /** Mesma mecânica do `aoConcluir`, para quando a chamada não completou. A
   *  emissão usa isto para oferecer o cadastro manual com o motivo na tela. */
  aoFalhar: (ouvinte: OuvinteFalha) => () => void
}

const Contexto = React.createContext<EmissaoJobsContexto | null>(null)

export function useEmissaoJobs() {
  const ctx = React.useContext(Contexto)
  if (!ctx) throw new Error("useEmissaoJobs precisa do EmissaoJobsProvider")
  return ctx
}

export function EmissaoJobsProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = React.useState<JobEmissao[]>([])
  const ouvintes = React.useRef(new Set<OuvinteConclusao>())
  const ouvintesFalha = React.useRef(new Set<OuvinteFalha>())

  const aoConcluir = React.useCallback((ouvinte: OuvinteConclusao) => {
    ouvintes.current.add(ouvinte)
    return () => {
      ouvintes.current.delete(ouvinte)
    }
  }, [])

  const aoFalhar = React.useCallback((ouvinte: OuvinteFalha) => {
    ouvintesFalha.current.add(ouvinte)
    return () => {
      ouvintesFalha.current.delete(ouvinte)
    }
  }, [])

  /** Roda um passo lento fora da tela e avisa quem estiver ouvindo.
   *
   *  `desfecho` existe porque nenhum dos dois passos é sucesso-ou-erro: uma
   *  minuta pode sair sem PDF por pendência, e uma emissão pode ir para análise
   *  em vez de virar apólice. Os dois casos são normais e merecem aviso
   *  diferente do de erro, que é quando a chamada não completou. */
  const rodar = React.useCallback(
    (
      job: JobEmissao,
      executar: () => Promise<EmissaoResponse>,
      desfecho: (emissao: EmissaoResponse) => { ok: boolean; texto: string }
    ) => {
      setJobs(atual => comJob(atual, job))
      const aviso = toast.loading(
        `${ROTULO_JOB[job.tipo]} na ${job.seguradoraNome}...`,
        {
          description: `Cotação ${job.cotacaoRotulo}`,
          // O `<Toaster>` do layout define `duration={5000}`; sem isto o aviso
          // de carregando sumiria muito antes de um passo de 80s terminar.
          duration: Infinity,
        }
      )

      // Sem await de propósito: quem chamou não espera, é isso que libera a tela.
      executar()
        .then(emissao => {
          ouvintes.current.forEach(ouvinte =>
            ouvinte({
              tipo: job.tipo,
              cotacaoId: job.cotacaoId,
              seguradoraId: job.seguradoraId,
              emissao,
            })
          )
          const { ok, texto } = desfecho(emissao)
          const avisar = ok ? toast.success : toast.warning
          avisar(texto, {
            id: aviso,
            description: `Cotação ${job.cotacaoRotulo}`,
            duration: 5000,
          })
        })
        .catch(err => {
          const motivo =
            err instanceof Error ? err.message : "A seguradora não respondeu."
          ouvintesFalha.current.forEach(ouvinte =>
            ouvinte({
              tipo: job.tipo,
              cotacaoId: job.cotacaoId,
              seguradoraId: job.seguradoraId,
              motivo,
            })
          )
          toast.error(motivo, {
            id: aviso,
            description: `Cotação ${job.cotacaoRotulo}`,
            duration: 5000,
          })
        })
        .finally(() => {
          setJobs(atual => semJob(atual, job.cotacaoId, job.seguradoraId))
        })
    },
    []
  )

  const gerarMinuta = React.useCallback(
    (job: Omit<JobEmissao, "tipo">, forcar = false) => {
      rodar(
        { ...job, tipo: "minuta" },
        () => emissaoApi.minuta(job.cotacaoId, job.seguradoraId, forcar),
        emissao =>
          emissao.url_minuta
            ? { ok: true, texto: `Minuta da ${job.seguradoraNome} pronta.` }
            : { ok: false, texto: `${job.seguradoraNome} apontou pendências.` }
      )
    },
    [rodar]
  )

  const emitirApolice = React.useCallback(
    (job: Omit<JobEmissao, "tipo">, condicoesAdicionais = "") => {
      rodar(
        { ...job, tipo: "emissao" },
        () =>
          emissaoApi.emitir(job.cotacaoId, job.seguradoraId, condicoesAdicionais),
        emissao =>
          emissao.etapa === "emitida"
            ? { ok: true, texto: `Apólice ${emissao.policy_number} emitida.` }
            : {
                ok: false,
                texto: `${job.seguradoraNome} mandou a proposta para análise.`,
              }
      )
    },
    [rodar]
  )

  const ocupado = React.useCallback(
    (cotacaoId: number, seguradoraId: number) =>
      jobs.some(
        j => j.cotacaoId === cotacaoId && j.seguradoraId === seguradoraId
      ),
    [jobs]
  )

  const valor = React.useMemo(
    () => ({ jobs, ocupado, gerarMinuta, emitirApolice, aoConcluir, aoFalhar }),
    [jobs, ocupado, gerarMinuta, emitirApolice, aoConcluir, aoFalhar]
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}
