"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import {
  Search,
  Plus,
  FileText,
  ArrowLeft,
  FileDown,
  MessageCircle,
  Mail,
  Trash2,
  Pencil,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AsyncCombobox, type AsyncComboboxOption } from "@/components/ui/async-combobox"
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
  tomadoresApi,
  seguradosApi,
  modalidadesApi,
  seguradorasApi,
  cotacoesApi,
  type SeguradoraResponse,
  type CotacaoResponse,
  type CotacaoPayload,
} from "@/services/api"
import { toast } from "sonner"

// ─── Helpers de data (ISO yyyy-mm-dd, sem problema de fuso) ───────────────────

// Soma `days` a uma data ISO e retorna outra data ISO. Retorna "" se inválido.
function addDays(isoDate: string, days: number): string {
  if (!isoDate || !Number.isFinite(days)) return ""
  const [y, m, d] = isoDate.split("-").map(Number)
  const date = new Date(y, m - 1, d)
  if (isNaN(date.getTime())) return ""
  date.setDate(date.getDate() + days)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

// Diferença em dias entre duas datas ISO (final - inicial). Retorna "" se inválido.
function daysBetween(startIso: string, endIso: string): string {
  if (!startIso || !endIso) return ""
  const [ys, ms, ds] = startIso.split("-").map(Number)
  const [ye, me, de] = endIso.split("-").map(Number)
  const start = new Date(ys, ms - 1, ds)
  const end = new Date(ye, me - 1, de)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return ""
  const diff = Math.round((end.getTime() - start.getTime()) / 86400000)
  return String(diff)
}

// Formata um valor decimal (número ou string, ex.: "180.00") como moeda pt-BR
// "R$ 180,00". Retorna "—" quando o valor não é informado.
function formatBRL(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—"
  const num = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(num)) return "—"
  return num.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
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

// Converte uma data ISO "yyyy-mm-dd" para exibição "dd/mm/yyyy". "" se vazio.
function isoToBR(iso: string | null | undefined): string {
  if (!iso) return "—"
  const [y, m, d] = iso.split("-")
  if (!y || !m || !d) return "—"
  return `${d}/${m}/${y}`
}

// Converte um valor decimal do backend ("1500.00") para o formato de exibição
// pt-BR do input ("1.500,00"). Retorna "" quando não há valor.
function decimalToCurrencyInput(value: string | null | undefined): string {
  if (value === null || value === undefined || value === "") return ""
  const num = Number(value)
  if (!Number.isFinite(num)) return ""
  return num.toLocaleString("pt-BR", {
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

export default function CotacoesPage() {
  const [view, setView] = useState<"list" | "form" | "details">("list")
  // Contexto do formulário: criação de nova cotação ou edição de uma existente.
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Form State (Nova Cotação)
  const [tomador, setTomador] = useState<AsyncComboboxOption | null>(null)
  const [modalidade, setModalidade] = useState<AsyncComboboxOption | null>(null)
  const [segurado, setSegurado] = useState<AsyncComboboxOption | null>(null)
  // Rótulos iniciais dos comboboxes ao editar (para exibir o nome já selecionado).
  const [tomadorLabel, setTomadorLabel] = useState("")
  const [modalidadeLabel, setModalidadeLabel] = useState("")
  const [seguradoLabel, setSeguradoLabel] = useState("")
  const [edital, setEdital] = useState("")

  // Cotação atualmente selecionada (linha clicada → detalhes / edição).
  const [selectedCotacao, setSelectedCotacao] = useState<CotacaoResponse | null>(null)
  const [saving, setSaving] = useState(false)

  // Confirmação de aprovação da cotação (tela de detalhes).
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)

  // Cotação para excluir (estado para o modal de confirmação)
  const [deleteTarget, setDeleteTarget] = useState<CotacaoResponse | null>(null)

  // Seleciona a cotação em foco.
  const selectCotacao = (c: CotacaoResponse | null) => {
    setSelectedCotacao(c)
  }

  const fetchTomadores = React.useCallback(async (search: string): Promise<AsyncComboboxOption[]> => {
    const data = await tomadoresApi.list({ search })
    return data.map((t) => ({ value: t.id, label: t.nome, hint: t.cnpj }))
  }, [])

  const fetchModalidades = React.useCallback(async (search: string): Promise<AsyncComboboxOption[]> => {
    const data = await modalidadesApi.list({ search, ativo: true })
    return data.map((m) => ({ value: m.id, label: m.nome }))
  }, [])

  const fetchSegurados = React.useCallback(async (search: string): Promise<AsyncComboboxOption[]> => {
    const data = await seguradosApi.list({ search })
    return data.map((s) => ({ value: s.id, label: s.nome, hint: s.cnpj }))
  }, [])

  // Vigência (Data Início / Prazo em dias / Data Final) com auto-cálculo
  const [dataInicio, setDataInicio] = useState("")
  const [prazo, setPrazo] = useState("")
  const [dataFinal, setDataFinal] = useState("")

  // Importância Segurada formatada em reais (pt-BR)
  const [importanciaSegurada, setImportanciaSegurada] = useState("")

  // Seguradoras cadastradas (exibidas na tela de detalhes da simulação)
  const [seguradoras, setSeguradoras] = useState<SeguradoraResponse[]>([])
  const [loadingSeguradoras, setLoadingSeguradoras] = useState(false)

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

  const handleDataInicioChange = (value: string) => {
    setDataInicio(value)
    // Mantém o Prazo se já foi informado e recalcula o Final; senão recalcula o Prazo a partir do Final.
    if (prazo) {
      setDataFinal(addDays(value, parseInt(prazo, 10)))
    } else if (dataFinal) {
      setPrazo(daysBetween(value, dataFinal))
    }
  }

  const handlePrazoChange = (value: string) => {
    setPrazo(value)
    if (dataInicio) {
      setDataFinal(addDays(dataInicio, parseInt(value, 10)))
    }
  }

  const handleDataFinalChange = (value: string) => {
    setDataFinal(value)
    if (dataInicio) {
      setPrazo(daysBetween(dataInicio, value))
    }
  }

  // List State
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)

  // Cotações carregadas da API
  const [cotacoes, setCotacoes] = useState<CotacaoResponse[]>([])
  const [loadingCotacoes, setLoadingCotacoes] = useState(false)

  // Busca a lista de cotações. Reutilizada após criar/editar/excluir.
  // Só lista as em aberto: uma vez aprovada, a cotação vira proposta e passa a
  // ser listada em Propostas (status "Aprovado") ou em Apólices ("Emitido").
  const loadCotacoes = React.useCallback(async (search: string) => {
    setLoadingCotacoes(true)
    try {
      const data = await cotacoesApi.list({ status: "Iniciado", ...(search ? { search } : {}) })
      setCotacoes(data)
    } catch {
      setCotacoes([])
    } finally {
      setLoadingCotacoes(false)
    }
  }, [])

  // Carrega a lista ao entrar na view de lista, com debounce na busca.
  React.useEffect(() => {
    if (view !== "list") return
    const handle = setTimeout(() => loadCotacoes(searchQuery.trim()), 300)
    return () => clearTimeout(handle)
  }, [view, searchQuery, loadCotacoes])

  // Filter and Pagination Logic for List View (a busca já vem filtrada da API)
  const paginatedCotacoes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return cotacoes.slice(startIndex, startIndex + itemsPerPage)
  }, [cotacoes, currentPage, itemsPerPage])

  const totalPages = Math.max(1, Math.ceil(cotacoes.length / itemsPerPage))

  const handleClearFilters = () => {
    setSearchQuery("")
    setCurrentPage(1)
  }

  // ─── Gestão do formulário (criar / editar) ──────────────────────────────────

  // Limpa todos os campos do formulário.
  const resetForm = React.useCallback(() => {
    setTomador(null)
    setModalidade(null)
    setSegurado(null)
    setTomadorLabel("")
    setModalidadeLabel("")
    setSeguradoLabel("")
    setEdital("")
    setDataInicio("")
    setPrazo("")
    setDataFinal("")
    setImportanciaSegurada("")
  }, [])

  // Abre o formulário em branco para criar uma nova cotação.
  const openCreate = () => {
    resetForm()
    setFormMode("create")
    setView("form")
  }

  // Abre o formulário já preenchido com os dados da cotação `c` para edição.
  const openEdit = (c: CotacaoResponse) => {
    setFormMode("edit")
    selectCotacao(c)
    setTomador({ value: c.tomador, label: c.tomador_nome })
    setModalidade({ value: c.modalidade, label: c.modalidade_nome })
    setSegurado(c.segurado != null ? { value: c.segurado, label: c.segurado_nome ?? "" } : null)
    setTomadorLabel(c.tomador_nome)
    setModalidadeLabel(c.modalidade_nome)
    setSeguradoLabel(c.segurado_nome ?? "")
    setEdital(c.edital ?? "")
    setDataInicio(c.data_inicio ?? "")
    setPrazo(c.prazo_dias != null ? String(c.prazo_dias) : "")
    setDataFinal(c.data_final ?? "")
    setImportanciaSegurada(decimalToCurrencyInput(c.importancia_segurada))
    setView("form")
  }

  // Cria ou atualiza a cotação conforme o modo atual.
  const handleSave = async () => {
    if (!tomador || !modalidade) {
      toast.error("Selecione o tomador e a modalidade.")
      return
    }
    const payload: CotacaoPayload = {
      tomador: Number(tomador.value),
      modalidade: Number(modalidade.value),
      segurado: segurado ? Number(segurado.value) : null,
      edital,
      data_inicio: dataInicio || null,
      prazo_dias: prazo ? parseInt(prazo, 10) : null,
      data_final: dataFinal || null,
      importancia_segurada: currencyInputToDecimal(importanciaSegurada),
    }
    setSaving(true)
    try {
      const saved =
        formMode === "edit" && selectedCotacao
          ? await cotacoesApi.update(selectedCotacao.id, payload)
          : await cotacoesApi.create(payload)
      setSelectedCotacao(saved)
      await loadCotacoes(searchQuery.trim())
      setView("details")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar a cotação.")
    } finally {
      setSaving(false)
    }
  }

  // Exclui a cotação informada e volta para a lista.
  const handleDelete = (c: CotacaoResponse) => {
    setDeleteTarget(c)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await cotacoesApi.remove(deleteTarget.id)
      if (selectedCotacao?.id === deleteTarget.id) selectCotacao(null)
      await loadCotacoes(searchQuery.trim())
      setView("list")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir a cotação.")
    } finally {
      setDeleteTarget(null)
    }
  }

  // Aprova a cotação selecionada. Permanece na tela de detalhes, apenas
  // atualizando os dados (status vira "Aprovado").
  const handleAprovar = async () => {
    if (!selectedCotacao) return
    setSaving(true)
    try {
      const updated = await cotacoesApi.aprovar(selectedCotacao.id)
      setSelectedCotacao(updated)
      setShowApproveConfirm(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao aprovar a cotação.")
    } finally {
      setSaving(false)
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
            <AlertDialogTitle className="text-center font-bold text-zinc-900 dark:text-zinc-50">Excluir cotação?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-zinc-500 mt-1">
              Você está prestes a excluir a cotação #{deleteTarget?.id}. Esta ação não pode ser desfeita.
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
                Lista de Simulações
              </h1>
              <p className="text-xs opacity-60 mt-0.5">
                Gerencie e acompanhe as simulações e cotações ativas.
              </p>
            </div>

            <Button
              onClick={openCreate}
              className="bg-brand-red text-white hover:bg-brand-red/90 font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-brand-red/10 transition-all duration-200 active:scale-[0.98]"
            >
              <Plus className="size-4.5" />
              <span>Nova Cotação</span>
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            {/* Filters Card */}
            <div className="custom-filters-card border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-3.5 shadow-sm">
              <div className="w-full max-w-xs">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 opacity-40" />
                  <Input
                    placeholder="Buscar simulação..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="custom-filter-input pl-9 h-8.5 w-full max-w-xs rounded-lg border border-zinc-200 dark:border-zinc-800 focus-visible:ring-brand-red/20 focus-visible:border-brand-red text-xs transition-all duration-200"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <button
                  onClick={handleClearFilters}
                  className="text-[11px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:underline transition-all mt-1"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>

            {/* Exibir registros */}
            <div className="flex items-center justify-between mt-1">
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
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>registros por página</span>
              </div>
            </div>

            {/* Cards Table list */}
            <div className="flex flex-col gap-2">
              <div className="hidden xl:grid grid-cols-10 gap-4 px-5 py-2 text-[9px] font-bold uppercase tracking-wider opacity-65 border-b border-zinc-200/30 dark:border-zinc-800/30 text-center">
                <div className="col-span-1 text-left pl-5">ID</div>
                <div className="col-span-2">Tomador / CNPJ</div>
                <div className="col-span-2">Modalidade / Edital</div>
                <div className="col-span-1">Início / Prazo</div>
                <div className="col-span-1">Data</div>
                <div className="col-span-1">IS</div>
                <div className="col-span-1">Emitido Por</div>
                <div className="col-span-1">Ação</div>
              </div>

              {loadingCotacoes ? (
                <div className="bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-xl p-12 text-center">
                  <div className="flex flex-col items-center justify-center max-w-xs mx-auto">
                    <FileText className="size-5 text-zinc-400 mb-3 opacity-70 animate-pulse" />
                    <h4 className="font-bold text-xs text-inherit opacity-70">Carregando cotações...</h4>
                  </div>
                </div>
              ) : paginatedCotacoes.length > 0 ? (
                paginatedCotacoes.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => { selectCotacao(t); setView("details") }}
                    className="cursor-pointer group bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-xl hover:border-brand-red/40 dark:hover:border-brand-red/40 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 hover:shadow-md transition-all duration-200 relative"
                  >
                    {/* ===== DESKTOP LAYOUT (INTACT) ===== */}
                    <div className="hidden xl:grid grid-cols-10 gap-4 items-center p-3.5 px-5 text-center">
                      <div className="col-span-1 text-[11px] font-bold text-zinc-500 text-left pl-5">#{t.id}</div>

                      {/* Tomador / CNPJ */}
                      <div className="col-span-2 flex flex-col gap-1 items-center justify-center">
                        <span className="font-bold text-xs tracking-tight text-inherit uppercase">{t.tomador_nome}</span>
                        <span className="font-mono text-[10px] text-zinc-500 font-medium">{t.tomador_cnpj}</span>
                      </div>

                      {/* Modalidade / Edital */}
                      <div className="col-span-2 flex flex-col gap-1 text-[11px] text-zinc-650 dark:text-zinc-400 font-medium items-center justify-center">
                        <span className="leading-tight">{t.modalidade_nome}</span>
                        <span className="leading-tight text-[10px] uppercase">{t.edital || "—"}</span>
                      </div>

                      {/* Data Início / Prazo */}
                      <div className="col-span-1 flex flex-col gap-1 text-[11px] text-zinc-650 dark:text-zinc-400 items-center justify-center">
                        <span className="font-medium text-[10px]">Inc: {isoToBR(t.data_inicio)}</span>
                        <span className="font-medium text-[10px]">Prz: {t.prazo_dias != null ? `${t.prazo_dias} dias` : "—"}</span>
                      </div>

                      {/* Data */}
                      <div className="col-span-1 flex flex-col gap-1 text-[11px] text-zinc-650 dark:text-zinc-400 items-center justify-center">
                        <span className="font-medium text-[10px]">{isoToBR(t.criado_em?.slice(0, 10))}</span>
                      </div>

                      {/* Valores */}
                      <div className="col-span-1 flex flex-col gap-1 text-[11px] text-zinc-650 dark:text-zinc-400 items-center justify-center">
                        <span className="font-bold text-brand-red dark:text-[#cf7458]">{formatBRL(t.importancia_segurada)}</span>
                      </div>

                      {/* Emitido Por */}
                      <div className="col-span-1 flex items-center justify-center text-[11px] text-zinc-650 dark:text-zinc-400">
                        <span className="font-medium opacity-80 uppercase leading-tight text-center">{t.criado_por_nome ?? "—"}</span>
                      </div>

                      {/* Ação */}
                      <div className="col-span-1 flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(t) }}
                          className="w-7 h-7 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white rounded flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); openEdit(t) }}
                          className="w-7 h-7 bg-zinc-200 text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600 rounded flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* ===== MOBILE LAYOUT (NEW DESIGN) ===== */}
                    <div className="grid xl:hidden grid-cols-2 gap-x-4 gap-y-4 items-start p-4">
                      {/* Tomador / CNPJ */}
                      <div className="col-span-2 flex flex-col gap-1 order-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[13px] font-medium text-brand-red/90 dark:text-[#cf7458] uppercase tracking-wide">Simulação #{t.id}</span>
                        </div>
                        <span className="font-bold text-[15px] tracking-tight text-zinc-800 dark:text-zinc-200 uppercase">{t.tomador_nome}</span>
                        <span className="font-mono text-[13px] text-zinc-400 font-normal">{t.tomador_cnpj}</span>
                      </div>

                      {/* Modalidade / Edital */}
                      <div className="col-span-1 flex flex-col gap-1 text-[13px] text-zinc-800 dark:text-zinc-300 font-normal order-2">
                        <span className="leading-tight uppercase">{t.modalidade_nome}</span>
                        <span className="leading-tight text-[12px] text-zinc-500 uppercase mt-0.5 max-w-[110px] inline-block">{t.edital || "—"}</span>
                      </div>

                      {/* Data Início / Prazo */}
                      <div className="col-span-1 flex flex-col gap-2.5 text-sm text-zinc-650 dark:text-zinc-400 order-3">
                        <div className="flex flex-col gap-0">
                          <span className="text-[10px] uppercase text-zinc-700 font-medium tracking-wide mb-0.5">Data Inicial:</span>
                          <span className="font-normal text-[13px] text-zinc-600">{isoToBR(t.data_inicio)}</span>
                        </div>
                        <div className="flex flex-col gap-0">
                          <span className="text-[10px] uppercase text-zinc-700 font-medium tracking-wide mb-0.5">Prazo:</span>
                          <span className="font-normal text-[13px] text-zinc-600">{t.prazo_dias != null ? `${t.prazo_dias} dias` : "—"}</span>
                        </div>
                      </div>

                      {/* Valores */}
                      <div className="col-span-2 flex flex-col gap-0.5 text-sm text-zinc-650 dark:text-zinc-400 order-4 -mt-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-normal text-lg text-brand-red/90 dark:text-[#cf7458]">{formatBRL(t.importancia_segurada)}</span>
                        </div>
                      </div>

                      {/* Emitido Por / Data */}
                      <div className="col-span-1 flex flex-col gap-0.5 mt-1 order-5">
                        <span className="text-[11px] text-zinc-800 font-bold mb-0.5">Emitida em:</span>
                        <span className="text-[12px] text-zinc-500">{isoToBR(t.criado_em?.slice(0, 10))}</span>
                        <span className="text-[12px] text-zinc-500 mt-1">Por <span className="font-bold">{t.criado_por_nome ?? "—"}</span></span>
                      </div>

                      {/* Ação */}
                      <div className="col-span-1 flex items-end justify-end gap-2 mt-1 order-6">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(t) }}
                          className="w-11 h-11 bg-[#ffe6e6] text-brand-red hover:bg-brand-red hover:text-white dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                        >
                          <Trash2 className="size-5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); openEdit(t) }}
                          className="w-11 h-11 bg-[#e4e4e7] text-zinc-800 hover:bg-zinc-800 hover:text-white dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                        >
                          <Pencil className="size-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-xl p-12 text-center">
                  <div className="flex flex-col items-center justify-center max-w-xs mx-auto">
                    <FileText className="size-5 text-zinc-400 mb-3 opacity-70" />
                    <h4 className="font-bold text-xs text-inherit">Nenhuma simulação encontrada</h4>
                  </div>
                </div>
              )}

              {/* Pagination */}
              <div className="border border-zinc-200/40 dark:border-zinc-800/40 px-5 py-3 rounded-xl flex items-center justify-between bg-zinc-50/20 dark:bg-zinc-900/10 mt-2">
                <span className="text-[11px] opacity-50">Mostrando {paginatedCotacoes.length} registros</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} className="text-xs font-bold text-brand-red dark:text-[#cf7458] cursor-pointer">Anterior</button>
                  <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} className="text-xs font-bold text-brand-red dark:text-[#cf7458] cursor-pointer">Próximo</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ──── FORM VIEW (NOVA COTAÇÃO / EDITAR) ──── */}
      {view === "form" && (
        <div className="flex flex-col max-w-2xl mx-auto w-full">
          <div className="flex items-center gap-4 mb-8">
             <button
              onClick={() => setView(formMode === "edit" ? "details" : "list")}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="size-4 opacity-70" />
            </button>
            <h1 className="text-3xl font-light text-zinc-600 dark:text-zinc-300">
              {formMode === "edit" ? "Editar Cotação" : "Nova Cotação"}
            </h1>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-8 flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">Tomador:</Label>
              <AsyncCombobox
                value={tomador?.value ?? null}
                onChange={setTomador}
                fetchOptions={fetchTomadores}
                initialLabel={tomadorLabel}
                placeholder="Digite o nome ou CNPJ do tomador..."
                emptyMessage="Nenhum tomador encontrado."
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">Modalidade:</Label>
              <AsyncCombobox
                value={modalidade?.value ?? null}
                onChange={setModalidade}
                fetchOptions={fetchModalidades}
                initialLabel={modalidadeLabel}
                placeholder="Selecione a modalidade..."
                emptyMessage="Nenhuma modalidade encontrada."
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">Segurado:</Label>
              <AsyncCombobox
                value={segurado?.value ?? null}
                onChange={setSegurado}
                fetchOptions={fetchSegurados}
                initialLabel={seguradoLabel}
                placeholder="Digite o nome ou CNPJ do segurado..."
                emptyMessage="Nenhum segurado encontrado."
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">Edital:</Label>
              <Input
                className="h-10 border-zinc-300"
                value={edital}
                onChange={(e) => setEdital(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 text-center">Data de Início</Label>
                <Input
                  type="date"
                  className="h-10 border-zinc-300"
                  value={dataInicio}
                  onChange={(e) => handleDataInicioChange(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 text-center">Prazo (dias)</Label>
                <Input
                  type="number"
                  min={0}
                  className="h-10 border-zinc-300 text-center"
                  value={prazo}
                  onChange={(e) => handlePrazoChange(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 text-center">Data Final</Label>
                <Input
                  type="date"
                  className="h-10 border-zinc-300"
                  value={dataFinal}
                  onChange={(e) => handleDataFinalChange(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase whitespace-nowrap">Importância Segurada</Label>
              <div className="relative w-full">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">R$</span>
                <Input
                  className="h-10 pl-9 border-zinc-300"
                  inputMode="numeric"
                  placeholder="0,00"
                  value={importanciaSegurada}
                  onChange={(e) => setImportanciaSegurada(formatCurrency(e.target.value))}
                />
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 h-10 w-auto min-w-40 rounded-md transition-colors disabled:opacity-60"
              >
                {saving
                  ? "SALVANDO..."
                  : formMode === "edit"
                  ? "SALVAR ALTERAÇÕES"
                  : "CALCULAR"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ──── DETAILS VIEW (DADOS DA SIMULAÇÃO) ──── */}
      {view === "details" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setView("list")}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="size-4 opacity-70" />
              </button>
              <h1 className="text-3xl font-light text-zinc-600 dark:text-zinc-300">
                Dados da Simulação
              </h1>
            </div>
            
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-full border border-red-200 text-red-500 flex items-center justify-center bg-white shadow-sm hover:bg-red-50"><FileDown className="size-4" /></button>
              <button className="w-8 h-8 rounded-full border border-green-200 text-green-500 flex items-center justify-center bg-white shadow-sm hover:bg-green-50"><MessageCircle className="size-4" /></button>
              <button className="w-8 h-8 rounded-full border border-blue-200 text-blue-500 flex items-center justify-center bg-white shadow-sm hover:bg-blue-50"><Mail className="size-4" /></button>
              <button className="w-8 h-8 rounded-full border border-green-200 text-green-500 flex items-center justify-center bg-white shadow-sm hover:bg-green-50"><MessageCircle className="size-4" /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-5xl mx-auto w-full">
            
            {/* Informações da Cotação */}
            <div className="md:col-span-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-[#e85c5c] dark:text-[#cf7458] text-lg font-light tracking-wide mb-6">INFORMAÇÕES DA COTAÇÃO</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                <div className="flex flex-col gap-3 text-[13px] text-zinc-600 dark:text-zinc-400">
                  <p><strong className="text-zinc-900 dark:text-zinc-100 font-bold mr-1">Tomador:</strong> {selectedCotacao ? `${selectedCotacao.tomador_nome} - ${selectedCotacao.tomador_cnpj}` : "—"}</p>
                  <p><strong className="text-zinc-900 dark:text-zinc-100 font-bold mr-1">Modalidade:</strong> {selectedCotacao?.modalidade_nome ?? "—"}</p>
                  <p><strong className="text-zinc-900 dark:text-zinc-100 font-bold mr-1">Edital/Contrato:</strong> <span className="uppercase break-all">{selectedCotacao?.edital || "—"}</span></p>
                  <p><strong className="text-zinc-900 dark:text-zinc-100 font-bold mr-1">Valor da Cobertura:</strong> {formatBRL(selectedCotacao?.importancia_segurada)}</p>
                  <p><strong className="text-zinc-900 dark:text-zinc-100 font-bold mr-1">Segurado:</strong> {selectedCotacao?.segurado_nome ? `${selectedCotacao.segurado_nome}${selectedCotacao.segurado_cnpj ? ` - ${selectedCotacao.segurado_cnpj}` : ""}` : "—"}</p>
                  <div className="mt-4 flex flex-col gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                    <p><strong className="text-zinc-900 dark:text-zinc-100 font-bold mr-1">Realizado por:</strong> {selectedCotacao?.criado_por_nome ?? "—"}</p>
                    <p><strong className="text-zinc-900 dark:text-zinc-100 font-bold mr-1">Observações:</strong> {selectedCotacao?.observacoes || "—"}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 text-[13px] text-zinc-600 dark:text-zinc-400">
                  <p><strong className="text-zinc-900 dark:text-zinc-100 font-bold mr-1">Vigência de:</strong> {isoToBR(selectedCotacao?.data_inicio)}</p>
                  <p><strong className="text-zinc-900 dark:text-zinc-100 font-bold mr-1">Até:</strong> {isoToBR(selectedCotacao?.data_final)}</p>
                  <p><strong className="text-zinc-900 dark:text-zinc-100 font-bold mr-1">Total de Dias:</strong> {selectedCotacao?.prazo_dias != null ? `${selectedCotacao.prazo_dias} Dias` : "—"}</p>
                </div>
              </div>
            </div>


            {/* Seguradoras Grid */}
            <div className="md:col-span-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-[#e85c5c] dark:text-[#cf7458] text-lg font-light tracking-wide mb-6">SEGURADORAS</h2>

              {loadingSeguradoras ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="bg-zinc-100 dark:bg-zinc-800/50 rounded-xl h-40 border border-zinc-200 dark:border-zinc-700/50 animate-pulse" />
                  ))}
                </div>
              ) : seguradoras.length === 0 ? (
                <p className="text-[13px] text-zinc-500 dark:text-zinc-400 py-4">
                  Nenhuma seguradora cadastrada.
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {seguradoras.map((seg) => {
                    return (
                    <div
                      key={seg.id}
                      className="relative bg-zinc-100 dark:bg-zinc-800/50 rounded-xl h-40 flex flex-col items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700/50 opacity-70"
                    >
                      <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide text-center leading-tight">{seg.nome}</span>

                      <div className="flex-1 flex items-center justify-center py-1">
                        {seg.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={seg.logo} alt={`Logo ${seg.nome}`} className="max-w-full max-h-14 object-contain" />
                        ) : (
                          <div className="text-2xl font-black text-brand-red/80 dark:text-[#cf7458]">{seg.nome.charAt(0)}</div>
                        )}
                      </div>

                      <div className="w-full flex flex-col gap-1 text-[10.5px] text-zinc-600 dark:text-zinc-400 border-t border-zinc-200/70 dark:border-zinc-700/50 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="uppercase font-medium opacity-70">Taxa</span>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">
                            {seg.taxa_comissao != null ? `${Number(seg.taxa_comissao).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%` : "—"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="uppercase font-medium opacity-70">Prêmio mín.</span>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">{formatBRL(seg.premio_minimo)}</span>
                        </div>
                      </div>
                    </div>
                    )
                  })}
                </div>
              )}
            </div>
            
            {/* Boleto Seguradora */}
            <div className="md:col-span-12 mt-4 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/40 rounded-xl p-6 shadow-sm">
              <h3 className="text-brand-red uppercase font-normal text-lg mb-6">Boleto Seguradora</h3>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-12">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Quantidade dias:</span>
                  <Input 
                    type="number" 
                    defaultValue={7}
                    className="w-24 h-9 text-right text-sm border-zinc-300 dark:border-zinc-700"
                  />
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Vencimento:</span>
                  <span className="text-sm text-zinc-400">28/07/2026</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons Footer */}
            <div className="md:col-span-12 flex flex-col sm:flex-row items-center gap-3 mt-8 pt-6 border-t border-zinc-200/50 dark:border-zinc-800/50 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => selectedCotacao && handleDelete(selectedCotacao)}
                className="w-full sm:w-auto bg-red-50 dark:bg-red-500/10 text-red-600 border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/30 font-semibold px-4 py-2.5 h-10.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 sm:mr-auto"
              >
                <Trash2 className="size-4" />
                Excluir
              </Button>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => selectedCotacao && openEdit(selectedCotacao)}
                  className="w-full sm:w-auto border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-semibold h-10.5 px-6 rounded-xl flex items-center justify-center gap-2"
                >
                  <Pencil className="size-4 text-zinc-500 dark:text-zinc-400" />
                  Editar
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowApproveConfirm(true)}
                  className="w-full sm:w-auto bg-brand-red text-white hover:bg-brand-red/90 font-bold px-6 py-2.5 h-10.5 rounded-xl cursor-pointer shadow-md shadow-brand-red/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="size-4" />
                  Aprovar Cotação
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ──── CONFIRMAÇÃO DE APROVAÇÃO ──── */}
      <AlertDialog open={showApproveConfirm} onOpenChange={setShowApproveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aprovar cotação?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja aprovar esta cotação
              {selectedCotacao ? ` #${selectedCotacao.id}` : ""}? Essa ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleAprovar() }}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-60"
            >
              {saving ? "Aprovando..." : "Aprovar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}

