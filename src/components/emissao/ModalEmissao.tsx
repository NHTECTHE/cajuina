"use client"

import * as React from "react"
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  Paperclip,
  Receipt,
  RefreshCw,
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
import { NativeSelect } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import { cn, formatBRL } from "@/lib/utils"
import { emissaoApi, type EmissaoResponse, type EtapaEmissao } from "@/services/api"

import { useEmissaoJobs } from "./emissao-jobs"

/** Formatos que a análise da seguradora consegue abrir.
 *
 *  A mesma lista existe no backend, e é lá que ela vale — a Junto não valida
 *  nada, aceitou um `.exe` de 4 bytes com 200 quando testamos. Aqui ela é só
 *  cortesia: evita a viagem de ida e volta para receber o mesmo "não". */
const EXTENSOES = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx", ".xls", ".xlsx", ".zip"]

/** Limite da seguradora por requisição, somando os arquivos. */
const TAMANHO_MAXIMO = 30 * 1024 * 1024

const SELO: Record<EtapaEmissao, { texto: string; classe: string }> = {
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

function tamanhoLegivel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface Props {
  aberto: boolean
  aoFechar: () => void
  emissao: EmissaoResponse | null
  cotacaoId: number
  cotacaoRotulo: string
  /** Toda mudança de estado sobe para a página, que é dona do cache por
   *  seguradora — o modal não guarda cópia própria da emissão. */
  aoAtualizar: (emissao: EmissaoResponse) => void
}

/** O wizard de emissão inteiro, de ponta a ponta, num lugar só.
 *
 *  Existe porque o badge do card já carregava três estados num botão de 36px e
 *  a emissão precisa de cinco ações e dois links. E porque o antigo modal de
 *  pendências era um beco: listava "Fora dos parâmetros de crédito" e só
 *  oferecia "gerar mesmo assim", sem lugar para anexar o documento que resolve
 *  a pendência — que é justamente o que o backend passou a exigir. */
export function ModalEmissao({
  aberto,
  aoFechar,
  emissao,
  cotacaoId,
  cotacaoRotulo,
  aoAtualizar,
}: Props) {
  const { ocupado, gerarMinuta, emitirApolice } = useEmissaoJobs()
  // Estado inicial vindo das props, e não de um efeito que reage a `aberto`:
  // a página remonta este componente a cada abertura (via `key`), então o
  // inicializador já vê a emissão certa. Sincronizar por efeito custaria dois
  // renders e apagaria o que o usuário digitou a cada atualização da emissão.
  const [condicoes, setCondicoes] = React.useState(
    emissao?.condicoes_adicionais ?? ""
  )
  const [recotando, setRecotando] = React.useState(false)
  const [enviandoAnexos, setEnviandoAnexos] = React.useState(false)
  const [sincronizando, setSincronizando] = React.useState(false)
  const [pendentes, setPendentes] = React.useState<File[]>([])
  const inputArquivo = React.useRef<HTMLInputElement>(null)

  const seguradoraId = emissao?.seguradora ?? 0
  const emAndamento = emissao ? ocupado(cotacaoId, seguradoraId) : false
  const travado = emAndamento || recotando || enviandoAnexos || sincronizando

  if (!emissao) return null

  const emitida = emissao.etapa === "emitida"
  const emAnalise = emissao.etapa === "aguardando"
  const temMinuta = Boolean(emissao.document_number)
  const precisaAnexo = emissao.tem_pendencias && emissao.anexos_enviados === 0
  const selo = SELO[emissao.etapa] ?? SELO.cotada

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
    <Dialog open={aberto} onOpenChange={open => !open && aoFechar()}>
      <DialogContent className="sm:max-w-xl rounded-2xl p-6 border-zinc-200 dark:border-zinc-800 max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-lg font-bold text-zinc-900 dark:text-zinc-50">
            {emissao.seguradora_nome}
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide",
                selo.classe
              )}
            >
              {selo.texto}
            </span>
            {emissao.ambiente === "sandbox" && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                sandbox
              </span>
            )}
          </DialogTitle>
          {/* Não é enfeite: sem descrição o Radix avisa que o diálogo não tem
              `aria-describedby`, e quem usa leitor de tela abre a caixa sem
              saber do que ela trata. */}
          <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
            Emissão da cotação {cotacaoRotulo} na seguradora, do parcelamento à
            apólice.
          </DialogDescription>
        </DialogHeader>

        {/* ─── Números da seguradora ─── */}
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 p-4 text-[12.5px]">
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

        {/* ─── Parcelamento ─── */}
        {emissao.opcoes_parcelamento.length > 0 && (
          <section className="mt-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Parcelamento
              </h3>
              {/* Depois de emitida a escolha está no documento: mostrar um
                  select que não muda nada seria mentira. */}
              {emitida || emAnalise ? (
                <span className="text-[12.5px] font-semibold">
                  {emissao.numero_parcelas ?? 1}x
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  {recotando && (
                    <Loader2 className="size-3.5 animate-spin text-zinc-400" />
                  )}
                  <NativeSelect
                    size="sm"
                    disabled={travado}
                    value={String(emissao.numero_parcelas ?? "")}
                    onChange={e => trocarParcelas(Number(e.target.value))}
                    aria-label="Número de parcelas"
                  >
                    {emissao.opcoes_parcelamento.map(opcao => (
                      <option
                        key={opcao.numero_parcelas}
                        value={opcao.numero_parcelas}
                      >
                        {opcao.numero_parcelas}x de{" "}
                        {formatBRL(opcao.parcelas[0]?.valor)}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ─── Minuta ─── */}
        <section className="mt-4 border-t border-zinc-200/70 dark:border-zinc-700/50 pt-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Minuta
              {emissao.document_number && (
                <span className="ml-2 font-mono font-normal normal-case tracking-normal text-zinc-400">
                  doc {emissao.document_number}
                </span>
              )}
            </h3>
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

          {emissao.pendencias.length > 0 && (
            <div className="mt-3 flex flex-col gap-2">
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
          )}
        </section>

        {/* ─── Documentos da análise ─── */}
        {temMinuta && !emitida && (
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
                A seguradora apontou pendências. Anexe o contrato ou o edital
                antes de pedir a emissão — sem documento, a análise volta
                pedindo.
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
        )}

        {/* ─── Condições adicionais ─── */}
        {temMinuta && !emitida && !emAnalise && (
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
        )}

        {/* ─── Desfecho: em análise ─── */}
        {emAnalise && (
          <section className="mt-4 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-4">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="size-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <div className="text-[13px] font-bold text-amber-800 dark:text-amber-300">
                  {emissao.mensagem || "Apólice em análise"}
                </div>
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

        {/* ─── Ações ─── */}
        <div className="mt-5 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={aoFechar}
            className="h-10 px-5 rounded-xl font-semibold border-zinc-200 dark:border-zinc-800"
          >
            <X className="size-4" /> Fechar
          </Button>
          {/* Emitir some depois de pedida: o backend recusa repetir, e o
              caminho de quem espera é o botão de atualizar. */}
          {!emitida && !emAnalise && (
            <Button
              type="button"
              disabled={travado || !temMinuta || precisaAnexo}
              title={
                !temMinuta
                  ? "Gere a minuta antes de emitir."
                  : precisaAnexo
                    ? "Anexe os documentos da análise antes de emitir."
                    : undefined
              }
              onClick={() => emitirApolice(job, condicoes)}
              className="h-10 px-5 rounded-xl font-bold bg-brand-red text-white hover:bg-brand-red/90 disabled:opacity-60"
            >
              {emAndamento ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Emitindo...
                </>
              ) : (
                <>
                  <ShieldCheck className="size-4" /> Emitir apólice
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
