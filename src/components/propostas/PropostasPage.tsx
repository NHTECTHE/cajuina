"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import {
  ArrowLeft,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

// Mock Data Structure
interface PropostaMock {
  id: number
  tomador: string
  cnpj: string
  segurado: string
  modalidade: string
  is: string
  prazo: string
  data: string
  status: "Em Conclusão" | "Em Análise"
  premio: string
  emitidoPor: string
}

const mockPropostas: PropostaMock[] = [
  {
    id: 45717,
    tomador: "OLIARG SERVICOS LTDA",
    cnpj: "31.634.109/0001-04",
    segurado: "MUNICIPIO DE RIO REAL",
    modalidade: "Contrato / Executante Prestação de Serviços",
    is: "R$ 19.391,86",
    prazo: "186 Dias",
    data: "07/07/2026 16:45",
    status: "Em Conclusão",
    premio: "R$ 150,00",
    emitidoPor: "Filipe Chaves"
  },
  {
    id: 45716,
    tomador: "ARCON CONSTRUCOES E CONSULTORIA LTDA",
    cnpj: "07.137.727/0001-64",
    segurado: "SETUR PI - SECRETARIA DE ESTADO DO TURISMO",
    modalidade: "Edital / Licitação - Publico",
    is: "R$ 25.210,00",
    prazo: "60 Dias",
    data: "07/07/2026 15:53",
    status: "Em Conclusão",
    premio: "R$ 150,00",
    emitidoPor: "Filipe Chaves"
  },
  {
    id: 45715,
    tomador: "A DE C MAGALHAES",
    cnpj: "50.323.857/0001-10",
    segurado: "SECRETARIA DO AGRONEGOCIO E EMPREENDEDORISMO RURAL",
    modalidade: "Edital / Licitação - Publico",
    is: "R$ 8.111,42",
    prazo: "125 Dias",
    data: "28/04/2026 08:50",
    status: "Em Conclusão",
    premio: "R$ 150,00",
    emitidoPor: "ytallo"
  },
  {
    id: 45583,
    tomador: "M L FERNANDES SERVICOS",
    cnpj: "25.285.715/0001-69",
    segurado: "SECRETARIA DO AGRONEGOCIO E EMPREENDEDORISMO RURAL",
    modalidade: "Edital / Licitação - Publico",
    is: "R$ 9.803,90",
    prazo: "125 Dias",
    data: "01/03/2026 22:51",
    status: "Em Análise",
    premio: "Não Calculado",
    emitidoPor: "M L FERNANDES SERVICOS"
  },
  {
    id: 44398,
    tomador: "AMETISTA TERCEIRIZACOES E ENGENHARIA LTDA",
    cnpj: "29.828.673/0001-16",
    segurado: "MUNICIPIO DE CABACEIRAS",
    modalidade: "Edital / Licitação - Publico",
    is: "R$ 11.869,34",
    prazo: "95 Dias",
    data: "04/02/2026 17:19",
    status: "Em Análise",
    premio: "R$ 150,00",
    emitidoPor: "Ananda Oliveira"
  },
  {
    id: 43726,
    tomador: "LEANDRO SAMPAIO ENGENHARIA LTDA",
    cnpj: "22.328.425/0001-67",
    segurado: "MUNICIPIO DE SALGUEIRO",
    modalidade: "Edital / Licitação - Publico",
    is: "R$ 68.694,22",
    prazo: "95 Dias",
    data: "21/01/2026 16:25",
    status: "Em Análise",
    premio: "R$ 191,97",
    emitidoPor: "Érica Cordeiro"
  },
  {
    id: 43108,
    tomador: "DISTRIMED COMERCIO E REPRESENTACOES LTDA",
    cnpj: "08.516.958/0001-41",
    segurado: "MUNICIPIO DE MIGUEL ALVES",
    modalidade: "Edital / Licitação - Publico",
    is: "R$ 157.386,87",
    prazo: "95 Dias",
    data: "30/12/2025 14:02",
    status: "Em Análise",
    premio: "R$ 150,00",
    emitidoPor: "DISTRIMED COMERCIO E REPRESENTACOES LTDA"
  },
  {
    id: 40398,
    tomador: "GURGUEIA ENGENHARIA LTDA",
    cnpj: "46.292.068/0001-92",
    segurado: "MUNICIPIO DE PALMEIRA DO PIAUI",
    modalidade: "Edital / Licitação - Publico",
    is: "R$ 2.795,00",
    prazo: "95 Dias",
    data: "29/10/2025 08:41",
    status: "Em Análise",
    premio: "R$ 150,00",
    emitidoPor: "Ananda Oliveira"
  }
]

