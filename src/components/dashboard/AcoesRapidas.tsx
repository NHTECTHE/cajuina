"use client"

import * as React from "react"
import { Plus, UserPlus, Search, BarChart3 } from "lucide-react"

export function AcoesRapidas() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full bg-white dark:bg-[#1a1c23] border border-zinc-200 dark:border-zinc-800/60 rounded-xl shadow-sm p-4">
      <h3 className="text-zinc-600 dark:text-zinc-400 font-medium text-sm shrink-0 sm:mr-2">
        Ações rápidas
      </h3>
      
      <div className="flex flex-wrap items-center gap-3 w-full">
        <button className="flex items-center gap-2 px-3 py-1.5 text-xs text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-md transition-colors font-medium">
          <Plus className="w-3.5 h-3.5" />
          Nova cotação
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 text-xs text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-md transition-colors font-medium">
          <UserPlus className="w-3.5 h-3.5" />
          Novo tomador
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-md transition-colors">
          <Search className="w-3.5 h-3.5" />
          Consultar apólice
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-md transition-colors">
          <BarChart3 className="w-3.5 h-3.5 text-green-500" />
          Relatórios
        </button>
      </div>
    </div>
  )
}
