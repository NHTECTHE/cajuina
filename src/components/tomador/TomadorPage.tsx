"use client"

import * as React from "react"
import { TableSkeleton } from "@/components/ui/skeleton"
import { useState, useMemo, useEffect } from "react"
import {
  Search,
  Plus,
  Trash2,
  ArrowLeft,
  PlusCircle,
  Users,
  MapPin,
  FileText,
  UserCheck,
  Building,
  Percent,
  Paperclip,
  Download,
  Upload,
  Mail,
  KeyRound,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  DialogDescription,
} from "@/components/ui/dialog"
import { NativeSelect } from "@/components/ui/native-select"
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox"
import { toast } from "sonner"
import { lookupCnpj, tomadoresApi, apolicesApi, type TomadorResponse, type ApoliceResponse, type TomadorPremioAcumuladoResponse, type TomadorAtividade } from "@/services/api"
import { listSeguradorasAction, type Seguradora } from "@/app/actions/seguradoras"
import {
  listTomadorSeguradorasAction,
  saveTomadorSeguradorasAction,
} from "@/app/actions/tomador-seguradoras"
import { listProdutoresAction, type Produtor } from "@/app/actions/produtores"
import { listCorretoresAction, type Corretor } from "@/app/actions/corretores"
import {
  listTomadorArquivosAction,
  uploadTomadorArquivoAction,
  deleteTomadorArquivoAction,
  type TomadorArquivo,
} from "@/app/actions/tomador-arquivos"

// Masks
const maskCNPJ = (v: string) => {
  v = v.replace(/\D/g, "").slice(0, 14);
  v = v.replace(/^(\d{2})(\d)/, "$1.$2");
  v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
  v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
  v = v.replace(/(\d{4})(\d)/, "$1-$2");
  return v;
};

const maskCPF = (v: string) => {
  v = v.replace(/\D/g, "").slice(0, 11);
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
  v = v.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, "$1.$2.$3-$4");
  return v;
};

const maskTelefone = (v: string) => {
  v = v.replace(/\D/g, "").slice(0, 11);
  v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
  v = v.replace(/(\d)(\d{4})$/, "$1-$2");
  return v;
};

interface ContactRow {
  nome: string;
  telefone: string;
  email: string;
}

interface SocioRow {
  nome: string;
  cpf: string;
  nascimento: string;
  qualificacao: string;
}

