"use client"

import * as React from "react"
import { TableSkeleton } from "@/components/ui/skeleton"
import { useState, useMemo, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  ArrowLeft, FileText, Search, FileDown, DollarSign, Mail, Phone, FileDigit, Pencil, Trash2, Send, Ban, Copy, Check, Upload
} from "lucide-react"
import { Input } from "@/components/ui/input"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

import { Button } from "@/components/ui/button"
import { apolicesApi, seguradorasApi, tomadoresApi, type ApoliceResponse, type SeguradoraResponse } from "@/services/api"
import { toast } from "sonner"

// Formata um decimal ("180.00") como moeda pt-BR. "—" quando não informado.
function formatBRL(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—"
  const num = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(num)) return "—"
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

// Converte data ISO "yyyy-mm-dd" para "dd/mm/yyyy". "—" quando vazio.
function isoToBR(iso: string | null | undefined): string {
  if (!iso) return "—"
  const parts = iso.split("T")[0].split("-")
  if (parts.length !== 3) return "—"
  const [y, m, d] = parts
  return `${d}/${m}/${y}`
}



function ApolicesPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const openId = searchParams.get("id")
  const initialView = openId || searchParams.get("view") === "details" ? "details" : "list"

  const [view, setView] = useState<"list" | "details">(() => {
    if (typeof window !== "undefined") {
      const storedView = sessionStorage.getItem("apolices_view");
      if (initialView !== "details" && storedView === "details") {
        return "details";
      }
    }
    return initialView;
  })
  const [selected, setSelected] = useState<ApoliceResponse | null>(() => {
    if (typeof window !== "undefined" && initialView !== "details") {
      const stored = sessionStorage.getItem("apolices_selected");
      if (stored) {
        try { return JSON.parse(stored); } catch(e) {}
      }
    }
    if (initialView === "details" && searchParams.get("mock") === "1") {
      return {
        id: 9999,
        numero_apolice: searchParams.get("numero") || "449555",
        cotacao: "4",
        tomador_nome: "SERGIO P DE REZENDE ADMINISTRACAO DE SEGUROS",
        tomador_cnpj: "22.013.182/0001-78",
        segurado_nome: null,
        modalidade_nome: "MODALIDADE EXEMPLO",
        seguradora_nome: "PORTO SEGURO",
        valor_seguradora: 150.00,
        data_inicio: null,
        data_final: null,
        prazo_dias: null,
        criado_em: "2026-07-18T12:00:00Z",
        emitido_por_nome: "ADMIN",
        edital: null,
        arquivo_apolice: null,
        arquivo_boleto: null
      } as unknown as ApoliceResponse
    }
    return null
  })

  const [apolices, setApolices] = useState<ApoliceResponse[]>([])
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("apolices_view", view);
      if (selected) {
        sessionStorage.setItem("apolices_selected", JSON.stringify(selected));
      } else {
        sessionStorage.removeItem("apolices_selected");
      }
    }
  }, [view, selected]);

  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Estados para envio de WhatsApp
  const [editableMessage, setEditableMessage] = useState("")
  const [telefoneDestino, setTelefoneDestino] = useState("")
  const [isLoadingTelefone, setIsLoadingTelefone] = useState(false)

  // Estados para envio de E-mail
  const [editableEmailMessage, setEditableEmailMessage] = useState("")
  const [emailDestino, setEmailDestino] = useState("")
  const [emailAssunto, setEmailAssunto] = useState("")
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  const [showEditModal, setShowEditModal] = useState(false)
  const [editStatusPremio, setEditStatusPremio] = useState("Pendente")
  const [editStatusComissao, setEditStatusComissao] = useState("A Receber")
  const [editObservacoes, setEditObservacoes] = useState("")
  const [editArquivoProposta, setEditArquivoProposta] = useState<File | null>(null)
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  const openEditModal = () => {
    if (!selected) return
    setEditStatusPremio(selected.status_pagamento_premio || "Pendente")
    setEditStatusComissao(selected.status_pagamento_comissao || "A Receber")
    setEditObservacoes(selected.observacoes || "")
    setEditArquivoProposta(null)
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!selected) return
    setIsSavingEdit(true)
    try {
      const formData = new FormData()
      formData.append("status_pagamento_premio", editStatusPremio)
      formData.append("status_pagamento_comissao", editStatusComissao)
      formData.append("observacoes", editObservacoes)
      if (editArquivoProposta) {
        formData.append("arquivo_proposta", editArquivoProposta)
      }
      
      const updated = await apolicesApi.update(selected.id, formData)
      setApolices((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
      setSelected(updated)
      setShowEditModal(false)
      toast.success("Apólice atualizada com sucesso!")
    } catch {
      toast.error("Erro ao atualizar apólice.")
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleDelete = () => {
    if (!selected) return
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selected) return
    
    try {
      await apolicesApi.remove(selected.id)
      toast.success("Apólice removida com sucesso!")
      setApolices(prev => prev.filter(a => a.id !== selected.id))
      setSelected(null)
      setView("list")
    } catch {
      toast.error("Erro ao remover a apólice.")
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  const generatedMessage = useMemo(() => {
    if (!selected) return ""
    const premio = Number(selected.valor_seguradora) || 0
    return `*Cajuína Seguros - Apólice Emitida* 🚀

Olá! Sua apólice foi emitida com sucesso.
*Segurado:* ${selected.segurado_nome || selected.tomador_nome}
*Seguradora:* ${selected.seguradora_nome}
*Prêmio:* ${formatBRL(premio)}

Agradecemos a confiança!`
  }, [selected])

  const emailMessage = useMemo(() => {
    if (!selected) return ""
    const premio = Number(selected.valor_seguradora) || 0
    return `Prezado(a),

Sua apólice foi emitida com sucesso.

Detalhes:
- Segurado: ${selected.segurado_nome || selected.tomador_nome}
- Seguradora: ${selected.seguradora_nome}
- Prêmio: ${formatBRL(premio)}

Atenciosamente,
Equipe Cajuína Seguros.`
  }, [selected])

  React.useEffect(() => {
    if (isMessageModalOpen || isEmailModalOpen) {
      if (isMessageModalOpen) setEditableMessage(generatedMessage)
      if (isEmailModalOpen) {
        setEditableEmailMessage(emailMessage)
        setEmailAssunto("Apólice Emitida - Cajuína Seguros")
      }
      
      if (selected?.tomador) {
        setIsLoadingTelefone(true)
        tomadoresApi.get(selected.tomador)
          .then(res => {
            if (isMessageModalOpen) setTelefoneDestino(res.celular || res.telefone || "")
            if (isEmailModalOpen) setEmailDestino(res.email || "")
          })
          .catch(() => {})
          .finally(() => setIsLoadingTelefone(false))
      }
    } else {
      setTelefoneDestino("")
      setEmailDestino("")
    }
  }, [isMessageModalOpen, isEmailModalOpen, generatedMessage, emailMessage, selected])

  const handleSendWhatsApp = () => {
    let phone = telefoneDestino.replace(/\D/g, "")
    if (!phone) {
      toast.error("Informe um número de telefone válido.")
      return
    }
    if (phone.length <= 11) {
      phone = "55" + phone
    }
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(editableMessage)}`
    window.open(url, '_blank')
    setIsMessageModalOpen(false)
  }

  const handleSendEmail = async () => {
    if (!emailDestino) {
      toast.error("Informe um e-mail de destino válido.")
      return
    }
    if (!selected) return

    setIsSendingEmail(true)
    try {
      await apolicesApi.enviarEmail(selected.id, {
        assunto: emailAssunto,
        mensagem: editableEmailMessage,
        destinatario: emailDestino
      })
      toast.success("E-mail enviado com sucesso!")
      setIsEmailModalOpen(false)
    } catch (err) {
      toast.error("Erro ao enviar o e-mail.")
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(generatedMessage)
    setIsMessageModalOpen(false)
    setShowSuccessModal(true)
  }

  const handleCopyEmailMessage = () => {
    navigator.clipboard.writeText(emailMessage)
    setIsEmailModalOpen(false)
    setShowSuccessModal(true)
  }


  // Ao chegar com ?id=, abre direto nos detalhes da apólice indicada
  // (ex.: logo após a emissão), sem passar pela listagem.
  React.useEffect(() => {
    if (!openId) return
    let active = true
    ;(async () => {
      try {
        const data = await apolicesApi.get(Number(openId))
        if (active) {
          setSelected(data)
          setView("details")
        }
      } catch {
        if (active) setView("list")
      } finally {
        if (active) router.replace("/dashboard/apolices")
      }
    })()
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId])

  // Busca geral: a tela filtra pelos campos específicos abaixo, então não há
  // input ligado a este termo por ora — a API já o aceita quando houver.
  const [searchQuery] = useState("")
  const [filterNumero, setFilterNumero] = useState("")
  const [filterTomador, setFilterTomador] = useState("")
  const [filterSeguradora, setFilterSeguradora] = useState("")
  const [seguradoras, setSeguradoras] = useState<SeguradoraResponse[]>([])

  React.useEffect(() => {
    let active = true
    seguradorasApi.list({ ativo: true }).then((data) => {
      if (active) setSeguradoras(data)
    }).catch(() => {})
    return () => { active = false }
  }, [])

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(5)

  React.useEffect(() => {
    if (view !== "list") return
    let active = true
    const handle = setTimeout(async () => {
      if (active) setLoading(true)
      try {
        const data = await apolicesApi.list({
          search: searchQuery.trim() || undefined,
          numero_apolice: filterNumero.trim() || undefined,
          tomador: filterTomador.trim() || undefined,
          seguradora: filterSeguradora.trim() || undefined,
        })
        if (active) {
          setApolices(data)
        }
      } catch {
        if (active) setApolices([])
      } finally {
        if (active) setLoading(false)
      }
    }, 300)
    return () => {
      active = false
      clearTimeout(handle)
    }
  }, [view, searchQuery, filterNumero, filterTomador, filterSeguradora])

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return apolices.slice(start, start + itemsPerPage)
  }, [apolices, currentPage, itemsPerPage])

  const totalPages = Math.max(1, Math.ceil(apolices.length / itemsPerPage))

  const handleRowClick = (apolice: ApoliceResponse) => {
    setSelected(apolice)
    setView("details")
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ──── LIST VIEW ──── */}
      {view === "list" && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-inherit">
                Lista de Apólices
              </h1>
              <p className="text-xs opacity-60 mt-0.5">
                Apólices emitidas e vigentes no sistema.
              </p>
            </div>
          </div>
          

            <div className="flex flex-col gap-4">
            {/* Table Actions / Filters */}
            <div className="custom-filters-card border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-3.5 shadow-sm">
              <div className="flex flex-col xl:flex-row xl:items-end gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-zinc-600 uppercase">Registros</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(parseInt(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="custom-filter-select w-full xl:w-20 px-2 h-9 border border-zinc-300 dark:border-zinc-800 rounded text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/20"
                  >
                    <option value={5} className="custom-filter-input">5</option>
                    <option value={10} className="custom-filter-input">10</option>
                    <option value={25} className="custom-filter-input">25</option>
                    <option value={50} className="custom-filter-input">50</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1 flex-1">
                  <span className="text-[11px] font-bold text-zinc-600 uppercase">Nº Apólice</span>
                  <Input
                    value={filterNumero}
                    onChange={(e) => {
                      setFilterNumero(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="custom-filter-input h-9 text-xs border-zinc-300 dark:border-zinc-800"
                  />
                </div>

                <div className="flex flex-col gap-1 flex-1">
                  <span className="text-[11px] font-bold text-zinc-600 uppercase">Tomador</span>
                  <Input
                    value={filterTomador}
                    onChange={(e) => {
                      setFilterTomador(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="custom-filter-input h-9 text-xs border-zinc-300 dark:border-zinc-800"
                  />
                </div>

                <div className="flex flex-col gap-1 flex-1">
                  <span className="text-[11px] font-bold text-zinc-600 uppercase">Seguradora</span>
                  <Input
                    value={filterSeguradora}
                    onChange={(e) => {
                      setFilterSeguradora(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="custom-filter-input h-9 text-xs border-zinc-300 dark:border-zinc-800"
                  />
                </div>

                <button className="order-first xl:order-last w-full xl:w-auto h-10 xl:h-9 px-4 bg-green-500 hover:bg-green-600 text-white rounded transition-colors flex items-center justify-center gap-2 self-start xl:self-auto shadow-sm">
                  <Search className="size-4" />
                  <span className="xl:hidden text-xs font-bold uppercase tracking-wider">Buscar Apólices</span>
                </button>
              </div>
            </div>

            {/* Table / List */}
            <div className="flex flex-col gap-2 mt-4">
              {/* Table Header for Desktop */}
              <div className="hidden xl:grid grid-cols-12 gap-4 px-5 py-2 text-[9px] font-bold uppercase tracking-wider opacity-65 border-b border-zinc-200/30 dark:border-zinc-800/30 text-center">
                <div className="col-span-2 text-left pl-5">Nº Apólice / Emissão</div>
                <div className="col-span-3 text-center -ml-4">Tomador / Contrato</div>
                <div className="col-span-2">Segurado</div>
                <div className="col-span-2">Seguradora / Modalidade</div>
                <div className="col-span-2">Prêmio</div>
                <div className="col-span-1">Ações</div>
              </div>

              {loading ? (
                <TableSkeleton rows={6} />
              ) : paginated.length > 0 ? (
                paginated.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => handleRowClick(a)}
                    className="cursor-pointer group bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-xl hover:border-brand-red/40 dark:hover:border-brand-red/40 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 hover:shadow-md transition-all duration-200 relative"
                  >
                    {/* ===== DESKTOP LAYOUT ===== */}
                    <div className="hidden xl:grid grid-cols-12 gap-4 items-center p-3.5 px-5 text-center">
                      {/* Apólice / Emissão */}
                      <div className="col-span-2 flex flex-col items-start gap-1 text-left pl-2">
                         <span className="font-bold text-xs tracking-tight text-[#e85c5c] dark:text-[#cf7458] uppercase">{a.numero_apolice}</span>
                         <span className="text-[10px] text-zinc-500 font-medium">{isoToBR(a.criado_em)}</span>
                      </div>
                      
                      {/* Tomador / Contrato */}
                      <div className="col-span-3 flex flex-col items-center gap-1 -ml-4">
                        <span className="font-bold text-xs tracking-tight text-zinc-800 dark:text-zinc-200 uppercase line-clamp-1" title={a.tomador_nome}>{a.tomador_nome}</span>
                        <span className="font-mono text-[10px] text-zinc-500 font-medium line-clamp-1" title={a.edital ?? ""}>{a.edital ?? "—"}</span>
                      </div>

                      {/* Segurado */}
                      <div className="col-span-2 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-medium text-zinc-650 dark:text-zinc-400 uppercase line-clamp-2" title={a.segurado_nome ?? "—"}>{a.segurado_nome ?? "—"}</span>
                      </div>

                      {/* Seguradora / Modalidade */}
                      <div className="col-span-2 flex flex-col items-center gap-1 text-[11px] text-zinc-650 dark:text-zinc-400 font-medium">
                        <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200 uppercase">{a.seguradora_nome}</span>
                        <span className="leading-tight line-clamp-1" title={a.modalidade_nome}>{a.modalidade_nome}</span>
                      </div>

                      {/* Prêmio */}
                      <div className="col-span-2 flex flex-col items-center justify-center gap-1 text-[11px] text-zinc-650 dark:text-zinc-400">
                        <span className="font-bold text-brand-red dark:text-[#cf7458] whitespace-nowrap">{formatBRL(a.valor_seguradora)}</span>
                      </div>

                      {/* Ações */}
                      <div className="col-span-1 flex items-center justify-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            if (a.arquivo_apolice) window.open(a.arquivo_apolice, "_blank")
                            else toast.error("Arquivo da Apólice não anexado nesta cotação.")
                          }}
                          className="w-6 h-6 rounded border border-red-200 text-[#e85c5c] dark:text-[#e85c5c] flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Visualizar PDF Apólice">
                          <FileDown className="size-3.5" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            if (a.arquivo_boleto) window.open(a.arquivo_boleto, "_blank")
                            else toast.error("Boleto/Financeiro não anexado nesta cotação.")
                          }}
                          className="w-6 h-6 rounded border border-zinc-200 text-zinc-500 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="Financeiro / Boleto">
                          <DollarSign className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* ===== MOBILE LAYOUT ===== */}
                    <div className="flex xl:hidden flex-col gap-4 text-left p-4">
                      <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
                        <span className="font-bold text-[#e85c5c] dark:text-[#cf7458] text-[13px]">{a.numero_apolice}</span>
                        <div className="flex gap-2 items-center">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              if (a.arquivo_apolice) window.open(a.arquivo_apolice, "_blank")
                              else toast.error("Arquivo da Apólice não anexado.")
                            }}
                            className="w-7 h-7 rounded border border-red-200 text-[#e85c5c] dark:text-[#cf7458] flex items-center justify-center bg-red-50/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Visualizar PDF Apólice" style={{backgroundColor:"transparent"}}>
                            <FileDown className="size-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              if (a.arquivo_boleto) window.open(a.arquivo_boleto, "_blank")
                              else toast.error("Boleto não anexado.")
                            }}
                            className="w-7 h-7 rounded border border-zinc-200 text-zinc-500 flex items-center justify-center bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 transition-colors" title="Financeiro / Boleto">
                            <DollarSign className="size-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-[14px] text-zinc-800 dark:text-zinc-200 uppercase leading-tight">{a.tomador_nome}</span>
                        <span className="text-[12px] text-zinc-500 font-mono tracking-tight line-clamp-1">{a.edital ?? "—"}</span>
                      </div>
                      
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Segurado:</span>
                        <span className="text-xs uppercase text-zinc-700 dark:text-zinc-300">{a.segurado_nome ?? "—"}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase">Seguradora:</span>
                          <span className="text-xs font-bold uppercase">{a.seguradora_nome}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 text-right">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase">Modalidade:</span>
                          <span className="text-[11px] uppercase truncate">{a.modalidade_nome}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-2 p-3 bg-zinc-50/80 dark:bg-zinc-800/30 rounded-lg">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase">Emissão:</span>
                          <span className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">{isoToBR(a.criado_em)}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 text-right">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase">Prêmio:</span>
                          <span className="text-[14px] font-black text-brand-red dark:text-[#cf7458]">{formatBRL(a.valor_seguradora)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-xl p-12 text-center mt-4">
                  <div className="flex flex-col items-center justify-center max-w-xs mx-auto">
                    <FileText className="size-5 text-zinc-400 mb-3 opacity-70" />
                    <h4 className="font-bold text-xs text-inherit">Nenhuma apólice encontrada</h4>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-2">
              <span>Mostrando {paginated.length} de {apolices.length} registro(s)</span>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 rounded-full bg-brand-red text-white flex items-center justify-center font-bold">
                  {currentPage}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="w-6 h-6 flex items-center justify-center hover:text-brand-red dark:hover:text-[#cf7458] transition-colors"
                >
                  2
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="w-6 h-6 flex items-center justify-center hover:text-brand-red dark:hover:text-[#cf7458] transition-colors"
                >
                  {'>'}
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className="w-6 h-6 flex items-center justify-center hover:text-brand-red dark:hover:text-[#cf7458] transition-colors"
                >
                  {'>|'}
                </button>
              </div>
            </div>
          </div>

      </>
      )}

      {/* ──── DETAILS VIEW ──── */}
      {view === "details" && selected && (
        <div className="flex flex-col gap-6 w-full">
          {/* Header Bar */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (searchParams.has("mock")) {
                  router.back()
                } else {
                  setView("list")
                }
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <ArrowLeft className="size-4" />
            </button>
            <h1 className="text-2xl font-light text-zinc-600 dark:text-zinc-300">
              Dados da Apólice
            </h1>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
            <h2 className="text-[#e85c5c] dark:text-[#cf7458] text-lg font-light tracking-wide uppercase">
              APÓLICE Nº {selected.numero_apolice}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Block 1: Partes Envolvidas */}
              <div className="flex flex-col gap-4 border border-zinc-100 dark:border-zinc-800 p-5 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/20">
                <h3 className="text-[10px] font-bold text-[#e85c5c] dark:text-[#cf7458] uppercase tracking-wider flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-red"></div>
                  Partes Envolvidas
                </h3>
                
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Tomador</span>
                  <span className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200 uppercase leading-tight">{selected.tomador_nome}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">{selected.tomador_cnpj}</span>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Segurado</span>
                  <span className="text-[12px] uppercase text-zinc-700 dark:text-zinc-300 leading-tight">{selected.segurado_nome ?? "—"}</span>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Modalidade</span>
                  <span className="text-[12px] uppercase text-zinc-700 dark:text-zinc-300">{selected.modalidade_nome}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Edital/Contrato</span>
                  <span className="text-[12px] uppercase text-zinc-700 dark:text-zinc-300 line-clamp-2" title={selected.edital || ""}>{selected.edital || "—"}</span>
                </div>
              </div>

              {/* Block 2: Apólice & Seguradora */}
              <div className="flex flex-col gap-4 border border-zinc-100 dark:border-zinc-800 p-5 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/20">
                <h3 className="text-[10px] font-bold text-[#e85c5c] dark:text-[#cf7458] uppercase tracking-wider flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-red"></div>
                  Dados da Emissão
                </h3>
                
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Seguradora</span>
                  <span className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200 uppercase">{selected.seguradora_nome}</span>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Nº da Apólice</span>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] uppercase text-zinc-700 dark:text-zinc-300 font-medium">{selected.numero_apolice}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Nº da Proposta</span>
                  <span className="text-[12px] uppercase text-zinc-700 dark:text-zinc-300">{selected.cotacao}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Produtor / Responsável</span>
                  <span className="text-[12px] uppercase text-zinc-700 dark:text-zinc-300">CAJUÍNA SEGUROS</span>
                  <span className="text-[10px] uppercase text-zinc-500">Usuário: {selected.emitido_por_nome || "—"}</span>
                </div>
              </div>

              {/* Block 3: Valores & Prazos */}
              <div className="flex flex-col gap-4 border border-zinc-100 dark:border-zinc-800 p-5 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/20">
                <h3 className="text-[10px] font-bold text-[#e85c5c] dark:text-[#cf7458] uppercase tracking-wider flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-red"></div>
                  Valores & Vigência
                </h3>
                
                <div className="flex flex-col gap-1 bg-white dark:bg-zinc-900 border border-brand-red/20 p-3 rounded-lg shadow-sm">
                  <span className="text-[10px] font-bold text-brand-red dark:text-[#cf7458] uppercase">Importância Segurada (IS)</span>
                  <span className="text-[18px] font-black text-brand-red dark:text-[#cf7458] tracking-tight">{formatBRL(selected.importancia_segurada)}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-1">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Início Vigência</span>
                    <span className="text-[12px] uppercase text-zinc-800 dark:text-zinc-200 font-medium">{isoToBR(selected.data_inicio)}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Fim Vigência</span>
                    <span className="text-[12px] uppercase text-zinc-800 dark:text-zinc-200 font-medium">{isoToBR(selected.data_final)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Prazo (Dias)</span>
                    <span className="text-[12px] uppercase text-zinc-700 dark:text-zinc-300">{selected.prazo_dias != null ? selected.prazo_dias : "—"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Data de Emissão</span>
                    <span className="text-[12px] uppercase text-zinc-700 dark:text-zinc-300">{isoToBR(selected.criado_em)}</span>
                  </div>
                </div>
              </div>
            </div>



            <hr className="border-zinc-100 dark:border-zinc-800/60 my-2" />

            {/* Detalhamento Financeiro (Tabelas) */}
            <div className="flex flex-col gap-6 text-[12px]">
              
              {/* ===== DESKTOP TABLE ===== */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-500 uppercase">
                    <tr>
                      <th className="py-2 font-bold w-1/3">Parte</th>
                      <th className="py-2 font-bold w-1/3">Valor Previsto</th>
                      <th className="py-2 font-bold w-1/3">Status Pagamento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                    <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                      <td className="py-3 font-bold text-zinc-800 dark:text-zinc-200">Prêmio Seguradora</td>
                      <td className="py-3 text-zinc-700 dark:text-zinc-300 font-bold">{formatBRL(selected.valor_seguradora)}</td>
                      <td className="py-3">
                         <div className="flex items-center gap-2">
                           <div className="w-9 h-4 bg-zinc-300 dark:bg-zinc-700 rounded-full flex items-center px-1 cursor-pointer">
                             <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                           </div>
                           <span className="font-bold text-[10px] text-zinc-500 uppercase">{selected.status_pagamento_premio || "Pendente"}</span>
                         </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 bg-green-50/30 dark:bg-green-900/10">
                      <td className="py-3 font-bold text-green-700 dark:text-green-500">Comissão Prevista</td>
                      <td className="py-3 text-green-700 dark:text-green-500 font-bold">
                        {(() => {
                          const seg = seguradoras.find(s => s.id === selected.seguradora)
                          if (!seg) return "R$ 0,00"
                          const calc = (Number(selected.valor_seguradora) * Number(seg.taxa_comissao)) / 100
                          return formatBRL(calc)
                        })()}
                      </td>
                      <td className="py-3">
                         <div className="flex items-center gap-2">
                           <div className="w-9 h-4 bg-zinc-300 dark:bg-zinc-700 rounded-full flex items-center px-1 cursor-pointer">
                             <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                           </div>
                           <span className="font-bold text-[10px] text-zinc-500 uppercase">{selected.status_pagamento_comissao || "A Receber"}</span>
                         </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ===== MOBILE CARDS ===== */}
              <div className="flex md:hidden flex-col gap-4">
                <div className="flex flex-col gap-3 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/30">
                  <div className="flex justify-between items-center border-b border-zinc-200/50 dark:border-zinc-800/50 pb-2">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">Prêmio Seguradora</span>
                    <span className="text-zinc-700 dark:text-zinc-300 font-black text-sm">{formatBRL(selected.valor_seguradora)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-bold uppercase">Status</span>
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-4 bg-zinc-300 dark:bg-zinc-700 rounded-full flex items-center px-1 cursor-pointer">
                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                      </div>
                      <span className="font-bold text-[10px] text-zinc-500 uppercase">{selected.status_pagamento_premio || "Pendente"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 p-4 border border-green-200 dark:border-green-900/30 rounded-lg bg-green-50/30 dark:bg-green-900/10">
                  <div className="flex justify-between items-center border-b border-green-200/50 dark:border-green-900/30 pb-2">
                    <span className="font-bold text-green-700 dark:text-green-500">Comissão Prevista</span>
                    <span className="text-green-700 dark:text-green-500 font-black text-sm">
                        {(() => {
                          const seg = seguradoras.find(s => s.id === selected.seguradora)
                          if (!seg) return "R$ 0,00"
                          const calc = (Number(selected.valor_seguradora) * Number(seg.taxa_comissao)) / 100
                          return formatBRL(calc)
                        })()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-bold uppercase">Status</span>
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-4 bg-zinc-300 dark:bg-zinc-700 rounded-full flex items-center px-1 cursor-pointer">
                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                      </div>
                      <span className="font-bold text-[10px] text-zinc-500 uppercase">{selected.status_pagamento_comissao || "A Receber"}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <hr className="border-zinc-100 dark:border-zinc-800/60 my-2" />

            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-300">Observações</span>
              <textarea 
                className="w-full h-16 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded p-2 text-xs text-zinc-600 dark:text-zinc-400 resize-none focus:outline-none focus:border-brand-red"
                readOnly
                value={selected.observacoes || ""}
              ></textarea>
            </div>

            <div className="border border-zinc-200 dark:border-zinc-800 rounded divide-y divide-zinc-200 dark:divide-zinc-800 mt-2">
              <div className="flex bg-zinc-50 dark:bg-zinc-800/50 p-3 text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                <div className="flex-1">Tipo</div>
                <div className="w-32 text-center">Visualizar</div>
              </div>
              
              <div className="flex items-center p-3 text-xs text-zinc-500">
                <div className="flex-1">Proposta</div>
                <div className="w-32 flex justify-center">
                  <button onClick={() => { if (selected.arquivo_proposta) window.open(selected.arquivo_proposta, "_blank"); else toast.error("Arquivo da Proposta não anexado.") }} className="hover:scale-110 transition-transform">
                    <FileDown className="size-4 text-[#e85c5c] dark:text-[#cf7458] cursor-pointer" />
                  </button>
                </div>
              </div>

              <div className="flex items-center p-3 text-xs text-zinc-500">
                <div className="flex-1">Apólice</div>
                <div className="w-32 flex justify-center">
                  <button 
                    onClick={() => {
                      if (selected.arquivo_apolice) window.open(selected.arquivo_apolice, "_blank")
                      else toast.error("Arquivo da Apólice não anexado.")
                    }} 
                    className="hover:scale-110 transition-transform"
                  >
                    <FileDown className="size-4 text-[#e85c5c] dark:text-[#cf7458] cursor-pointer" />
                  </button>
                </div>
              </div>

              <div className="flex items-center p-3 text-xs text-zinc-500">
                <div className="flex-1">Boleto</div>
                <div className="w-32 flex justify-center">
                  <button 
                    onClick={() => {
                      if (selected.arquivo_boleto) window.open(selected.arquivo_boleto, "_blank")
                      else toast.error("Arquivo do Boleto não anexado.")
                    }} 
                    className="hover:scale-110 transition-transform"
                  >
                    <FileDigit className="size-4 text-red-300 dark:text-[#cf7458] cursor-pointer" />
                  </button>
                </div>
              </div>

              <div className="flex items-center p-3 text-xs text-zinc-500">
                <div className="flex-1">Whatsapp</div>
                <div className="w-32 flex justify-center gap-3 text-green-500">
                  <button onClick={() => setIsMessageModalOpen(true)} className="hover:scale-110 transition-transform">
                    <Phone className="size-4 cursor-pointer" />
                  </button>
                </div>
              </div>

              <div className="flex items-center p-3 text-xs text-zinc-500">
                <div className="flex-1">Email</div>
                <div className="w-32 flex justify-center">
                  <button onClick={() => setIsEmailModalOpen(true)} className="hover:scale-110 transition-transform">
                    <Mail className="size-4 text-blue-400 cursor-pointer" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="md:col-span-12 flex flex-col sm:flex-row items-center gap-3 mt-8 pt-6 border-t border-zinc-200/50 dark:border-zinc-800/50 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                className="w-full sm:w-auto bg-red-50 dark:bg-red-500/10 text-red-600 border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/30 font-semibold px-4 py-2.5 h-10.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 sm:mr-auto"
              >
                <Trash2 className="size-4" />
                Excluir
              </Button>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDelete}
                  className="w-full sm:w-auto border-orange-200 dark:border-orange-500/20 text-orange-600 bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/30 font-semibold h-10.5 px-6 rounded-xl flex items-center justify-center gap-2"
                >
                  <Ban className="size-4" />
                  Cancelar Apólice
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto border-blue-200 dark:border-blue-500/20 text-blue-600 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/30 font-semibold h-10.5 px-6 rounded-xl flex items-center justify-center gap-2"
                >
                  <Send className="size-4" />
                  Reenviar Email
                </Button>
              </div>
            </div>

          </div>

          {/* Modal Excluir/Cancelar Apólice */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent aria-describedby={undefined} className="sm:max-w-[450px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-red-500 text-lg font-bold tracking-wide flex items-center gap-2">
                  <Trash2 className="size-5" />
                  REMOVER APÓLICE
                </DialogTitle>
              </DialogHeader>
              
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700/50 mt-2">
                <p className="text-[14px] text-zinc-700 dark:text-zinc-300">
                  Tem certeza que deseja cancelar e remover esta apólice?
                </p>
                <p className="text-[14px] text-zinc-500 mt-2 font-medium">
                  A cotação retornará para o status de <span className="font-bold text-zinc-700 dark:text-zinc-300">Aprovada</span>.
                </p>
              </div>
              
              <div className="mt-4 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-zinc-200 dark:border-zinc-700">Cancelar</Button>
                <Button 
                  onClick={confirmDelete}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold"
                >
                  Sim, remover apólice
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Modal Mensagem WhatsApp */}
          <Dialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
            <DialogContent aria-describedby={undefined} className="sm:max-w-[450px] max-h-[90vh] flex flex-col bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-[#e85c5c] dark:text-[#cf7458] text-lg font-bold tracking-wide flex items-center gap-2">
                  <WhatsAppIcon className="size-5" />
                  MENSAGEM PARA O CLIENTE
                </DialogTitle>
              </DialogHeader>
              
              <div className="flex flex-col gap-4 mt-2 overflow-y-auto pr-2">
                <div className="space-y-1.5">
                  <Label className="text-zinc-600 dark:text-zinc-300">Telefone do Destinatário</Label>
                  <Input 
                    value={telefoneDestino}
                    onChange={(e) => setTelefoneDestino(e.target.value)}
                    placeholder="(00) 00000-0000"
                    disabled={isLoadingTelefone}
                    className="bg-zinc-50 dark:bg-zinc-800/50"
                  />
                </div>
                
                <div className="space-y-1.5 flex flex-col">
                  <Label className="text-zinc-600 dark:text-zinc-300">Mensagem</Label>
                  <Textarea 
                    value={editableMessage}
                    onChange={(e) => setEditableMessage(e.target.value)}
                    className="min-h-[150px] resize-y text-[13px] bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 font-sans"
                  />
                </div>
              </div>
              
              <div className="mt-4 flex justify-between shrink-0">
                <Button 
                  onClick={handleCopyMessage}
                  variant="ghost"
                  className="gap-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  <Copy className="size-4" />
                  <span>Copiar</span>
                </Button>
                <Button 
                  onClick={handleSendWhatsApp}
                  className="gap-2 bg-green-500 hover:bg-green-600 text-white"
                >
                  <WhatsAppIcon className="size-4" />
                  <span>Enviar WhatsApp</span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Modal Mensagem Email */}
          <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
            <DialogContent aria-describedby={undefined} className="sm:max-w-[550px] max-h-[90vh] flex flex-col bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-blue-500 text-lg font-bold tracking-wide flex items-center gap-2">
                  <Mail className="size-5" />
                  MENSAGEM DE E-MAIL
                </DialogTitle>
              </DialogHeader>
              
              <div className="flex flex-col gap-4 mt-2 overflow-y-auto pr-2">
                <div className="space-y-1.5">
                  <Label className="text-zinc-600 dark:text-zinc-300">E-mail do Destinatário</Label>
                  <Input 
                    value={emailDestino}
                    onChange={(e) => setEmailDestino(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="bg-zinc-50 dark:bg-zinc-800/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-zinc-600 dark:text-zinc-300">Assunto</Label>
                  <Input 
                    value={emailAssunto}
                    onChange={(e) => setEmailAssunto(e.target.value)}
                    placeholder="Assunto do e-mail"
                    className="bg-zinc-50 dark:bg-zinc-800/50"
                  />
                </div>
                
                <div className="space-y-1.5 flex flex-col">
                  <Label className="text-zinc-600 dark:text-zinc-300">Mensagem</Label>
                  <Textarea 
                    value={editableEmailMessage}
                    onChange={(e) => setEditableEmailMessage(e.target.value)}
                    className="min-h-[150px] flex-1 resize-y text-[13px] bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 font-sans"
                  />
                </div>
              </div>
              
              <div className="mt-4 flex justify-end shrink-0">
                <Button 
                  onClick={handleSendEmail}
                  disabled={isSendingEmail}
                  className="gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Mail className="size-4" />
                  <span>{isSendingEmail ? "Enviando..." : "Enviar e-mail"}</span>
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

          {/* Modal Editar Apólice */}
          <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
            <DialogContent aria-describedby={undefined} className="sm:max-w-[450px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-zinc-900 dark:text-zinc-100 text-lg font-bold">
                  Editar Apólice
                </DialogTitle>
              </DialogHeader>
              
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">Status Prêmio Seguradora</Label>
                  <Select value={editStatusPremio} onValueChange={setEditStatusPremio}>
                    <SelectTrigger className="w-full h-10 border-zinc-300">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Pago">Pago</SelectItem>
                      <SelectItem value="Atrasado">Atrasado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">Status Comissão Prevista</Label>
                  <Select value={editStatusComissao} onValueChange={setEditStatusComissao}>
                    <SelectTrigger className="w-full h-10 border-zinc-300">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A Receber">A Receber</SelectItem>
                      <SelectItem value="Recebido">Recebido</SelectItem>
                      <SelectItem value="Atrasado">Atrasado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">Observações</Label>
                  <textarea
                    className="w-full h-20 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-md p-3 text-sm text-zinc-800 dark:text-zinc-200 resize-none focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all shadow-sm"
                    value={editObservacoes}
                    onChange={(e) => setEditObservacoes(e.target.value)}
                  ></textarea>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">Arquivo da Proposta</Label>
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => document.getElementById("file-proposta-upload")?.click()}
                      className="gap-2"
                    >
                      <Upload className="size-4" />
                      Anexar
                    </Button>
                    <input 
                      type="file" 
                      id="file-proposta-upload" 
                      className="hidden" 
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setEditArquivoProposta(e.target.files[0])
                      }}
                    />
                    {editArquivoProposta && <span className="text-xs text-zinc-500 truncate max-w-[200px]">{editArquivoProposta.name}</span>}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancelar</Button>
                <Button 
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit}
                  className="bg-brand-red hover:bg-brand-red/90 text-white font-bold"
                >
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

        </div>
      )}

    </div>
  )
}

export default function ApolicesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Carregando...</div>}>
      <ApolicesPageContent />
    </Suspense>
  )
}
