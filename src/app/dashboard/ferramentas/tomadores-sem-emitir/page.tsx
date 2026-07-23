"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function TomadoresSemEmitirPage() {
  const router = useRouter()

  const handleContinuar = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <div className="flex-1 flex flex-col gap-6 py-2 w-full max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <h1 className="text-2xl font-light tracking-tight text-zinc-600 dark:text-zinc-400">
            Tomadores Ativos
          </h1>
        </div>
      </div>

      <div className="flex justify-center mt-10">
        <form onSubmit={handleContinuar} className="w-full max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-[#e85c5c] dark:text-[#cf7458] font-light tracking-wide text-lg uppercase mb-6">
              DADOS
            </h2>
            
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 ml-1">Data</label>
                  <Input type="date" className="w-full text-zinc-600 dark:text-zinc-300" />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 ml-1">Qnt. Dias</label>
                  <Input type="number" className="w-full text-zinc-600 dark:text-zinc-300" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 ml-1">Produtor</label>
                  <select className="flex h-9 w-full items-center justify-between rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-zinc-600 dark:text-zinc-300">
                    <option>Todos</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end mt-2">
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-[#e85c5c] hover:bg-[#cf5151] text-white text-xs font-bold uppercase tracking-wide rounded transition-colors shadow-sm"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
