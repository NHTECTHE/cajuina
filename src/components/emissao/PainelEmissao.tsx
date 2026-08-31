"use client"

import * as React from "react"
import {
  AlertTriangle,
  FileText,
  Loader2,
  Receipt,
  RefreshCw,
  ShieldCheck,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { formatBRL } from "@/lib/utils"
import { emissaoApi, type EmissaoResponse } from "@/services/api"

import {
  AvisoDesatualizada,
  ListaPendencias,
  Parcelamento,
  SeloEtapa,
} from "./emissao-comum"
import { useEmissaoJobs } from "./emissao-jobs"

interface Props {
  emissao: EmissaoResponse
  cotacaoId: number
  cotacaoRotulo: string
  /** Toda mudança de estado sobe para a página, que é dona do cache por
   *  seguradora — o painel não guarda cópia própria da emissão. */
  aoAtualizar: (emissao: EmissaoResponse) => void
}

/** O que a seguradora escolhida tem a dizer, aberto na própria tela de cotação.
 *
 *  Nasceu da quebra do `ModalEmissao`, que carregava o wizard inteiro num
 *  diálogo. Aqui ficam os passos que a corretora faz antes de mandar a
 *  proposta — parcelamento, minuta e acompanhamento. Emitir não mora aqui: é
 *  na tela de proposta. Anexo também não: é no modal da pendência.
 *
 *  Largura total, abaixo do grid, e não dentro do card: o card é um tile de
 *  altura fixa num grid de até quatro colunas, e crescer ali quebraria a
 *  linha inteira. */
export function PainelEmissao({
  emissao,
  cotacaoId,
  cotacaoRotulo,
  aoAtualizar,
}: Props) {
  const { ocupado, gerarMinuta } = useEmissaoJobs()
  const [recotando, setRecotando] = React.useState(false)
  const [sincronizando, setSincronizando] = React.useState(false)

  const seguradoraId = emissao.seguradora
  const emAndamento = ocupado(cotacaoId, seguradoraId)
  const travado = emAndamento || recotando || sincronizando

  const emitida = emissao.etapa === "emitida"
  const emAnalise = emissao.etapa === "aguardando"
  const temMinuta = Boolean(emissao.document_number)

  const job = {
    cotacaoId,
    seguradoraId,
    cotacaoRotulo,
    seguradoraNome: emissao.seguradora_nome,
  }

  /** Trocar o parcelamento é recotar: a seguradora só aceita o número de
   *  parcelas na atualização, nunca na criação. */
  const trocarParcelas = async (parcelas: number) => {
    setRecotando(true)
    try {
      aoAtualizar(await emissaoApi.cotar(cotacaoId, seguradoraId, parcelas))
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Não foi possível trocar o parcelamento."
      )
    } finally {
      setRecotando(false)
    }
  }

  /** Reenvia os dados atuais da cotação. É o mesmo endpoint do parcelamento,
   *  sem `parcelas`: o backend transforma a segunda chamada em `PUT` lá dentro,
   *  então não nasce cotação órfã contando contra o limite do tomador. */
  const recotar = async () => {
    setRecotando(true)
    try {
      aoAtualizar(await emissaoApi.cotar(cotacaoId, seguradoraId))
      toast.success("Cotação atualizada na seguradora.")
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Não foi possível recotar na seguradora."
      )
    } finally {
      setRecotando(false)
    }
  }

  const sincronizar = async () => {
    setSincronizando(true)
    try {
      const atualizada = await emissaoApi.sincronizar(cotacaoId, seguradoraId)
      aoAtualizar(atualizada)
      if (atualizada.etapa === "emitida") {
        toast.success(`Apólice ${atualizada.policy_number} emitida.`)
      } else {
        toast.info(atualizada.mensagem || "A seguradora ainda está analisando.")
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Não foi possível consultar a seguradora."
      )
    } finally {
      setSincronizando(false)
    }
  }

  return (
    <div className="md:col-span-12 mt-4 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/40 rounded-xl p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-2.5">
        <h3 className="text-brand-red dark:text-[#cf7458] uppercase font-normal text-lg">
          {emissao.seguradora_nome}
        </h3>
        <SeloEtapa etapa={emissao.etapa} />
      </div>

      {/* ─── Números da seguradora ─── */}
      <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 p-4 text-[12.5px]">
        <div className="flex items-center justify-between">
          <dt className="text-zinc-500 dark:text-zinc-400">Prêmio total</dt>
          <dd className="font-bold text-brand-red dark:text-[#cf7458]">
            {formatBRL(emissao.premio_total)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-zinc-500 dark:text-zinc-400">Prêmio líquido</dt>
          <dd className="font-semibold">{formatBRL(emissao.premio_liquido)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-zinc-500 dark:text-zinc-400">Taxa</dt>
          <dd className="font-semibold">
            {emissao.taxa
              ? `${Number(emissao.taxa).toLocaleString("pt-BR", {
                  maximumFractionDigits: 6,
                })}%`
              : "—"}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-zinc-500 dark:text-zinc-400">Comissão</dt>
          <dd className="font-semibold">
            {emissao.comissao_percentual
              ? `${Number(emissao.comissao_percentual).toLocaleString("pt-BR")}%`
              : "—"}
            <span className="font-normal text-zinc-500">
              {" "}
              · {formatBRL(emissao.comissao_valor)}
            </span>
          </dd>
        </div>
      </dl>

      <AvisoDesatualizada
        emissao={emissao}
        travado={travado}
        recotando={recotando}
        aoRecotar={recotar}
      />

      {/* ─── Parcelamento ─── */}
      {emissao.opcoes_parcelamento.length > 0 && (
        <section className="mt-4">
          <Parcelamento
            emissao={emissao}
            travado={travado}
            recotando={recotando}
            aoTrocar={trocarParcelas}
          />
        </section>
      )}

      {/* ─── Minuta ───
          A ação principal do painel enquanto a apólice não saiu. É daqui que
          sai o documento sem o qual a proposta não pode ser enviada. */}
      <section className="mt-4 border-t border-zinc-200/70 dark:border-zinc-700/50 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Minuta
            {emissao.document_number && (
              <span className="ml-2 font-mono font-normal normal-case tracking-normal text-zinc-400">
                doc {emissao.document_number}
              </span>
            )}
          </h3>
          {/* Ou o PDF, ou o botão — nunca os dois. Com a minuta pronta não há
              o que gerar; sem ela, o botão é o caminho.

              "Gerar mesmo assim" não é sinônimo de "de novo": a seguradora que
              aponta pendência devolve `document_number` sem `url_minuta`, e é
              esse par que significa "ela recusou". O botão então força a
              geração, passando `tem_pendencias` como `forcar`. */}
          {emissao.url_minuta ? (
            <a
              href={emissao.url_minuta}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-green-300 dark:border-green-700 px-3 py-1.5 text-[12px] font-semibold text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors"
            >
              <FileText className="size-3.5" /> Abrir PDF
            </a>
          ) : (
            !emitida &&
            !emAnalise && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={travado}
                onClick={() => gerarMinuta(job, emissao.tem_pendencias)}
                className="h-8 rounded-lg text-[12px] font-semibold"
              >
                {emAndamento ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : temMinuta ? (
                  "Gerar mesmo assim"
                ) : (
                  "Gerar minuta"
                )}
              </Button>
            )
          )}
        </div>

        {!temMinuta && !emitida && !emAnalise && (
          <p className="mt-2 text-[11.5px] text-zinc-500 dark:text-zinc-400">
            A proposta só pode ser enviada depois que a minuta sair.
          </p>
        )}

        <div className="mt-3">
          <ListaPendencias emissao={emissao} />
        </div>
      </section>

      {/* ─── Desfecho: em análise ─── */}
      {emAnalise && (
        <section className="mt-4 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-4">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="size-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <div className="text-[13px] font-bold text-amber-800 dark:text-amber-300">
                {emissao.mensagem || "Apólice em análise"}
              </div>
              <p className="mt-1 text-[11.5px] text-amber-700/90 dark:text-amber-400/90">
                A emissão foi pedida e agora depende do time técnico da
                seguradora. A API dela não avisa quando termina — clique em
                atualizar para perguntar.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={travado}
            onClick={sincronizar}
            className="mt-3 h-8 rounded-lg text-[12px] font-semibold border-amber-300 dark:border-amber-500/30"
          >
            {sincronizando ? (
              <>
                <Loader2 className="size-3.5 animate-spin" /> Consultando...
              </>
            ) : (
              <>
                <RefreshCw className="size-3.5" /> Atualizar andamento
              </>
            )}
          </Button>
        </section>
      )}

      {/* ─── Desfecho: emitida ─── */}
      {emitida && (
        <section className="mt-4 rounded-xl border border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/10 p-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="size-4 shrink-0 text-green-600 dark:text-green-400" />
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-green-700/80 dark:text-green-400/80">
                Apólice emitida
              </div>
              <div className="font-mono text-[15px] font-bold text-green-800 dark:text-green-300">
                {emissao.policy_number}
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {emissao.url_apolice && (
              <a
                href={emissao.url_apolice}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-green-300 dark:border-green-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-[12px] font-semibold text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors"
              >
                <FileText className="size-3.5" /> PDF da apólice
              </a>
            )}
            {emissao.url_boleto && (
              <a
                href={emissao.url_boleto}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-green-300 dark:border-green-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-[12px] font-semibold text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors"
              >
                <Receipt className="size-3.5" /> Boleto
              </a>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