export default function TomadorPage() {
  const [tomadores, setTomadores] = useState<TomadorResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [view, setView] = useState<"list" | "form">("list")
  const [currentTab, setCurrentTab] = useState<"dados" | "endereco" | "contatos" | "socios" | "taxas" | "arquivos" | "apolices" | "info_adicionais">("dados")

  // Apolices state
  const [selectedApoliceType, setSelectedApoliceType] = useState<"garantia" | "engenharia" | null>(null)
  const [apolices, setApolices] = useState<ApoliceResponse[]>([])
  const [apolicesLoadedFor, setApolicesLoadedFor] = useState<number | null>(null)

  // Premio Acumulado state
  const [premioAcumulado, setPremioAcumulado] = useState<TomadorPremioAcumuladoResponse | null>(null)
  const [premioLoadedFor, setPremioLoadedFor] = useState<number | null>(null)

  // Movimentacao state
  const [atividades, setAtividades] = useState<TomadorAtividade[]>([])
  const [atividadesCount, setAtividadesCount] = useState(0)
  const [atividadesPage, setAtividadesPage] = useState(1)
  const [atividadesLoadedFor, setAtividadesLoadedFor] = useState<{ id: number; page: number } | null>(null)

  // Taxas tab — condições comerciais do tomador em cada seguradora
  const [seguradoras, setSeguradoras] = useState<Seguradora[]>([])
  const [seguradorasLoaded, setSeguradorasLoaded] = useState(false)
  const loadingSeguradoras = currentTab === "dados" && !seguradorasLoaded

  // Vínculos já salvos (tomador × seguradora) e o rascunho editável da tela.
  // A chave do rascunho é o id da seguradora; "" significa "herda da seguradora".
  const [taxasDraft, setTaxasDraft] = useState<Record<number, {
    taxa: string
    premio_minimo: string
    status: string
    dias_vencimento: string
    taxa_origem?: string
    taxa_junto_modalidade_id?: string
    taxa_junto_modalidade_descricao?: string
    taxa_data_atualizacao?: string | null
    taxa_zero_aviso?: boolean
  }>>({})
  const [taxasLoadedFor, setTaxasLoadedFor] = useState<number | null>(null)
  const [savingTaxas, setSavingTaxas] = useState(false)

  // Seguradoras que aceitam condições: ativas e já persistidas (com id).
  const seguradorasTaxaveis = seguradoras.filter(
    (s): s is Seguradora & { id: number } => s.ativo !== false && s.id != null,
  )

  // Produtores / Corretores — cadastros used to populate the form comboboxes
  const [produtores, setProdutores] = useState<Produtor[]>([])
  const [corretores, setCorretores] = useState<Corretor[]>([])
  const [cadastrosLoaded, setCadastrosLoaded] = useState(false)

  // Arquivos tab — files attached to the tomador being edited
  const [arquivos, setArquivos] = useState<TomadorArquivo[]>([])
  const [arquivosLoadedFor, setArquivosLoadedFor] = useState<number | null>(null)
  const [uploadingArquivo, setUploadingArquivo] = useState(false)
  const loadingArquivos = currentTab === "arquivos" && arquivosLoadedFor === null

  // Editing state — stores the backend id of the record being edited
  const [editingId, setEditingId] = useState<number | null>(null)

  // Derivado do marcador de carga, no mesmo padrão de `loadingArquivos` acima.
  // Espelha a guarda do effect que busca as atividades, o que evita chamar
  // setState dentro dele (react-hooks/set-state-in-effect).
  const loadingAtividades =
    currentTab === "info_adicionais" &&
    editingId !== null &&
    (atividadesLoadedFor?.id !== editingId || atividadesLoadedFor?.page !== atividadesPage)

  // Deletion state
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTipo, setSelectedTipo] = useState("Todos")
  const [selectedUf, setSelectedUf] = useState("Todos")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)

  // Form State
  const initialFormState = {
    cnpj: "",
    nome: "",
    produtor: "",
    corretora: "",
    cidade: "",
    uf: "PI",
    contato: "",
    celular: "",
    nomeFantasia: "",
    email: "",
    habilitarEmail: false,
    telefone: "",
    observacoes: "",
    ativarCotacao: false,
    endereco: "",
    bairro: "",
    numero: "",
    complemento: "",
    cep: "",
    contatosAdicionais: [] as ContactRow[],
    socios: [] as SocioRow[]
  }

  const [formData, setFormData] = useState(initialFormState)
  const [seguradoraInicial, setSeguradoraInicial] = useState<number | null>(null)
  const [seguradoraInicialLabel, setSeguradoraInicialLabel] = useState<string | null>(null)
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false)
  const [juntoModalOpen, setJuntoModalOpen] = useState(false)
  const [juntoModalContext, setJuntoModalContext] = useState<{ tomadorId: number | null; seguradoraId: number | null } | null>(null)
  const [juntoProcessing, setJuntoProcessing] = useState(false)
  const [juntoCheckingIds, setJuntoCheckingIds] = useState<Record<number, boolean>>({})

  // Dynamic Contact Form Row Input Temp States
  const [newContact, setNewContact] = useState<ContactRow>({ nome: "", telefone: "", email: "" })
  const [newSocio, setNewSocio] = useState<SocioRow>({ nome: "", cpf: "", nascimento: "", qualificacao: "" })

  // Load tomadores from API on mount
  React.useEffect(() => {
    tomadoresApi.list()
      .then(setTomadores)
      .catch(() => toast.error("Erro ao carregar tomadores."))
      .finally(() => setLoading(false))
  }, [])

  const ufs = useMemo(() => {
    const unique = new Set(tomadores.map(t => t.uf).filter(Boolean))
    return ["Todos", ...Array.from(unique)]
  }, [tomadores])

  // Filtered list (client-side, complements server-side search)
  const filteredTomadores = useMemo(() => {
    return tomadores.filter(t => {
      const matchesSearch =
        t.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.cnpj.includes(searchQuery) ||
        (t.contato && t.contato.toLowerCase().includes(searchQuery.toLowerCase()))

      const isCnpj = t.cnpj.includes("/")
      const matchesTipo = selectedTipo === "Todos" || (selectedTipo === "CNPJ" ? isCnpj : !isCnpj)
      const matchesUf = selectedUf === "Todos" || t.uf === selectedUf

      return matchesSearch && matchesTipo && matchesUf
    })
  }, [tomadores, searchQuery, selectedTipo, selectedUf])

  // Paginated list
  const paginatedTomadores = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredTomadores.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredTomadores, currentPage, itemsPerPage])

  const totalPages = Math.max(1, Math.ceil(filteredTomadores.length / itemsPerPage))

  // Combobox options — names of registered produtores/corretores, keeping the
  // current form value in the list so an existing/default selection stays visible.
  const produtorItems = useMemo(() => {
    const names = produtores.map(p => p.nome).filter(Boolean)
    if (formData.produtor && !names.includes(formData.produtor)) names.unshift(formData.produtor)
    return names
  }, [produtores, formData.produtor])

  const corretorItems = useMemo(() => {
    const names = corretores.map(c => c.nome).filter(Boolean)
    if (formData.corretora && !names.includes(formData.corretora)) names.unshift(formData.corretora)
    return names
  }, [corretores, formData.corretora])

  // Clean filters
  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedTipo("Todos")
    setSelectedUf("Todos")
    setCurrentPage(1)
    toast.info("Filtros limpos com sucesso")
  }

  // Edit action
  const handleEditClick = (id: number) => {
    const tomador = tomadores.find(t => t.id === id)
    if (!tomador) return
    setFormData({
      cnpj: tomador.cnpj,
      nome: tomador.nome,
      produtor: tomador.produtor || "",
      corretora: tomador.corretora || "",
      cidade: tomador.cidade || "",
      uf: tomador.uf || "",
      contato: tomador.contato || "",
      celular: tomador.celular || "",
      nomeFantasia: tomador.nome_fantasia || "",
      email: tomador.email || "",
      habilitarEmail: tomador.habilitar_email || false,
      telefone: tomador.telefone || "",
      observacoes: tomador.observacoes || "",
      ativarCotacao: tomador.ativar_cotacao || false,
      endereco: tomador.endereco || "",
      bairro: tomador.bairro || "",
      numero: tomador.numero || "",
      complemento: tomador.complemento || "",
      cep: tomador.cep || "",
      contatosAdicionais: tomador.contatos_adicionais.map(c => ({
        nome: c.nome,
        telefone: c.telefone,
        email: c.email,
      })),
      socios: tomador.socios.map(s => ({
        nome: s.nome,
        cpf: s.cpf,
        nascimento: s.nascimento,
        qualificacao: s.qualificacao,
      })),
    })
    setEditingId(tomador.id)
    setView("form")
    setCurrentTab("dados")
  }

  // Delete action
  const handleDeleteClick = (id: number) => {
    setDeleteTarget(id)
  }

  const confirmDelete = () => {
    if (deleteTarget === null) return
    tomadoresApi.remove(deleteTarget)
      .then(() => {
        setTomadores(prev => prev.filter(t => t.id !== deleteTarget))
        toast.success("Tomador excluído com sucesso!")
        if (editingId === deleteTarget) {
          setView("list")
          setEditingId(null)
        }
      })
      .catch((err: Error) => toast.error(err.message || "Erro ao excluir tomador."))
      .finally(() => setDeleteTarget(null))
  }

  // O CNPJ e unico no backend: acha o cadastro existente antes de deixar o usuario prosseguir.
  const somenteDigitos = (valor: string) => valor.replace(/\D/g, "")

  const buscarTomadorPorCnpj = (cnpj: string) => {
    const digits = somenteDigitos(cnpj)
    if (digits.length !== 14) return undefined
    return tomadores.find(t => somenteDigitos(t.cnpj) === digits)
  }

  // Handle Form Submit (from main view)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.cnpj) {
      toast.error("CNPJ é obrigatório.")
      return
    }

    if (editingId === null) {
      const existente = buscarTomadorPorCnpj(formData.cnpj)
      if (existente) {
        setCnpjDuplicado(existente)
        toast.error("Já existe um tomador cadastrado com esse CNPJ.")
        return
      }
      // No modo de criação, o form principal apenas avança para o modal
      setIsFinalizeModalOpen(true)
    } else {
      // No modo de edição, salva direto
      handleSave()
    }
  }

  // Handle Save
  const handleSave = async () => {
    if (editingId === null && !seguradoraInicial) {
      toast.error("Seguradora é obrigatória no cadastro inicial.")
      return
    }

    if (!formData.produtor) {
      toast.error("Produtor é obrigatório.")
      return
    }

    const payload = {
      cnpj: formData.cnpj,
      nome: formData.nome.toUpperCase(),
      nome_fantasia: formData.nomeFantasia.toUpperCase(),
      produtor: formData.produtor,
      corretora: formData.corretora,
      cidade: formData.cidade.toUpperCase(),
      uf: formData.uf.toUpperCase(),
      contato: formData.contato.toUpperCase(),
      celular: formData.celular,
      email: formData.email,
      habilitar_email: formData.habilitarEmail,
      telefone: formData.telefone,
      observacoes: formData.observacoes,
      ativar_cotacao: formData.ativarCotacao,
      endereco: formData.endereco.toUpperCase(),
      bairro: formData.bairro.toUpperCase(),
      numero: formData.numero,
      complemento: formData.complemento.toUpperCase(),
      cep: formData.cep,
      contatos_adicionais: formData.contatosAdicionais,
      socios: formData.socios,
    }

    setSaving(true)
    try {
      if (editingId !== null) {
        const updated = await tomadoresApi.update(editingId, payload)
        setTomadores(prev => prev.map(t => t.id === editingId ? updated : t))
        toast.success("Cadastro atualizado com sucesso!")
      } else {
        const created = await tomadoresApi.create(payload)
        if (seguradoraInicial) {
          await saveTomadorSeguradorasAction(created.id, [{
            seguradora: seguradoraInicial,
            taxa: "0",
            status: "sem_cadastro",
            premio_minimo: "",
            dias_vencimento: null
          }])

          // Verifica automaticamente na Junto se a seguradora selecionada for Junto
          const segInicialObj = seguradoras.find(s => s.id === seguradoraInicial)
          const isJuntoInicial = segInicialObj?.integracao === "junto" || segInicialObj?.nome?.toLowerCase().includes("junto")

          if (isJuntoInicial) {
            try {
              // Valida CNPJ antes de chamar a Junto
              const cnpjDigits = somenteDigitos(created.cnpj || "")
              if (!cnpjDigits || cnpjDigits.length !== 14) {
                toast.dismiss()
                toast.error("CNPJ inválido. Não é possível verificar na Junto.")
              } else {
                const checkingToast = toast.loading("Verificando na Junto...")
                const res = await fetch(`/api/tomadores/${created.id}/seguradoras/${seguradoraInicial}/junto/verificar/`, { method: "POST" })
                let payload = null
                try { payload = await res.json() } catch { payload = null }
                toast.dismiss(checkingToast)
                if (!res.ok) {
                  toastErroJunto(res, payload, 'Não foi possível verificar o cadastro na Junto.')
                } else if (payload?.data?.status === "cadastro_ok") {
                  toast.success("Tomador encontrado e cadastrado na Junto.")
                  setTaxasLoadedFor(null)
                } else if (payload?.data?.status === "em_analise") {
                  toast.info("Tomador já cadastrado na Junto, em análise. Verifique de novo em alguns minutos.")
                  setTaxasLoadedFor(null)
                } else {
                  setJuntoModalContext({ tomadorId: created.id, seguradoraId: seguradoraInicial })
                  setJuntoModalOpen(true)
                }
              }
            } catch {
              toast.error("Erro ao verificar cadastro na Junto.")
            }
          }
        }
        setTomadores(prev => [created, ...prev])
        toast.success("Tomador cadastrado com sucesso!")
      }
      setView("list")
      setFormData(initialFormState)
      setSeguradoraInicial(null)
      setSeguradoraInicialLabel(null)
      setEditingId(null)
      setCadastroManual(false)
      setCnpjNaoEncontrado(false)
      setCnpjDuplicado(null)
      setIsFinalizeModalOpen(false)
      setAtividadesLoadedFor(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao salvar tomador."
      if (message.toLowerCase().includes("cnpj") && message.toLowerCase().includes("já existe")) {
        toast.error("Já existe um tomador cadastrado com esse CNPJ. Edite o cadastro existente na lista.")
      } else {
        toast.error(message)
      }
    } finally {
      setSaving(false)
    }
  }

  // Dynamic Addition Helpers
  const addContact = () => {
    if (!newContact.nome) {
      toast.error("Preencha o nome do contato.")
      return
    }
    setFormData(prev => ({
      ...prev,
      contatosAdicionais: [...prev.contatosAdicionais, { ...newContact }]
    }))
    setNewContact({ nome: "", telefone: "", email: "" })
    toast.success("Contato adicionado à lista temporária.")
  }

  const removeContact = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      contatosAdicionais: prev.contatosAdicionais.filter((_, i) => i !== idx)
    }))
  }

  const addSocio = () => {
    if (!newSocio.nome) {
      toast.error("Preencha o nome do sócio.")
      return
    }
    setFormData(prev => ({
      ...prev,
      socios: [...prev.socios, { ...newSocio }]
    }))
    setNewSocio({ nome: "", cpf: "", nascimento: "", qualificacao: "" })
    toast.success("Sócio adicionado à lista temporária.")
  }

  const removeSocio = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      socios: prev.socios.filter((_, i) => i !== idx)
    }))
  }

  useEffect(() => {
    if (currentTab !== "dados" || seguradorasLoaded) return
    let cancelled = false
    listSeguradorasAction().then((result) => {
      if (cancelled) return
      if (result.data) setSeguradoras(result.data)
      else if (result.error) toast.error(result.error)
      setSeguradorasLoaded(true)
    })
    return () => { cancelled = true }
  }, [currentTab, seguradorasLoaded])

  // O backend agora distingue "não deu para saber" (502) de "a Junto recusou"
  // (400/404) e de "já tem uma solicitação em andamento" (409). Antes ele
  // devolvia 200 com dado inventado, então um catch genérico bastava.
  function toastErroJunto(res: Response, json: unknown, fallback: string) {
    const corpo = json as { data?: { error?: string }; error?: string; detail?: string } | null
    const msg = corpo?.data?.error || corpo?.error || corpo?.detail
    if (res.status === 409) toast.warning(msg || "Já existe uma solicitação em andamento.")
    else if (res.status === 502) toast.error(msg || "A seguradora não respondeu. Tente novamente.")
    else toast.error(msg || fallback)
  }

  function formatTaxaDisplay(val: string | number | null | undefined): string {
    if (val === null || val === undefined || val === "") return ""
    const str = String(val).replace(",", ".")
    if (isNaN(Number(str))) return String(val)
    const parts = str.split(".")
    if (parts.length === 1) return parts[0]
    const dec = parts[1].replace(/0+$/, "")
    return dec.length > 0 ? `${parts[0]},${dec}` : parts[0]
  }

  // Condições já salvas deste tomador. Recarrega ao trocar de tomador; em
  // cadastro novo (editingId null) não há vínculo para buscar.
  useEffect(() => {
    if (currentTab !== "dados" || editingId === null || taxasLoadedFor === editingId) return
    let cancelled = false
    listTomadorSeguradorasAction(editingId).then((result) => {
      if (cancelled) return
      if (result.data) {
        const draft: Record<number, {
          taxa: string
          premio_minimo: string
          status: string
          dias_vencimento: string
          taxa_origem?: string
          taxa_junto_modalidade_id?: string
          taxa_junto_modalidade_descricao?: string
          taxa_data_atualizacao?: string | null
          taxa_zero_aviso?: boolean
        }> = {}
        for (const v of result.data) {
          draft[v.seguradora] = {
            taxa: formatTaxaDisplay(v.taxa ?? ""),
            premio_minimo: v.premio_minimo ?? "",
            dias_vencimento: v.dias_vencimento !== null ? String(v.dias_vencimento) : "",
            status: v.status || "sem_cadastro",
            taxa_origem: v.taxa_origem || "",
            taxa_junto_modalidade_id: v.taxa_junto_modalidade_id || "",
            taxa_junto_modalidade_descricao: v.taxa_junto_modalidade_descricao || "",
            taxa_data_atualizacao: v.taxa_data_atualizacao || null,
            taxa_zero_aviso: false,
          }
        }
        setTaxasDraft(draft)
      } else if (result.error) {
        toast.error(result.error)
      }
      setTaxasLoadedFor(editingId)
    })
    return () => { cancelled = true }
  }, [currentTab, editingId, taxasLoadedFor])

  function taxaInputToDecimal(value: string): string | null {
    const trimmed = value.trim()
    if (!trimmed) return null
    const cleaned = trimmed.includes(",")
      ? trimmed.replace(/\./g, "").replace(",", ".")
      : trimmed
    const num = Number(cleaned)
    return Number.isFinite(num) ? cleaned : null
  }

  async function handleSaveTaxas() {
    if (editingId === null) return

    const itens = seguradorasTaxaveis.map((s) => {
      const draft = taxasDraft[s.id] ?? { taxa: "", premio_minimo: "", status: "sem_cadastro", dias_vencimento: "" }
      return {
        seguradora: s.id,
        status: draft.status,
        taxa: taxaInputToDecimal(draft.taxa) ?? "0.00",
        taxa_origem: draft.taxa_origem || "",
        taxa_junto_modalidade_id: draft.taxa_junto_modalidade_id || "",
        taxa_junto_modalidade_descricao: draft.taxa_junto_modalidade_descricao || "",
        taxa_data_atualizacao: draft.taxa_data_atualizacao || null,
        premio_minimo: taxaInputToDecimal(draft.premio_minimo),
        dias_vencimento: draft.dias_vencimento ? parseInt(draft.dias_vencimento.replace(/\D/g, ""), 10) : null,
      }
    })

    setSavingTaxas(true)
    const result = await saveTomadorSeguradorasAction(editingId, itens)
    setSavingTaxas(false)

    if (result.error) {
      toast.error(result.error)
      return
    }
    if (result.data) {
      const draft: Record<number, {
        taxa: string
        premio_minimo: string
        status: string
        dias_vencimento: string
        taxa_origem?: string
        taxa_junto_modalidade_id?: string
        taxa_junto_modalidade_descricao?: string
        taxa_data_atualizacao?: string | null
        taxa_zero_aviso?: boolean
      }> = {}
      for (const v of result.data) {
        draft[v.seguradora] = {
          taxa: formatTaxaDisplay(v.taxa ?? ""),
          premio_minimo: v.premio_minimo ?? "",
          dias_vencimento: v.dias_vencimento !== null ? String(v.dias_vencimento) : "",
          status: v.status || "sem_cadastro",
          taxa_origem: v.taxa_origem || "",
          taxa_junto_modalidade_id: v.taxa_junto_modalidade_id || "",
          taxa_junto_modalidade_descricao: v.taxa_junto_modalidade_descricao || "",
          taxa_data_atualizacao: v.taxa_data_atualizacao || null,
          taxa_zero_aviso: false,
        }
      }
      setTaxasDraft(draft)
      toast.success("Taxas salvas com sucesso.")
    }
  }

  useEffect(() => {
    if (view !== "form" || cadastrosLoaded) return
    let cancelled = false
    Promise.all([listProdutoresAction(), listCorretoresAction()]).then(([prod, corr]) => {
      if (cancelled) return
      if (prod.data) setProdutores(prod.data)
      else if (prod.error) toast.error(prod.error)
      if (corr.data) setCorretores(corr.data)
      else if (corr.error) toast.error(corr.error)
      setCadastrosLoaded(true)
    })
    return () => { cancelled = true }
  }, [view, cadastrosLoaded])

  useEffect(() => {
    if (currentTab !== "arquivos" || editingId === null || arquivosLoadedFor === editingId) return
    let cancelled = false
    listTomadorArquivosAction(editingId).then((result) => {
      if (cancelled) return
      if (result.data) setArquivos(result.data)
      else if (result.error) toast.error(result.error)
      setArquivosLoadedFor(editingId)
    })
    return () => { cancelled = true }
  }, [currentTab, editingId, arquivosLoadedFor])

  useEffect(() => {
    if (currentTab !== "apolices" || editingId === null || apolicesLoadedFor === editingId) return
    let cancelled = false
    apolicesApi.list({ tomador: String(editingId) }).then((result) => {
      if (cancelled) return
      setApolices(result)
      setApolicesLoadedFor(editingId)
    }).catch(err => {
      if (cancelled) return
      toast.error("Erro ao carregar apólices: " + (err.message || err))
    })
    return () => { cancelled = true }
  }, [currentTab, editingId, apolicesLoadedFor])

  useEffect(() => {
    if (currentTab !== "info_adicionais" || editingId === null || premioLoadedFor === editingId) return
    let cancelled = false
    tomadoresApi.getPremioAcumulado(editingId).then((result) => {
      if (cancelled) return
      setPremioAcumulado(result)
      setPremioLoadedFor(editingId)
    }).catch(err => {
      if (cancelled) return
      toast.error("Erro ao carregar prêmio acumulado: " + (err.message || err))
    })
    return () => { cancelled = true }
  }, [currentTab, editingId, premioLoadedFor])

  useEffect(() => {
    if (currentTab !== "info_adicionais" || editingId === null) return
    if (atividadesLoadedFor?.id === editingId && atividadesLoadedFor?.page === atividadesPage) return
    let cancelled = false
    tomadoresApi.getAtividades(editingId, atividadesPage).then((result) => {
      if (cancelled) return
      setAtividades(result.results)
      setAtividadesCount(result.count)
      setAtividadesLoadedFor({ id: editingId, page: atividadesPage })
    }).catch(err => {
      if (cancelled) return
      toast.error("Erro ao carregar movimentação: " + (err.message || err))
      // Marca a tentativa mesmo em erro: sem isso `loadingAtividades` (derivado)
      // ficaria preso em "Carregando..." depois de uma falha.
      setAtividadesLoadedFor({ id: editingId, page: atividadesPage })
    })
    return () => { cancelled = true }
  }, [currentTab, editingId, atividadesPage, atividadesLoadedFor])

  const filteredApolices = useMemo(() => {
    if (!selectedApoliceType) return []
    return apolices.filter(a => {
      const isEngenharia = a.modalidade_nome?.toLowerCase().includes("engenharia")
      if (selectedApoliceType === "engenharia") return isEngenharia
      if (selectedApoliceType === "garantia") return !isEngenharia
      return true
    })
  }, [apolices, selectedApoliceType])

  async function handleUploadArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file || editingId === null) return
    setUploadingArquivo(true)
    const result = await uploadTomadorArquivoAction(editingId, file)
    setUploadingArquivo(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    if (result.data) {
      setArquivos(prev => [result.data!, ...prev])
      toast.success("Arquivo enviado com sucesso.")
    }
  }

  async function handleDeleteArquivo(arquivo: TomadorArquivo) {
    if (editingId === null) return
    const result = await deleteTomadorArquivoAction(editingId, arquivo.id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    setArquivos(prev => prev.filter(a => a.id !== arquivo.id))
    toast.success("Arquivo removido.")
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const [cnpjLoading, setCnpjLoading] = React.useState(false)
  // Busca automatica falhou: libera o cadastro manual em vez de travar o usuario.
  const [cnpjNaoEncontrado, setCnpjNaoEncontrado] = React.useState(false)
  const [cnpjDuplicado, setCnpjDuplicado] = React.useState<TomadorResponse | null>(null)
  const [cadastroManual, setCadastroManual] = React.useState(false)

  const fetchCompanyByCnpj = async (rawValue: string) => {
    const digits = rawValue.replace(/\D/g, '').slice(0, 14);
    if (digits.length !== 14) return;

    const jaCadastrado = buscarTomadorPorCnpj(digits);
    if (jaCadastrado) {
      setCnpjDuplicado(jaCadastrado);
      setCnpjNaoEncontrado(false);
      return;
    }
    setCnpjDuplicado(null);

    setCnpjLoading(true);
    setCnpjNaoEncontrado(false);
    try {
      const data = await lookupCnpj(digits);
      setFormData(prev => ({
        ...prev,
        nome: data.razao_social || prev.nome,
        nomeFantasia: data.nome_fantasia || prev.nomeFantasia,
        email: data.email ? data.email.toLowerCase().trim() : prev.email,
        telefone: data.telefone ? maskTelefone(data.telefone) : prev.telefone,
        celular: data.telefone ? maskTelefone(data.telefone) : prev.celular,
        cep: data.cep || prev.cep,
        endereco: data.logradouro || prev.endereco,
        numero: data.numero || prev.numero,
        complemento: data.complemento || prev.complemento,
        bairro: data.bairro || prev.bairro,
        cidade: data.municipio || prev.cidade,
        uf: data.uf || prev.uf,
        socios: prev.socios,
      }));
      toast.success("Dados do CNPJ preenchidos automaticamente.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao buscar CNPJ";
      setCnpjNaoEncontrado(true);
      toast.error(msg);
    } finally {
      setCnpjLoading(false);
    }
  };



  return (
    <div className="flex flex-1 flex-col gap-6">

      {/* ──── CONTAINER HEADER ──── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-inherit">
            {view === "list" ? "Lista de Tomadores" : editingId !== null ? (formData.nome || "Editar Tomador") : "Cadastrar Tomador"}
          </h1>
          <p className="text-xs opacity-60 mt-0.5">
            {view === "list"
              ? "Gerencie a base de tomadores de seguros da corretora."
              : "Preencha as informações detalhadas do tomador."}
          </p>
        </div>

        {view === "list" ? (
          <Button
            onClick={() => {
              setFormData(initialFormState)
              setEditingId(null)
              setCadastroManual(false)
              setCnpjNaoEncontrado(false)
              setCnpjDuplicado(null)
              setView("form")
              setCurrentTab("dados")
            }}
            className="bg-brand-red text-white hover:bg-brand-red/90 font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-brand-red/10 transition-all duration-200 active:scale-[0.98]"
          >
            <Plus className="size-4.5" />
            <span>Novo Tomador</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => {
              setView("list")
              setEditingId(null)
            }}
            className="border-zinc-200 dark:border-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl flex items-center gap-2 cursor-pointer transition-all duration-200"
          >
            <ArrowLeft className="size-4" />
            <span>Voltar para Lista</span>
          </Button>
        )}
      </div>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-sm rounded-2xl p-6 border-zinc-200 dark:border-zinc-800">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-2">
              <Trash2 className="size-5 text-red-500" />
            </div>
            <AlertDialogTitle className="text-center font-bold text-zinc-900 dark:text-zinc-50">Excluir tomador?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-zinc-500 mt-1">
              Deseja realmente excluir este tomador? Esta ação não pode ser desfeita.
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

      <Dialog open={juntoModalOpen} onOpenChange={(open) => { if (!open) { setJuntoModalOpen(false); setJuntoModalContext(null); } }}>
        <DialogContent className="max-w-md rounded-2xl p-6 border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-center font-bold">Cadastrar na Junto Seguros?</DialogTitle>
            <DialogDescription className="text-center text-sm text-zinc-500 mt-1">
              Este tomador não tem cadastro na Junto Seguros. Deseja cadastrar agora?
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex gap-3 justify-center">
            <Button
              disabled={juntoProcessing}
              onClick={async () => {
                if (!juntoModalContext) return
                setJuntoProcessing(true)
                try {
                  const res = await fetch(`/api/tomadores/${juntoModalContext.tomadorId}/seguradoras/${juntoModalContext.seguradoraId}/junto/solicitar/`, { method: 'POST' })
                  const json = await res.json().catch(() => null)
                  setJuntoProcessing(false)
                  setJuntoModalOpen(false)
                  setJuntoModalContext(null)
                  if (res.ok) {
                    // O endpoint devolve 202 na hora: a Junto processa depois e
                    // quem confirma é o ⟳ no canto do card.
                    //
                    // Sem recarregar o rascunho: a solicitação não muda taxa nem
                    // status, e o reload descartaria uma taxa recém-consultada que
                    // o usuário ainda não salvou.
                    toast.success('Solicitação enviada. A Junto pode levar de 10 segundos a 1 minuto — use o ⟳ no canto do card em instantes.')
                  } else {
                    toastErroJunto(res, json, 'Não foi possível solicitar o cadastro na Junto.')
                  }
                } catch {
                  setJuntoProcessing(false)
                  setJuntoModalOpen(false)
                  setJuntoModalContext(null)
                  toast.error('Erro ao solicitar o cadastro na Junto.')
                }
              }}
              className="rounded-xl bg-brand-red text-white px-4 py-2"
            >
              {juntoProcessing ? 'Enviando...' : 'Cadastrar na Junto'}
            </Button>

            <Button
              variant="outline"
              onClick={() => { setJuntoModalOpen(false); setJuntoModalContext(null) }}
              className="rounded-xl px-4 py-2"
            >
              Agora não
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ──── LIST VIEW ──── */}
      {view === "list" && (
        <div className="flex flex-col gap-4">

          {/* Filters Card */}
          <div className="custom-filters-card border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-3.5 shadow-sm">
            {/* Search Input */}
            <div className="w-full max-w-xs">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 opacity-40" />
                <Input
                  id="search"
                  placeholder="Buscar tomador..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="custom-filter-input pl-9 h-8.5 w-full max-w-xs rounded-lg border border-zinc-200 dark:border-zinc-800 focus-visible:ring-brand-red/20 focus-visible:border-brand-red text-xs transition-all duration-200"
                />
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">Tipo</span>
                <NativeSelect
                  value={selectedTipo}
                  onChange={(e) => {
                    setSelectedTipo(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="custom-filter-select w-[110px] h-8 [&>select]:h-8 [&>select]:py-0.5 [&>select]:rounded-lg [&>select]:text-xs [&>select]:border-zinc-200 dark:[&>select]:border-zinc-800"
                >
                  <option value="Todos" className="custom-filter-input">Todos</option>
                  <option value="CNPJ" className="custom-filter-input">CNPJ</option>
                  <option value="CPF" className="custom-filter-input">CPF</option>
                </NativeSelect>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">Estado</span>
                <NativeSelect
                  value={selectedUf}
                  onChange={(e) => {
                    setSelectedUf(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="custom-filter-select w-[110px] h-8 [&>select]:h-8 [&>select]:py-0.5 [&>select]:rounded-lg [&>select]:text-xs [&>select]:border-zinc-200 dark:[&>select]:border-zinc-800"
                >
                  {ufs.map(uf => (
                    <option key={uf} value={uf} className="custom-filter-input">{uf === "Todos" ? "Todos" : uf}</option>
                  ))}
                </NativeSelect>
              </div>

              <button
                onClick={handleClearFilters}
                className="text-[11px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:underline transition-all mt-4.5"
              >
                Limpar Filtros
              </button>
            </div>
          </div>

          {/* Exibir registros por página control */}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-650 dark:text-zinc-400 px-1 mt-1">
            <span>Exibir</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value))
                setCurrentPage(1)
              }}
              className="custom-select-exibir w-14 px-1.5 h-6 text-center font-extrabold border border-zinc-300 dark:border-zinc-800 rounded text-[11px] focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/20 cursor-pointer"
            >
              <option value={10} className="custom-select-exibir">10</option>
              <option value={20} className="custom-select-exibir">20</option>
              <option value={50} className="custom-select-exibir">50</option>
            </select>
            <span>registros por página</span>
          </div>

          {/* Cards Table list */}
          <div className="flex flex-col gap-2">

            {/* Header Row */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-2 text-[9px] font-bold uppercase tracking-wider opacity-65 border-b border-zinc-200/30 dark:border-zinc-800/30">
              <div className="col-span-12 md:col-span-2">CNPJ</div>
              <div className="col-span-12 md:col-span-4">Tomador</div>
              <div className="col-span-12 md:col-span-2">Produtor</div>
              <div className="col-span-12 md:col-span-2">Cidade/UF</div>
              <div className="col-span-12 md:col-span-2">Contato</div>
            </div>

            {/* List Rows */}
            {loading ? (
              <TableSkeleton rows={6} />
            ) : paginatedTomadores.length > 0 ? (
              paginatedTomadores.map((t) => {
                return (
                  <div
                    key={t.id}
                    onClick={() => handleEditClick(t.id)}
                    className="cursor-pointer group grid grid-cols-12 gap-4 items-center bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-xl p-3.5 md:py-3.5 md:px-5 hover:border-brand-red/40 dark:hover:border-brand-red/40 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 hover:shadow-md transition-all duration-200 relative"
                  >
                    {/* Documento (CNPJ) */}
                    <div className="col-span-12 md:col-span-2 font-mono text-[11px] text-zinc-650 dark:text-zinc-400 font-medium">
                      {t.cnpj}
                    </div>

                    {/* Tomador */}
                    <div className="col-span-12 md:col-span-4 flex flex-col gap-1">
                      <span className="font-bold text-xs tracking-tight text-inherit uppercase truncate pr-2" title={t.nome}>{t.nome}</span>
                    </div>

                    {/* Produtor */}
                    <div className="col-span-12 md:col-span-2 flex flex-col gap-1">
                      <span className="text-[11px] text-zinc-650 dark:text-zinc-400 font-medium truncate pr-2 uppercase" title={t.produtor || ""}>
                        {t.produtor || "-"}
                      </span>
                    </div>

                    {/* Cidade/UF */}
                    <div className="col-span-12 md:col-span-2 flex items-center justify-between gap-1 text-[11px] text-zinc-650 dark:text-zinc-400">
                      <div className="flex items-center gap-1">
                        <span className="font-medium uppercase truncate pr-2" title={t.cidade ? `${t.cidade}/${t.uf}` : ""}>{t.cidade ? `${t.cidade}/${t.uf}` : "-"}</span>
                      </div>
                    </div>

                    {/* Contato */}
                    <div className="col-span-12 md:col-span-2 flex flex-col gap-1 text-[11px] text-zinc-650 dark:text-zinc-400 font-medium">
                      {t.celular && (
                        <span className="flex items-center gap-1 truncate" title={t.celular}>
                          <span>{t.celular}</span>
                        </span>
                      )}
                      {t.email && (
                        <span className="flex items-center gap-1 truncate" title={t.email}>
                          <span className="truncate">{t.email}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-xl p-12 text-center">
                <div className="flex flex-col items-center justify-center max-w-xs mx-auto">
                  <div className="w-10 h-10 rounded-xl bg-zinc-150 dark:bg-zinc-900 flex items-center justify-center mb-3 opacity-70">
                    <Users className="size-5 text-zinc-400" />
                  </div>
                  <h4 className="font-bold text-xs text-inherit">Nenhum tomador encontrado</h4>
                  <p className="text-[11px] opacity-50 mt-1">
                    Tente refinar seus termos de pesquisa ou cadastrar um novo tomador.
                  </p>
                </div>
              </div>
            )}

            {/* Pagination Footer */}
            <div className="border border-zinc-200/40 dark:border-zinc-800/40 px-5 py-3 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-50/20 dark:bg-zinc-900/10">
              <span className="text-[11px] opacity-50">
                Mostrando {filteredTomadores.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} a {Math.min(currentPage * itemsPerPage, filteredTomadores.length)} de {filteredTomadores.length} registro(s)
              </span>

              <div className="flex items-center gap-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="text-xs font-bold text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-40 disabled:hover:text-zinc-500 disabled:dark:hover:text-zinc-500 transition-all cursor-pointer disabled:cursor-not-allowed select-none"
                >
                  Anterior
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    const isActive = currentPage === pageNum;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={cn(
                          "text-xs font-bold transition-all cursor-pointer flex items-center justify-center select-none",
                          isActive
                            ? "w-6 h-6 rounded-full bg-brand-red text-white shadow-sm shadow-brand-red/10"
                            : "w-6 h-6 rounded-full text-zinc-500 hover:text-brand-red hover:bg-zinc-100 dark:hover:bg-zinc-900"
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="text-xs font-bold text-brand-red hover:text-brand-red/80 disabled:opacity-40 disabled:hover:text-brand-red transition-all cursor-pointer disabled:cursor-not-allowed select-none"
                >
                  Próximo
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ──── REGISTRATION FORM VIEW ──── */}
      {view === "form" && (
        <form onSubmit={handleSubmit} className={cn("flex-1 flex flex-col", editingId === null && !cadastroManual ? "justify-center items-center" : "min-h-0 gap-6")}>
          {editingId === null && !cadastroManual ? (
            <div className="w-full max-w-3xl px-4 md:px-0">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/40 rounded-xl shadow-sm p-6 md:p-10">
                <div className="space-y-3 mb-6">
                  <Label htmlFor="form-cnpj" className="text-brand-red font-bold flex items-center gap-2 text-sm uppercase">
                    CNPJ
                    {cnpjLoading && (
                      <span className="flex items-center gap-1 text-[10px] font-normal opacity-80 text-zinc-500">
                        <span className="w-2.5 h-2.5 border border-brand-red border-t-transparent rounded-full animate-spin" />
                        Buscando...
                      </span>
                    )}
                  </Label>
                  <Input
                    id="form-cnpj"
                    placeholder="Digite o número do CNPJ"
                    value={formData.cnpj}
                    onChange={(e) => {
                      const val = maskCNPJ(e.target.value);
                      setFormData(prev => ({ ...prev, cnpj: val }));
                      setCnpjNaoEncontrado(false);
                      setCnpjDuplicado(null);
                      fetchCompanyByCnpj(val);
                    }}
                    className="h-12 rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/5 px-4"
                    required
                  />
                </div>
                
                {/* CNPJ ja existe no backend: nao adianta prosseguir, o save seria recusado */}
                {cnpjDuplicado && (
                  <div className="mt-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="size-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-red-600 dark:text-red-400 font-bold text-sm">CNPJ já cadastrado</span>
                        <span className="text-zinc-500 dark:text-zinc-400 text-xs">
                          Este CNPJ pertence a <span className="font-semibold">{cnpjDuplicado.nome}</span>. Abra o cadastro existente para editá-lo.
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleEditClick(cnpjDuplicado.id)}
                      className="self-start h-10 px-4 rounded-lg font-semibold border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 cursor-pointer transition-all"
                    >
                      Abrir cadastro existente
                    </Button>
                  </div>
                )}

                {/* Exibição do Nome/Razão Social estilo badge (Apenas se já buscou/preencheu) */}
                {formData.nome && !cnpjLoading && !cnpjDuplicado && (
                  <div className="mt-3 p-4 bg-brand-red/5 dark:bg-brand-red/10 border border-brand-red/10 dark:border-brand-red/20 rounded-lg flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-200">
                    <span className="text-brand-red font-bold text-sm uppercase">{formData.nome}</span>
                    <span className="text-zinc-500 dark:text-zinc-400 text-xs">{formData.cnpj}</span>
                  </div>
                )}
                
                {/* Busca automatica falhou: oferece o cadastro manual (fluxo completo) */}
                {cnpjNaoEncontrado && !cnpjLoading && (
                  <div className="mt-3 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-amber-700 dark:text-amber-400 font-bold text-sm">CNPJ nao identificado</span>
                        <span className="text-zinc-500 dark:text-zinc-400 text-xs">
                          Nao foi possivel buscar os dados automaticamente. Voce pode preencher o cadastro manualmente.
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setCadastroManual(true)
                        setCurrentTab("dados")
                      }}
                      className="self-start h-10 px-4 rounded-lg font-semibold border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 cursor-pointer transition-all"
                    >
                      Cadastrar manualmente
                    </Button>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-8">
                  <Button 
                    type="button" 
                    variant="ghost"
                    onClick={() => { setView("list"); setEditingId(null); }}
                    className="h-11 px-6 font-semibold"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving || cnpjLoading || cnpjDuplicado !== null}
                    className="bg-[#e43a3e] hover:bg-[#c72f32] text-white font-bold h-11 px-8 rounded-lg cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed uppercase"
                  >
                    {saving ? "Aguarde..." : "continuar"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
          <>
          {/* Form Action Buttons (Mobile) */}
          <div className="md:hidden flex flex-col gap-3 pb-6 border-b border-zinc-200/60 dark:border-zinc-800/80 shrink-0">
            {editingId !== null && (
              <div className="grid grid-cols-2 gap-3">
                <Button type="button" variant="outline" disabled={saving} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-semibold h-10 rounded-xl flex items-center justify-center gap-2">
                  <Mail className="size-4 text-zinc-500" />
                  <span>Carta</span>
                </Button>
                <Button type="button" variant="outline" disabled={saving} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-semibold h-10 rounded-xl flex items-center justify-center gap-2">
                  <KeyRound className="size-4 text-zinc-500" />
                  <span>Senha</span>
                </Button>
              </div>
            )}
            <div className={cn("grid gap-2", editingId !== null ? "grid-cols-3" : "grid-cols-1")}>
              {editingId !== null && (
                <>
                  <Button type="button" disabled={saving} onClick={() => handleDeleteClick(editingId)} className="bg-red-50 dark:bg-red-500/10 text-red-600 border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 font-semibold h-10 rounded-xl flex items-center justify-center gap-1.5">
                    <Trash2 className="size-3.5" />
                    <span className="text-[11px]">Excluir</span>
                  </Button>
                  <Button type="button" variant="outline" disabled={saving} className="border-brand-red/20 text-brand-red hover:bg-brand-red/5 font-semibold h-10 rounded-xl flex items-center justify-center gap-1.5">
                    <RefreshCw className="size-3.5" />
                    <span className="text-[11px]">Atualizar</span>
                  </Button>
                </>
              )}
              <Button type="button" variant="outline" disabled={saving} onClick={() => { setView("list"); setEditingId(null); }} className="border-zinc-200 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-semibold h-10 rounded-xl flex items-center justify-center">
                <span className="text-[11px]">Cancelar</span>
              </Button>
            </div>
            <Button type="submit" disabled={saving} className="bg-brand-red text-white hover:bg-brand-red/90 font-bold h-11 rounded-xl shadow-md shadow-brand-red/10 flex items-center justify-center gap-2 mt-1">
              {saving && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{saving ? "Processando..." : editingId !== null ? "Salvar Alterações" : "Continuar"}</span>
            </Button>
          </div>

          {/* Top Action Buttons (Desktop) */}
          {editingId !== null && (
            <div className="hidden md:flex items-center gap-3 -mt-2">
              <Button type="button" variant="outline" disabled={saving} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold h-9 px-4 rounded-xl flex items-center gap-2 text-xs">
                <Mail className="size-3.5 text-zinc-500" />
                <span>Enviar Carta de Nomeação</span>
              </Button>
              <Button type="button" variant="outline" disabled={saving} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold h-9 px-4 rounded-xl flex items-center gap-2 text-xs">
                <KeyRound className="size-3.5 text-zinc-500" />
                <span>Resetar Senha</span>
              </Button>
              <Button type="button" variant="outline" disabled={saving} className="border-brand-red/20 text-brand-red hover:bg-brand-red/5 font-bold h-9 px-4 rounded-xl flex items-center gap-2 text-xs">
                <RefreshCw className="size-3.5" />
                <span>Atualizar Tomador</span>
              </Button>
            </div>
          )}

          {/* Tab selectors */}
          <div className="flex overflow-x-auto no-scrollbar md:border-b border-zinc-200/60 dark:border-zinc-800/80 gap-2 shrink-0 pb-2 md:pb-0">
            <button
              type="button"
              onClick={() => setCurrentTab("dados")}
              className={cn(
                "shrink-0 justify-center px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
                currentTab === "dados"
                  ? "bg-brand-red text-white rounded-xl shadow-md md:bg-transparent md:text-brand-red md:border-b-2 md:border-brand-red md:rounded-none md:shadow-none"
                  : "bg-black/5 dark:bg-white/5 text-zinc-500 rounded-xl md:bg-transparent md:border-b-2 md:border-transparent hover:text-zinc-600 dark:hover:text-zinc-300 md:rounded-none"
              )}
            >
              <FileText className="size-4" />
              <span>Dados Gerais</span>
            </button>

            {editingId !== null && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentTab("endereco")}
                  className={cn(
                    "shrink-0 justify-center px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
                    currentTab === "endereco"
                      ? "bg-brand-red text-white rounded-xl shadow-md md:bg-transparent md:text-brand-red md:border-b-2 md:border-brand-red md:rounded-none md:shadow-none"
                      : "bg-black/5 dark:bg-white/5 text-zinc-500 rounded-xl md:bg-transparent md:border-b-2 md:border-transparent hover:text-zinc-600 dark:hover:text-zinc-300 md:rounded-none"
                  )}
                >
                  <MapPin className="size-4" />
                  <span>Endereço</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentTab("contatos")}
                  className={cn(
                    "shrink-0 justify-center px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
                    currentTab === "contatos"
                      ? "bg-brand-red text-white rounded-xl shadow-md md:bg-transparent md:text-brand-red md:border-b-2 md:border-brand-red md:rounded-none md:shadow-none"
                      : "bg-black/5 dark:bg-white/5 text-zinc-500 rounded-xl md:bg-transparent md:border-b-2 md:border-transparent hover:text-zinc-600 dark:hover:text-zinc-300 md:rounded-none"
                  )}
                >
                  <Users className="size-4" />
                  <span>Contatos ({formData.contatosAdicionais.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentTab("socios")}
                  className={cn(
                    "shrink-0 justify-center px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
                    currentTab === "socios"
                      ? "bg-brand-red text-white rounded-xl shadow-md md:bg-transparent md:text-brand-red md:border-b-2 md:border-brand-red md:rounded-none md:shadow-none"
                      : "bg-black/5 dark:bg-white/5 text-zinc-500 rounded-xl md:bg-transparent md:border-b-2 md:border-transparent hover:text-zinc-600 dark:hover:text-zinc-300 md:rounded-none"
                  )}
                >
                  <UserCheck className="size-4" />
                  <span>Quadro de Sócios ({formData.socios.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentTab("arquivos")}
                  className={cn(
                    "shrink-0 justify-center px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
                    currentTab === "arquivos"
                      ? "bg-brand-red text-white rounded-xl shadow-md md:bg-transparent md:text-brand-red md:border-b-2 md:border-brand-red md:rounded-none md:shadow-none"
                      : "bg-black/5 dark:bg-white/5 text-zinc-500 rounded-xl md:bg-transparent md:border-b-2 md:border-transparent hover:text-zinc-600 dark:hover:text-zinc-300 md:rounded-none"
                  )}
                >
                  <Paperclip className="size-4" />
                  <span>Arquivos ({arquivos.length})</span>
                </button>
              </>
            )}

            {editingId !== null && (
              <button
                type="button"
                onClick={() => setCurrentTab("apolices")}
                className={cn(
                  "shrink-0 justify-center px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
                  currentTab === "apolices"
                    ? "bg-brand-red text-white rounded-xl shadow-md md:bg-transparent md:text-brand-red md:border-b-2 md:border-brand-red md:rounded-none md:shadow-none"
                    : "bg-black/5 dark:bg-white/5 text-zinc-500 rounded-xl md:bg-transparent md:border-b-2 md:border-transparent hover:text-zinc-600 dark:hover:text-zinc-300 md:rounded-none"
                )}
              >
                <FileText className="size-4" />
                <span>Apólices</span>
              </button>
            )}

            {editingId !== null && (
              <button
                type="button"
                onClick={() => setCurrentTab("info_adicionais")}
                className={cn(
                  "shrink-0 justify-center px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
                  currentTab === "info_adicionais"
                    ? "bg-brand-red text-white rounded-xl shadow-md md:bg-transparent md:text-brand-red md:border-b-2 md:border-brand-red md:rounded-none md:shadow-none"
                    : "bg-black/5 dark:bg-white/5 text-zinc-500 rounded-xl md:bg-transparent md:border-b-2 md:border-transparent hover:text-zinc-600 dark:hover:text-zinc-300 md:rounded-none"
                )}
              >
                <FileText className="size-4" />
                <span>Info. Adicionais</span>
              </button>
            )}
          </div>

          {/* Form Scroll Area */}
          <div className="flex-1 overflow-y-auto no-scrollbar pr-1 flex flex-col gap-8 md:block">

            {/* ──── TAB: DADOS ──── */}
            <div className={cn("space-y-6", currentTab !== "dados" && "hidden")}>

              <div className="bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-2xl p-6 space-y-6">
                <h3 className="text-sm font-black text-brand-red dark:text-[#cf7458] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Building className="size-4.5" />
                  <span>DADOS DE IDENTIFICAÇÃO</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* Produtor (Apenas na edição) */}
                  {editingId !== null && (
                    <div className="space-y-2">
                    <Label htmlFor="form-produtor" className="text-xs font-bold">Produtor *</Label>
                    <Combobox
                      items={produtorItems}
                      value={formData.produtor}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, produtor: value ?? "" }))}
                    >
                      <ComboboxInput
                        id="form-produtor"
                        placeholder={cadastrosLoaded ? "Pesquisar produtor..." : "Carregando produtores..."}
                        disabled={!cadastrosLoaded}
                        className="w-full h-10 [&_input]:h-10 rounded-xl border-zinc-200/80 dark:border-zinc-800/80"
                      />
                      <ComboboxContent>
                        <ComboboxEmpty>Nenhum produtor encontrado.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: string) => (
                            <ComboboxItem key={item} value={item}>
                              {item}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>
                  )}

                  {/* Corretora (Apenas na edição) */}
                  {editingId !== null && (
                    <div className="space-y-2">
                      <Label htmlFor="form-corretora" className="text-xs font-bold">Corretora</Label>
                      <Combobox
                        items={corretorItems}
                        value={formData.corretora}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, corretora: value ?? "" }))}
                      >
                        <ComboboxInput
                          id="form-corretora"
                          placeholder={cadastrosLoaded ? "Pesquisar corretora..." : "Carregando corretoras..."}
                          disabled={!cadastrosLoaded}
                          className="w-full h-10 [&_input]:h-10 rounded-xl border-zinc-200/80 dark:border-zinc-800/80"
                        />
                        <ComboboxContent>
                          <ComboboxEmpty>Nenhuma corretora encontrada.</ComboboxEmpty>
                          <ComboboxList>
                            {(item: string) => (
                              <ComboboxItem key={item} value={item}>
                                {item}
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    </div>
                  )}

                  {/* CNPJ (Edição) */}
                  <div className="space-y-2">
                    <Label htmlFor="form-cnpj" className="text-xs font-bold flex items-center gap-2">
                      CNPJ *
                    </Label>
                    <Input
                      id="form-cnpj"
                      placeholder="00.000.000/0000-00"
                      value={formData.cnpj}
                      onChange={(e) => {
                        const val = maskCNPJ(e.target.value);
                        setFormData(prev => ({ ...prev, cnpj: val }));
                      }}
                      className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-white/5"
                      required
                    />
                  </div>

                  {/* Nome/Razão Social */}
                  <div className="space-y-2">
                    <Label htmlFor="form-nome" className="text-xs font-bold">Nome / Razão Social *</Label>
                    <Input
                      id="form-nome"
                      placeholder="Ex: ARCON CONSTRUCOES E CONSULTORIA LTDA"
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-white/5"
                    />
                  </div>



                  {editingId !== null && (
                    <>
                      {/* Nome Fantasia */}
                  <div className="space-y-2">
                    <Label htmlFor="form-nome-fantasia" className="text-xs font-bold">Nome Fantasia</Label>
                    <Input
                      id="form-nome-fantasia"
                      placeholder="Ex: ARCON CONSTRUTORA"
                      value={formData.nomeFantasia}
                      onChange={(e) => setFormData(prev => ({ ...prev, nomeFantasia: e.target.value }))}
                      className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-white/5"
                    />
                  </div>

                  {/* E-mail */}
                  <div className="space-y-2">
                    <Label htmlFor="form-email" className="text-xs font-bold">E-mail</Label>
                    <Input
                      id="form-email"
                      type="email"
                      placeholder="exemplo@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-white/5 w-full"
                    />
                  </div>

                  {/* Telefone */}
                  <div className="space-y-2">
                    <Label htmlFor="form-telefone" className="text-xs font-bold">Telefone</Label>
                    <Input
                      id="form-telefone"
                      placeholder="(00) 0000-0000"
                      value={formData.telefone}
                      onChange={(e) => setFormData(prev => ({ ...prev, telefone: maskTelefone(e.target.value) }))}
                      className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-white/5"
                    />
                  </div>

                  {/* Celular */}
                  <div className="space-y-2">
                    <Label htmlFor="form-celular" className="text-xs font-bold">Celular</Label>
                    <Input
                      id="form-celular"
                      placeholder="(00) 90000-0000"
                      value={formData.celular}
                      onChange={(e) => setFormData(prev => ({ ...prev, celular: maskTelefone(e.target.value) }))}
                      className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-white/5"
                    />
                  </div>

                  {/* Contato Principal */}
                  <div className="space-y-2">
                    <Label htmlFor="form-contato" className="text-xs font-bold">Contato Responsável</Label>
                    <Input
                      id="form-contato"
                      placeholder="Ex: Richard / João"
                      value={formData.contato}
                      onChange={(e) => setFormData(prev => ({ ...prev, contato: e.target.value }))}
                      className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-white/5"
                    />
                  </div>

                  {/* Observações */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="form-observacoes" className="text-xs font-bold">Observações</Label>
                    <Textarea
                      id="form-observacoes"
                      placeholder="Digite anotações adicionais sobre o tomador..."
                      value={formData.observacoes}
                      onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                      className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-white/5 min-h-[80px]"
                    />
                  </div>

                    </>
                  )}
                </div>
              </div>
              {editingId !== null && (
                <>
                  <div className="bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-2xl p-6 space-y-4">
                <h3 className="text-xs font-black text-brand-red dark:text-[#cf7458] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Percent className="size-4.5" />
                  <span>Taxas por Seguradora</span>
                </h3>
                <p className="text-xs opacity-60">
                  Defina a taxa de comissão e o prêmio mínimo deste tomador em cada seguradora.
                  Deixe em branco para herdar o valor cadastrado na seguradora (exibido em cinza).
                </p>
              </div>

              {loadingSeguradoras ? (
                <div className="flex items-center justify-center py-12">
                  <span className="w-5 h-5 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {seguradorasTaxaveis.map((s) => {
                      const draft = taxasDraft[s.id] ?? { taxa: "", premio_minimo: "", status: "sem_cadastro", dias_vencimento: "" }
                      return (
                        <div
                          key={s.id}
                          className={cn(
                            "relative bg-white dark:bg-zinc-800 rounded-xl border p-4 shadow-sm flex flex-col items-center text-center gap-2.5 transition-colors",
                            draft.status === "cadastro_ok"
                              ? "border-emerald-500/50 dark:border-emerald-500/40 ring-1 ring-emerald-500/20"
                              : draft.status === "em_analise"
                              ? "border-sky-500/50 dark:border-sky-500/40 ring-1 ring-sky-500/20 opacity-90"
                              : draft.status === "sem_aceitacao"
                              ? "border-red-500/40 dark:border-red-500/30 opacity-70 grayscale"
                              : draft.status === "outro_corretor"
                              ? "border-amber-500/40 dark:border-amber-500/30 opacity-80"
                              : "border-zinc-200/50 dark:border-zinc-800/40 opacity-60 grayscale"
                          )}
                        >
                          {editingId !== null && s.integracao === "junto" && s.tem_credencial_api && (
                            <button
                              type="button"
                              disabled={!!juntoCheckingIds[s.id]}
                              title="Atualizar cadastro e taxa na Junto"
                              onClick={async () => {
                                const tomador = tomadores.find(t => t.id === editingId)
                                const cnpjDigits = tomador ? somenteDigitos(tomador.cnpj) : ""
                                if (!cnpjDigits || cnpjDigits.length !== 14) {
                                  toast.error("CNPJ inválido. Não é possível atualizar na Junto.")
                                  return
                                }
                                setJuntoCheckingIds(prev => ({ ...prev, [s.id]: true }))
                                try {
                                  // Duas chamadas separadas de propósito, não um endpoint
                                  // único no back: a Junto já levou 21s numa consulta
                                  // simples, e duas em sequência no mesmo request
                                  // estourariam o timeout de 30s do gunicorn.
                                  const res = await fetch(`/api/tomadores/${editingId}/seguradoras/${s.id}/junto/verificar/`, { method: "POST" })
                                  let json = null
                                  try { json = await res.json() } catch { json = null }
                                  if (!res.ok || !json?.data) {
                                    toastErroJunto(res, json, 'Não foi possível verificar o cadastro na Junto.')
                                    return
                                  }
                                  const novoStatus = json.data.status || "sem_cadastro"
                                  // `prev[s.id]` e não `draft`: são duas atualizações em
                                  // sequência no mesmo rascunho, e espalhar o draft
                                  // capturado na renderização faria a segunda apagar o
                                  // status que a primeira acabou de gravar.
                                  setTaxasDraft(prev => ({ ...prev, [s.id]: { ...(prev[s.id] ?? draft), status: novoStatus } }))

                                  if (novoStatus === "em_analise") {
                                    toast.info("Cadastro em análise na Junto. Atualize de novo em alguns minutos.")
                                    return
                                  }
                                  if (novoStatus !== "cadastro_ok") {
                                    toast.success("Sem cadastro na Junto.")
                                    setJuntoModalContext({ tomadorId: editingId, seguradoraId: s.id })
                                    setJuntoModalOpen(true)
                                    return
                                  }

                                  // Cadastro OK: a taxa é a outra metade da mesma pergunta.
                                  toast.success("Cadastro OK na Junto. Buscando a taxa...")
                                  const resTaxa = await fetch(`/api/tomadores/${editingId}/seguradoras/${s.id}/junto/taxa/`, { method: "POST" })
                                  const jsonTaxa = await resTaxa.json().catch(() => null)
                                  if (!resTaxa.ok || !jsonTaxa?.data) {
                                    toastErroJunto(resTaxa, jsonTaxa, "Cadastro OK, mas não foi possível consultar a taxa.")
                                    return
                                  }
                                  const dataTaxa = jsonTaxa.data
                                  const taxaRaw = dataTaxa.taxa != null ? String(dataTaxa.taxa) : "0"
                                  const taxaDec = parseFloat(taxaRaw.replace(",", ".")) || 0
                                  if (taxaDec > 0) {
                                    const taxaFormatada = formatTaxaDisplay(taxaRaw)
                                    setTaxasDraft(prev => ({
                                      ...prev,
                                      [s.id]: {
                                        ...(prev[s.id] ?? draft),
                                        taxa: taxaFormatada,
                                        taxa_origem: "junto",
                                        taxa_junto_modalidade_id: String(dataTaxa.modalidade_id || ""),
                                        taxa_junto_modalidade_descricao: String(dataTaxa.modalidade_descricao || ""),
                                        taxa_data_atualizacao: dataTaxa.data_consulta || new Date().toISOString(),
                                        taxa_zero_aviso: false,
                                      }
                                    }))
                                    toast.success(`Taxa da Junto: ${taxaFormatada}%`)
                                  } else {
                                    setTaxasDraft(prev => ({ ...prev, [s.id]: { ...(prev[s.id] ?? draft), taxa_zero_aviso: true } }))
                                    toast.warning("A Junto devolveu taxa zero para este tomador.")
                                  }
                                } catch {
                                  toast.error('Erro ao atualizar na Junto.')
                                } finally {
                                  setJuntoCheckingIds(prev => ({ ...prev, [s.id]: false }))
                                }
                              }}
                              className="absolute top-2 right-2 p-1.5 rounded-lg bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors disabled:cursor-wait disabled:opacity-60"
                            >
                              {juntoCheckingIds[s.id] ? (
                                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin block" />
                              ) : (
                                <RefreshCw className="size-3.5" />
                              )}
                            </button>
                          )}
                          <h4 className="font-bold text-xs uppercase tracking-wide mb-2 px-6">{s.nome}</h4>
                          <div className="w-16 h-16 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 flex items-center justify-center overflow-hidden mb-3">
                            {s.logo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={s.logo} alt={s.nome} className="w-full h-full object-contain" />
                            ) : (
                              <Building className="size-6 text-zinc-300 dark:text-zinc-600" />
                            )}
                          </div>

                          
                          <div className="w-full space-y-1">
                            <label className="w-full flex items-center justify-between text-xs gap-2">
                              <span className="opacity-60 shrink-0">Taxa</span>
                              <div className="flex items-center gap-1.5 flex-1 max-w-[130px] justify-end">
                                <span className="relative flex-1 max-w-[92px]">
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    value={draft.taxa}
                                    placeholder="0,00"
                                    onChange={(e) => setTaxasDraft((prev) => ({
                                      ...prev,
                                      [s.id]: {
                                        ...draft,
                                        taxa: e.target.value,
                                        taxa_origem: "",
                                        taxa_junto_modalidade_id: "",
                                        taxa_junto_modalidade_descricao: "",
                                        taxa_data_atualizacao: null,
                                        taxa_zero_aviso: false,
                                      },
                                    }))}
                                    className="w-full h-7 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent pl-2 pr-5 text-right text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-red/40"
                                  />
                                  <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] opacity-50">%</span>
                                </span>
                              </div>
                            </label>
                            {draft.taxa_zero_aviso && (
                              <div className="w-full text-[10px] text-amber-600 dark:text-amber-400 text-left bg-amber-50 dark:bg-amber-950/30 p-1.5 rounded border border-amber-200/50 dark:border-amber-800/40">
                                A Junto devolveu taxa zero para este tomador.
                              </div>
                            )}
                          </div>

                          <label className="w-full flex items-center justify-between text-xs gap-2">
                            <span className="opacity-60 shrink-0">P. M.</span>
                            <span className="relative flex-1 max-w-[92px]">
                              <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] opacity-50">R$</span>
                              <input
                                type="text"
                                inputMode="decimal"
                                value={draft.premio_minimo}
                                placeholder={s.premio_minimo ? String(s.premio_minimo) : "0,00"}
                                onChange={(e) => setTaxasDraft((prev) => ({
                                  ...prev,
                                  [s.id]: { ...draft, premio_minimo: e.target.value },
                                }))}
                                className="w-full h-7 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent pl-6 pr-2 text-right text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-red/40"
                              />
                            </span>
                          </label>

                          <label className="w-full flex items-center justify-between text-xs gap-2">
                            <span className="opacity-60 shrink-0">Vencimento</span>
                            <span className="relative flex-1 max-w-[92px]">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={draft.dias_vencimento}
                                placeholder="7"
                                onChange={(e) => setTaxasDraft((prev) => ({
                                  ...prev,
                                  [s.id]: { ...draft, dias_vencimento: e.target.value.replace(/\D/g, "") },
                                }))}
                                className="w-full h-7 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent pl-2 pr-8 text-right text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-red/40"
                              />
                              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] opacity-50">dias</span>
                            </span>
                          </label>

                        
                          <hr className="w-full border-zinc-200 dark:border-zinc-800 my-0.5" />
                          <label className="w-full flex items-center justify-between text-xs gap-2">
                            <span className="opacity-60 shrink-0">Status</span>
                            <span className="relative flex-1 max-w-[135px]">
                              <NativeSelect
                                value={draft.status}
                                onChange={(e) => setTaxasDraft((prev) => ({
                                  ...prev,
                                  [s.id]: { ...draft, status: e.target.value },
                                }))}
                                className="w-full text-xs"
                              >
                                {/* A verificação na Junto grava `cadastro_ok` sozinha, mas a
                                    opção continua aqui: seguradora sem integração não tem
                                    outro caminho para chegar em "apto". */}
                                <option value="cadastro_ok">Cadastro OK</option>
                                {/* `em_analise` só é gravado pela verificação na Junto. Fica
                                    na lista mesmo assim: sem a option o select renderiza em
                                    branco quando o backend devolve esse status. */}
                                <option value="em_analise">Em análise</option>
                                <option value="sem_cadastro">Sem cadastro</option>
                                <option value="outro_corretor">Outro corretor</option>
                                <option value="sem_aceitacao">Sem aceitação</option>
                              </NativeSelect>
                            </span>
                          </label>
</div>
                      )
                    })}
                    {seguradorasTaxaveis.length === 0 && (
                      <p className="col-span-full text-center text-xs opacity-50 py-12">Nenhuma seguradora cadastrada.</p>
                    )}
                  </div>

                  {seguradorasTaxaveis.length > 0 && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleSaveTaxas}
                        disabled={savingTaxas}
                        className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-xl text-xs font-bold text-white bg-brand-red hover:bg-brand-red/90 shadow-md shadow-brand-red/10 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {savingTaxas ? "Salvando..." : "Salvar Taxas"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

            {/* ──── TAB: ENDEREÇO ──── */}
            <div className={cn("space-y-6", currentTab !== "endereco" && "hidden")}>
              <div className="bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-2xl p-6 space-y-6">
                <h3 className="text-sm font-black text-brand-red dark:text-[#cf7458] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <MapPin className="size-4.5" />
                  <span>ENDEREÇO DO TOMADOR</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

                  {/* CEP */}
                  <div className="md:col-span-3 space-y-2">
                    <Label htmlFor="form-cep" className="text-xs font-bold">CEP</Label>
                    <Input
                      id="form-cep"
                      placeholder="64.000-000"
                      value={formData.cep}
                      onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
                      className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-white/5"
                    />
                  </div>

                  {/* Endereço */}
                  <div className="md:col-span-6 space-y-2">
                    <Label htmlFor="form-endereco" className="text-xs font-bold">Logradouro / Endereço</Label>
                    <Input
                      id="form-endereco"
                      placeholder="Ex: Avenida Frei Serafim"
                      value={formData.endereco}
                      onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                      className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-white/5"
                    />
                  </div>

                  {/* Número */}
                  <div className="md:col-span-3 space-y-2">
                    <Label htmlFor="form-numero" className="text-xs font-bold">Número</Label>
                    <Input
                      id="form-numero"
                      placeholder="Ex: 1500"
                      value={formData.numero}
                      onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                      className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-white/5"
                    />
                  </div>

                  {/* Complemento */}
                  <div className="md:col-span-4 space-y-2">
                    <Label htmlFor="form-complemento" className="text-xs font-bold">Complemento</Label>
                    <Input
                      id="form-complemento"
                      placeholder="Ex: Sala 202"
                      value={formData.complemento}
                      onChange={(e) => setFormData(prev => ({ ...prev, complemento: e.target.value }))}
                      className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-white/5"
                    />
                  </div>

                  {/* Bairro */}
                  <div className="md:col-span-4 space-y-2">
                    <Label htmlFor="form-bairro" className="text-xs font-bold">Bairro</Label>
                    <Input
                      id="form-bairro"
                      placeholder="Ex: Centro"
                      value={formData.bairro}
                      onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
                      className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-white/5"
                    />
                  </div>

                  {/* Cidade */}
                  <div className="md:col-span-3 space-y-2">
                    <Label htmlFor="form-cidade" className="text-xs font-bold">Cidade</Label>
                    <Input
                      id="form-cidade"
                      placeholder="Ex: Teresina"
                      value={formData.cidade}
                      onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                      className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-white/5"
                    />
                  </div>

                  {/* Estado (UF) */}
                  <div className="md:col-span-1 space-y-2">
                    <Label htmlFor="form-uf" className="text-xs font-bold">UF</Label>
                    <Input
                      id="form-uf"
                      placeholder="PI"
                      maxLength={2}
                      value={formData.uf}
                      onChange={(e) => setFormData(prev => ({ ...prev, uf: e.target.value.toUpperCase() }))}
                      className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-white/5 text-center font-bold"
                    />
                  </div>

                </div>
              </div>

            </div>

            {/* ──── TAB: CONTATOS ──── */}
            <div className={cn("space-y-6", currentTab !== "contatos" && "hidden")}>

              {/* Add new contact form row */}
              <div className="bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-2xl p-6 space-y-4">
                <h3 className="text-xs font-black text-brand-red dark:text-[#cf7458] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <PlusCircle className="size-4.5" />
                  <span>Adicionar Novo Contato Adicional</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-nome" className="text-[11px] font-bold opacity-75">Nome do Contato</Label>
                    <Input
                      id="contact-nome"
                      placeholder="Nome"
                      value={newContact.nome}
                      onChange={(e) => setNewContact(prev => ({ ...prev, nome: e.target.value }))}
                      className="h-9 rounded-xl border-zinc-200 dark:border-zinc-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-tel" className="text-[11px] font-bold opacity-75">Telefone/Celular</Label>
                    <Input
                      id="contact-tel"
                      placeholder="Telefone"
                      value={newContact.telefone}
                      onChange={(e) => setNewContact(prev => ({ ...prev, telefone: maskTelefone(e.target.value) }))}
                      className="h-9 rounded-xl border-zinc-200 dark:border-zinc-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-email" className="text-[11px] font-bold opacity-75">E-mail</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="E-mail"
                      value={newContact.email}
                      onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                      className="h-9 rounded-xl border-zinc-200 dark:border-zinc-800"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={addContact}
                  className="mt-2 bg-emerald-600 text-white hover:bg-emerald-700 font-bold px-3 py-1.5 h-8.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <Plus className="size-3.5" />
                  <span>Inserir Contato</span>
                </Button>
              </div>

                {/* Contacts table list */}
                <div className="hidden md:block bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-2xl overflow-x-auto mt-6">
                  <table className="w-full border-collapse text-left text-sm min-w-max">
                  <thead>
                    <tr className="border-b border-zinc-200/40 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-900/30 text-[10px] font-bold uppercase tracking-wider opacity-60">
                      <th className="px-6 py-3">Nome do Contato</th>
                      <th className="px-6 py-3">Telefone/Celular</th>
                      <th className="px-6 py-3">E-mail</th>
                      <th className="px-6 py-3 text-center">Remover</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/30 dark:divide-zinc-800/20">
                    {formData.contatosAdicionais.length > 0 ? (
                      formData.contatosAdicionais.map((c, i) => (
                        <tr key={i} className="hover:bg-zinc-50/20 dark:hover:bg-zinc-950/10">
                          <td className="px-6 py-3 font-bold">{c.nome.toUpperCase()}</td>
                          <td className="px-6 py-3 font-mono text-xs">{c.telefone}</td>
                          <td className="px-6 py-3 text-xs opacity-80">{c.email}</td>
                          <td className="px-6 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeContact(i)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center border border-zinc-200 dark:border-zinc-850 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 transition-all cursor-pointer"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-xs opacity-50 font-medium">
                          Nenhum contato adicional adicionado ainda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Card grid for contacts (Mobile only) */}
              <div className="md:hidden mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {formData.contatosAdicionais.map((c, i) => (
                  <div key={i} className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200/50 dark:border-zinc-800/40 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="font-bold text-sm mb-2">{c.nome}</h4>
                    <p className="text-xs text-muted-foreground">Telefone: {c.telefone || '-'} </p>
                    <p className="text-xs text-muted-foreground">E-mail: {c.email || '-'} </p>
                    <button
                      type="button"
                      onClick={() => removeContact(i)}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-md bg-red-600/10 text-red-600 hover:bg-red-600/20 text-xs py-1"
                    >
                      <Trash2 className="size-3" /> Remover
                    </button>
                  </div>
                ))}
                {formData.contatosAdicionais.length === 0 && (
                  <p className="col-span-full text-center text-xs opacity-50">Nenhum contato adicional adicionado ainda.</p>
                )}
              </div>

            </div>

            {/* ──── TAB: SOCIOS ──── */}
            <div className={cn("space-y-6", currentTab !== "socios" && "hidden")}>

              {/* Add new partner form row */}
              <div className="bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-2xl p-6 space-y-4">
                <h3 className="text-xs font-black text-brand-red dark:text-[#cf7458] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <PlusCircle className="size-4.5" />
                  <span>Adicionar Sócio ou Administrador</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="socio-nome" className="text-[11px] font-bold opacity-75">Nome do Sócio *</Label>
                    <Input
                      id="socio-nome"
                      placeholder="Nome Completo"
                      value={newSocio.nome}
                      onChange={(e) => setNewSocio(prev => ({ ...prev, nome: e.target.value }))}
                      className="h-9 rounded-xl border-zinc-200 dark:border-zinc-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="socio-cpf" className="text-[11px] font-bold opacity-75">CPF</Label>
                    <Input
                      id="socio-cpf"
                      placeholder="000.000.000-00"
                      value={newSocio.cpf}
                      onChange={(e) => setNewSocio(prev => ({ ...prev, cpf: maskCPF(e.target.value) }))}
                      className="h-9 rounded-xl border-zinc-200 dark:border-zinc-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="socio-qualif" className="text-[11px] font-bold opacity-75">Qualificação</Label>
                    <NativeSelect
                      id="socio-qualif"
                      value={newSocio.qualificacao}
                      onChange={(e) => setNewSocio(prev => ({ ...prev, qualificacao: e.target.value }))}
                      className="w-full h-9 [&>select]:h-9 [&>select]:rounded-xl [&>select]:border-zinc-200/80 dark:[&>select]:border-zinc-800/80"
                    >
                      <option value="">Selecionar...</option>
                      <option value="Sócio Administrador">Sócio Administrador</option>
                      <option value="Diretor">Diretor</option>
                      <option value="Sócio">Sócio</option>
                      <option value="Administrador">Administrador</option>
                      <option value="Procurador">Procurador</option>
                    </NativeSelect>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="socio-nasc" className="text-[11px] font-bold opacity-75">Data Nascimento</Label>
                    <Input
                      id="socio-nasc"
                      type="date"
                      value={newSocio.nascimento}
                      onChange={(e) => setNewSocio(prev => ({ ...prev, nascimento: e.target.value }))}
                      className="h-9 rounded-xl border-zinc-200 dark:border-zinc-800 text-xs"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={addSocio}
                  className="mt-2 bg-emerald-600 text-white hover:bg-emerald-700 font-bold px-3 py-1.5 h-8.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <Plus className="size-3.5" />
                  <span>Inserir Sócio</span>
                </Button>
              </div>

              {/* Partners list table (Desktop only) */}
              <div className="hidden md:block bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-2xl overflow-hidden mt-6">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200/40 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-900/30 text-[10px] font-bold uppercase tracking-wider opacity-60">
                      <th className="px-6 py-3">Nome do Sócio</th>
                      <th className="px-6 py-3">CPF</th>
                      <th className="px-6 py-3">Qualificação</th>
                      <th className="px-6 py-3">Data de Nascimento</th>
                      <th className="px-6 py-3 text-center">Remover</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/30 dark:divide-zinc-800/20">
                    {formData.socios.length > 0 ? (
                      formData.socios.map((s, i) => (
                        <tr key={i} className="hover:bg-zinc-50/20 dark:hover:bg-zinc-950/10">
                          <td className="px-6 py-3 font-bold">{s.nome.toUpperCase()}</td>
                          <td className="px-6 py-3 font-mono text-xs">{s.cpf || "-"}</td>
                          <td className="px-6 py-3 text-xs opacity-85">{s.qualificacao || "-"}</td>
                          <td className="px-6 py-3 text-xs opacity-75">{s.nascimento || "-"}</td>
                          <td className="px-6 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeSocio(i)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center border border-zinc-200 dark:border-zinc-850 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 transition-all cursor-pointer"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-xs opacity-50 font-medium">
                          Nenhum sócio ou administrador cadastrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Card grid for socios (Mobile only) */}
              <div className="md:hidden mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {formData.socios.map((s, i) => (
                  <div key={i} className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200/50 dark:border-zinc-800/40 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="font-bold text-sm mb-2">{s.nome}</h4>
                    <p className="text-xs text-muted-foreground">CPF: {s.cpf || '-'} </p>
                    <p className="text-xs text-muted-foreground">Qualificação: {s.qualificacao || '-'} </p>
                    <p className="text-xs text-muted-foreground">Nascimento: {s.nascimento || '-'} </p>
                    <button
                      type="button"
                      onClick={() => removeSocio(i)}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-md bg-red-600/10 text-red-600 hover:bg-red-600/20 text-xs py-1"
                    >
                      <Trash2 className="size-3" /> Remover
                    </button>
                  </div>
                ))}
                {formData.socios.length === 0 && (
                  <p className="col-span-full text-center text-xs opacity-50">Nenhum sócio ou administrador cadastrado.</p>
                )}
              </div>

            </div>

            {/* ──── TAB: ARQUIVOS ──── */}
            <div className={cn("space-y-6", currentTab !== "arquivos" && "hidden")}>

              {editingId === null ? (
                <div className="bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-2xl p-6">
                  <p className="text-xs opacity-60 text-center">
                    Salve o cadastro do tomador antes de anexar arquivos.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-2xl p-6 space-y-4">
                    <h3 className="text-xs font-black text-brand-red dark:text-[#cf7458] uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Paperclip className="size-4.5" />
                      <span>Arquivos do Tomador</span>
                    </h3>
                    <label
                      htmlFor="arquivo-upload"
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 h-8.5 rounded-lg text-xs font-bold cursor-pointer transition-all active:scale-[0.98]",
                        uploadingArquivo
                          ? "bg-zinc-300 dark:bg-zinc-700 text-zinc-500 cursor-not-allowed"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      )}
                    >
                      {uploadingArquivo ? (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload className="size-3.5" />
                      )}
                      <span>{uploadingArquivo ? "Enviando..." : "Enviar Arquivo"}</span>
                    </label>
                    <input
                      id="arquivo-upload"
                      type="file"
                      className="hidden"
                      disabled={uploadingArquivo}
                      onChange={handleUploadArquivo}
                    />
                  </div>

                  {loadingArquivos ? (
                    <div className="flex items-center justify-center py-12">
                      <span className="w-5 h-5 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <>
                      <div className="hidden md:block bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-2xl overflow-hidden">
                        <table className="w-full border-collapse text-left text-sm">
                        <thead>
                          <tr className="border-b border-zinc-200/40 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-900/30 text-[10px] font-bold uppercase tracking-wider opacity-60">
                            <th className="px-6 py-3">Arquivo</th>
                            <th className="px-6 py-3">Tamanho</th>
                            <th className="px-6 py-3">Enviado em</th>
                            <th className="px-6 py-3 text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200/30 dark:divide-zinc-800/20">
                          {arquivos.length > 0 ? (
                            arquivos.map((a) => (
                              <tr key={a.id} className="hover:bg-zinc-50/20 dark:hover:bg-zinc-950/10">
                                <td className="px-6 py-3 font-bold flex items-center gap-2">
                                  <Paperclip className="size-3.5 opacity-50 shrink-0" />
                                  <span className="truncate max-w-xs">{a.nome_original}</span>
                                </td>
                                <td className="px-6 py-3 text-xs opacity-75">{formatFileSize(a.tamanho)}</td>
                                <td className="px-6 py-3 text-xs opacity-75">
                                  {new Date(a.criado_em).toLocaleDateString("pt-BR")}
                                </td>
                                <td className="px-6 py-3">
                                  <div className="flex items-center justify-center gap-2">
                                    <a
                                      href={a.arquivo}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-7 h-7 rounded-lg flex items-center justify-center border border-zinc-200 dark:border-zinc-850 hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-600 transition-all cursor-pointer"
                                    >
                                      <Download className="size-3.5" />
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteArquivo(a)}
                                      className="w-7 h-7 rounded-lg flex items-center justify-center border border-zinc-200 dark:border-zinc-850 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 transition-all cursor-pointer"
                                    >
                                      <Trash2 className="size-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="px-6 py-12 text-center text-xs opacity-50 font-medium">
                                Nenhum arquivo enviado.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile cards for arquivos */}
                    <div className="md:hidden mt-6 grid gap-4 sm:grid-cols-2">
                      {arquivos.map((a) => (
                        <div key={a.id} className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200/50 dark:border-zinc-800/40 p-4 shadow-sm hover:shadow-md transition-shadow">
                          <h4 className="font-bold text-sm mb-2 truncate" title={a.nome_original}>{a.nome_original}</h4>
                          <p className="text-xs text-muted-foreground">Tamanho: {formatFileSize(a.tamanho)} </p>
                          <p className="text-xs text-muted-foreground">Enviado: {new Date(a.criado_em).toLocaleDateString("pt-BR")} </p>
                          <div className="mt-3 flex items-center gap-2">
                            <a
                              href={a.arquivo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20 text-xs py-1.5 transition-colors"
                            >
                              <Download className="size-3" /> Baixar
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteArquivo(a)}
                              className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-red-600/10 text-red-600 hover:bg-red-600/20 text-xs py-1.5 transition-colors"
                            >
                              <Trash2 className="size-3" /> Remover
                            </button>
                          </div>
                        </div>
                      ))}
                      {arquivos.length === 0 && (
                        <p className="col-span-full text-center text-xs opacity-50">Nenhum arquivo enviado.</p>
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            </div>

            {/* ──── TAB: APOLICES ──── */}
            {/* ──── TAB: APOLICES ──── */}
            {editingId !== null && (
              <div className={cn("space-y-6", currentTab !== "apolices" && "hidden")}>
                
                {/* Cards for selection */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedApoliceType(selectedApoliceType === "garantia" ? null : "garantia")}
                    className={cn(
                      "flex flex-col items-start text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md w-full sm:w-[280px]",
                      selectedApoliceType === "garantia" 
                        ? "bg-brand-red border-brand-red text-white shadow-brand-red/20" 
                        : "bg-white dark:bg-zinc-900 border-zinc-200/50 dark:border-zinc-800/50 hover:border-brand-red/30"
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-colors",
                      selectedApoliceType === "garantia"
                        ? "bg-white/20 text-white"
                        : "bg-red-50 dark:bg-red-500/10 text-brand-red"
                    )}>
                      <FileText className="size-4.5" />
                    </div>
                    <h4 className="font-bold text-base mb-0.5">Seguro Garantia</h4>
                    <p className={cn(
                      "text-[11px] leading-tight",
                      selectedApoliceType === "garantia" ? "text-white/80" : "text-muted-foreground"
                    )}>Lista de apólices de Seguro Garantia.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedApoliceType(selectedApoliceType === "engenharia" ? null : "engenharia")}
                    className={cn(
                      "flex flex-col items-start text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md w-full sm:w-[280px]",
                      selectedApoliceType === "engenharia" 
                        ? "bg-brand-red border-brand-red text-white shadow-brand-red/20" 
                        : "bg-white dark:bg-zinc-900 border-zinc-200/50 dark:border-zinc-800/50 hover:border-brand-red/30"
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-colors",
                      selectedApoliceType === "engenharia"
                        ? "bg-white/20 text-white"
                        : "bg-red-50 dark:bg-red-500/10 text-brand-red"
                    )}>
                      <Building className="size-4.5" />
                    </div>
                    <h4 className="font-bold text-base mb-0.5">Risco de Engenharia</h4>
                    <p className={cn(
                      "text-[11px] leading-tight",
                      selectedApoliceType === "engenharia" ? "text-white/80" : "text-muted-foreground"
                    )}>Lista de apólices de Risco de Engenharia.</p>
                  </button>
                </div>

                {/* Content Area */}
                {selectedApoliceType && (
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-6 shadow-sm mt-6">
                    <h3 className="text-sm font-black text-brand-red uppercase tracking-wider mb-6">
                      {selectedApoliceType === "garantia" ? "LISTA DE APÓLICES" : "RISCO DE ENGENHARIA"}
                    </h3>

                    {/* Filters bar */}
                    <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-2 text-xs w-full md:w-auto">
                        <span className="text-muted-foreground">Exibir</span>
                        <select className="border border-zinc-200 dark:border-zinc-800 rounded-md p-1 bg-transparent">
                          <option>10</option>
                          <option>25</option>
                          <option>50</option>
                        </select>
                        <span className="text-muted-foreground">registros por página</span>
                      </div>
                      
                      <div className="flex flex-col md:flex-row items-end md:items-center gap-4 w-full md:w-auto">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto">
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="flex flex-col gap-1 w-1/2 sm:w-auto">
                              <span className="text-[10px] font-semibold text-muted-foreground uppercase">DATA INÍCIO</span>
                              <Input type="date" className="h-9 w-full sm:w-[140px] text-xs" />
                            </div>
                            <div className="flex flex-col gap-1 w-1/2 sm:w-auto">
                              <span className="text-[10px] font-semibold text-muted-foreground uppercase">DATA FIM</span>
                              <Input type="date" className="h-9 w-full sm:w-[140px] text-xs" />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 w-full sm:w-auto mt-2 sm:mt-0">
                            <span className="hidden sm:block text-[10px] opacity-0">.</span>
                            <Button type="button" className="w-full sm:w-auto h-9 bg-brand-red text-white hover:bg-brand-red/90 font-bold px-4">BUSCAR</Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                          <span className="text-xs text-muted-foreground shrink-0">Filtrar:</span>
                          <Input type="text" className="h-9 w-full md:w-[200px]" />
                        </div>
                      </div>
                    </div>

                    {/* Table */}
                    <div className="hidden md:block overflow-x-auto rounded-none md:rounded-lg">
                      <table className="w-full border-collapse text-left text-[11px] whitespace-nowrap min-w-max">
                        <thead>
                          <tr className="border-b-2 border-brand-red text-brand-red font-bold uppercase">
                            {selectedApoliceType === "garantia" ? (
                              <>
                                <th className="px-4 py-3">Nº DA APÓLICE</th>
                                <th className="px-4 py-3">EMISSÃO</th>
                                <th className="px-4 py-3">SEGURADO</th>
                                <th className="px-4 py-3">SEGURADORA</th>
                                <th className="px-4 py-3">MODALIDADE</th>
                                <th className="px-4 py-3">EDITAL/CONTRATO</th>
                                <th className="px-4 py-3 text-right">IS</th>
                                <th className="px-4 py-3 text-right">PRÊMIO CAJUÍNA</th>
                                <th className="px-4 py-3 text-right">PRÊMIO</th>
                                <th className="px-4 py-3 text-right">COMISSÃO</th>
                                <th className="px-4 py-3 text-center">AÇÕES</th>
                              </>
                            ) : (
                              <>
                                <th className="px-4 py-3">Nº DA APÓLICE</th>
                                <th className="px-4 py-3">SEGURADO</th>
                                <th className="px-4 py-3">SEGURADORA</th>
                                <th className="px-4 py-3">PRODUTOR</th>
                                <th className="px-4 py-3">EMISSÃO</th>
                                <th className="px-4 py-3 text-right">LMI</th>
                                <th className="px-4 py-3">NÚMERO CONTRATO</th>
                                <th className="px-4 py-3 text-center">AÇÕES</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredApolices.length > 0 ? (
                            filteredApolices.map((a) => (
                              <tr key={a.id} className="border-b border-zinc-100 dark:border-zinc-800/40 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 font-medium text-brand-red transition-colors">
                                {selectedApoliceType === "garantia" ? (
                                  <>
                                    <td className="px-4 py-3">{a.numero_apolice || "-"}</td>
                                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                                      {a.criado_em ? new Date(a.criado_em).toLocaleDateString("pt-BR") : "-"}
                                    </td>
                                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{a.segurado_nome || "-"}</td>
                                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{a.seguradora_nome || "-"}</td>
                                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{a.modalidade_nome || "-"}</td>
                                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{a.edital || "-"}</td>
                                    <td className="px-4 py-3 text-right text-zinc-700 dark:text-zinc-300">
                                      {a.importancia_segurada ? `R$ ${a.importancia_segurada}` : "-"}
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold">-</td>
                                    <td className="px-4 py-3 text-right font-bold">
                                      {a.valor_seguradora ? `R$ ${a.valor_seguradora}` : "-"}
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold">-</td>
                                  </>
                                ) : (
                                  <>
                                    <td className="px-4 py-3">{a.numero_apolice || "-"}</td>
                                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{a.segurado_nome || "-"}</td>
                                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{a.seguradora_nome || "-"}</td>
                                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">-</td>
                                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                                      {a.criado_em ? new Date(a.criado_em).toLocaleDateString("pt-BR") : "-"}
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-zinc-900 dark:text-white">
                                      {a.importancia_segurada ? `R$ ${a.importancia_segurada}` : "-"}
                                    </td>
                                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{a.edital || "-"}</td>
                                  </>
                                )}
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-zinc-600 border border-zinc-200">
                                      <FileText className="size-3" />
                                    </Button>
                                    {a.arquivo_apolice ? (
                                      <a href={a.arquivo_apolice} target="_blank" rel="noopener noreferrer">
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-emerald-600 border border-zinc-200">
                                          <Download className="size-3" />
                                        </Button>
                                      </a>
                                    ) : (
                                      <Button variant="ghost" size="icon" disabled className="h-6 w-6 text-zinc-400 border border-zinc-200 opacity-50">
                                        <Download className="size-3" />
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={selectedApoliceType === "garantia" ? 11 : 8} className="px-4 py-8 text-center text-xs opacity-50">
                                Nenhuma apólice encontrada.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden flex flex-col gap-4 mt-4">
                          {filteredApolices.length > 0 ? (
                            filteredApolices.map((a) => (
                              <div key={a.id} className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200/50 dark:border-zinc-800/40 p-4 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-bold text-sm text-brand-red">{a.numero_apolice || "-"}</h4>
                                  <span className="text-xs text-muted-foreground">{a.criado_em ? new Date(a.criado_em).toLocaleDateString("pt-BR") : "-"}</span>
                                </div>
                                <div className="space-y-1 mb-3">
                                  <p className="text-xs"><span className="font-semibold">Segurado:</span> {a.segurado_nome || "-"}</p>
                                  <p className="text-xs"><span className="font-semibold">Seguradora:</span> {a.seguradora_nome || "-"}</p>
                                  {selectedApoliceType === "garantia" ? (
                                    <>
                                      <p className="text-xs"><span className="font-semibold">Modalidade:</span> {a.modalidade_nome || "-"}</p>
                                      <p className="text-xs"><span className="font-semibold">IS:</span> <span className="font-bold">{a.importancia_segurada ? `R$ ${a.importancia_segurada}` : "-"}</span></p>
                                    </>
                                  ) : (
                                    <>
                                      <p className="text-xs"><span className="font-semibold">LMI:</span> <span className="font-bold text-zinc-900 dark:text-white">{a.importancia_segurada ? `R$ ${a.importancia_segurada}` : "-"}</span></p>
                                    </>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                  <Button type="button" variant="outline" className="flex-1 h-8 text-xs border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-700">
                                    <FileText className="size-3 mr-1.5" /> Ver
                                  </Button>
                                  {a.arquivo_apolice ? (
                                    <a href={a.arquivo_apolice} target="_blank" rel="noopener noreferrer" className="flex-1">
                                      <Button type="button" variant="outline" className="w-full h-8 text-xs border-zinc-200 dark:border-zinc-800 text-emerald-600 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50">
                                        <Download className="size-3 mr-1.5" /> Baixar
                                      </Button>
                                    </a>
                                  ) : (
                                    <Button type="button" variant="outline" disabled className="flex-1 h-8 text-xs border-zinc-200 dark:border-zinc-800 opacity-50">
                                      <Download className="size-3 mr-1.5" /> Baixar
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-xs opacity-50 p-4">Nenhuma apólice encontrada.</p>
                          )}
                    </div>
                    
                    {/* Pagination footer */}
                    <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground px-2">
                      <span>Mostrando 1 a {filteredApolices.length} de {filteredApolices.length} registros</span>
                      <div className="flex items-center gap-2">
                        <button type="button" className="opacity-50 cursor-not-allowed hover:opacity-100 transition-opacity">Anterior</button>
                        <button type="button" className="opacity-50 cursor-not-allowed hover:opacity-100 transition-opacity">Próximo</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ──── TAB: INFO. ADICIONAIS ──── */}
            {editingId !== null && (
              <div className={cn("space-y-6", currentTab !== "info_adicionais" && "hidden")}>
                
                {/* Prêmio Acumulado */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-brand-red uppercase tracking-wider mb-6">
                    Prêmio Acumulado
                  </h3>
                  
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-y-6 gap-x-4">
                    {/* Totals */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-zinc-900 dark:text-white">Prêmio</span>
                      <span className="text-[11px] text-zinc-500">
                        {premioAcumulado ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(premioAcumulado.premio_total)) : "R$ 0,00"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-zinc-900 dark:text-white">Flex</span>
                      <span className="text-[11px] text-zinc-500">
                        {premioAcumulado?.flex != null
                          ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(premioAcumulado.flex))
                          : "—"}
                      </span>
                    </div>
                    <div className="hidden md:block"></div>
                    <div className="hidden md:block"></div>
                    
                    {/* Divider */}
                    <div className="col-span-3 md:col-span-4 h-px bg-zinc-100 dark:bg-zinc-800 my-1"></div>

                    {/* Seguradoras */}
                    {premioAcumulado?.seguradoras.map((seg) => (
                      <div key={seg.id} className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-zinc-900 dark:text-white uppercase">{seg.nome}</span>
                        <span className="text-[11px] text-zinc-500">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(seg.total))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Movimentação */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-brand-red uppercase tracking-wider mb-6">
                    Movimentação / Informações Adicionais
                  </h3>
                  
                  {/* Filters bar */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Exibir</span>
                      <select className="border border-zinc-200 dark:border-zinc-800 rounded-md p-1 bg-transparent">
                        <option>10</option>
                        <option>25</option>
                        <option>50</option>
                      </select>
                      <span className="text-muted-foreground">registros por página</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs w-full md:w-auto">
                      <span className="text-muted-foreground shrink-0">Filtrar:</span>
                      <Input type="text" className="h-8 w-full md:w-[200px]" />
                    </div>
                  </div>

                  {/* dividido por cards pequenos */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full border-collapse text-left text-[11px] whitespace-nowrap">
                      <thead>
                        <tr className="border-b-2 border-brand-red text-brand-red font-bold">
                          <th className="py-2 pr-4 pl-2 font-bold cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Data</th>
                          <th className="py-2 pr-4 pl-2 font-bold cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                            <div className="flex items-center justify-between">
                              Hora
                              <span className="opacity-50 text-[8px]">◆</span>
                            </div>
                          </th>
                          <th className="py-2 pr-4 pl-2 font-bold cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                            <div className="flex items-center justify-between">
                              Situação
                              <span className="opacity-50 text-[8px]">◆</span>
                            </div>
                          </th>
                          <th className="py-2 pr-4 pl-2 font-bold cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                            <div className="flex items-center justify-between">
                              Efetuado Por
                              <span className="opacity-50 text-[8px]">◆</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {atividades.length > 0 ? (
                          atividades.map((item) => (
                            <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                              <td className="py-2.5 px-2 font-medium">{item.data}</td>
                              <td className="py-2.5 px-2">{item.hora}</td>
                              <td className="py-2.5 px-2">{item.situacao}</td>
                              <td className="py-2.5 px-2">{item.usuario}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-xs opacity-50">
                              {loadingAtividades ? "Carregando..." : "Nenhuma movimentação registrada."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards for Movimentação */}
                  <div className="md:hidden flex flex-col gap-3">
                    {atividades.length > 0 ? (
                      atividades.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800/40 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-brand-red leading-tight pr-2">{item.situacao}</span>
                            <span className="text-[10px] text-zinc-500 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-full border border-zinc-200/80 dark:border-zinc-700 whitespace-nowrap shrink-0">{item.data} às {item.hora}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] mt-1 pt-2 border-t border-zinc-100 dark:border-zinc-700/50">
                            <span className="text-zinc-500">Efetuado por:</span>
                            <span className="font-semibold text-zinc-900 dark:text-zinc-300">{item.usuario}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-xs opacity-50 py-4">
                        {loadingAtividades ? "Carregando..." : "Nenhuma movimentação registrada."}
                      </p>
                    )}
                  </div>

                  {/* Pagination footer */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 text-[11px] text-muted-foreground border-t border-zinc-200 dark:border-zinc-800 pt-4">
                    <span className="hidden md:inline">Mostrando {(atividadesPage - 1) * 10 + (atividades.length > 0 ? 1 : 0)} a {Math.min(atividadesPage * 10, atividadesCount)} de {atividadesCount} registro(s)</span>
                    <span className="md:hidden">Página {atividadesPage} de {Math.ceil(atividadesCount / 10) || 1}</span>
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                      <button 
                        type="button" 
                        onClick={() => setAtividadesPage(p => Math.max(1, p - 1))}
                        disabled={atividadesPage === 1}
                        className="opacity-50 cursor-pointer disabled:cursor-not-allowed hover:opacity-100 transition-opacity px-2 disabled:hover:opacity-50"
                      >
                        Anterior
                      </button>
                      
                      {Array.from({ length: Math.ceil(atividadesCount / 10) || 1 }).map((_, i) => (
                        <button 
                          key={i}
                          type="button" 
                          onClick={() => setAtividadesPage(i + 1)}
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer",
                            atividadesPage === i + 1 
                              ? "bg-brand-red text-white font-bold" 
                              : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          )}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button 
                        type="button"
                        onClick={() => setAtividadesPage(p => Math.min(Math.ceil(atividadesCount / 10) || 1, p + 1))}
                        disabled={atividadesPage === Math.ceil(atividadesCount / 10) || atividadesCount === 0}
                        className="text-brand-red font-semibold cursor-pointer hover:opacity-80 transition-opacity px-2 disabled:opacity-50 disabled:hover:opacity-50 disabled:cursor-not-allowed"
                      >
                        Próximo
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Form action footer buttons */}
          <div className="border-t border-zinc-200/50 dark:border-zinc-800/50 pt-5 shrink-0 w-full">
            
            {/* --- DESKTOP FOOTER --- */}
            <div className="hidden md:flex items-center gap-3 w-full">
              {editingId !== null && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  onClick={() => handleDeleteClick(editingId)}
                  className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200 hover:border-red-300 font-semibold px-4 py-2.5 h-10.5 rounded-xl cursor-pointer transition-all flex items-center gap-2 mr-auto"
                >
                  <Trash2 className="size-4" />
                  Excluir
                </Button>
              )}
              
              <div className={cn("flex items-center gap-3", editingId === null && "ml-auto")}>
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  onClick={() => {
                    setView("list")
                    setEditingId(null)
                    setAtividadesLoadedFor(null)
                  }}
                  className="border-zinc-200 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-semibold px-6 py-2.5 h-10.5 rounded-xl cursor-pointer transition-all"
                >
                  <span>Cancelar</span>
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-brand-red text-white hover:bg-brand-red/90 font-bold px-6 py-2.5 h-10.5 rounded-xl cursor-pointer shadow-md shadow-brand-red/10 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{saving ? "Salvando..." : editingId !== null ? "Salvar Cadastro" : "Continuar"}</span>
                </Button>
              </div>
            </div>

           </div>
          </>
          )}
        </form>
      )}

      <Dialog open={isFinalizeModalOpen} onOpenChange={setIsFinalizeModalOpen}>
        <DialogContent
          onInteractOutside={(e) => {
            const target = e.target as HTMLElement
            if (target.closest('[data-slot="combobox-content"]')) {
              e.preventDefault()
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Finalizar Cadastro</DialogTitle>
            <DialogDescription>
              Selecione o produtor e a seguradora inicial para finalizar o cadastro de {formData.nome}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold">Produtor *</Label>
              <Combobox
                items={produtorItems}
                value={formData.produtor}
                onValueChange={(val) => setFormData(p => ({ ...p, produtor: val ?? "" }))}
              >
                <ComboboxInput placeholder="Pesquisar produtor..." />
                <ComboboxContent>
                  <ComboboxEmpty>Nenhum produtor encontrado</ComboboxEmpty>
                  <ComboboxList>
                    {(item: string) => (
                      <ComboboxItem key={item} value={item}>{item}</ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold">Seguradora Inicial *</Label>
              <Combobox
                items={seguradorasTaxaveis}
                value={seguradoraInicialLabel ?? ""}
                onValueChange={(val) => {
                  if (!val) {
                    setSeguradoraInicial(null)
                    setSeguradoraInicialLabel(null)
                    return
                  }
                  // value is encoded as "id:::nome"
                  const parts = String(val).split(":::")
                  const id = Number(parts[0]) || null
                  const nome = parts.slice(1).join(":::") || null
                  setSeguradoraInicial(id)
                  setSeguradoraInicialLabel(nome)
                }}
              >
                <ComboboxInput placeholder="Pesquisar seguradora..." value={seguradoraInicialLabel ?? ""} />
                <ComboboxContent>
                  <ComboboxEmpty>Nenhuma seguradora</ComboboxEmpty>
                  <ComboboxList>
                    {(item: Seguradora & { id: number }) => (
                      <ComboboxItem key={item.id} value={`${item.id}:::${item.nome}`}>{item.nome}</ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsFinalizeModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-brand-red text-white hover:bg-brand-red/90">
              {saving ? "Salvando..." : "Finalizar Cadastro"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

