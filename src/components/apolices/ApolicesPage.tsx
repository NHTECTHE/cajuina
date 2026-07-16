"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { 
  ArrowLeft, FileText, Search, FileDown, DollarSign, Mail, Phone, FileDigit
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { apolicesApi, type ApoliceResponse } from "@/services/api"

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



export default function ApolicesPage() {
  const [view, setView] = useState<"list" | "details">("list")
  const [selected, setSelected] = useState<ApoliceResponse | null>(null)

  const [apolices, setApolices] = useState<ApoliceResponse[]>([])
  const [loading, setLoading] = useState(false)

  // Busca geral: a tela filtra pelos campos específicos abaixo, então não há
  // input ligado a este termo por ora — a API já o aceita quando houver.
  const [searchQuery] = useState("")
  const [filterNumero, setFilterNumero] = useState("")
  const [filterTomador, setFilterTomador] = useState("")
  const [filterSeguradora, setFilterSeguradora] = useState("")

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
                <div className="bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-xl p-12 text-center mt-4">
                  <div className="flex flex-col items-center justify-center max-w-xs mx-auto">
                    <FileText className="size-5 text-zinc-400 mb-3 opacity-70 animate-pulse" />
                    <h4 className="font-bold text-xs text-inherit opacity-70">Carregando apólices...</h4>
                  </div>
                </div>
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
                            else alert("Arquivo da Apólice não anexado nesta cotação.")
                          }}
                          className="w-6 h-6 rounded border border-red-200 text-[#e85c5c] dark:text-[#e85c5c] flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Visualizar PDF Apólice">
                          <FileDown className="size-3.5" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            if (a.arquivo_boleto) window.open(a.arquivo_boleto, "_blank")
                            else alert("Boleto/Financeiro não anexado nesta cotação.")
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
                              else alert("Arquivo da Apólice não anexado.")
                            }}
                            className="w-7 h-7 rounded border border-red-200 text-[#e85c5c] dark:text-[#cf7458] flex items-center justify-center bg-red-50/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Visualizar PDF Apólice" style={{backgroundColor:"transparent"}}>
                            <FileDown className="size-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              if (a.arquivo_boleto) window.open(a.arquivo_boleto, "_blank")
                              else alert("Boleto não anexado.")
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
              onClick={() => setView("list")}
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
                  <span className="text-[10px] uppercase text-zinc-500">{selected.emitido_por_nome || "—"}</span>
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
                      <th className="py-2 font-bold w-1/5">Parte</th>
                      <th className="py-2 font-bold w-1/5">Valor Previsto</th>
                      <th className="py-2 font-bold w-1/5">Vencimento</th>
                      <th className="py-2 font-bold w-1/5">Status Pagamento</th>
                      <th className="py-2 font-bold w-1/5">Boleto/Recibo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                    <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                      <td className="py-3 font-bold text-zinc-800 dark:text-zinc-200">Prêmio Seguradora</td>
                      <td className="py-3 text-zinc-700 dark:text-zinc-300 font-bold">{formatBRL(selected.valor_seguradora)}</td>
                      <td className="py-3 text-zinc-600 dark:text-zinc-400">—</td>
                      <td className="py-3">
                         <div className="flex items-center gap-2">
                           <div className="w-9 h-4 bg-zinc-300 dark:bg-zinc-700 rounded-full flex items-center px-1 cursor-pointer">
                             <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                           </div>
                           <span className="font-bold text-[10px] text-zinc-500 uppercase">Pendente</span>
                         </div>
                      </td>
                      <td className="py-3 text-zinc-500">—</td>
                    </tr>
                    <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 bg-green-50/30 dark:bg-green-900/10">
                      <td className="py-3 font-bold text-green-700 dark:text-green-500">Comissão Prevista</td>
                      <td className="py-3 text-green-700 dark:text-green-500 font-bold">R$ 0,00</td>
                      <td className="py-3 text-zinc-600 dark:text-zinc-400">—</td>
                      <td className="py-3">
                         <div className="flex items-center gap-2">
                           <div className="w-9 h-4 bg-zinc-300 dark:bg-zinc-700 rounded-full flex items-center px-1 cursor-pointer">
                             <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                           </div>
                           <span className="font-bold text-[10px] text-zinc-500 uppercase">A Receber</span>
                         </div>
                      </td>
                      <td className="py-3 text-zinc-500">—</td>
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
                    <span className="text-zinc-500 font-bold uppercase">Vencimento</span>
                    <span className="text-zinc-600 dark:text-zinc-400">—</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-bold uppercase">Status</span>
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-4 bg-zinc-300 dark:bg-zinc-700 rounded-full flex items-center px-1 cursor-pointer">
                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                      </div>
                      <span className="font-bold text-[10px] text-zinc-500 uppercase">Pendente</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-bold uppercase">Boleto</span>
                    <span className="text-zinc-500">—</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 p-4 border border-green-200 dark:border-green-900/30 rounded-lg bg-green-50/30 dark:bg-green-900/10">
                  <div className="flex justify-between items-center border-b border-green-200/50 dark:border-green-900/30 pb-2">
                    <span className="font-bold text-green-700 dark:text-green-500">Comissão Prevista</span>
                    <span className="text-green-700 dark:text-green-500 font-black text-sm">R$ 0,00</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-bold uppercase">Vencimento</span>
                    <span className="text-zinc-600 dark:text-zinc-400">—</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-bold uppercase">Status</span>
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-4 bg-zinc-300 dark:bg-zinc-700 rounded-full flex items-center px-1 cursor-pointer">
                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                      </div>
                      <span className="font-bold text-[10px] text-zinc-500 uppercase">A Receber</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-bold uppercase">Recibo</span>
                    <span className="text-zinc-500">—</span>
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
                  <button onClick={() => alert("PDF da proposta não configurado.")} className="hover:scale-110 transition-transform">
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
                      else alert("Arquivo da Apólice não anexado.")
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
                      else alert("Arquivo do Boleto não anexado.")
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
                  <button onClick={() => alert("Integração com WhatsApp será implementada em breve.")} className="hover:scale-110 transition-transform">
                    <Phone className="size-4 cursor-pointer" />
                  </button>
                </div>
              </div>

              <div className="flex items-center p-3 text-xs text-zinc-500">
                <div className="flex-1">Email</div>
                <div className="w-32 flex justify-center">
                  <button onClick={() => alert("Envio por email será implementado em breve.")} className="hover:scale-110 transition-transform">
                    <Mail className="size-4 text-blue-400 cursor-pointer" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 mt-4 text-[9px] sm:text-xs">
              <button className="w-full sm:w-auto px-2 sm:px-5 py-2.5 sm:py-2 bg-[#e85c5c] text-white font-bold rounded hover:bg-red-600 transition-colors text-center leading-tight">
                EDITAR
              </button>
              <button className="w-full sm:w-auto px-2 sm:px-5 py-2.5 sm:py-2 bg-[#365b9e] text-white font-bold rounded hover:bg-blue-700 transition-colors text-center leading-tight">
                REENVIAR EMAIL
              </button>
              <button className="w-full sm:w-auto px-2 sm:px-5 py-2.5 sm:py-2 bg-orange-400 text-white font-bold rounded hover:bg-orange-500 transition-colors text-center leading-tight">
                CANCELAR APÓLICE
              </button>
              <button className="w-full sm:w-auto px-2 sm:px-5 py-2.5 sm:py-2 bg-zinc-400 text-white font-bold rounded hover:bg-zinc-500 transition-colors text-center leading-tight">
                EXCLUIR
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
