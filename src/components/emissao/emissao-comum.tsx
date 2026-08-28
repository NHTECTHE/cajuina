"use client"

import { AlertTriangle, Loader2 } from "lucide-react"

import { NativeSelect } from "@/components/ui/native-select"
import { cn, formatBRL } from "@/lib/utils"
import type { EmissaoResponse, EtapaEmissao } from "@/services/api"

/** Formatos que a análise da seguradora consegue abrir.
 *
 *  A mesma lista existe no backend, e é lá que ela vale — a Junto não valida
 *  nada, aceitou um `.exe` de 4 bytes com 200 quando testamos. Aqui ela é só
 *  cortesia: evita a viagem de ida e volta para receber o mesmo "não". */
export const EXTENSOES = [
  ".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx", ".xls", ".xlsx", ".zip",
]

/** Limite da seguradora por requisição, somando os arquivos. */
export const TAMANHO_MAXIMO = 30 * 1024 * 1024

export function tamanhoLegivel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const SELO: Record<EtapaEmissao, { texto: string; classe: string }> = {
  cotada: {
    texto: "Cotada",
    classe: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  },
  minuta: {
    texto: "Minuta gerada",
    classe: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  },
  aguardando: {
    texto: "Em análise",
    classe: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  },
  emitida: {
    texto: "Emitida",
    classe: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300",
  },
  recusada: {
    texto: "Recusada",
    classe: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
  },
}

export function SeloEtapa({ etapa }: { etapa: EtapaEmissao }) {
  const selo = SELO[etapa] ?? SELO.cotada
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide",
        selo.classe
      )}
    >
      {selo.texto}
    </span>
  )
}

/** Escolha do parcelamento. Vive em dois lugares — o painel da cotação e o
 *  modal de pendências — porque a corretora precisa poder ajustar tanto antes
 *  de mandar a proposta quanto na hora de resolver a pendência. */
export function Parcelamento({
  emissao,
  travado,
  recotando,
  aoTrocar,
}: {
  emissao: EmissaoResponse
  travado: boolean
  recotando: boolean
  aoTrocar: (parcelas: number) => void
}) {
  if (emissao.opcoes_parcelamento.length === 0) return null

  const fixo = emissao.etapa === "emitida" || emissao.etapa === "aguardando"

  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Parcelamento
      </h3>
      {/* Depois de emitida a escolha está no documento: mostrar um select que
          não muda nada seria mentira. */}
      {fixo ? (
        <span className="text-[12.5px] font-semibold">
          {emissao.numero_parcelas ?? 1}x
        </span>
      ) : (
        <div className="flex items-center gap-2">
          {recotando && <Loader2 className="size-3.5 animate-spin text-zinc-400" />}
          <NativeSelect
            size="sm"
            disabled={travado}
            value={String(emissao.numero_parcelas ?? "")}
            onChange={e => aoTrocar(Number(e.target.value))}
            aria-label="Número de parcelas"
          >
            {emissao.opcoes_parcelamento.map(opcao => (
              <option key={opcao.numero_parcelas} value={opcao.numero_parcelas}>
                {opcao.numero_parcelas}x de {formatBRL(opcao.parcelas[0]?.valor)}
              </option>
            ))}
          </NativeSelect>
        </div>
      )}
    </div>
  )
}

export function ListaPendencias({ emissao }: { emissao: EmissaoResponse }) {
  if (emissao.pendencias.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      {emissao.pendencias.map(p => (
        <div
          key={p.codigo}
          className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-3"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="size-3.5 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <div className="text-[12.5px] font-semibold text-amber-800 dark:text-amber-300">
                {p.descricao}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                {p.departamento}
                {p.email ? ` · ${p.email}` : ""}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
