"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function CartaNomeacaoPage() {
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
            Carta Nomeação
          </h1>
        </div>
      </div>

      <div className="flex justify-center mt-10">
        <form onSubmit={handleContinuar} className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-[#e85c5c] dark:text-[#cf7458] font-light tracking-wide text-lg uppercase mb-6">
              TOMADOR
            </h2>
            
            <div className="flex flex-col gap-6">
              <Input 
                placeholder="Digite o CNPJ" 
                type="text"
                className="w-full text-zinc-600 dark:text-zinc-300 border-b-2 border-t-0 border-l-0 border-r-0 border-zinc-200 dark:border-zinc-800 rounded-none shadow-none focus-visible:ring-0 focus-visible:border-[#e85c5c] px-0 placeholder:text-zinc-400 placeholder:text-xs"
              />

              <div className="flex justify-end mt-2">
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-[#e85c5c] hover:bg-[#cf5151] text-white text-xs font-bold uppercase tracking-wide rounded transition-colors shadow-sm cursor-pointer"
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
