"use client"

import * as React from "react"
import { TableSkeleton } from "@/components/ui/skeleton"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Plus,
  FileText,
  ArrowLeft,
  FileDown,
  Mail,
  Trash2,
  Pencil,
  CheckCircle2,
  Copy,
  Check
} from "lucide-react"

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

import { cn, getMediaUrl } from "@/lib/utils"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  tomadoresApi,
  seguradosApi,
  modalidadesApi,
  seguradorasApi,
  cotacoesApi,
  getTomadorSeguradoraVinculo,
  type SeguradoraResponse,
  type CotacaoResponse,
  type CotacaoPayload,
} from "@/services/api"
import {
  listTomadorSeguradorasAction,
  type TomadorSeguradora,
} from "@/app/actions/tomador-seguradoras"
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
  const [view, setView] = useState<"list" | "form" | "details">(() => {
    if (typeof window !== "undefined") {
      const storedView = sessionStorage.getItem("cotacoes_view");
      if (storedView === "details") return "details";
    }
    return "list"
  })
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
  const [observacoes, setObservacoes] = useState("")

  // Cotação atualmente selecionada (linha clicada → detalhes / edição).
  const [selectedCotacao, setSelectedCotacao] = useState<CotacaoResponse | null>(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("cotacoes_selected");
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
    }
    return null;
  })
  const [saving, setSaving] = useState(false)

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      if (view === "details" || view === "list") {
        sessionStorage.setItem("cotacoes_view", view);
      } else {
        sessionStorage.setItem("cotacoes_view", "list");
      }
      
      if (selectedCotacao) {
        sessionStorage.setItem("cotacoes_selected", JSON.stringify(selectedCotacao));
      } else {
        sessionStorage.removeItem("cotacoes_selected");
      }
    }
  }, [view, selectedCotacao]);

  // Confirmação de aprovação da cotação (tela de detalhes).
  
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Cotação para excluir (estado para o modal de confirmação)
  const [deleteTarget, setDeleteTarget] = useState<CotacaoResponse | null>(null)

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
    if (data.length > 0) {
      return data.map((s) => ({ value: s.id, label: s.nome, hint: s.cnpj }))
    }

    const digits = search.replace(/\D/g, "")
    if (digits.length === 14) {
      try {
        const { lookupCnpj } = await import("@/services/api")
        const cnpjData = await lookupCnpj(digits)
        
        if (cnpjData && cnpjData.razao_social) {
          const payload = {
            cnpj: digits,
            nome: cnpjData.razao_social,
            natureza_juridica: cnpjData.natureza_juridica || "",
            endereco: cnpjData.logradouro || "",
            cidade: cnpjData.municipio || "",
            estado: cnpjData.uf || "",
            bairro: cnpjData.bairro || "",
            numero: cnpjData.numero || "",
            cep: cnpjData.cep || "",
            complemento: cnpjData.complemento || "",
            observacoes: "Cadastrado automaticamente via Cotação"
          }
          const saved = await seguradosApi.create(payload)
          toast.success("Segurado encontrado e cadastrado com sucesso!")
          
          setSegurado({ value: saved.id, label: saved.nome, hint: saved.cnpj })
          setSeguradoLabel(saved.nome)
          
          return [{ value: saved.id, label: saved.nome, hint: saved.cnpj }]
        }
      } catch {
        toast.error("CNPJ não encontrado")
      }
    }
    
    return []
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

  // Condições comerciais do tomador desta cotação, indexadas por seguradora.
  // A taxa e o prêmio mínimo exibidos são os do tomador (cadastrados na aba
  // Taxas), com fallback para os valores da própria seguradora.
  const [vinculosTomador, setVinculosTomador] = useState<Record<number, TomadorSeguradora>>({})

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

  // Busca as condições do tomador em cada seguradora ao abrir os detalhes.
  React.useEffect(() => {
    const tomadorId = selectedCotacao?.tomador
    if (view !== "details" || !tomadorId) return
    let active = true
    listTomadorSeguradorasAction(tomadorId).then((result) => {
      if (!active) return
      if (!result.data) {
        setVinculosTomador({})
        return
      }
      const porSeguradora: Record<number, TomadorSeguradora> = {}
      for (const v of result.data) porSeguradora[v.seguradora] = v
      setVinculosTomador(porSeguradora)
    })
    return () => { active = false }
  }, [view, selectedCotacao?.tomador])

  // Grava a seguradora escolhida na cotação. O backend recalcula o prêmio a
  // partir da taxa do tomador nessa seguradora e devolve a cotação atualizada.
  const handleEscolherSeguradora = async (seguradoraId: number) => {
    if (!selectedCotacao) return
    setSeguradoraEscolhidaId(seguradoraId)
    try {
      const atualizada = await cotacoesApi.update(selectedCotacao.id, { seguradora: seguradoraId })
      setSelectedCotacao(atualizada)
    } catch {
      toast.error("Não foi possível salvar a seguradora escolhida.")
    }
  }

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
  const [loadingCotacoes, setLoadingCotacoes] = useState(true)
  const router = useRouter()
  const [seguradoraEscolhidaId, setSeguradoraEscolhidaId] = useState<number | null>(null)

  // Boleto Seguradora (tela de detalhes, cotação aprovada): quantidade de dias
  // até o vencimento, pré-preenchida a partir do vínculo tomador x seguradora
  // escolhida (default 7 dias quando a seguradora não tem prazo cadastrado).
  const [diasVencimento, setDiasVencimento] = useState(7)

  React.useEffect(() => {
    if (selectedCotacao?.status !== "Aprovado" || !seguradoraEscolhidaId) return
    // Fallback quando não há vínculo tomador x seguradora cadastrado (a API
    // retorna 404 nesse caso): usa o vencimento_dias da própria seguradora.
    const seguradoraFallback = seguradoras.find(s => s.id === seguradoraEscolhidaId)?.vencimento_dias ?? 7
    let active = true
    getTomadorSeguradoraVinculo(selectedCotacao.tomador, seguradoraEscolhidaId)
      .then((vinculo) => {
        if (!active) return
        setDiasVencimento(vinculo?.dias_vencimento_efetivo ?? seguradoraFallback)
      })
      .catch(() => {
        if (active) setDiasVencimento(seguradoraFallback)
      })
    return () => { active = false }
  }, [selectedCotacao?.status, selectedCotacao?.tomador, seguradoraEscolhidaId, seguradoras])

  const generatedMessage = useMemo(() => {
    if (!selectedCotacao) return ""
    
    const seguradorasDisponiveis = seguradoras
      .filter(seg => vinculosTomador[seg.id]?.apto)
      .map(seg => {
        const vinculo = vinculosTomador[seg.id]
        const taxa = Number(vinculo.taxa) || 0
        const premioMinimo = Number(vinculo.premio_minimo_efetivo) || 0
        const isValor = Number(selectedCotacao.importancia_segurada) || 0
        const prazo = selectedCotacao.prazo_dias || 0
        const calcPremio = (isValor / 365) * (taxa / 100) * prazo
        const premio = Math.max(premioMinimo, calcPremio)
        return `${seg.nome}: ${formatBRL(premio)}`
      })

    const valoresTexto = seguradorasDisponiveis.length > 0
      ? `*Valores das Seguradoras*\n${seguradorasDisponiveis.join('\n')}`
      : `*Valores das Seguradoras*\n\nNenhuma seguradora disponível`

    return `Olá, ${selectedCotacao.tomador_nome}!
CNPJ ${selectedCotacao.tomador_cnpj}

Obrigado pela sua preferência pela CAJUINA CORRETORA DE SEGUROS EIRELI. Informamos que a sua cotação foi APROVADA e encontra-se pronta para emissão da apólice. Seguem os dados:

*Dados da Cotação*
Segurado: ${selectedCotacao.segurado_nome ? `${selectedCotacao.segurado_nome} - ${selectedCotacao.segurado_cnpj}` : '—'}
Edital/Contrato: ${selectedCotacao.edital || '—'}
Modalidade: ${selectedCotacao.modalidade_nome || '—'}
IS: ${formatBRL(selectedCotacao.importancia_segurada)}
Prazo: ${selectedCotacao.prazo_dias != null ? `${selectedCotacao.prazo_dias} Dias` : '—'}
Início: ${isoToBR(selectedCotacao.data_inicio)}
Fim: ${isoToBR(selectedCotacao.data_final)}

${valoresTexto}

Vencimento do Boleto: ${isoToBR(addDays(new Date().toISOString().slice(0, 10), diasVencimento)) || '—'}

Em caso de dúvidas ou para prosseguir com a emissão, entre em contato com o nosso suporte:

(86) 3081-0282`
  }, [selectedCotacao, diasVencimento, seguradoras, vinculosTomador])

  const emailMessage = useMemo(() => {
    if (!selectedCotacao) return ""

    const seguradorasList = seguradoras
      .filter(seg => vinculosTomador[seg.id]?.apto)
      .map(seg => {
        const vinculo = vinculosTomador[seg.id]
        const taxa = Number(vinculo.taxa) || 0
        const premioMinimo = Number(vinculo.premio_minimo_efetivo) || 0
        const isValor = Number(selectedCotacao.importancia_segurada) || 0
        const prazo = selectedCotacao.prazo_dias || 0
        const calcPremio = (isValor / 365) * (taxa / 100) * prazo
        const premio = Math.max(premioMinimo, calcPremio)
        return `${seg.nome}: ${formatBRL(premio)}`
      }).join('\n')

    return `Cotação de Seguro Garantia

Olá, ${selectedCotacao.tomador_nome}!

Segue abaixo os dados da sua cotação.

**Dados da Cotação**
Cliente:
${selectedCotacao.tomador_nome} - ${selectedCotacao.tomador_cnpj}

Edital / Contrato:
${selectedCotacao.edital || '—'}

Modalidade:
${selectedCotacao.modalidade_nome || '—'}

Importância Segurada:
${formatBRL(selectedCotacao.importancia_segurada)}

Prazo:
${selectedCotacao.prazo_dias != null ? `${selectedCotacao.prazo_dias} Dias` : '—'}

**Valores das Seguradoras**

${seguradorasList || 'Nenhuma seguradora disponível'}

Sua cotação já está aprovada e pronta para emissão da apólice.

Caso tenha qualquer dúvida, estamos à disposição.

Atenciosamente,

CAJUINA CORRETORA DE SEGUROS EIRELI

Telefone: (86) 3081-0282

E-mail: garantia@cajuinaseguros.com.br`
  }, [selectedCotacao, seguradoras, vinculosTomador])

  const handleCopyEmailMessage = async () => {
    try {
      await navigator.clipboard.writeText(emailMessage)
      setIsEmailModalOpen(false)
      setShowSuccessModal(true)
    } catch {
      toast.error("Erro ao copiar a mensagem de e-mail.")
    }
  }

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(generatedMessage)
      setIsMessageModalOpen(false)
      setShowSuccessModal(true)
    } catch {
      toast.error("Erro ao copiar a mensagem.")
    }
  }

  // Seleciona a cotação em foco. A seguradora escolhida vem da própria cotação
  // (persistida no banco); o prazo de boleto é recalculado pelo efeito acima.
  const selectCotacao = (c: CotacaoResponse | null) => {
    setSelectedCotacao(c)
    setSeguradoraEscolhidaId(c?.seguradora ?? null)
    setDiasVencimento(7)
  }

  // Busca a lista de cotações. Reutilizada após criar/editar/excluir.
  // Só lista as em aberto: uma vez aprovada, a cotação vira proposta e passa a
  // ser listada em Propostas (status "Aprovado") ou em Apólices ("Emitido").
  const loadCotacoes = React.useCallback(async (search: string) => {
    setLoadingCotacoes(true)
    try {
      const data = await cotacoesApi.list({ ...(search ? { search } : {}) })
      setCotacoes(data.filter(c => {
        if (c.status === "Emitido") return false
        if (c.status === "Aprovado" && typeof window !== "undefined") {
          const jaEnviado = localStorage.getItem(`enviado_proposta_${c.id}`) === "true" || localStorage.getItem(`forma_emissao_${c.id}`) !== null
          if (jaEnviado) return false
        }
        return true
      }))
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
    setObservacoes(c.observacoes ?? "")
    setView("form")
  }

  // Cria ou atualiza a cotação conforme o modo atual.
  const handleSave = async () => {
    if (!tomador || !modalidade || !edital.trim()) {
      toast.error("Selecione o tomador, a modalidade e preencha o edital.")
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
      observacoes,
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
                <TableSkeleton rows={6} />
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
              <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">Edital: </Label>
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

            <div className="flex flex-col gap-1.5 mt-2">
              <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">Observações:</Label>
              <textarea
                className="w-full h-20 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-md p-3 text-sm text-zinc-800 dark:text-zinc-200 resize-none focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all shadow-sm"
                placeholder="Observações adicionais..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              ></textarea>
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
              <h1 className="text-3xl font-light text-zinc-600 dark:text-zinc-300 flex items-center gap-3">
                Dados da Simulação
              </h1>
            </div>
            
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-full border border-red-200 text-red-500 flex items-center justify-center bg-white shadow-sm hover:bg-red-50"><FileDown className="size-4" /></button>
              <button 
                onClick={() => setIsMessageModalOpen(true)}
                className="w-8 h-8 rounded-full border border-green-200 text-green-500 flex items-center justify-center bg-white shadow-sm hover:bg-green-50 transition-colors"
                title="Mensagem para o cliente"
              >
                <WhatsAppIcon className="size-4" />
              </button>
              <button 
                onClick={() => setIsEmailModalOpen(true)}
                className="w-8 h-8 rounded-full border border-blue-200 text-blue-500 flex items-center justify-center bg-white shadow-sm hover:bg-blue-50 transition-colors"
                title="E-mail para o cliente"
              >
                <Mail className="size-4" />
              </button>
              
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
                  <p><strong className="text-zinc-900 dark:text-zinc-100 font-bold mr-1">Importância Segurada:</strong> {formatBRL(selectedCotacao?.importancia_segurada)}</p>
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

            {/* Modal Mensagem de E-mail */}
            <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
              <DialogContent aria-describedby={undefined} className="sm:max-w-[550px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                <DialogHeader>
                  <DialogTitle className="text-blue-500 text-lg font-bold tracking-wide">
                    MENSAGEM DE E-MAIL
                  </DialogTitle>
                </DialogHeader>
                
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700/50 relative max-h-[400px] overflow-y-auto">
                  <pre className="text-[13px] text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-sans">
                    {emailMessage}
                  </pre>
                </div>
                
                <div className="mt-2 flex justify-end">
                  <Button 
                    onClick={handleCopyEmailMessage}
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
                    const vinculo = vinculosTomador[seg.id]
                    // Condições do tomador têm precedência sobre as da seguradora.
                    const taxa = vinculo?.apto ? vinculo.taxa : seg.taxa_comissao
                    const premioMinimo = vinculo?.apto ? vinculo.premio_minimo_efetivo : seg.premio_minimo
                    // Sem taxa cadastrada para este tomador, a seguradora não pode ser escolhida.
                    const apto = vinculo?.apto ?? false
                    // isAprovado check removed, cotacoes are always approved
                    const selecionavel = apto
                    const escolhida = seguradoraEscolhidaId === seg.id
                    return (
                    <div
                      key={seg.id}
                      onClick={() => selecionavel && handleEscolherSeguradora(seg.id)}
                      title={!apto ? "Tomador sem taxa cadastrada para esta seguradora." : undefined}
                      className={cn(
                        "relative bg-zinc-100 dark:bg-zinc-800/50 rounded-xl h-40 flex flex-col items-center justify-between p-4 border transition-all",
                        selecionavel ? "cursor-pointer hover:border-brand-red/50 hover:bg-red-50/50 dark:hover:bg-red-500/10" : "opacity-70 border-zinc-200 dark:border-zinc-700/50",
                        !apto ? "cursor-not-allowed" : "",
                        escolhida ? "ring-2 ring-brand-red border-brand-red bg-red-50/50 dark:bg-red-500/10 shadow-sm" : ""
                      )}
                    >
                      <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide text-center leading-tight">{seg.nome}</span>

                      <div className="flex-1 flex items-center justify-center py-1">
                        {seg.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={getMediaUrl(seg.logo)} alt={`Logo ${seg.nome}`} className="max-w-full max-h-14 object-contain" />
                        ) : (
                          <div className="text-2xl font-black text-brand-red/80 dark:text-[#cf7458]">{seg.nome.charAt(0)}</div>
                        )}
                      </div>

                      {(() => {
                        const is = Number(selectedCotacao?.importancia_segurada) || 0;
                        const prazo = selectedCotacao?.prazo_dias || 0;
                        const taxaNum = Number(taxa) || 0;
                        const min = Number(premioMinimo) || 0;
                        const calc = (is / 365) * (taxaNum / 100) * prazo;
                        const premioFinal = Math.max(calc, min);

                        return (
                          <div className="w-full flex flex-col gap-1 text-[10.5px] text-zinc-600 dark:text-zinc-400 border-t border-zinc-200/70 dark:border-zinc-700/50 pt-2">
                            <div className="flex items-center justify-between">
                              <span className="uppercase font-medium opacity-70">Prêmio</span>
                              <span className="font-bold text-brand-red dark:text-[#cf7458]">{formatBRL(premioFinal)}</span>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                    )
                  })}
                </div>
              )} 
               
            </div>
             
            {selectedCotacao && (
              <div className="md:col-span-12 mt-4 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/40 rounded-xl p-6 shadow-sm">
                <h3 className="text-brand-red uppercase font-normal text-lg mb-6 dark:text-[#cf7458]">Boleto Seguradora</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-12">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Quantidade dias:</span>
                    <Input
                      type="number"
                      value={diasVencimento}
                      onChange={(e) => setDiasVencimento(Number(e.target.value) || 0)}
                      className="w-24 h-9 text-right text-sm border-zinc-300 dark:border-zinc-700"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Vencimento:</span>
                    <span className="text-sm text-zinc-400">
                      {isoToBR(addDays(new Date().toISOString().slice(0, 10), diasVencimento))}
                    </span>
                  </div>
                </div>
              </div>
            )}
                     
            
            {/* Action Buttons Footer */}
            <div className="md:col-span-12 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 mt-8 pt-6 border-t border-zinc-200/50 dark:border-zinc-800/50 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => selectedCotacao && handleDelete(selectedCotacao)}
                className="flex-1 sm:flex-none bg-red-50 dark:bg-red-500/10 text-red-600 border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/30 font-semibold h-10.5 sm:px-6 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 sm:mr-auto"
              >
                <Trash2 className="size-4" />
                Excluir
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => selectedCotacao && openEdit(selectedCotacao)}
                className="flex-1 sm:flex-none border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-semibold h-10.5 sm:px-6 rounded-xl flex items-center justify-center gap-2"
              >
                <Pencil className="size-4 text-zinc-500 dark:text-zinc-400" />
                Editar
              </Button>
              <button
                onClick={() => {
                  if (!seguradoraEscolhidaId) {
                    toast.error("Escolha uma seguradora.")
                    return
                  }
                  if (selectedCotacao && typeof window !== "undefined") {
                    localStorage.setItem(`seguradora_cotacao_${selectedCotacao.id}`, String(seguradoraEscolhidaId))
                    localStorage.setItem(`enviado_proposta_${selectedCotacao.id}`, "true")
                  }
                  router.push(`/dashboard/propostas?id=${selectedCotacao?.id}&abrirModal=true`)
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10.5 sm:px-8 rounded-xl text-[12px] font-bold uppercase tracking-wide text-white bg-green-600 hover:bg-green-700 shadow-sm shadow-green-600/20 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="size-4" />
                Enviar para Emissão
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
