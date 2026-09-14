"use client"

import * as React from "react"
import { FileText, FileSignature, FileKey, ChevronRight, ArrowRight } from "lucide-react"

import { DashboardResumo } from "@/services/api"
import Link from "next/link"

export function Pendencias({ resumo }: { resumo: DashboardResumo | null | undefined }) {
  const pendenciasReais = [
    { 
      id: 1, 
      titulo: 'Documentos aguardando envio', 
      quantidade: 0, 
      icone: <FileText className="w-4 h-4 text-white" />, 
      corIcone: 'bg-red-500 shadow-red-500/20',
      link: '/dashboard/cotacoes'
    },
    { 
      id: 2, 
      titulo: 'Cotações aguardando análise', 
      quantidade: resumo?.cotacoes?.iniciadas ?? 0, 
      icone: <FileSignature className="w-4 h-4 text-white" />, 
      corIcone: 'bg-amber-500 shadow-amber-500/20',
      link: '/dashboard/cotacoes'
    },
    { 
      id: 3, 
      titulo: 'Apólices aguardando emissão', 
      quantidade: resumo?.cotacoes?.aprovadas ?? 0, 
      icone: <FileKey className="w-4 h-4 text-white" />, 
      corIcone: 'bg-orange-500 shadow-orange-500/20',
      link: '/dashboard/propostas'
    },
  ].filter(item => item.quantidade > 0)
  return (
    <div className="flex flex-col h-full w-full">
      <h3 className="text-zinc-600 dark:text-zinc-400 font-medium text-sm mb-6">
        Pendências
      </h3>

      <div className="flex flex-col gap-2 flex-1">
        {pendenciasReais.length === 0 ? (
          <div className="py-4 text-center text-sm text-zinc-500">
            Você não possui pendências.
          </div>
        ) : pendenciasReais.map((item) => (
          <Link 
            key={item.id}
            href={item.link}
            className="flex items-center gap-4 w-full p-3 bg-zinc-50 dark:bg-[#1f2128] hover:bg-zinc-100 dark:hover:bg-[#252830] transition-colors rounded-xl text-left border border-transparent dark:border-zinc-800/40"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${item.corIcone}`}>
              {item.icone}
            </div>
            
            <span className="flex-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {item.titulo}
            </span>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-zinc-900 dark:text-white">
                {item.quantidade}
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </div>
          </Link>
        ))}
      </div>

      <div className="pt-6 mt-auto">
        <Link href="/dashboard/cotacoes" className="flex items-center justify-center gap-2 w-full py-2 text-xs font-medium text-red-500 hover:text-red-600 transition-colors">
          Ver todas pendências
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
