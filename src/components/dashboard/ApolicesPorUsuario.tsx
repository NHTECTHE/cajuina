"use client"

import * as React from "react"
import { ChevronDown, User } from "lucide-react"
import { formatarBRL } from "./BlocoEstado"

const mockData = [
  { id: 1, name: 'Ananda Oliveira', value: 172000, color: '#0ea5e9' },
  { id: 2, name: 'Érica Cordeiro', value: 138000, color: '#22c55e' },
  { id: 3, name: 'Natália Oliveira', value: 117000, color: '#eab308' },
  { id: 4, name: 'Ytallo Gomes', value: 82000, color: '#a855f7' },
  { id: 5, name: 'Wanderson Bacelar', value: 67000, color: '#06b6d4' },
  { id: 6, name: 'Kenedy Linhares', value: 45000, color: '#f97316' },
  { id: 7, name: 'Nayana Bacelar', value: 28000, color: '#ef4444' },
  { id: 8, name: 'Tomadores (Clientes)', value: 42000, color: '#ef4444' },
]

export function ApolicesPorUsuario() {
  const max = Math.max(...mockData.map(d => d.value))

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-zinc-600 dark:text-zinc-400 font-medium text-sm">
          Valor de apólices por usuário
        </h3>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            Este mês
            <ChevronDown className="w-3 h-3" />
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            Todas as seguradoras
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 flex-1 relative mt-2">
        {mockData.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div 
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${item.color}20`, color: item.color }}
            >
              <User className="w-3 h-3" />
            </div>
            
            <div className="w-32 shrink-0">
              <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate block">
                {item.name}
              </span>
            </div>
            
            <div className="flex-1 flex items-center gap-3">
              <div className="flex-1 h-2 bg-transparent rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ 
                    width: `${(item.value / max) * 100}%`,
                    backgroundColor: item.color 
                  }} 
                />
              </div>
              <span className="text-xs text-zinc-500 w-24 text-right tabular-nums">
                {formatarBRL(String(item.value))}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between text-[10px] text-zinc-400 mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 ml-40">
        <span>R$ 0</span>
        <span>R$ 40k</span>
        <span>R$ 80k</span>
        <span>R$ 120k</span>
        <span>R$ 160k</span>
        <span>R$ 200k</span>
      </div>
    </div>
  )
}
