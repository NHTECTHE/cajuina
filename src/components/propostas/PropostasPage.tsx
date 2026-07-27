"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  FileText,
  Trash2,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  cotacoesApi,
  seguradorasApi,
  type CotacaoResponse,
  type SeguradoraResponse,
} from "@/services/api"
import { toast } from "sonner"

// Formata um decimal ("180.00") como moeda pt-BR. "—" quando não informado.
function formatBRL(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—"
  const num = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(num)) return "—"
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

// Formata dígitos em moeda pt-BR (ex.: "150000" -> "1.500,00"). Trata os dígitos
// como centavos, então cada tecla desliza a vírgula. Retorna "" se não houver dígitos.
function formatCurrency(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  if (!digits) return ""
  const cents = Number(digits)
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// Converte o texto pt-BR do input ("1.500,00") de volta para decimal serializável
// ("1500.00"). Retorna null quando vazio.
function currencyInputToDecimal(value: string): string | null {
  const cleaned = value.replace(/\./g, "").replace(",", ".")
  if (!cleaned) return null
  const num = Number(cleaned)
  return Number.isFinite(num) ? num.toFixed(2) : null
}

// Converte data ISO "yyyy-mm-dd" para "dd/mm/yyyy". "—" quando vazio.
function isoToBR(iso: string | null | undefined): string {
  if (!iso) return "—"
  const [y, m, d] = iso.split("-")
  if (!y || !m || !d) return "—"
  return `${d}/${m}/${y}`
}

export default function PropostasPage() {
  const router = useRouter()
  const [view, setView] = useState<"list" | "details">("list")
  const [selected, setSelected] = useState<CotacaoResponse | null>(null)

  // Propostas = cotações com status "Aprovado".
  const [propostas, setPropostas] = useState<CotacaoResponse[]>([])
  const [loading, setLoading] = useState(false)

  // Proposta para exclusão
  const [deleteTarget, setDeleteTarget] = useState<CotacaoResponse | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)

  // Seguradoras cadastradas (exibidas na tela de detalhes, igual à de Cotações)
  const [seguradoras, setSeguradoras] = useState<SeguradoraResponse[]>([])
  const [loadingSeguradoras, setLoadingSeguradoras] = useState(false)
  const [seguradoraEscolhidaId, setSeguradoraEscolhidaId] = useState<number | null>(null)

  // Aviso exibido ao tentar emitir sem ter escolhido uma seguradora.
  const [showSeguradoraAviso, setShowSeguradoraAviso] = useState(false)

  // Modal "Emitir" (emissão manual, sem integração com API da seguradora).
  const [showEmitirModal, setShowEmitirModal] = useState(false)
  const [numeroApolice, setNumeroApolice] = useState("")
  const [valorSeguradoraEmissao, setValorSeguradoraEmissao] = useState("")
  const [arquivoApolice, setArquivoApolice] = useState<File | null>(null)
  const [arquivoBoleto, setArquivoBoleto] = useState<File | null>(null)
  const [emitindo, setEmitindo] = useState(false)

  const loadPropostas = React.useCallback(async (search: string) => {
    setLoading(true)
    try {
      const data = await cotacoesApi.list({
        status: "Aprovado",
        search: search || undefined,
      })
      setPropostas(data)
    } catch {
      setPropostas([])
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (view !== "list") return
    const handle = setTimeout(() => loadPropostas(searchQuery.trim()), 300)
    return () => clearTimeout(handle)
  }, [view, searchQuery, loadPropostas])

  React.useEffect(() => {
    if (view !== "details") return
    let active = true
    ;(async () => {
      if (active) setLoadingSeguradoras(true)
      try {
        const data = await seguradorasApi.list({ ativo: true })
        if (active) setSeguradoras(data)
      } catch {
        if (active) setSeguradoras([])
      } finally {
        if (active) setLoadingSeguradoras(false)
      }
    })()
    return () => {
      active = false
    }
  }, [view])

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return propostas.slice(start, start + itemsPerPage)
  }, [propostas, currentPage, itemsPerPage])

  const totalPages = Math.max(1, Math.ceil(propostas.length / itemsPerPage))

  const handleRowClick = (proposta: CotacaoResponse) => {
    setSelected(proposta)
    setSeguradoraEscolhidaId(null)
    setView("details")
  }

  const handleDelete = (c: CotacaoResponse) => {
    setDeleteTarget(c)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await cotacoesApi.remove(deleteTarget.id)
      setView("list")
      setSelected(null)
      await loadPropostas(searchQuery.trim())
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir a proposta.")
    } finally {
      setDeleteTarget(null)
    }
  }

  // Emite a apólice. Emitida, a proposta sai desta listagem (status vira
  // "Emitido") e vamos direto para os detalhes da apólice recém-criada,
  // sem passar pela listagem de apólices.
  const handleEmitir = async () => {
    if (!selected || !seguradoraEscolhidaId) return
    if (!numeroApolice.trim()) {
      toast.error("Informe o número da apólice.")
      return
    }
    const valorDecimal = currencyInputToDecimal(valorSeguradoraEmissao)
    if (!valorDecimal) {
      toast.error("Informe o valor da seguradora.")
      return
    }

    setEmitindo(true)
    try {
      const apolice = await cotacoesApi.emitir(selected.id, {
        seguradora: seguradoraEscolhidaId,
        numero_apolice: numeroApolice.trim(),
        valor_seguradora: valorDecimal,
        arquivo_apolice: arquivoApolice,
        arquivo_boleto: arquivoBoleto,
      })
      setShowEmitirModal(false)
      router.push(`/dashboard/apolices?id=${apolice.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao emitir a apólice.")
    } finally {
      setEmitindo(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ──── LIST VIEW ──── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-sm rounded-2xl p-6 border-zinc-200 dark:border-zinc-800">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-2">
              <Trash2 className="size-5 text-red-500" />
            </div>
            <AlertDialogTitle className="text-center font-bold text-zinc-900 dark:text-zinc-50">Excluir proposta?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-zinc-500 mt-1">
              Você está prestes a excluir a proposta #{deleteTarget?.id}. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 justify-center sm:justify-center mt-4 border-t-0 bg-transparent p-0">
            <AlertDialogCancel className="mt-0 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-600 dark:text-zinc-300">
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {view === "list" && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-inherit">
                Lista de Propostas
              </h1>
              <p className="text-xs opacity-60 mt-0.5">
                Cotações aprovadas, aguardando emissão.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* Table Actions / Pagination Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-650 dark:text-zinc-400 px-1">
                <span>Exibir</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(parseInt(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="custom-select-exibir w-14 px-1.5 h-6 text-center font-extrabold border border-zinc-300 dark:border-zinc-800 rounded text-[11px] focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/20 cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>registros por página</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Filtrar:</span>
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="h-7 text-xs w-48 border-zinc-300 dark:border-zinc-800"
                />
              </div>
            </div>

            {/* Cards Table list */}
            <div className="flex flex-col gap-2 mt-2">
              <div className="hidden xl:grid grid-cols-12 gap-4 px-5 py-2 text-[9px] font-bold uppercase tracking-wider opacity-65 border-b border-zinc-200/30 dark:border-zinc-800/30 text-center">
                <div className="col-span-1 text-left pl-5">ID</div>
                <div className="col-span-3 text-center -ml-4">Tomador / CNPJ</div>
                <div className="col-span-3">Segurado</div>
                <div className="col-span-2">Modalidade</div>
                <div className="col-span-1">Início / Prazo</div>
                <div className="col-span-1">IS</div>
                <div className="col-span-1">Status</div>
              </div>

              {loading ? (
                <div className="bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-xl p-12 text-center mt-4">
                  <div className="flex flex-col items-center justify-center max-w-xs mx-auto">
                    <FileText className="size-5 text-zinc-400 mb-3 opacity-70 animate-pulse" />
                    <h4 className="font-bold text-xs text-inherit opacity-70">Carregando propostas...</h4>
                  </div>
                </div>
              ) : paginated.length > 0 ? (
                paginated.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleRowClick(t)}
                    className="cursor-pointer group bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-xl hover:border-brand-red/40 dark:hover:border-brand-red/40 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 hover:shadow-md transition-all duration-200 relative"
                  >
                    {/* ===== DESKTOP LAYOUT ===== */}
                    <div className="hidden xl:grid grid-cols-12 gap-4 items-center p-3.5 px-5 text-center">
                      <div className="col-span-1 flex items-center justify-start text-left text-[11px] font-bold text-zinc-500 pl-2">#{t.id}</div>

                      {/* Tomador / CNPJ */}
                      <div className="col-span-3 flex flex-col items-center gap-1 -ml-4">
                        <span className="font-bold text-xs tracking-tight text-zinc-800 dark:text-zinc-200 uppercase line-clamp-1" title={t.tomador_nome}>{t.tomador_nome}</span>
                        <span className="font-mono text-[10px] text-zinc-500 font-medium">{t.tomador_cnpj}</span>
                      </div>

                      {/* Segurado */}
                      <div className="col-span-3 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-medium text-zinc-650 dark:text-zinc-400 uppercase line-clamp-2" title={t.segurado_nome ?? "—"}>{t.segurado_nome ?? "—"}</span>
                      </div>

                      {/* Modalidade */}
                      <div className="col-span-2 flex flex-col items-center gap-1 text-[11px] text-zinc-650 dark:text-zinc-400 font-medium">
                        <span className="leading-tight line-clamp-2" title={t.modalidade_nome}>{t.modalidade_nome}</span>
                      </div>

                      {/* Início / Prazo */}
                      <div className="col-span-1 flex flex-col items-center justify-center gap-0.5 text-[11px] text-zinc-650 dark:text-zinc-400">
                        <span className="font-medium text-[10px] whitespace-nowrap">{isoToBR(t.data_inicio)}</span>
                        <span className="font-medium text-[10px] opacity-80 whitespace-nowrap">{t.prazo_dias != null ? `${t.prazo_dias} dias` : "—"}</span>
                      </div>

                      {/* IS */}
                      <div className="col-span-1 flex flex-col items-center justify-center gap-1 text-[11px] text-zinc-650 dark:text-zinc-400">
                        <span className="font-bold text-brand-red dark:text-[#cf7458] whitespace-nowrap">{formatBRL(t.importancia_segurada)}</span>
                      </div>

                      {/* Status */}
                      <div className="col-span-1 flex items-center justify-center">
                        <span className="whitespace-nowrap px-2 py-1 rounded text-[9px] font-bold uppercase bg-green-100 text-green-700 dark:bg-green-700 dark:text-white">
                          {t.status === "Aprovado" ? "EM CONCLUSÃO" : t.status}
                        </span>
                      </div>
                    </div>

                    {/* ===== MOBILE LAYOUT ===== */}
                    <div className="flex xl:hidden flex-col gap-4 text-left p-4">
                      <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
                        <span className="font-bold text-brand-red dark:text-[#cf7458]">#{t.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-700">
                          {t.status === "Aprovado" ? "EM CONCLUSÃO" : t.status}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-[14px] text-zinc-800 dark:text-zinc-200 uppercase leading-tight">{t.tomador_nome}</span>
                        <span className="text-[12px] text-zinc-500 font-mono tracking-tight">{t.tomador_cnpj}</span>
                      </div>
                      <div className="col-span-2 flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Segurado:</span>
                        <span className="text-xs uppercase">{t.segurado_nome ?? "—"}</span>
                      </div>
                      <div className="col-span-2 flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Modalidade:</span>
                        <span className="text-xs uppercase">{t.modalidade_nome}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase">IS:</span>
                          <span className="text-xs font-bold text-brand-red dark:text-[#cf7458] ">{formatBRL(t.importancia_segurada)}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 text-right">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase">Início / Prazo:</span>
                          <span className="text-xs">{isoToBR(t.data_inicio)} - {t.prazo_dias != null ? `${t.prazo_dias} dias` : "—"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-xl p-12 text-center mt-4">
                  <div className="flex flex-col items-center justify-center max-w-xs mx-auto">
                    <FileText className="size-5 text-zinc-400 mb-3 opacity-70" />
                    <h4 className="font-bold text-xs text-inherit">Nenhuma proposta encontrada</h4>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between text-[11px] text-zinc-500 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-sm p-3 shadow-sm">
              <span>Mostrando {paginated.length} de {propostas.length} registro(s)</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="text-zinc-500 hover:text-brand-red transition-colors"
                >
                  Anterior
                </button>
                <div className="w-6 h-6 rounded-full bg-brand-red text-white flex items-center justify-center font-bold">
                  {currentPage}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="text-zinc-500 hover:text-brand-red transition-colors"
                >
                  Próximo
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ──── DETAILS VIEW (NOVO LAYOUT DE CONFIRMAÇÃO) ──── */}
      {view === "details" && selected && (
        <div className="flex flex-col gap-6 p-8 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => setView("list")}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="size-4 opacity-70" />
            </button>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Deseja Prosseguir com a Emissão?</h1>
            <p className="text-[13px] text-zinc-500 mt-1">Confirme os dados abaixo antes de emitir a cotação.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ENVOLVIDOS */}
            <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/60 rounded-xl p-6">
              <h3 className="text-[#e85c5c] font-bold text-xs uppercase tracking-wider mb-5">ENVOLVIDOS</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">TOMADOR</span>
                  <p className="text-[13px] text-zinc-800 dark:text-zinc-200 font-bold mt-0.5 uppercase">{selected.tomador_cnpj} - {selected.tomador_nome}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">SEGURADO</span>
                  <p className="text-[13px] text-zinc-800 dark:text-zinc-200 font-bold mt-0.5 uppercase">{selected.segurado_cnpj || "—"} - {selected.segurado_nome || "—"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">SEGURADORA</span>
                  <p className="text-[13px] text-zinc-800 dark:text-zinc-200 font-bold mt-0.5 uppercase">JUNTO SEGUROS</p>
                </div>
              </div>
            </div>

            {/* DETALHES DA APÓLICE */}
            <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/60 rounded-xl p-6">
              <h3 className="text-[#e85c5c] font-bold text-xs uppercase tracking-wider mb-5">DETALHES DA APÓLICE</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">MODALIDADE</span>
                  <p className="text-[13px] text-zinc-800 dark:text-zinc-200 font-bold mt-0.5 uppercase">{selected.modalidade_nome}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">EDITAL / CONTRATO</span>
                  <p className="text-[13px] text-zinc-800 dark:text-zinc-200 font-bold mt-0.5 uppercase">{selected.edital || "—"}</p>
                </div>
              </div>
            </div>

            {/* VALORES E VENCIMENTO */}
            <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/60 rounded-xl p-6">
              <h3 className="text-[#e85c5c] font-bold text-xs uppercase tracking-wider mb-5">VALORES E VENCIMENTO</h3>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">VALOR DA COBERTURA</span>
                  <p className="text-lg text-[#e85c5c] font-bold mt-1">{formatBRL(selected.importancia_segurada)}</p>
                </div>
                <div>
                  <div className="mb-4">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide">VALOR (PRÊMIO)</span>
                    <p className="text-[13px] text-zinc-800 dark:text-zinc-200 font-bold mt-0.5">R$ 150,00</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide">VENCIMENTO</span>
                    <p className="text-[13px] text-zinc-800 dark:text-zinc-200 font-bold mt-0.5">20/07/2026</p>
                  </div>
                </div>
              </div>
            </div>

            {/* VIGÊNCIA */}
            <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/60 rounded-xl p-6">
              <h3 className="text-[#e85c5c] font-bold text-xs uppercase tracking-wider mb-5">VIGÊNCIA</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">INÍCIO</span>
                  <p className="text-[13px] text-zinc-800 dark:text-zinc-200 font-bold mt-0.5">{isoToBR(selected.data_inicio)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">TOTAL DE DIAS</span>
                  <p className="text-[13px] text-zinc-800 dark:text-zinc-200 font-bold mt-0.5">{selected.prazo_dias != null ? `${selected.prazo_dias} Dias` : "—"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">FIM</span>
                  <p className="text-[13px] text-zinc-800 dark:text-zinc-200 font-bold mt-0.5">{isoToBR(selected.data_final)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center">
            <p className="text-[11px] text-zinc-500 mb-8 text-center max-w-3xl">
              Declaro, expressamente, ter lido, compreendido e concordado com as condições aqui estabelecidas, incluindo as condições gerais do presente seguro.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-between w-full relative mb-10">
              <span className="text-[11px] text-zinc-500 font-medium absolute left-0 hidden sm:block">
                Sujeito a Análise e a Aprovação pela Seguradora
              </span>
              <div className="flex items-center gap-3 mx-auto">
                <button 
                  onClick={() => handleDelete(selected)}
                  className="bg-[#f97316] hover:bg-[#ea580c] text-white text-[11px] font-bold px-8 py-2.5 rounded-lg uppercase tracking-wide transition-colors"
                >
                  Excluir
                </button>
                <button 
                  className="bg-zinc-500 hover:bg-zinc-600 text-white text-[11px] font-bold px-8 py-2.5 rounded-lg uppercase tracking-wide transition-colors"
                >
                  Editar
                </button>
                <button 
                  onClick={() => setShowEmitirModal(true)}
                  className="bg-[#e85c5c] hover:bg-[#d44848] text-white text-[11px] font-bold px-8 py-2.5 rounded-lg uppercase tracking-wide transition-colors"
                >
                  Emitir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──── AVISO: SEGURADORA NÃO ESCOLHIDA ──── */}
      <AlertDialog open={showSeguradoraAviso} onOpenChange={setShowSeguradoraAviso}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Escolha uma seguradora</AlertDialogTitle>
            <AlertDialogDescription>
              Selecione uma seguradora antes de emitir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-brand-red hover:bg-brand-red/90 text-white">
              Entendi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ──── MODAL DE EMISSÃO ──── */}
      <Dialog open={showEmitirModal} onOpenChange={setShowEmitirModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Emitir</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">Nº Apólice:</Label>
                <Input
                  className="h-10 border-zinc-300"
                  value={numeroApolice}
                  onChange={(e) => setNumeroApolice(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">Valor Seguradora:</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">R$</span>
                  <Input
                    className="h-10 pl-9 border-zinc-300"
                    inputMode="numeric"
                    placeholder="0,00"
                    value={valorSeguradoraEmissao}
                    onChange={(e) => setValorSeguradoraEmissao(formatCurrency(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">Apólice:</Label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setArquivoApolice(e.target.files?.[0] ?? null)}
                  className="h-10 w-full rounded-md border border-zinc-300 text-xs file:mr-2 file:h-full file:border-0 file:bg-zinc-100 dark:file:bg-zinc-800 file:px-3 file:text-xs file:font-bold cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">Boleto:</Label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setArquivoBoleto(e.target.files?.[0] ?? null)}
                  className="h-10 w-full rounded-md border border-zinc-300 text-xs file:mr-2 file:h-full file:border-0 file:bg-zinc-100 dark:file:bg-zinc-800 file:px-3 file:text-xs file:font-bold cursor-pointer"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <button
              type="button"
              disabled
              title="Emissão via API da seguradora ainda não disponível"
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-[12px] font-bold uppercase tracking-wide text-zinc-400 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 cursor-not-allowed"
            >
              Emitir com API
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowEmitirModal(false)}
                disabled={emitindo}
                className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-lg text-[12px] font-bold uppercase tracking-wide text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEmitir}
                disabled={emitindo}
                className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-lg text-[12px] font-bold uppercase tracking-wide text-white bg-green-600 hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-60"
              >
                {emitindo ? "Emitindo..." : "Emitir"}
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
