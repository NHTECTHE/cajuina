"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CircleAlert,
  Download,
  Loader2,
  Plus,
  Search,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"
import {
  ApoliceJaImportadaError,
  type ModalidadeResponse,
  type NovoTomadorImportacao,
  type PreviaImportacao,
  type SeguradoraResponse,
  importacaoApi,
  lookupCnpj,
  modalidadesApi,
  seguradorasApi,
} from "@/services/api"
import { formatBRL } from "@/lib/utils"

/** `020775001234 5` -> `02-0775-0012345`. A Junto só aceita a apólice inteira
 *  neste formato; digitar o traço é trabalho que a tela pode poupar. */
function mascararNumero(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 13)
  if (d.length <= 2) return d
  if (d.length <= 6) return `${d.slice(0, 2)}-${d.slice(2)}`
  return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`
}

function formatarData(iso: string | null): string {
  if (!iso) return "—"
  const [ano, mes, dia] = iso.slice(0, 10).split("-")
  return `${dia}/${mes}/${ano}`
}

type EstadoVinculo = "ok" | "resolvido" | "pendente"

function LinhaVinculo({
  rotulo,
  estado,
  principal,
  detalhe,
  acao,
}: {
  rotulo: string
  estado: EstadoVinculo
  principal: string
  detalhe?: string
  acao?: React.ReactNode
}) {
  const icone =
    estado === "pendente" ? (
      <CircleAlert className="size-4 shrink-0 text-amber-500" />
    ) : (
      <Check className="size-4 shrink-0 text-green-600 dark:text-green-400" />
    )

  return (
    <div className="flex items-start justify-between gap-3 py-2.5">
      <div className="flex items-start gap-2.5 min-w-0">
        {icone}
        <div className="min-w-0">
          <div className="text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">
            {rotulo}
          </div>
          <div className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-100 truncate">
            {principal}
          </div>
          {detalhe && (
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {detalhe}
            </div>
          )}
        </div>
      </div>
      {acao && <div className="shrink-0">{acao}</div>}
    </div>
  )
}

function Valor({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">
        {rotulo}
      </div>
      <div className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-100">
        {children}
      </div>
    </div>
  )
}

export function ImportarApoliceJunto() {
  const router = useRouter()

  const [numero, setNumero] = React.useState("")
  const [seguradoras, setSeguradoras] = React.useState<SeguradoraResponse[]>([])
  const [seguradoraId, setSeguradoraId] = React.useState<number | null>(null)
  const [modalidades, setModalidades] = React.useState<ModalidadeResponse[]>([])

  const [previa, setPrevia] = React.useState<PreviaImportacao | null>(null)
  const [buscando, setBuscando] = React.useState(false)
  const [importando, setImportando] = React.useState(false)
  const [erro, setErro] = React.useState<string | null>(null)

  // Resoluções que o operador tomou na tela de conferência.
  const [criarSegurado, setCriarSegurado] = React.useState(false)
  const [novoTomador, setNovoTomador] = React.useState<NovoTomadorImportacao | null>(
    null
  )
  const [buscandoCnpj, setBuscandoCnpj] = React.useState(false)
  const [modalidadeEscolhida, setModalidadeEscolhida] = React.useState<number | null>(
    null
  )

  React.useEffect(() => {
    seguradorasApi
      .list({ ativo: true })
      .then(lista => {
        const integradas = lista.filter(s => s.integracao === "junto")
        setSeguradoras(integradas)
        if (integradas.length > 0) setSeguradoraId(integradas[0].id)
      })
      .catch(() => setErro("Não foi possível carregar as seguradoras."))

    modalidadesApi.list({ ativo: true }).then(setModalidades).catch(() => {})
  }, [])

  /** Toda busca zera as resoluções: elas se referem ao que a busca anterior
   *  achou, e mantê-las depois de trocar de apólice importaria dado errado. */
  function limparResolucoes() {
    setCriarSegurado(false)
    setNovoTomador(null)
    setModalidadeEscolhida(null)
  }

  async function buscar(e: React.FormEvent) {
    e.preventDefault()
    if (!seguradoraId || numero.replace(/\D/g, "").length < 13) {
      setErro("Informe o número completo da apólice (00-0000-0000000).")
      return
    }

    setBuscando(true)
    setErro(null)
    setPrevia(null)
    limparResolucoes()
    try {
      setPrevia(await importacaoApi.previa(numero, seguradoraId))
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Falha ao consultar a apólice.")
    } finally {
      setBuscando(false)
    }
  }

  /** O endereço do tomador não vem da seguradora — só CNPJ e nome. Quem
   *  completa é o lookup de CNPJ. Falhando, o tomador entra assim mesmo. */
  async function prepararTomador() {
    if (!previa) return
    setBuscandoCnpj(true)
    try {
      const dados = await lookupCnpj(previa.tomador.cnpj)
      setNovoTomador({
        nome: dados.razao_social || previa.tomador.nome,
        nome_fantasia: dados.nome_fantasia,
        email: dados.email,
        telefone: dados.telefone,
        cep: dados.cep,
        endereco: dados.logradouro,
        numero: dados.numero,
        complemento: dados.complemento,
        bairro: dados.bairro,
        cidade: dados.municipio,
        uf: dados.uf,
      })
      toast.success("Endereço do tomador encontrado pelo CNPJ.")
    } catch {
      setNovoTomador({ nome: previa.tomador.nome })
      toast.warning(
        "Não foi possível buscar o CNPJ. O tomador entrará só com CNPJ e nome."
      )
    } finally {
      setBuscandoCnpj(false)
    }
  }

  const tomadorResolvido = previa?.tomador.encontrado || novoTomador !== null
  const seguradoResolvido = previa?.segurado.encontrado || criarSegurado
  const modalidadeResolvida =
    previa?.modalidade.encontrada || modalidadeEscolhida !== null
  const podeImportar =
    previa !== null &&
    !previa.ja_importada &&
    tomadorResolvido &&
    seguradoResolvido &&
    modalidadeResolvida

  async function importar() {
    if (!previa || !seguradoraId) return
    setImportando(true)
    setErro(null)
    try {
      const apolice = await importacaoApi.importar({
        numero: previa.numero_apolice,
        seguradora: seguradoraId,
        criar_segurado: criarSegurado,
        criar_tomador: novoTomador,
        modalidade: modalidadeEscolhida,
      })
      toast.success(`Apólice ${apolice.numero_apolice} importada.`)
      router.push("/dashboard/apolices")
    } catch (err) {
      if (err instanceof ApoliceJaImportadaError) {
        setErro(err.message)
        setPrevia({ ...previa, ja_importada: true, apolice_id: err.apoliceId })
      } else {
        setErro(err instanceof Error ? err.message : "Falha ao importar.")
      }
    } finally {
      setImportando(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col gap-6 py-2 w-full max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Importar Apólice
          </h1>
          <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
            Traz para o sistema uma apólice já emitida na seguradora.
          </p>
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <div className="w-full max-w-2xl flex flex-col gap-4">
          <form
            onSubmit={buscar}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm p-6"
          >
            <h2 className="text-[#e85c5c] dark:text-[#cf7458] font-light tracking-wide text-lg uppercase mb-4">
              Pesquisar Nº da Apólice
            </h2>

            <div className="space-y-4">
              {seguradoras.length > 1 && (
                <NativeSelect
                  value={String(seguradoraId ?? "")}
                  onChange={e => setSeguradoraId(Number(e.target.value))}
                  aria-label="Seguradora"
                >
                  {seguradoras.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nome}
                    </option>
                  ))}
                </NativeSelect>
              )}

              <Input
                value={numero}
                onChange={e => setNumero(mascararNumero(e.target.value))}
                placeholder="00-0000-0000000"
                inputMode="numeric"
                autoFocus
                className="w-full font-mono tracking-wide"
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={buscando || !seguradoraId}>
                  {buscando ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Consultando...
                    </>
                  ) : (
                    <>
                      <Search className="size-4" /> Buscar
                    </>
                  )}
                </Button>
              </div>

              {seguradoras.length === 0 && (
                <p className="text-[11.5px] text-amber-600 dark:text-amber-400">
                  Nenhuma seguradora com integração ativa. Configure a integração
                  em Seguradoras antes de importar.
                </p>
              )}
            </div>
          </form>

          {erro && (
            <div className="rounded-xl border border-red-200 dark:border-red-500/25 bg-red-50 dark:bg-red-500/10 p-4 flex items-start gap-2.5">
              <X className="size-4 mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
              <div className="text-[12.5px] text-red-800 dark:text-red-300">
                {erro}
                {previa?.apolice_id && (
                  <button
                    onClick={() => router.push("/dashboard/apolices")}
                    className="ml-2 underline font-semibold"
                  >
                    Ver a apólice
                  </button>
                )}
              </div>
            </div>
          )}

          {previa && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm p-6 flex flex-col gap-5">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <h3 className="text-[15px] font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
                  {previa.numero_apolice}
                </h3>
                <span className="text-[11.5px] text-zinc-500 dark:text-zinc-400">
                  emitida em {formatarData(previa.emitida_em)}
                </span>
              </div>

              {previa.cancelada && (
                <div className="rounded-xl border border-red-200 dark:border-red-500/25 bg-red-50 dark:bg-red-500/10 p-3 flex items-start gap-2.5">
                  <AlertTriangle className="size-4 mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
                  <div className="text-[12px] text-red-800 dark:text-red-300">
                    <strong>
                      Esta apólice está{" "}
                      {previa.cancelada_em ? "cancelada" : "baixada"} na
                      seguradora
                    </strong>{" "}
                    desde{" "}
                    {formatarData(previa.cancelada_em ?? previa.baixada_em)}. Dá
                    para importar para histórico, mas confira se é o que você
                    quer.
                  </div>
                </div>
              )}

              {previa.ja_importada && (
                <div className="rounded-xl border border-amber-200 dark:border-amber-500/25 bg-amber-50 dark:bg-amber-500/10 p-3 text-[12px] text-amber-800 dark:text-amber-300">
                  Esta apólice já está no sistema.
                </div>
              )}

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                <LinhaVinculo
                  rotulo="Tomador"
                  estado={
                    previa.tomador.encontrado
                      ? "ok"
                      : novoTomador
                        ? "resolvido"
                        : "pendente"
                  }
                  principal={novoTomador?.nome ?? previa.tomador.nome}
                  detalhe={
                    previa.tomador.encontrado
                      ? previa.tomador.cnpj
                      : novoTomador
                        ? `${previa.tomador.cnpj} · será cadastrado`
                        : `${previa.tomador.cnpj} · não cadastrado`
                  }
                  acao={
                    !previa.tomador.encontrado &&
                    !novoTomador && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={buscandoCnpj}
                        onClick={prepararTomador}
                        className="h-8 rounded-lg text-[12px]"
                      >
                        {buscandoCnpj ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Plus className="size-3.5" />
                        )}
                        Cadastrar
                      </Button>
                    )
                  }
                />

                <LinhaVinculo
                  rotulo="Segurado"
                  estado={
                    previa.segurado.encontrado
                      ? "ok"
                      : criarSegurado
                        ? "resolvido"
                        : "pendente"
                  }
                  principal={previa.segurado.nome}
                  detalhe={
                    previa.segurado.encontrado
                      ? previa.segurado.cnpj
                      : criarSegurado
                        ? `${previa.segurado.cnpj} · será cadastrado`
                        : `${previa.segurado.cnpj} · não cadastrado`
                  }
                  acao={
                    !previa.segurado.encontrado &&
                    !criarSegurado && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCriarSegurado(true)}
                        className="h-8 rounded-lg text-[12px]"
                      >
                        <Plus className="size-3.5" /> Cadastrar
                      </Button>
                    )
                  }
                />

                <LinhaVinculo
                  rotulo="Modalidade"
                  estado={
                    previa.modalidade.encontrada
                      ? "ok"
                      : modalidadeEscolhida
                        ? "resolvido"
                        : "pendente"
                  }
                  principal={
                    previa.modalidade.encontrada
                      ? previa.modalidade.nome
                      : previa.modalidade.descricao_seguradora ||
                        `Código ${previa.modalidade.codigo_seguradora}`
                  }
                  detalhe={
                    previa.modalidade.encontrada
                      ? `código ${previa.modalidade.codigo_seguradora} na seguradora`
                      : `código ${previa.modalidade.codigo_seguradora} não mapeado`
                  }
                  acao={
                    !previa.modalidade.encontrada && (
                      <NativeSelect
                        size="sm"
                        value={String(modalidadeEscolhida ?? "")}
                        onChange={e =>
                          setModalidadeEscolhida(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        aria-label="Modalidade"
                      >
                        <option value="">Escolher...</option>
                        {modalidades.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.nome}
                          </option>
                        ))}
                      </NativeSelect>
                    )
                  }
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                <Valor rotulo="Imp. segurada">
                  {formatBRL(previa.importancia_segurada)}
                </Valor>
                <Valor rotulo="Prêmio">{formatBRL(previa.premio_total)}</Valor>
                <Valor rotulo="Parcelas">{previa.numero_parcelas ?? 1}x</Valor>
                <Valor rotulo="Vigência">
                  {formatarData(previa.data_inicio)} a{" "}
                  {formatarData(previa.data_final)}
                </Valor>
              </div>

              {(previa.url_apolice || previa.url_boleto) && (
                <div className="flex gap-2 flex-wrap">
                  {previa.url_apolice && (
                    <a
                      href={previa.url_apolice}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-zinc-600 dark:text-zinc-300 hover:text-brand-red"
                    >
                      <Download className="size-3.5" /> Apólice (PDF)
                    </a>
                  )}
                  {previa.url_boleto && (
                    <a
                      href={previa.url_boleto}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-zinc-600 dark:text-zinc-300 hover:text-brand-red"
                    >
                      <Download className="size-3.5" /> Boleto (PDF)
                    </a>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPrevia(null)
                    limparResolucoes()
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  disabled={!podeImportar || importando}
                  onClick={importar}
                >
                  {importando ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Importando...
                    </>
                  ) : (
                    "Importar"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
