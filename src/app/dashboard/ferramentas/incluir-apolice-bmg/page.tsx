"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function IncluirApoliceBMGPage() {
  const router = useRouter()

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <div className="flex-1 flex flex-col gap-6 py-2 w-full max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Incluir Apólice - BMG
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex justify-center mt-10">
        <form onSubmit={handleBuscar} className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-[#e85c5c] dark:text-[#cf7458] font-light tracking-wide text-lg uppercase mb-4">
              PESQUISAR Nº DA PROPOSTA
            </h2>
            
            <div className="space-y-4">
              <Input 
                placeholder="0" 
                type="number"
                className="w-full"
              />
              <div className="flex justify-end">
                <button 
                  type="submit"
                  className="px-6 py-2 bg-brand-red hover:bg-brand-red/90 text-white text-xs font-bold uppercase tracking-wide rounded transition-colors shadow-sm"
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
