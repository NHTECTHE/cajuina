"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import {
  Search,
  Plus,
  Trash2,
  Edit,
  ArrowLeft,
  PlusCircle,
  Users,
  MapPin,
  FileText,
  UserCheck,
  Building,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { NativeSelect } from "@/components/ui/native-select"
import { toast } from "sonner"
import { lookupCnpj, tomadoresApi, type TomadorResponse } from "@/services/api"

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
  const [currentTab, setCurrentTab] = useState<"dados" | "endereco" | "contatos" | "socios">("dados")

  // Editing state — stores the backend id of the record being edited
  const [editingId, setEditingId] = useState<number | null>(null)

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
    produtor: "CAJUINA SEGUROS",
    corretora: "CAJUINA",
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
      produtor: tomador.produtor,
      corretora: tomador.corretora || "CAJUINA",
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
    if (!confirm("Deseja realmente excluir este tomador?")) return
    tomadoresApi.remove(id)
      .then(() => {
        setTomadores(prev => prev.filter(t => t.id !== id))
        toast.success("Tomador excluído com sucesso!")
      })
      .catch((err: Error) => toast.error(err.message || "Erro ao excluir tomador."))
  }

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.cnpj || !formData.nome) {
      toast.error("CNPJ e Nome/Razão Social são obrigatórios.")
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
        setTomadores(prev => [created, ...prev])
        toast.success("Tomador cadastrado com sucesso!")
      }
      setView("list")
      setFormData(initialFormState)
      setEditingId(null)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar tomador.")
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

  const [cnpjLoading, setCnpjLoading] = React.useState(false)

  const fetchCompanyByCnpj = async (rawValue: string) => {
    const digits = rawValue.replace(/\D/g, '').slice(0, 14);
    if (digits.length !== 14) return;

    setCnpjLoading(true);
    try {
      const data = await lookupCnpj(digits);
      setFormData(prev => ({
        ...prev,
        nome: data.razao_social || prev.nome,
        nomeFantasia: data.nome_fantasia || prev.nomeFantasia,
        email: data.email ? data.email.toLowerCase().trim() : prev.email,
        telefone: data.telefone || prev.telefone,
        celular: data.telefone || prev.celular,
        cep: data.cep || prev.cep,
        endereco: data.logradouro || prev.endereco,
        numero: data.numero || prev.numero,
        complemento: data.complemento || prev.complemento,
        bairro: data.bairro || prev.bairro,
        cidade: data.municipio || prev.cidade,
        uf: data.uf || prev.uf,
        socios: data.socios?.length
          ? data.socios.map(s => ({
              nome: s.nome,
              cpf: s.cpf,
              nascimento: "",
              qualificacao: s.qualificacao,
            }))
          : prev.socios,
      }));
      toast.success("Dados do CNPJ preenchidos automaticamente.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao buscar CNPJ";
      toast.error(msg);
    } finally {
      setCnpjLoading(false);
    }
  };



  return (
    <div className="flex flex-col gap-6">

      {/* ──── CONTAINER HEADER ──── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-inherit">
            {view === "list" ? "Lista de Tomadores" : editingId !== null ? "Editar Tomador" : "Cadastrar Tomador"}
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
              <div className="col-span-12 md:col-span-4">Tomador</div>
              <div className="col-span-12 md:col-span-3">Documento</div>
              <div className="col-span-12 md:col-span-3">Contato</div>
              <div className="col-span-12 md:col-span-2">Cidade/UF</div>
            </div>

            {/* List Rows */}
            {loading ? (
              <div className="flex items-center justify-center py-16 opacity-50">
                <div className="w-5 h-5 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
              </div>
            ) : paginatedTomadores.length > 0 ? (
              paginatedTomadores.map((t) => {
                return (
                  <div
                    key={t.id}
                    className="group grid grid-cols-12 gap-4 items-center bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-xl p-3.5 md:py-3.5 md:px-5 hover:border-brand-red/40 dark:hover:border-brand-red/40 hover:shadow-md transition-all duration-200 relative"
                  >
                    {/* Tomador */}
                    <div className="col-span-12 md:col-span-4 flex flex-col gap-1">
                      <span className="font-bold text-xs tracking-tight text-inherit uppercase">{t.nome}</span>
                    </div>

                    {/* Documento */}
                    <div className="col-span-12 md:col-span-3 font-mono text-[11px] text-zinc-650 dark:text-zinc-400 font-medium">
                      {t.cnpj}
                    </div>

                    {/* Contato */}
                    <div className="col-span-12 md:col-span-3 flex flex-col gap-1 text-[11px] text-zinc-650 dark:text-zinc-400 font-medium">
                      {t.celular && (
                        <span className="flex items-center gap-1">
                          <span className="opacity-70 text-[10px]">📞</span>
                          <span>{t.celular}</span>
                        </span>
                      )}
                      {t.email && (
                        <span className="flex items-center gap-1">
                          <span className="opacity-70 text-[10px]">✉️</span>
                          <span className="truncate">{t.email}</span>
                        </span>
                      )}
                    </div>

                    {/* Cidade/UF */}
                    <div className="col-span-12 md:col-span-2 flex items-center justify-between gap-1 text-[11px] text-zinc-650 dark:text-zinc-400">
                      <div className="flex items-center gap-1">
                        <span className="opacity-70 text-[10px]">📍</span>
                        <span className="font-medium">{t.cidade ? `${t.cidade}/${t.uf}` : "N/A"}</span>
                      </div>

                      {/* Action buttons on the right */}
                      <div className="flex items-center gap-1 opacity-80 md:opacity-0 md:group-hover:opacity-100 hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditClick(t.id)}
                          title="Editar Tomador"
                          className="w-7 h-7 rounded-md flex items-center justify-center border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-150 dark:hover:bg-zinc-900 text-zinc-650 dark:text-zinc-400 hover:text-brand-red dark:hover:text-brand-red transition-all cursor-pointer"
                        >
                          <Edit className="size-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(t.id)}
                          title="Excluir Tomador"
                          className="w-7 h-7 rounded-md flex items-center justify-center border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-150 dark:hover:bg-zinc-900 text-zinc-650 dark:text-zinc-400 hover:text-red-500 transition-all cursor-pointer"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
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
        <form onSubmit={handleSave} className="flex-1 flex flex-col min-h-0 gap-6">

          {/* Tab selectors */}
          <div className="hidden md:flex border-b border-zinc-200/60 dark:border-zinc-800/80 gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setCurrentTab("dados")}
              className={cn(
                "w-full md:w-auto justify-start md:justify-center px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer",
                currentTab === "dados"  
                  ? "border-brand-red text-brand-red"
                  : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              )}
            >
              <FileText className="size-4" />
              <span>Dados Gerais</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab("endereco")}
              className={cn(
                "w-full md:w-auto justify-start md:justify-center px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer",
                currentTab === "endereco"
                  ? "border-brand-red text-brand-red"
                  : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              )}
            >
              <MapPin className="size-4" />
              <span>Endereço</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab("contatos")}
              className={cn(
                "w-full md:w-auto justify-start md:justify-center px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer",
                currentTab === "contatos"
                  ? "border-brand-red text-brand-red"
                  : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              )}
            >
              <Users className="size-4" />
              <span>Contatos ({formData.contatosAdicionais.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab("socios")}
              className={cn(
                "w-full md:w-auto justify-start md:justify-center px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer",
                currentTab === "socios"
                  ? "border-brand-red text-brand-red"
                  : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              )}
            >
              <UserCheck className="size-4" />
              <span>Quadro de Sócios ({formData.socios.length})</span>
            </button>
          </div>

          {/* Form Scroll Area */}
          <div className="flex-1 overflow-y-auto no-scrollbar pr-1 flex flex-col gap-8 md:block">

            {/* ──── TAB: DADOS ──── */}
            <div className={cn("space-y-6", currentTab !== "dados" && "md:hidden")}>

                <div className="bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-2xl p-6 space-y-6">
                  <h3 className="text-sm font-black text-brand-red uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Building className="size-4.5" />
                    <span>DADOS DE IDENTIFICAÇÃO</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Produtor */}
                    <div className="space-y-2">
                      <Label htmlFor="form-produtor" className="text-xs font-bold">Produtor</Label>
                      <NativeSelect
                        id="form-produtor"
                        value={formData.produtor}
                        onChange={(e) => setFormData(prev => ({ ...prev, produtor: e.target.value }))}
                        className="w-full h-10 [&>select]:h-10 [&>select]:rounded-xl [&>select]:border-zinc-200/80 dark:[&>select]:border-zinc-800/80"
                      >
                        <option value="CAJUINA SEGUROS">CAJUINA SEGUROS</option>
                      </NativeSelect>
                    </div>

                    {/* Corretora */}
                    <div className="space-y-2">
                      <Label htmlFor="form-corretora" className="text-xs font-bold">Corretora</Label>
                      <NativeSelect
                        id="form-corretora"
                        value={formData.corretora}
                        onChange={(e) => setFormData(prev => ({ ...prev, corretora: e.target.value }))}
                        className="w-full h-10 [&>select]:h-10 [&>select]:rounded-xl [&>select]:border-zinc-200/80 dark:[&>select]:border-zinc-800/80"
                      >
                        <option value="CAJUINA">CAJUINA</option>
                      </NativeSelect>
                    </div>

                    {/* CNPJ */}
                    <div className="space-y-2">
                      <Label htmlFor="form-cnpj" className="text-xs font-bold flex items-center gap-2">
                        CNPJ *
                        {cnpjLoading && (
                          <span className="flex items-center gap-1 text-[10px] font-normal text-brand-red opacity-80">
                            <span className="w-2.5 h-2.5 border border-brand-red border-t-transparent rounded-full animate-spin" />
                            Buscando...
                          </span>
                        )}
                      </Label>
                      <Input
                        id="form-cnpj"
                        placeholder="00.000.000/0000-00"
                        value={formData.cnpj}
                        onChange={(e) => {
                          const val = maskCNPJ(e.target.value);
                          setFormData(prev => ({ ...prev, cnpj: val }));
                          fetchCompanyByCnpj(val);
                        }}
                        className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-955/30"
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
                        className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-955/30"
                        required
                      />
                    </div>

                    {/* Nome Fantasia */}
                    <div className="space-y-2">
                      <Label htmlFor="form-nome-fantasia" className="text-xs font-bold">Nome Fantasia</Label>
                      <Input
                        id="form-nome-fantasia"
                        placeholder="Ex: ARCON CONSTRUTORA"
                        value={formData.nomeFantasia}
                        onChange={(e) => setFormData(prev => ({ ...prev, nomeFantasia: e.target.value }))}
                        className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-955/30"
                      />
                    </div>

                    {/* E-mail */}
                    <div className="space-y-2">
                      <Label htmlFor="form-email" className="text-xs font-bold">E-mail</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="form-email"
                          type="email"
                          placeholder="exemplo@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-955/30 flex-1"
                        />
                        <div className="flex items-center gap-2 select-none border border-zinc-250/10 px-3 py-2 rounded-xl h-10 bg-black/5 dark:bg-white/5 shrink-0">
                          <Checkbox
                            id="form-habilitar-email"
                            checked={formData.habilitarEmail}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, habilitarEmail: !!checked }))}
                          />
                          <Label htmlFor="form-habilitar-email" className="text-xs cursor-pointer">Habilitar e-mail</Label>
                        </div>
                      </div>
                    </div>

                    {/* Telefone */}
                    <div className="space-y-2">
                      <Label htmlFor="form-telefone" className="text-xs font-bold">Telefone</Label>
                      <Input
                        id="form-telefone"
                        placeholder="(00) 0000-0000"
                        value={formData.telefone}
                        onChange={(e) => setFormData(prev => ({ ...prev, telefone: maskTelefone(e.target.value) }))}
                        className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-955/30"
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
                        className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-955/30"
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
                        className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-955/30"
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
                        className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-955/30 min-h-[80px]"
                      />
                    </div>

                    {/* Checkbox Ativar Cotação */}
                    <div className="md:col-span-2 flex items-center gap-2 select-none mt-2">
                      <Checkbox
                        id="form-ativar-cotacao"
                        checked={formData.ativarCotacao}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativarCotacao: !!checked }))}
                      />
                      <Label htmlFor="form-ativar-cotacao" className="text-xs font-bold cursor-pointer">
                        Ativar Cotação Automática nas Seguradoras?
                      </Label>
                    </div>

                  </div>
                </div>
            </div>

            {/* ──── TAB: ENDEREÇO ──── */}
            <div className={cn("space-y-6", currentTab !== "endereco" && "md:hidden")}>
              <div className="bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-2xl p-6 space-y-6">
                <h3 className="text-sm font-black text-brand-red uppercase tracking-wider mb-2 flex items-center gap-2">
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
                      className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-955/30"
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
                      className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-955/30"
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
                      className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-955/30"
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
                      className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-955/30"
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
                      className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-955/30"
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
                      className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-955/30"
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
                      className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-955/30 text-center font-bold"
                    />
                  </div>

                </div>
              </div>
            </div>

            {/* ──── TAB: CONTATOS ──── */}
            <div className={cn("space-y-6", currentTab !== "contatos" && "md:hidden")}>

                {/* Add new contact form row */}
                <div className="bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-2xl p-6 space-y-4">
                  <h3 className="text-xs font-black text-brand-red uppercase tracking-wider mb-2 flex items-center gap-2">
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

                {/* Contacts table list (Desktop only) */}
                <div className="hidden md:block bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-2xl overflow-hidden mt-6">
                  <table className="w-full border-collapse text-left text-sm">
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
            <div className={cn("space-y-6", currentTab !== "socios" && "md:hidden")}>

                {/* Add new partner form row */}
                <div className="bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-2xl p-6 space-y-4">
                  <h3 className="text-xs font-black text-brand-red uppercase tracking-wider mb-2 flex items-center gap-2">
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

          </div>

          {/* Form action footer buttons */}
          <div className="flex items-center gap-3 border-t border-zinc-200/50 dark:border-zinc-800/50 pt-5 shrink-0">
            <Button
              type="submit"
              disabled={saving}
              className="bg-brand-red text-white hover:bg-brand-red/90 font-bold px-6 py-2.5 h-10.5 rounded-xl cursor-pointer shadow-md shadow-brand-red/10 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{saving ? "Salvando..." : "Salvar Cadastro"}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => {
                setView("list")
                setEditingId(null)
              }}
              className="border-zinc-200 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-semibold px-6 py-2.5 h-10.5 rounded-xl cursor-pointer transition-all"
            >
              <span>Cancelar</span>
            </Button>
          </div>

        </form>
      )}

    </div>
  )
}
