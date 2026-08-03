"use client"

import * as React from "react"
import { TableSkeleton } from "@/components/ui/skeleton"
import { useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  FileText,
  Trash2,
  Pencil,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.015 2.015c-5.503 0-9.98 4.477-9.98 9.98 0 1.758.46 3.473 1.332 4.981l-1.349 4.929 5.044-1.323a9.92 9.92 0 004.953 1.328h.004c5.498 0 9.977-4.477 9.977-9.98 0-2.665-1.038-5.168-2.923-7.054a9.926 9.926 0 00-7.058-2.926zM12.015 20.3c-1.488 0-2.946-.4-4.225-1.157l-.303-.18-3.136.822.836-3.056-.197-.314a8.312 8.312 0 01-1.272-4.437c0-4.59 3.738-8.328 8.33-8.328 2.224 0 4.314.867 5.886 2.439a8.271 8.271 0 012.437 5.892c-.001 4.59-3.74 8.328-8.33 8.328zm4.562-6.223c-.25-.125-1.481-.732-1.71-.815-.229-.084-.397-.125-.563.125-.167.25-.646.815-.792.981-.146.167-.292.188-.542.063-.25-.125-1.057-.39-2.015-1.243-.745-.664-1.248-1.485-1.394-1.735-.146-.25-.015-.386.11-.511.112-.113.25-.292.375-.438.125-.146.167-.25.25-.417.084-.167.042-.313-.021-.438-.063-.125-.563-1.356-.771-1.856-.203-.485-.411-.42-.563-.427-.146-.007-.313-.007-.48-.007-.167 0-.438.063-.667.313-.229.25-.875.855-.875 2.085 0 1.23.896 2.419 1.021 2.585.125.167 1.764 2.693 4.275 3.776.598.258 1.064.412 1.428.528.601.191 1.147.164 1.576.1.48-.073 1.481-.605 1.69-1.189.208-.584.208-1.085.146-1.189-.062-.104-.229-.167-.479-.292z"/>
  </svg>
)
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
  getTomadorSeguradoraVinculo,
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
  const searchParams = useSearchParams()
  const [view, setView] = useState<"list" | "details">(() => {
    return searchParams?.get("abrirModal") === "true" || searchParams?.get("id") ? "details" : "list"
  })
  const [selected, setSelected] = useState<CotacaoResponse | null>(null)
  const [showFormaEmissaoModal, setShowFormaEmissaoModal] = useState(false)
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Propostas = cotações com status "Aprovado".
  const [propostas, setPropostas] = useState<CotacaoResponse[]>([])
  const [loading, setLoading] = useState(true)

  // Proposta para exclusão
  const [deleteTarget, setDeleteTarget] = useState<CotacaoResponse | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)

  const [seguradoras, setSeguradoras] = useState<SeguradoraResponse[]>([])
  const [seguradoraEscolhidaId, setSeguradoraEscolhidaId] = useState<number | null>(null)

  // Aviso exibido ao tentar emitir sem ter escolhido uma seguradora.
  const [showSeguradoraAviso, setShowSeguradoraAviso] = useState(false)

  // Modal "Emitir" (emissão manual, sem integração com API da seguradora).
  const [showEmitirModal, setShowEmitirModal] = useState(false)
  const [numeroApolice, setNumeroApolice] = useState("")
  const [valorSeguradoraEmissao, setValorSeguradoraEmissao] = useState("")
  const [arquivoApolice, setArquivoApolice] = useState<File | null>(null)
  const [arquivoBoleto, setArquivoBoleto] = useState<File | null>(null)
  const [vencimentoBoleto, setVencimentoBoleto] = useState("")
  const [emitindo, setEmitindo] = useState(false)

  // Calcula o vencimento do boleto (hoje + dias_vencimento_efetivo do par
  // tomador x seguradora). Roda ao abrir a proposta, pois a data é exibida
  // tanto nos detalhes quanto no modal de emissão.
  React.useEffect(() => {
    if (!selected) return
    // A seguradora escolhida vem da própria cotação; o localStorage é fallback
    // para propostas anteriores à persistência desse campo.
    const seguradoraId = selected.seguradora
      || seguradoraEscolhidaId
      || Number(typeof window !== "undefined" ? localStorage.getItem(`seguradora_cotacao_${selected.id}`) : null)
      || seguradoras[0]?.id
      || 1
    let active = true
    getTomadorSeguradoraVinculo(selected.tomador, seguradoraId)
      .then((vinculo) => {
        if (!active) return
        const dias = vinculo?.dias_vencimento_efetivo
        if (dias == null) {
          setVencimentoBoleto("")
          return
        }
        const data = new Date()
        data.setDate(data.getDate() + dias)
        setVencimentoBoleto(data.toISOString().slice(0, 10))
      })
      .catch(() => {
        if (active) setVencimentoBoleto("")
      })
    return () => { active = false }
  }, [selected, seguradoraEscolhidaId, seguradoras])

  const generatedMessage = useMemo(() => {
    if (!selected) return ""
    return `Olá, ${selected.tomador_nome}!

CNPJ ${selected.tomador_cnpj}

Obrigado pela sua preferência pela CAJUINA CORRETORA DE SEGUROS EIRELI. Informamos que a sua cotação foi APROVADA e encontra-se pronta para emissão da apólice. Seguem os dados:

Segurado: ${selected.segurado_nome ? `${selected.segurado_nome} - ${selected.segurado_cnpj}` : '—'}
Edital/Contrato: ${selected.edital || '—'}
Modalidade: ${selected.modalidade_nome || '—'}
IS: ${formatBRL(selected.importancia_segurada)}
Prazo: ${selected.prazo_dias != null ? `${selected.prazo_dias} Dias` : '—'}
Início: ${isoToBR(selected.data_inicio)}
Fim: ${isoToBR(selected.data_final)}
Valor (Prêmio): ${formatBRL(selected.premio)}
Seguradora: ${selected.seguradora_nome || '—'}
Vencimento do Boleto: ${isoToBR(vencimentoBoleto) || '—'}

Em caso de dúvidas ou para prosseguir com a emissão, entre em contato com o nosso suporte:

(86) 3081-0282`
  }, [selected, vencimentoBoleto])

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(generatedMessage)
      setIsMessageModalOpen(false)
      setShowSuccessModal(true)
    } catch {
      toast.error("Erro ao copiar a mensagem.")
    }
  }

  const loadPropostas = React.useCallback(async (search: string) => {
    setLoading(true)
    try {
      const data = await cotacoesApi.list({
        status: "Aprovado",
        search: search || undefined,
      })
      setPropostas(data.filter(c => {
        if (typeof window !== "undefined") {
          return localStorage.getItem(`enviado_proposta_${c.id}`) === "true" || localStorage.getItem(`forma_emissao_${c.id}`) !== null
        }
        return false
      }))
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
    let active = true
    seguradorasApi.list({ ativo: true }).then((data) => {
      if (active) setSeguradoras(data)
    }).catch(() => {})
    return () => { active = false }
  }, [])

  React.useEffect(() => {
    const abrirModal = searchParams.get("abrirModal")
    const idParam = searchParams.get("id")
    if (idParam) {
      const numId = Number(idParam)
      const target = propostas.find(p => p.id === numId)
      if (target) {
        setTimeout(() => {
          setSelected(target)
          const stored = typeof window !== "undefined" ? localStorage.getItem(`seguradora_cotacao_${target.id}`) : null
          setSeguradoraEscolhidaId(stored ? Number(stored) : null)
          setView("details")
          if (abrirModal === "true") setShowFormaEmissaoModal(true)
          router.replace("/dashboard/propostas", { scroll: false })
        }, 0)
      } else {
        cotacoesApi.get(numId).then((data) => {
          setSelected(data)
          const stored = typeof window !== "undefined" ? localStorage.getItem(`seguradora_cotacao_${data.id}`) : null
          setSeguradoraEscolhidaId(stored ? Number(stored) : null)
          setView("details")
          if (abrirModal === "true") setShowFormaEmissaoModal(true)
          router.replace("/dashboard/propostas", { scroll: false })
        }).catch(() => {})
      }
    }
  }, [searchParams, propostas, router])

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return propostas.slice(start, start + itemsPerPage)
  }, [propostas, currentPage, itemsPerPage])

  const totalPages = Math.max(1, Math.ceil(propostas.length / itemsPerPage))

  const handleRowClick = (proposta: CotacaoResponse) => {
    setSelected(proposta)
    const stored = typeof window !== "undefined" ? localStorage.getItem(`seguradora_cotacao_${proposta.id}`) : null
    setSeguradoraEscolhidaId(stored ? Number(stored) : null)
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
    if (!selected) return
    const seguradoraId = seguradoraEscolhidaId || Number(typeof window !== "undefined" ? localStorage.getItem(`seguradora_cotacao_${selected.id}`) : null) || seguradoras[0]?.id || 1
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
        seguradora: seguradoraId,
        numero_apolice: numeroApolice.trim(),
        valor_seguradora: valorDecimal,
        vencimento_boleto: vencimentoBoleto || null,
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
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3 sm:gap-0 w-full">
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-1.5 text-[11px] text-zinc-650 dark:text-zinc-400 px-1 text-center">
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

              <div className="flex items-center gap-2 w-full sm:w-auto px-1 sm:px-0">
                <span className="text-xs text-zinc-500 shrink-0">Filtrar:</span>
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="h-7 text-xs w-full sm:w-48 border-zinc-300 dark:border-zinc-800"
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
                <TableSkeleton rows={6} />
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

      {/* ──── DETAILS LOADING ──── */}
      {view === "details" && !selected && (
        <div className="flex flex-col items-center justify-center p-16 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <div className="size-8 rounded-full border-2 border-brand-red border-t-transparent animate-spin mb-4" />
          <p className="text-xs text-zinc-500 font-medium">Carregando detalhes da proposta...</p>
        </div>
      )}

      {/* ──── DETAILS VIEW (NOVO LAYOUT DE CONFIRMAÇÃO) ──── */}
      {view === "details" && selected && (
        <div className="flex flex-col gap-6 p-8 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setView("list")}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="size-4 opacity-70" />
            </button>
            <button 
              onClick={() => setIsMessageModalOpen(true)}
              className="w-8 h-8 rounded-full border border-green-200 text-green-500 flex items-center justify-center bg-white shadow-sm hover:bg-green-50 transition-colors"
              title="Mensagem para o cliente"
            >
              <WhatsAppIcon className="size-4" />
            </button>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Deseja Prosseguir com a Emissão?</h1>
            <p className="text-[13px] text-zinc-500 mt-1">Confirme os dados abaixo antes de emitir a cotação.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ENVOLVIDOS */}
            <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/60 rounded-xl p-6">
              <h3 className="text-[#e85c5c] font-bold text-xs uppercase tracking-wider mb-5 dark:text-[#cf7458]">ENVOLVIDOS</h3>
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
                  <p className="text-[13px] text-zinc-800 dark:text-zinc-200 font-bold mt-0.5 uppercase">{selected.seguradora_nome ?? "—"}</p>
                </div>
              </div>
            </div>

            {/* DETALHES DA APÓLICE */}
            <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/60 rounded-xl p-6">
              <h3 className="text-[#e85c5c] font-bold text-xs uppercase tracking-wider mb-5 dark:text-[#cf7458]">DETALHES DA APÓLICE</h3>
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
              <h3 className="text-[#e85c5c] font-bold text-xs uppercase tracking-wider mb-5 dark:text-[#cf7458]">VALORES E VENCIMENTO</h3>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">VALOR DA COBERTURA</span>
                  <p className="text-lg text-[#e85c5c] font-bold mt-1 dark:text-[#cf7458]">{formatBRL(selected.importancia_segurada)}</p>
                </div>
                <div>
                  <div className="mb-4">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide">VALOR (PRÊMIO)</span>
                    <p className="text-[13px] text-zinc-800 dark:text-zinc-200 font-bold mt-0.5">{formatBRL(selected.premio)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide">VENCIMENTO</span>
                    <p className="text-[13px] text-zinc-800 dark:text-zinc-200 font-bold mt-0.5">{isoToBR(vencimentoBoleto)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* VIGÊNCIA */}
            <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/60 rounded-xl p-6">
              <h3 className="text-[#e85c5c] font-bold text-xs uppercase tracking-wider mb-5 dark:text-[#cf7458]">VIGÊNCIA</h3>
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
              <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 w-full sm:w-auto mx-auto sm:ml-auto sm:mr-0">
                <button 
                  onClick={() => handleDelete(selected)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 h-10.5 sm:px-6 rounded-xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 font-semibold text-xs transition-all active:scale-[0.98] shadow-sm cursor-pointer"
                >
                  <Trash2 className="size-4" />
                  Excluir
                </button>
                <button 
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 h-10.5 sm:px-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold text-xs transition-all active:scale-[0.98] shadow-sm cursor-pointer"
                >
                  <Pencil className="size-4 text-zinc-500 dark:text-zinc-400" />
                  Editar
                </button>
                <button 
                  onClick={() => setShowEmitirModal(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10.5 sm:px-6 rounded-xl bg-brand-red text-white hover:bg-brand-red/90 font-bold text-xs shadow-md shadow-brand-red/10 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <CheckCircle2 className="size-4" />
                  Emitir
                </button>
              </div>
            </div>
          </div>

          {/* Modal Mensagem para o Cliente */}
          <Dialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
            <DialogContent aria-describedby={undefined} className="sm:max-w-[450px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-[#e85c5c] dark:text-[#cf7458] text-lg font-bold tracking-wide">
                  MENSAGEM PARA O CLIENTE
                </DialogTitle>
              </DialogHeader>
              
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700/50 relative max-h-[300px] overflow-y-auto">
                <pre className="text-[13px] text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-sans">
                  {generatedMessage}
                </pre>
              </div>
              
              <div className="mt-2 flex justify-end">
                <Button 
                  onClick={handleCopyMessage}
                  variant="outline"
                  className="gap-2 text-zinc-600 dark:text-zinc-300 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Copy className="size-4" />
                  <span>Copiar mensagem</span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Modal de Sucesso */}
          <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
            <DialogContent aria-describedby={undefined} className="sm:max-w-[400px] flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 [&>button]:hidden">
              <div className="w-16 h-16 rounded-full border-[3px] border-[#a5d6a7] bg-white flex items-center justify-center mb-4">
                <Check className="size-8 text-[#4caf50]" strokeWidth={3} />
              </div>
              <DialogTitle className="text-[17px] font-bold text-zinc-800 dark:text-zinc-100 mb-6 text-center">
                Copiado com sucesso
              </DialogTitle>
              <Button 
                onClick={() => setShowSuccessModal(false)}
                className="bg-[#2196f3] hover:bg-[#1976d2] text-white font-medium px-8 h-10 min-w-[120px] rounded-md transition-colors"
              >
                OK
              </Button>
            </DialogContent>
          </Dialog>
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

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">Vencimento do Boleto:</Label>
              <Input
                type="date"
                className="h-10 border-zinc-300"
                value={vencimentoBoleto}
                onChange={(e) => setVencimentoBoleto(e.target.value)}
              />
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

          <DialogFooter className="sm:justify-between gap-3 mt-4">
            <button
              type="button"
              disabled
              title="Emissão via API da seguradora ainda não disponível"
              className="inline-flex items-center justify-center gap-2 h-10.5 px-5 rounded-xl text-xs font-semibold text-zinc-400 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 cursor-not-allowed"
            >
              Emitir com API
            </button>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowEmitirModal(false)}
                disabled={emitindo}
                className="inline-flex items-center justify-center gap-2 h-10.5 px-6 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-sm cursor-pointer disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEmitir}
                disabled={emitindo}
                className="inline-flex items-center justify-center gap-2 h-10.5 px-6 rounded-xl text-xs font-bold text-white bg-green-600 hover:bg-green-700 transition-all active:scale-[0.98] shadow-md shadow-green-600/20 cursor-pointer disabled:opacity-60"
              >
                <CheckCircle2 className="size-4" />
                {emitindo ? "Emitindo..." : "Confirmar Emissão"}
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ──── MODAL FORMA DE EMISSÃO ──── */}
      <Dialog open={showFormaEmissaoModal} onOpenChange={setShowFormaEmissaoModal}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6 text-center border-zinc-200 dark:border-zinc-800">
          <DialogHeader className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex items-center justify-center mx-auto mb-3 text-2xl font-light text-zinc-400">
              ?
            </div>
            <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50 text-center">
              Forma de Emissão
            </DialogTitle>
          </DialogHeader>
          <div className="py-1">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
              Como deseja realizar esta emissão?
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => {
                if (selected && typeof window !== "undefined") {
                  localStorage.setItem(`forma_emissao_${selected.id}`, "api")
                }
                setShowFormaEmissaoModal(false)
              }}
              className="inline-flex items-center justify-center gap-2 h-10.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wide text-white bg-green-600 hover:bg-green-700 shadow-md shadow-green-600/20 transition-all active:scale-[0.98] cursor-pointer flex-1"
            >
              Utilizar API
            </button>
            <button
              type="button"
              onClick={() => {
                if (selected && typeof window !== "undefined") {
                  localStorage.setItem(`forma_emissao_${selected.id}`, "manual")
                }
                setShowFormaEmissaoModal(false)
              }}
              className="inline-flex items-center justify-center gap-2 h-10.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wide text-white bg-brand-red hover:bg-brand-red/90 shadow-md shadow-brand-red/10 transition-all active:scale-[0.98] cursor-pointer flex-1"
            >
              Cadastrar Manualmente
            </button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
