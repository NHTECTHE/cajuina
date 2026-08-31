"use client"

import * as React from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Paperclip,
  PenLine,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { formatBRL } from "@/lib/utils"
import { emissaoApi, type EmissaoResponse } from "@/services/api"

import {
  AvisoDesatualizada,
  EXTENSOES,
  ListaPendencias,
  Parcelamento,
  SeloEtapa,
  TAMANHO_MAXIMO,
  tamanhoLegivel,
} from "./emissao-comum"

interface Props {
  aberto: boolean
  aoFechar: () => void
  emissao: EmissaoResponse
  cotacaoId: number
  cotacaoRotulo: string
  aoAtualizar: (emissao: EmissaoResponse) => void
  /** Dispara a emissão integrada. A página é dona da chamada porque é ela que
   *  decide o que fazer quando falha. */
  aoConfirmar: (condicoes: string) => void
  /** Está emitindo agora. Vem da página, que acompanha o job. */
  emitindo: boolean
  /** Motivo da última tentativa que não completou, ou `null`. Quando vem
   *  preenchido, o diálogo troca o botão de confirmar pelo caminho manual. */
  falha: string | null
  aoEmitirManual: () => void
}

/** A confirmação da emissão, e a pendência quando existe.
 *
 *  Um diálogo só, não dois: quem aperta "Emitir" está sempre confirmando, e
 *  a pendência é conteúdo a mais dentro da mesma confirmação — não uma tela
 *  separada. Anexar e parcelar moram aqui porque são as duas coisas que
 *  resolvem uma pendência sem sair do caminho. */
