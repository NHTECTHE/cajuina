"use client"

import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

import { DashboardResumo } from "@/services/api"

export function GraficoCotacoesStatus({ resumo }: { resumo: DashboardResumo | null | undefined }) {
  const chartData = [
    { name: 'Em análise', value: resumo?.cotacoes?.iniciadas ?? 0, color: '#e63946' },
    { name: 'Aprovadas', value: resumo?.cotacoes?.aprovadas ?? 0, color: '#22c55e' },
    { name: 'Emitidas', value: resumo?.cotacoes?.emitidas ?? 0, color: '#8b5cf6' },
    { name: 'Recusadas', value: resumo?.cotacoes?.recusadas ?? 0, color: '#f59e0b' },
  ]
  
  const total = chartData.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <div className="flex flex-col w-full h-full">
      <h3 className="text-zinc-600 dark:text-zinc-400 font-medium text-sm mb-6">
        Cotações por status
      </h3>

      <div className="flex flex-col flex-1 items-center justify-center gap-8 mt-2">
        {/* Gráfico Donut */}
        <div className="relative w-[140px] h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                stroke="none"
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Texto Central */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-zinc-900 dark:text-white leading-tight">
              {total}
            </span>
            <span className="text-[10px] text-zinc-500">
              Total
            </span>
          </div>
        </div>

        {/* Legenda Customizada */}
        <div className="flex flex-col gap-3 w-full px-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-zinc-600 dark:text-zinc-400">{item.name}</span>
              </div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-200">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
