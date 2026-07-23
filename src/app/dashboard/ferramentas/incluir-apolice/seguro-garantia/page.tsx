"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { toast } from "sonner"

export default function SeguroGarantiaPage() {
  const router = useRouter()

  const handleAvançar = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Apólice de Seguro Garantia salva com sucesso!")
    router.back()
  }

  return (
    <div className="flex-1 flex flex-col gap-6 py-2 w-full max-w-5xl mx-auto">
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
            Cadastrar Apólice
          </h1>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/60">
          <h2 className="text-brand-red font-bold uppercase tracking-wider text-sm">
            Dados da Apólice
          </h2>
        </div>

        <form onSubmit={handleAvançar} className="p-6 space-y-6">
          {/* Row 1 */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Tomador</Label>
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

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Segurado</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Digite o nome do segurado..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="s1">Segurado 1</SelectItem>
                  <SelectItem value="s2">Segurado 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Modalidade</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="ESCOLHA..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="m1">Modalidade 1</SelectItem>
                  <SelectItem value="m2">Modalidade 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">IS</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium">R$</span>
                <Input className="pl-9" placeholder="Valor IS" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Prazo</Label>
              <Input placeholder="Quantos dias?" type="number" />
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Seguradora</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="ESCOLHA..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seg1">Seguradora 1</SelectItem>
                  <SelectItem value="seg2">Seguradora 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Parcelas Seguradora</Label>
              <Input defaultValue="1" type="number" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Parcelamento Cajuina</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="ESCOLHA UMA OPÇÃO" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="op1">Opção 1</SelectItem>
                  <SelectItem value="op2">Opção 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 5 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Emissão</Label>
              <Input type="date" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Produtor</Label>
              <Select defaultValue="areolino">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="ESCOLHA..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="areolino">AREOLINO DE ABREU</SelectItem>
                  <SelectItem value="outro">Outro Produtor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 6 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Nº Apólice</Label>
              <Input placeholder="Nº da Apólice" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Edital/Contrato</Label>
              <Input placeholder="Nº do Edital/Contrato" />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex gap-3">
            <button 
              type="submit"
              className="px-8 py-2.5 bg-brand-red hover:bg-brand-red/90 text-white text-xs font-bold uppercase tracking-wide rounded-md transition-colors"
            >
              Avançar
            </button>
            <button 
              type="button"
              onClick={() => router.back()}
              className="px-8 py-2.5 bg-zinc-400 hover:bg-zinc-500 text-white text-xs font-bold uppercase tracking-wide rounded-md transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