export function ModalEmitir({
  aberto,
  aoFechar,
  emissao,
  cotacaoId,
  cotacaoRotulo,
  aoAtualizar,
  aoConfirmar,
  emitindo,
  falha,
  aoEmitirManual,
}: Props) {
  const [condicoes, setCondicoes] = React.useState(
    emissao?.condicoes_adicionais ?? ""
  )
  const [pendentes, setPendentes] = React.useState<File[]>([])
  const [enviandoAnexos, setEnviandoAnexos] = React.useState(false)
  const [recotando, setRecotando] = React.useState(false)
  const inputArquivo = React.useRef<HTMLInputElement>(null)

  const seguradoraId = emissao.seguradora
  const travado = emitindo || enviandoAnexos || recotando
  const temPendencia = emissao.tem_pendencias
  const precisaAnexo = temPendencia && emissao.anexos_enviados === 0

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

  /** Mesmo caminho do painel: sem `parcelas`, o backend vira `PUT` na
   *  seguradora. Existe aqui também porque é nesta tela que a emissão é
   *  recusada por "a cotação mudou". */
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

  const escolherArquivos = (lista: FileList | null) => {
    if (!lista) return
    const aceitos: File[] = []
    for (const arquivo of Array.from(lista)) {
      const extensao = arquivo.name.slice(arquivo.name.lastIndexOf(".")).toLowerCase()
      if (!EXTENSOES.includes(extensao)) {
        toast.error(`"${arquivo.name}": formato não aceito.`, {
          description: `Envie ${EXTENSOES.join(", ")}.`,
        })
        continue
      }
      aceitos.push(arquivo)
    }
    if (!aceitos.length) return

    const total = [...pendentes, ...aceitos].reduce((s, a) => s + a.size, 0)
    if (total > TAMANHO_MAXIMO) {
      toast.error("Os anexos somam mais de 30 MB, o limite da seguradora por envio.", {
        description: "Envie em partes.",
      })
      return
    }
    setPendentes(atual => [...atual, ...aceitos])
  }

  const enviarAnexos = async () => {
    if (!pendentes.length) return
    setEnviandoAnexos(true)
    try {
      aoAtualizar(await emissaoApi.anexos(cotacaoId, seguradoraId, pendentes))
      setPendentes([])
      toast.success("Documentos enviados à seguradora.")
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Não foi possível enviar os documentos."
      )
    } finally {
      setEnviandoAnexos(false)
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={open => !open && aoFechar()}>
      <DialogContent className="sm:max-w-xl rounded-2xl p-6 border-zinc-200 dark:border-zinc-800 max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2.5 text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Emitir na {emissao.seguradora_nome}
            <SeloEtapa etapa={emissao.etapa} />
          </DialogTitle>
          {/* Não é enfeite: sem descrição o Radix avisa que o diálogo não tem
              `aria-describedby`, e quem usa leitor de tela abre a caixa sem
              saber do que ela trata. */}
          <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
            {temPendencia
              ? `A seguradora apontou pendências na cotação ${cotacaoRotulo}. Resolva abaixo antes de emitir.`
              : `Confirme os dados antes de pedir a emissão da cotação ${cotacaoRotulo}.`}
          </DialogDescription>
        </DialogHeader>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 p-4 text-[12.5px]">
          <div className="flex items-center justify-between">
            <dt className="text-zinc-500 dark:text-zinc-400">Prêmio total</dt>
            <dd className="font-bold text-brand-red dark:text-[#cf7458]">
              {formatBRL(emissao.premio_total)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-zinc-500 dark:text-zinc-400">Minuta</dt>
            <dd className="font-mono font-semibold">
              {emissao.document_number || "—"}
            </dd>
          </div>
        </dl>

        <AvisoDesatualizada
          emissao={emissao}
          travado={travado}
          recotando={recotando}
          aoRecotar={recotar}
        />

        {/* ─── Pendências, quando há ─── */}
        {temPendencia && (
          <section className="mt-4">
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Pendências da seguradora
            </h3>
            <ListaPendencias emissao={emissao} />
          </section>
        )}

        {/* ─── Parcelamento ─── */}
        {emissao.opcoes_parcelamento.length > 0 && (
          <section className="mt-4 border-t border-zinc-200/70 dark:border-zinc-700/50 pt-4">
            <Parcelamento
              emissao={emissao}
              travado={travado}
              recotando={recotando}
              aoTrocar={trocarParcelas}
            />
          </section>
        )}

        {/* ─── Documentos da análise ─── */}
        <section className="mt-4 border-t border-zinc-200/70 dark:border-zinc-700/50 pt-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Documentos da análise
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={travado}
              onClick={() => inputArquivo.current?.click()}
              className="h-8 rounded-lg text-[12px] font-semibold"
            >
              <Paperclip className="size-3.5" /> Anexar
            </Button>
            <input
              ref={inputArquivo}
              type="file"
              multiple
              accept={EXTENSOES.join(",")}
              className="hidden"
              onChange={e => {
                escolherArquivos(e.target.files)
                // Zera para que escolher o mesmo arquivo de novo dispare o
                // change — o input não emite quando o valor não muda.
                e.target.value = ""
              }}
            />
          </div>

          {precisaAnexo && (
            <p className="mt-2 text-[11.5px] text-amber-700 dark:text-amber-400">
              Anexe o contrato ou o edital antes de pedir a emissão — sem
              documento, a análise volta pedindo.
            </p>
          )}

          {/* Já na seguradora. A lista vem dela, não da nossa memória: quem
              guarda documento é ela. */}
          {emissao.anexos.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1.5">
              {emissao.anexos.map(anexo => (
                <li
                  key={anexo.nome}
                  className="flex items-center gap-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 px-3 py-2 text-[12px]"
                >
                  <CheckCircle2 className="size-3.5 shrink-0 text-green-600 dark:text-green-400" />
                  <span className="truncate">{anexo.nome}</span>
                  <span className="ml-auto shrink-0 text-zinc-400">
                    {tamanhoLegivel(anexo.tamanho)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Escolhidos e ainda não enviados. */}
          {pendentes.length > 0 && (
            <>
              <ul className="mt-2 flex flex-col gap-1.5">
                {pendentes.map((arquivo, i) => (
                  <li
                    key={`${arquivo.name}-${i}`}
                    className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 px-3 py-2 text-[12px]"
                  >
                    <Paperclip className="size-3.5 shrink-0 text-zinc-400" />
                    <span className="truncate">{arquivo.name}</span>
                    <span className="ml-auto shrink-0 text-zinc-400">
                      {tamanhoLegivel(arquivo.size)}
                    </span>
                    <button
                      type="button"
                      title="Remover"
                      disabled={travado}
                      onClick={() =>
                        setPendentes(atual => atual.filter((_, j) => j !== i))
                      }
                      className="shrink-0 text-zinc-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                size="sm"
                disabled={travado}
                onClick={enviarAnexos}
                className="mt-2 h-8 rounded-lg text-[12px] font-bold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {enviandoAnexos ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" /> Enviando...
                  </>
                ) : (
                  `Enviar ${pendentes.length} documento${pendentes.length > 1 ? "s" : ""}`
                )}
              </Button>
            </>
          )}
        </section>

        {/* ─── Condições adicionais ─── */}
        <section className="mt-4 border-t border-zinc-200/70 dark:border-zinc-700/50 pt-4">
          <label
            htmlFor="condicoes-adicionais"
            className="text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
          >
            Condições adicionais{" "}
            <span className="font-normal normal-case tracking-normal">
              (opcional)
            </span>
          </label>
          <Textarea
            id="condicoes-adicionais"
            rows={2}
            disabled={travado}
            value={condicoes}
            onChange={e => setCondicoes(e.target.value)}
            placeholder="Texto livre impresso no documento da apólice."
            className="mt-2 rounded-xl text-[13px]"
          />
        </section>

        {/* ─── A tentativa que não deu ───
            O motivo fica na tela, e não só no toast: é com base nele que a
            corretora decide se emite por fora. */}
        {falha && (
          <section className="mt-4 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 p-4">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="size-4 mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
              <div>
                <div className="text-[13px] font-bold text-red-800 dark:text-red-300">
                  A emissão pela seguradora não foi concluída
                </div>
                <p className="mt-1 text-[12px] text-red-700/90 dark:text-red-400/90">
                  {falha}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ─── Ações ─── */}
        <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={aoFechar}
            className="h-10 px-5 rounded-xl font-semibold border-zinc-200 dark:border-zinc-800"
          >
            <X className="size-4" /> Fechar
          </Button>

          {falha && (
            <Button
              type="button"
              variant="outline"
              onClick={aoEmitirManual}
              className="h-10 px-5 rounded-xl font-semibold border-zinc-300 dark:border-zinc-700"
            >
              <PenLine className="size-4" /> Emitir manualmente
            </Button>
          )}

          <Button
            type="button"
            disabled={travado || precisaAnexo}
            title={
              precisaAnexo
                ? "Anexe os documentos da análise antes de emitir."
                : undefined
            }
            onClick={() => aoConfirmar(condicoes)}
            className="h-10 px-5 rounded-xl font-bold bg-brand-red text-white hover:bg-brand-red/90 disabled:opacity-60"
          >
            {emitindo ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Emitindo...
              </>
            ) : (
              <>
                <ShieldCheck className="size-4" />
                {falha ? "Tentar novamente" : "Confirmar emissão"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
