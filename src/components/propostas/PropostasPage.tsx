"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { ArrowLeft, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cotacoesApi, type CotacaoResponse } from "@/services/api"

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
  const [y, m, d] = iso.split("-")
  if (!y || !m || !d) return "—"
  return `${d}/${m}/${y}`
}

export default function PropostasPage() {
  const [view, setView] = useState<"list" | "details">("list")
  const [selected, setSelected] = useState<CotacaoResponse | null>(null)

  // Propostas = cotações com status "Aprovado".
  const [propostas, setPropostas] = useState<CotacaoResponse[]>([])
  const [loading, setLoading] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)

  React.useEffect(() => {
    if (view !== "list") return
    let active = true
    const handle = setTimeout(async () => {
      if (active) setLoading(true)
      try {
        const data = await cotacoesApi.list({
          status: "Aprovado",
          search: searchQuery.trim() || undefined,
        })
        if (active) setPropostas(data)
      } catch {
        if (active) setPropostas([])
      } finally {
        if (active) setLoading(false)
      }
    }, 300)
    return () => {
      active = false
      clearTimeout(handle)
    }
  }, [view, searchQuery])

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return propostas.slice(start, start + itemsPerPage)
  }, [propostas, currentPage, itemsPerPage])

  const totalPages = Math.max(1, Math.ceil(propostas.length / itemsPerPage))

  const handleRowClick = (proposta: CotacaoResponse) => {
    setSelected(proposta)
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
                        <span className="whitespace-nowrap px-2 py-1 rounded text-[9px] font-bold uppercase bg-green-100 text-green-700">
                          {t.status}
                        </span>
                      </div>
                    </div>

                    {/* ===== MOBILE LAYOUT ===== */}
                    <div className="flex xl:hidden flex-col gap-4 text-left p-4">
                      <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
                        <span className="font-bold text-brand-red dark:text-[#cf7458]">#{t.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-700">
                          {t.status}
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

      {/* ──── DETAILS VIEW ──── */}
      {view === "details" && selected && (
        <div className="flex flex-col gap-6 w-full">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setView("list")}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-red-200 text-red-500 bg-white shadow-sm hover:bg-red-50 transition-colors"
            >
              <ArrowLeft className="size-4" />
            </button>
            <h1 className="text-3xl font-light text-zinc-600 dark:text-zinc-300">
              Proposta nº {selected.id}
            </h1>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm flex flex-col">
            <h2 className="text-[#e85c5c] dark:text-[#cf7458] text-lg font-light tracking-wide mb-6">INFORMAÇÕES DA PROPOSTA</h2>

            <div className="flex flex-col gap-2 text-[13px] text-zinc-600 dark:text-zinc-400 mb-6">
              <p><strong className="text-zinc-800 dark:text-zinc-200 mr-1 font-bold">Proposta nº:</strong> <span className="text-[14px]">{selected.id}</span></p>
              <p><strong className="text-zinc-800 dark:text-zinc-200 mr-1 font-bold">Status:</strong> <span className="text-[14px]">{selected.status}</span></p>
              <p><strong className="text-zinc-800 dark:text-zinc-200 mr-1 font-bold">Realizado por:</strong> <span className="text-[14px]">{selected.criado_por_nome ?? "—"}</span></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-6">
              <div className="flex flex-col gap-3 text-[13px] text-zinc-600 dark:text-zinc-400">
                <p><strong className="text-zinc-800 dark:text-zinc-200 mr-1 font-bold">Tomador:</strong> <span className="uppercase text-[15px] text-zinc-700 dark:text-zinc-300">{selected.tomador_nome} - {selected.tomador_cnpj}</span></p>
                <p><strong className="text-zinc-800 dark:text-zinc-200 mr-1 font-bold">Modalidade:</strong> <span className="uppercase text-[15px] text-zinc-700 dark:text-zinc-300">{selected.modalidade_nome}</span></p>
                <p><strong className="text-zinc-800 dark:text-zinc-200 mr-1 font-bold">Segurado:</strong> <span className="uppercase text-[15px] text-zinc-700 dark:text-zinc-300">{selected.segurado_nome ? `${selected.segurado_nome}${selected.segurado_cnpj ? ` - ${selected.segurado_cnpj}` : ""}` : "—"}</span></p>
                <p><strong className="text-zinc-800 dark:text-zinc-200 mr-1 font-bold">Edital/Contrato:</strong> <span className="uppercase text-[14px]">{selected.edital || "—"}</span></p>
                <p><strong className="text-zinc-800 dark:text-zinc-200 mr-1 font-bold">Valor da Cobertura:</strong> <span className="font-bold text-[16px] text-brand-red dark:text-[#cf7458]">{formatBRL(selected.importancia_segurada)}</span></p>
              </div>

              <div className="flex flex-col gap-3 text-[13px] text-zinc-600 dark:text-zinc-400">
                <p><strong className="text-zinc-800 dark:text-zinc-200 mr-1 font-bold">Vigência de:</strong> <span className="text-[14px]">{isoToBR(selected.data_inicio)}</span></p>
                <p><strong className="text-zinc-800 dark:text-zinc-200 mr-1 font-bold">Até:</strong> <span className="text-[14px]">{isoToBR(selected.data_final)}</span></p>
                <p><strong className="text-zinc-800 dark:text-zinc-200 mr-1 font-bold">Total de Dias:</strong> <span className="text-[14px]">{selected.prazo_dias != null ? `${selected.prazo_dias} dias` : "—"}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