export default function PropostasPage() {
  const [view, setView] = useState<"list" | "details_conclusao" | "details_analise">("list")
  const [selectedProposta, setSelectedProposta] = useState<PropostaMock | null>(null)
  
  // List State
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)
  
  // Filter and Pagination Logic for List View
  const filteredPropostas = useMemo(() => {
    return mockPropostas.filter(c => 
      c.tomador.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.cnpj.includes(searchQuery)
    )
  }, [searchQuery])

  const paginatedPropostas = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredPropostas.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredPropostas, currentPage, itemsPerPage])

  const totalPages = Math.max(1, Math.ceil(filteredPropostas.length / itemsPerPage))

  const handleRowClick = (proposta: PropostaMock) => {
    setSelectedProposta(proposta)
    if (proposta.status === "Em Conclusão") {
      setView("details_conclusao")
    } else {
      setView("details_analise")
    }
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ──── LIST VIEW ──── */}
      {view === "list" && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-inherit">
                Lista de Cotações
              </h1>
              <p className="text-xs opacity-60 mt-0.5">
                Gerencie e acompanhe as cotações e propostas emitidas.
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
                <div className="col-span-2 text-center -ml-4">Tomador / CNPJ</div>
                <div className="col-span-2">Segurado</div>
                <div className="col-span-2">Modalidade</div>
                <div className="col-span-1">Prazo</div>
                <div className="col-span-1">Data</div>
                <div className="col-span-1">IS</div>
                <div className="col-span-1">Prêmio</div>
                <div className="col-span-1">Status</div>
              </div>

              {paginatedPropostas.length > 0 ? (
                paginatedPropostas.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleRowClick(t)}
                    className="cursor-pointer group bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-xl hover:border-brand-red/40 dark:hover:border-brand-red/40 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 hover:shadow-md transition-all duration-200 relative"
                  >
                    {/* ===== DESKTOP LAYOUT ===== */}
                    <div className="hidden xl:grid grid-cols-12 gap-4 items-center p-3.5 px-5 text-center">
                      <div className="col-span-1 flex items-center justify-start text-left text-[11px] font-bold text-zinc-500 pl-2">#{t.id}</div>
                      
                      {/* Tomador / CNPJ */}
                      <div className="col-span-2 flex flex-col items-center gap-1 -ml-4">
                        <span className="font-bold text-xs tracking-tight text-zinc-800 dark:text-zinc-200 uppercase line-clamp-1" title={t.tomador}>{t.tomador}</span>
                        <span className="font-mono text-[10px] text-zinc-500 font-medium">{t.cnpj}</span>
                      </div>

                      {/* Segurado */}
                      <div className="col-span-2 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-medium text-zinc-650 dark:text-zinc-400 uppercase line-clamp-2" title={t.segurado}>{t.segurado}</span>
                      </div>
                      
                      {/* Modalidade */}
                      <div className="col-span-2 flex flex-col items-center gap-1 text-[11px] text-zinc-650 dark:text-zinc-400 font-medium">
                        <span className="leading-tight line-clamp-2" title={t.modalidade}>{t.modalidade}</span>
                      </div>

                      {/* Prazo */}
                      <div className="col-span-1 flex flex-col items-center justify-center gap-1 text-[11px] text-zinc-650 dark:text-zinc-400">
                        <span className="font-medium text-[10px] whitespace-nowrap">{t.prazo}</span>
                      </div>

                      {/* Data */}
                      <div className="col-span-1 flex flex-col items-center justify-center gap-0.5 text-[11px] text-zinc-650 dark:text-zinc-400">
                        <span className="font-medium text-[10px] whitespace-nowrap">{t.data.split(" ")[0]}</span>
                        <span className="font-medium text-[10px] opacity-80 whitespace-nowrap">{t.data.split(" ")[1]}</span>
                      </div>

                      {/* IS */}
                      <div className="col-span-1 flex flex-col items-center justify-center gap-1 text-[11px] text-zinc-650 dark:text-zinc-400">
                         <span className="font-bold text-brand-red dark:text-brand-red/80 whitespace-nowrap">{t.is}</span>
                      </div>
                      
                      {/* Prêmio */}
                      <div className="col-span-1 flex flex-col items-center justify-center gap-1 text-[11px] text-zinc-650 dark:text-zinc-400">
                         <span className="font-medium text-[10px] whitespace-nowrap">{t.premio}</span>
                      </div>

                      {/* Status */}
                      <div className="col-span-1 flex items-center justify-center">
                        <span className={cn(
                          "whitespace-nowrap px-2 py-1 rounded text-[9px] font-bold uppercase",
                          t.status === "Em Conclusão" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                        )}>{t.status}</span>
                      </div>
                    </div>

                    {/* ===== MOBILE LAYOUT ===== */}
                    <div className="flex xl:hidden flex-col gap-4 text-left p-4">
                      <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
                        <span className="font-bold text-brand-red">#{t.id}</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                          t.status === "Em Conclusão" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                        )}>{t.status}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-[14px] text-zinc-800 dark:text-zinc-200 uppercase leading-tight">{t.tomador}</span>
                        <span className="text-[12px] text-zinc-500 font-mono tracking-tight">{t.cnpj}</span>
                      </div>
                      <div className="col-span-2 flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Segurado:</span>
                        <span className="text-xs uppercase">{t.segurado}</span>
                      </div>
                      <div className="col-span-2 flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Modalidade:</span>
                        <span className="text-xs uppercase">{t.modalidade}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase">IS:</span>
                          <span className="text-xs font-bold text-brand-red">{t.is}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 text-right">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase">Prazo / Data:</span>
                          <span className="text-xs">{t.prazo} - {t.data}</span>
                        </div>
                      </div>
                      <div className="col-span-2 flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800 pt-3 mt-1">
                        <div className="flex flex-col gap-0.5 text-left w-full">
                           <span className="text-[9px] font-bold text-zinc-500 uppercase">Prêmio:</span>
                           <span className="text-[12px] font-medium text-zinc-800 dark:text-zinc-200">{t.premio}</span>
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
              <span>Mostrando 1 / {Math.min(itemsPerPage, paginatedPropostas.length)} de {paginatedPropostas.length} registro(s)</span>
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

      {/* ──── DETAILS VIEW: EM CONCLUSÃO ──── */}
      {view === "details_conclusao" && selectedProposta && (
        <div className="flex flex-col gap-6 w-full">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => setView("list")}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-red-200 text-red-500 bg-white shadow-sm hover:bg-red-50 transition-colors"
            >
              <ArrowLeft className="size-4" />
            </button>
            <h1 className="text-3xl font-light text-zinc-600 dark:text-zinc-300">
              Emitir Cotação
            </h1>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm flex flex-col">
            <div className="flex flex-col items-center justify-center mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-6">
               <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">Deseja Prosseguir com a Emissão?</h2>
               <p className="text-sm text-zinc-500 mt-1">Confirme os dados abaixo antes de emitir a cotação.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left mb-8">
              {/* BLOCO 1: ENVOLVIDOS */}
              <div className="flex flex-col gap-5 bg-zinc-50 dark:bg-zinc-800/30 p-5 rounded-lg border border-zinc-100 dark:border-zinc-700/50">
                <h3 className="font-bold text-brand-red text-sm uppercase tracking-wider mb-2 border-b border-zinc-200 dark:border-zinc-700 pb-2">Envolvidos</h3>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-zinc-500 text-xs uppercase">Tomador</span>
                  <span className="uppercase text-[15px] text-zinc-800 dark:text-zinc-200 font-medium">{selectedProposta.cnpj} - {selectedProposta.tomador}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-zinc-500 text-xs uppercase">Segurado</span>
                  <span className="uppercase text-[15px] text-zinc-800 dark:text-zinc-200 font-medium">15.088.800/0001-83 - {selectedProposta.segurado}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-zinc-500 text-xs uppercase">Seguradora</span>
                  <span className="uppercase text-[15px] text-zinc-800 dark:text-zinc-200 font-medium">Junto Seguros</span>
                </div>
              </div>
              
              {/* BLOCO 2: DETALHES DA APÓLICE */}
              <div className="flex flex-col gap-5 bg-zinc-50 dark:bg-zinc-800/30 p-5 rounded-lg border border-zinc-100 dark:border-zinc-700/50">
                <h3 className="font-bold text-brand-red text-sm uppercase tracking-wider mb-2 border-b border-zinc-200 dark:border-zinc-700 pb-2">Detalhes da Apólice</h3>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-zinc-500 text-xs uppercase">Modalidade</span>
                  <span className="uppercase text-[15px] text-zinc-800 dark:text-zinc-200 font-medium">{selectedProposta.modalidade}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-zinc-500 text-xs uppercase">Edital / Contrato</span>
                  <span className="uppercase text-[15px] text-zinc-800 dark:text-zinc-200 font-medium">068-2026</span>
                </div>
              </div>

              {/* BLOCO 3: VALORES E VIGÊNCIA */}
              <div className="lg:col-span-2 flex flex-col bg-zinc-50 dark:bg-zinc-800/30 p-5 rounded-lg border border-zinc-100 dark:border-zinc-700/50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                  <h3 className="font-bold text-brand-red text-sm uppercase tracking-wider">Valores e Vencimento</h3>
                  <h3 className="font-bold text-brand-red text-sm uppercase tracking-wider hidden lg:block lg:pl-6">Vigência</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-700">
                  
                  {/* METADE ESQUERDA: VALORES */}
                  <div className="flex flex-col gap-5 lg:pr-6 pb-4 lg:pb-0">
                    <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-zinc-500 text-xs uppercase">Valor da Cobertura</span>
                        <span className="font-bold text-[18px] text-brand-red">{selectedProposta.is}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-zinc-500 text-xs uppercase">Valor (Prêmio)</span>
                        <span className="font-bold text-[18px] text-zinc-800 dark:text-zinc-200">{selectedProposta.premio}</span>
                      </div>
                      {/* Espaço vazio para manter a altura correta do grid e alinhar Vencimento debaixo do Prêmio */}
                      <div></div>
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-zinc-500 text-xs uppercase">Vencimento</span>
                        <span className="text-[15px] text-zinc-800 dark:text-zinc-200 font-medium">20/07/2026</span>
                      </div>
                    </div>
                  </div>

                  {/* METADE DIREITA: VIGÊNCIA E PRAZOS */}
                  <div className="flex flex-col gap-5 pt-0 lg:pl-6">
                    {/* Título Vigência apenas para mobile, já que no desktop ele fica no cabeçalho */}
                    <h3 className="font-bold text-brand-red text-sm uppercase tracking-wider block lg:hidden">Vigência</h3>
                    <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-zinc-500 text-xs uppercase">Início</span>
                        <span className="text-[15px] text-zinc-800 dark:text-zinc-200 font-medium">26/02/2026</span>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-zinc-500 text-xs uppercase">Total de Dias</span>
                        <span className="text-[15px] text-zinc-800 dark:text-zinc-200 font-medium">{selectedProposta.prazo}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-zinc-500 text-xs uppercase">Fim</span>
                        <span className="text-[15px] text-zinc-800 dark:text-zinc-200 font-medium">31/08/2026</span>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>

            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-6 mb-2 mx-auto max-w-2xl">
              Declaro, expressamente, ter lido, compreendido e concordado com as condições aqui estabelecidas, incluindo as condições gerais do presente seguro.
            </p>
            <p className="text-[13px] font-bold text-zinc-600 dark:text-zinc-500 mb-6">Sujeito a Análise e a Aprovação pela Seguradora</p>
            
            <div className="flex justify-center gap-1.5 mt-2">
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-md text-xs transition-colors">
                EXCLUIR
              </button>
              <button className="bg-zinc-500 hover:bg-zinc-600 text-white font-bold py-2.5 px-6 rounded-md text-xs transition-colors">
                EDITAR
              </button>
              <button className="bg-brand-red hover:bg-brand-red/90 text-white font-bold py-2.5 px-6 rounded-md text-xs transition-colors">
                EMITIR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──── DETAILS VIEW: EM ANÁLISE ──── */}
      {view === "details_analise" && selectedProposta && (
        <div className="flex flex-col gap-6 w-full">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => setView("list")}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-red-200 text-red-500 bg-white shadow-sm hover:bg-red-50 transition-colors"
            >
              <ArrowLeft className="size-4" />
            </button>
            <h1 className="text-3xl font-light text-zinc-600 dark:text-zinc-300">
              Cotação nº {selectedProposta.id}
            </h1>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm flex flex-col">
            <h2 className="text-[#e85c5c] text-lg font-light tracking-wide mb-6">INFORMAÇÕES DA COTAÇÃO</h2>
            
            <div className="flex flex-col gap-2 text-[13px] text-zinc-600 dark:text-zinc-400 mb-6">
              <p><strong className="text-zinc-800 dark:text-zinc-200 mr-1 font-bold">Cotação nº:</strong> <span className="text-[14px]">{selectedProposta.id}</span></p>
              <p><strong className="text-zinc-800 dark:text-zinc-200 mr-1 font-bold">Status:</strong> <span className="text-[14px]">{selectedProposta.status}</span></p>
              <p><strong className="text-zinc-800 dark:text-zinc-200 mr-1 font-bold">Submetido em:</strong> <span className="text-[14px]">29/10/2025 08:41</span></p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-6">
              <div className="flex flex-col gap-3 text-[13px] text-zinc-600 dark:text-zinc-400">
                <p><strong className="text-zinc-800 dark:text-zinc-200 mr-1 font-bold">Tomador:</strong> <span className="uppercase text-[15px] text-zinc-700 dark:text-zinc-300">{selectedProposta.tomador} - {selectedProposta.cnpj}</span></p>
                <p><strong className="text-zinc-800 dark:text-zinc-200 mr-1 font-bold">Modalidade:</strong> <span className="uppercase text-[15px] text-zinc-700 dark:text-zinc-300">{selectedProposta.modalidade}</span></p>
                <p><strong className="text-zinc-800 dark:text-zinc-200 mr-1 font-bold">Adicional Trabalhista:</strong> <span className="text-[14px]">Não</span></p>
                <p><strong className="text-zinc-800 dark:text-zinc-200 mr-1 font-bold">Edital/Contrato:</strong> <span className="uppercase text-[14px]">CONCORRÊNCIA 023/2025</span></p>
                <p><strong className="text-zinc-800 dark:text-zinc-200 mr-1 font-bold">Valor da Cobertura:</strong> <span className="font-bold text-[16px] text-brand-red">{selectedProposta.is}</span></p>
                
                <div className="mt-4 pt-4 text-[#e85c5c]">
                  <p><strong className="font-bold mr-1">Mensagem:</strong> Erro de requisição 503 &quot;\r\n</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 text-[13px] text-zinc-600 dark:text-zinc-400">
                <p><strong className="text-zinc-800 dark:text-zinc-200 mr-1 font-bold">Vigência de:</strong> <span className="text-[14px]">29/10/2025</span></p>
                <p><strong className="text-zinc-800 dark:text-zinc-200 mr-1 font-bold">Até:</strong> <span className="text-[14px]">01/02/2026</span></p>
                <p><strong className="text-zinc-800 dark:text-zinc-200 mr-1 font-bold">Total de Dias:</strong> <span className="text-[14px]">{selectedProposta.prazo}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
