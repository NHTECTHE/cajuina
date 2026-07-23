"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { toast } from "sonner"

export default function RiscoEngenhariaPage() {
  const router = useRouter()

  const handleRegistrar = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Apólice de Risco de Engenharia registrada com sucesso!")
    router.back()
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
            Risco de Engenharia
          </h1>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleRegistrar} className="space-y-6">
        
        {/* Tomador / Beneficiário Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Tomador:</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Digite o nome do tomador..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="t1">Tomador 1</SelectItem>
                <SelectItem value="t2">Tomador 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Beneficiário:</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Digite o nome do beneficiário..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="b1">Beneficiário 1</SelectItem>
                <SelectItem value="b2">Beneficiário 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Seguradora / Produtor Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Seguradora:</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="s1">Seguradora 1</SelectItem>
                <SelectItem value="s2">Seguradora 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Produtor:</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="p1">Produtor 1</SelectItem>
                <SelectItem value="p2">Produtor 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Datas Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Data de Início</Label>
            <Input type="date" className="text-center" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Prazo</Label>
            <Input type="number" className="text-center" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Data Final</Label>
            <Input type="date" className="text-center" />
          </div>
        </div>

        {/* Valores e Emissão Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
          <div className="space-y-2 text-left">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1 text-center">LMI</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium">R$</span>
              <Input className="pl-9" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1 text-center">Data de Emissão</Label>
            <Input type="date" className="text-center" />
          </div>
        </div>

        {/* Premiações Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_1fr] items-end gap-6 text-center">
          <div className="space-y-2 text-left w-full">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1 text-center">Prêmio</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium">R$</span>
              <Input className="pl-9" />
            </div>
          </div>
          
          <div className="text-sm font-medium text-zinc-500 pb-2">%</div>
          
          <div className="space-y-2 w-full">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1 text-center">Comissão</Label>
            <Input className="text-center" />
          </div>

          <div className="space-y-2 w-full text-left">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1 text-center">Parcela</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Parcela" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Detalhes da Apólice Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] items-center gap-4">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 text-right md:pr-4">Nº Apólice</Label>
            <Input />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] items-center gap-4">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 text-right md:pr-4">Nº Contrato</Label>
            <Input />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] items-start gap-4">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 text-right md:pr-4 mt-2">Objeto</Label>
            <Textarea className="min-h-[100px]" />
          </div>
        </div>

        {/* Anexos Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Apólice:</Label>
            <Input type="file" className="text-zinc-500 dark:text-zinc-400 p-2 h-auto" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Boleto:</Label>
            <Input type="file" className="text-zinc-500 dark:text-zinc-400 p-2 h-auto" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center pt-2">
          <button 
            type="submit"
            className="px-10 py-3 bg-green-500 hover:bg-green-600 shadow-md shadow-green-500/20 text-white text-sm font-bold uppercase tracking-wider rounded-md transition-colors"
          >
            Registrar
          </button>
        </div>
      </form>
    </div>
  )
}
