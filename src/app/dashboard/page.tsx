"use client"

import * as React from "react"
import { 
  FileText, 
  Building,
  DollarSign,
  AlertCircle
} from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex-1 flex flex-col gap-8 w-full pb-12 overflow-x-hidden px-4 md:px-8 pt-4">
      
      {/* ──── TOP HEADER ──── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-light tracking-tight text-zinc-600 dark:text-zinc-400">
          Página Inicial
        </h1>
        <button className="px-4 py-2 bg-brand-red hover:bg-brand-red/90 text-white text-xs font-bold uppercase tracking-wide rounded transition-colors shadow-sm">
          Enviar Notificação
        </button>
      </div>

      {/* ──── VISÃO GERAL SECTION ──── */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <h2 className="text-brand-red font-light tracking-wide text-lg uppercase">
            Visão Geral
          </h2>
          <button className="px-4 py-1 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-600 dark:text-zinc-300 shadow-sm">
            Dia
          </button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          
          {/* Card 1: Produção */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm relative pt-5 pb-3 px-4 flex flex-col">
            <div className="absolute -top-4 left-4 w-10 h-10 bg-green-500 rounded flex items-center justify-center text-white shadow-md">
              <DollarSign className="size-5" />
            </div>
            <div className="text-right flex-1 flex flex-col justify-end mt-2">
              <p className="text-xs text-zinc-400">Produção</p>
              <p className="text-xl font-bold text-zinc-700 dark:text-zinc-200">R$ 0,00</p>
            </div>
            <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] text-zinc-400">Produção de 07/2026</p>
            </div>
          </div>

          {/* Card 2: Apólices */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm relative pt-5 pb-3 px-4 flex flex-col">
            <div className="absolute -top-4 left-4 w-10 h-10 bg-brand-red rounded flex items-center justify-center text-white shadow-md">
              <FileText className="size-5" />
            </div>
            <div className="text-right flex-1 flex flex-col justify-end mt-2">
              <p className="text-xs text-zinc-400">Apólices</p>
              <p className="text-xl font-bold text-zinc-700 dark:text-zinc-200">0</p>
            </div>
            <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] text-zinc-400">Emissões de Hoje</p>
            </div>
          </div>

          {/* Card 3: Cancelamentos */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm relative pt-5 pb-3 px-4 flex flex-col">
            <div className="absolute -top-4 left-4 w-10 h-10 bg-brand-red rounded flex items-center justify-center text-white shadow-md">
              <AlertCircle className="size-5" />
            </div>
            <div className="text-right flex-1 flex flex-col justify-end mt-2">
              <p className="text-xs text-zinc-400">Cancelamentos Mês</p>
              <p className="text-xl font-bold text-zinc-700 dark:text-zinc-200">0</p>
            </div>
            <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] text-zinc-400">Apólices Canceladas 07/2026</p>
            </div>
          </div>

          {/* Card 4: Tomadores */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm relative pt-5 pb-3 px-4 flex flex-col">
            <div className="absolute -top-4 left-4 w-10 h-10 bg-cyan-500 rounded flex items-center justify-center text-white shadow-md">
              <Building className="size-5" />
            </div>
            <div className="text-right flex-1 flex flex-col justify-end mt-2">
              <p className="text-xs text-zinc-400">Tomadores mês</p>
              <p className="text-xl font-bold text-zinc-700 dark:text-zinc-200">0/0</p>
            </div>
            <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] text-zinc-400">Cadastrados em 07/2026</p>
            </div>
          </div>

        </div>
      </div>

      {/* ──── COTAÇÕES ROW ──── */}
      <div className="flex flex-col gap-6 mt-6">
        <div className="flex items-center justify-start gap-4">
          <h2 className="text-brand-red font-light tracking-wide text-lg uppercase">
            Cotações
          </h2>
        </div>

        {/* Cards Grid (Desktop/Tablet - Aligned Left) */}
        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-6 lg:w-[75%] self-start">
          
          {/* Pendentes */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm pt-4 pb-3 px-4 flex flex-col">
            <div className="text-left flex-1 flex flex-col justify-end">
              <p className="text-xs text-zinc-400">Pendentes</p>
              <p className="text-xl font-bold text-zinc-700 dark:text-zinc-200">58</p>
            </div>
            <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] text-zinc-400">Cotações em aberto</p>
            </div>
          </div>

          {/* Aprovadas */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm pt-4 pb-3 px-4 flex flex-col">
            <div className="text-left flex-1 flex flex-col justify-end">
              <p className="text-xs text-zinc-400">Aprovadas</p>
              <p className="text-xl font-bold text-zinc-700 dark:text-zinc-200">2</p>
            </div>
            <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] text-zinc-400">Aprovadas com sucesso</p>
            </div>
          </div>

          {/* Canceladas */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm pt-4 pb-3 px-4 flex flex-col">
            <div className="text-left flex-1 flex flex-col justify-end">
              <p className="text-xs text-zinc-400">Canceladas</p>
              <p className="text-xl font-bold text-zinc-700 dark:text-zinc-200">1338</p>
            </div>
            <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] text-zinc-400">Recusadas ou canceladas</p>
            </div>
          </div>

        </div>

        {/* Mobile View (Single Card) */}
        <div className="sm:hidden w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm p-4 flex flex-col">
          <div className="flex flex-col gap-3 text-xs text-zinc-600 dark:text-zinc-400 flex-1 justify-center">
            <div className="flex items-center justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
              <span>Pendentes:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">58</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
              <span>Aprovadas:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">2</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span>Canceladas:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">1338</span>
            </div>
          </div>
        </div>
      </div>

      {/* ──── COMISSÕES WIDE STRIP ──── */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm relative p-6 mt-6">
        <div className="absolute -top-4 left-4 w-10 h-10 bg-green-500 rounded flex items-center justify-center text-white shadow-md">
          <DollarSign className="size-5" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 text-center">
          <div>
            <p className="text-[10px] text-zinc-400 mb-2">Comissões A Receber</p>
            <p className="text-brand-red text-lg font-bold">R$794.665,58</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 mb-2">Valor Pago</p>
            <p className="text-brand-red text-lg font-bold">R$ 0,00</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 mb-2">Valor a Pagar</p>
            <p className="text-brand-red text-lg font-bold">R$ 0,00</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 mb-2">Valor em Atraso</p>
            <p className="text-brand-red text-lg font-bold">R$ 0,00</p>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <p className="text-[9px] text-zinc-300">Financeiro</p>
        </div>
      </div>

      {/* ──── APÓLICE A CANCELAR ──── */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm p-6 relative">
        <h3 className="text-brand-red font-light tracking-wide text-lg uppercase mb-1">
          Apólice a Cancelar
        </h3>
        <p className="text-[10px] text-zinc-400 mb-6">Autorizar / Recusar solicitações</p>

        {/* Floating Add Button Mockup */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-brand-red text-white rounded-full flex items-center justify-center shadow-lg opacity-50 pointer-events-none">
          +
        </div>

        <div className="flex flex-col md:flex-row items-center md:justify-between justify-end gap-4 mb-4 text-xs">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-zinc-400">Exibir</span>
            <select className="border border-zinc-200 dark:border-zinc-800 rounded p-1">
              <option>10</option>
            </select>
            <span className="text-zinc-400">registros por página</span>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-zinc-400">Filtrar:</span>
            <input type="text" className="border border-zinc-200 dark:border-zinc-800 rounded h-7 w-full md:w-40 px-2" />
          </div>
        </div>

        <div className="w-full">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse text-left text-[10px] whitespace-nowrap">
              <thead>
                <tr className="border-b-2 border-brand-red/50 text-brand-red font-bold">
                  <th className="py-2 pr-4 pl-2">Nº</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-2">Apólice</th>
                  <th className="py-2 px-2">Seguradora</th>
                  <th className="py-2 px-2">Tomador</th>
                  <th className="py-2 px-2">Usuário</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-600 dark:text-zinc-400">
                {[
                  { n: "2762", status: "Concluído", apolice: "10-0775-0525196", seg: "Junto Seguros", tomador: "G L A SERVICOS E EMPREENDIMENTOS", user: "Ananda Oliveira" },
                  { n: "2729", status: "Solicitar", apolice: "020712026000107750117099", seg: "AVLA", tomador: "ELLO DISTRIBUIDORA DE MEDICAMENTOS", user: "Érica Cordeiro" },
                  { n: "2651", status: "Solicitar", apolice: "020712025000107750095805", seg: "AVLA", tomador: "V R S DE CARVALHO", user: "Natalia Oliveira" },
                  { n: "2692", status: "Solicitar", apolice: "020712025000107750101112", seg: "AVLA", tomador: "RAMOS ENGENHARIA LTDA", user: "Natalia Oliveira" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="py-2 px-2">{row.n}</td>
                    <td className="py-2 px-2">{row.status}</td>
                    <td className="py-2 px-2 text-brand-red/70">{row.apolice}</td>
                    <td className="py-2 px-2">{row.seg}</td>
                    <td className="py-2 px-2">{row.tomador}</td>
                    <td className="py-2 px-2">{row.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-3 mt-2">
            {[
              { n: "2762", status: "Concluído", apolice: "10-0775-0525196", seg: "Junto Seguros", tomador: "G L A SERVICOS E EMPREENDIMENTOS", user: "Ananda Oliveira" },
              { n: "2729", status: "Solicitar", apolice: "020712026000107750117099", seg: "AVLA", tomador: "ELLO DISTRIBUIDORA DE MEDICAMENTOS", user: "Érica Cordeiro" },
              { n: "2651", status: "Solicitar", apolice: "020712025000107750095805", seg: "AVLA", tomador: "V R S DE CARVALHO", user: "Natalia Oliveira" },
              { n: "2692", status: "Solicitar", apolice: "020712025000107750101112", seg: "AVLA", tomador: "RAMOS ENGENHARIA LTDA", user: "Natalia Oliveira" },
            ].map((row, i) => (
              <div key={i} className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs flex flex-col gap-2 relative">
                <div className="flex justify-between items-center mb-1 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                  <span className="font-bold text-brand-red text-sm">Nº {row.n}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${row.status === 'Concluído' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'}`}>{row.status}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-zinc-500">Apólice:</span>
                  <span className="font-medium text-brand-red/70">{row.apolice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Seguradora:</span>
                  <span className="font-medium">{row.seg}</span>
                </div>
                <div className="flex flex-col mt-2 bg-white dark:bg-zinc-900 p-2.5 rounded border border-zinc-100 dark:border-zinc-800 shadow-sm">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wide">Tomador</span>
                  <span className="font-bold truncate mt-0.5">{row.tomador}</span>
                </div>
                <div className="flex justify-between items-center mt-2 border-t border-zinc-100 dark:border-zinc-800 pt-2">
                  <span className="text-zinc-500">Usuário:</span>
                  <span className="font-medium">{row.user}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
          <span>Mostrando 1 / 4 de 9 registro(s)</span>
          <div className="flex items-center gap-2">
            <button className="opacity-50">Anterior</button>
            <button className="w-5 h-5 bg-brand-red text-white rounded-full flex items-center justify-center font-bold">1</button>
            <button className="opacity-50">Próximo</button>
          </div>
        </div>
      </div>

      {/* ──── SEGURADORA PRÊMIO 2026 (CHART MOCKUP) ──── */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm p-6">
        <h3 className="text-brand-red font-light tracking-wide text-lg uppercase mb-6">
          Seguradora - Prêmio 2026
        </h3>
        
        {/* Fake chart visualization */}
        <div className="flex flex-col gap-4 text-xs">
          <div className="flex items-center gap-4">
            <span className="w-24 text-right text-zinc-500 truncate">Junto Seguros</span>
            <div className="flex-1 h-6 flex">
              <div className="w-[30%] bg-blue-400 h-full"></div>
              <div className="w-[60%] bg-zinc-400 h-full"></div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-24 text-right text-zinc-500 truncate">AVLA</span>
            <div className="flex-1 h-6 flex">
              <div className="w-[10%] bg-zinc-700 h-full"></div>
              <div className="w-[80%] bg-zinc-400 h-full"></div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-24 text-right text-zinc-500 truncate">ESSOR</span>
            <div className="flex-1 h-6 flex">
              <div className="w-[5%] bg-green-400 h-full"></div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-8 text-[10px] text-zinc-500">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-zinc-400"></div>Valor Atual</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-zinc-700"></div>Meta</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400"></div>Falta</div>
        </div>
      </div>

      {/* ──── NOVOS CADASTROS ──── */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm p-6">
        <h3 className="text-brand-red font-light tracking-wide text-lg uppercase mb-1">
          Novos Cadastros
        </h3>
        <p className="text-[10px] text-zinc-400 mb-6">Cadastros realizados recentemente</p>

        <div className="flex flex-col md:flex-row items-center md:justify-between justify-end gap-4 mb-4 text-xs">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-zinc-400">Exibir</span>
            <select className="border border-zinc-200 dark:border-zinc-800 rounded p-1">
              <option>10</option>
            </select>
            <span className="text-zinc-400">registros por página</span>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-zinc-400">Filtrar:</span>
            <input type="text" className="border border-zinc-200 dark:border-zinc-800 rounded h-7 w-full md:w-40 px-2" />
          </div>
        </div>

        <div className="w-full">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse text-left text-[10px] whitespace-nowrap">
              <thead>
                <tr className="border-b-2 border-brand-red/50 text-brand-red font-bold">
                  <th className="py-2 pr-4 pl-2">Nome</th>
                  <th className="py-2 px-2">Contato</th>
                  <th className="py-2 px-2">Telefone</th>
                  <th className="py-2 px-2">E-mail</th>
                  <th className="py-2 px-2">Realizado Por</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-600 dark:text-zinc-400">
                <tr>
                  <td colSpan={5} className="text-center py-4 text-zinc-400">
                    Nenhum registro encontrado
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-3 mt-2">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 text-center text-zinc-400 text-xs">
              Nenhum registro encontrado
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
          <span>Mostrando 0 / 0 de 0 registros</span>
          <div className="flex items-center gap-2">
            <button className="opacity-50">Anterior</button>
            <button className="opacity-50">Próximo</button>
          </div>
        </div>
      </div>

    </div>
  )
}
