"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Eye, Pencil, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function RelatorioDiarioPage() {
  const router = useRouter()

  const handleCadastrar = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const reports = [
    {
      id: 1,
      email: "wanderson@cajuinaseguros.com.br",
      configuradoPor: "Wanderson Bacelar",
      data: "18/06/2020 22:08:49"
    },
    {
      id: 2,
      email: "suporte@cajuinaseguros.com.br",
      configuradoPor: "Wanderson Bacelar",
      data: "18/06/2020 22:08:54"
    }
  ]

  return (
    <div className="flex-1 flex flex-col gap-6 py-2 w-full max-w-6xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <h1 className="text-2xl font-light tracking-tight text-zinc-600 dark:text-zinc-400">
            Relatório Diário
          </h1>
        </div>
      </div>

      <div className="flex flex-col mt-6">
        <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
          <div className="p-6 sm:p-8">
            <h2 className="text-[#e85c5c] dark:text-[#cf7458] font-light tracking-wide text-lg uppercase mb-6">
              RELATÓRIO DIÁRIO
            </h2>
            
            <form onSubmit={handleCadastrar} className="flex flex-col gap-8">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 ml-1">Email</label>
                <Input 
                  type="email" 
                  className="w-full text-zinc-600 dark:text-zinc-300" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 pl-1">
                <div className="flex items-center space-x-2">
                  <Checkbox id="cb1" className="border-zinc-300 data-[state=checked]:bg-[#e85c5c] data-[state=checked]:border-[#e85c5c]" />
                  <Label htmlFor="cb1" className="text-xs text-zinc-500 dark:text-zinc-400 font-normal cursor-pointer">Apolices Emitidas no Dia</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="cb6" className="border-zinc-300 data-[state=checked]:bg-[#e85c5c] data-[state=checked]:border-[#e85c5c]" />
                  <Label htmlFor="cb6" className="text-xs text-zinc-500 dark:text-zinc-400 font-normal cursor-pointer">Tomadores Cadastrados no Dia</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="cb2" className="border-zinc-300 data-[state=checked]:bg-[#e85c5c] data-[state=checked]:border-[#e85c5c]" />
                  <Label htmlFor="cb2" className="text-xs text-zinc-500 dark:text-zinc-400 font-normal cursor-pointer">Valor Recebido no Dia</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="cb7" className="border-zinc-300 data-[state=checked]:bg-[#e85c5c] data-[state=checked]:border-[#e85c5c]" />
                  <Label htmlFor="cb7" className="text-xs text-zinc-500 dark:text-zinc-400 font-normal cursor-pointer">Comissões Recebidas no Dia</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="cb3" className="border-zinc-300 data-[state=checked]:bg-[#e85c5c] data-[state=checked]:border-[#e85c5c]" />
                  <Label htmlFor="cb3" className="text-xs text-zinc-500 dark:text-zinc-400 font-normal cursor-pointer">Lucro/Plus do Dia</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="cb8" className="border-zinc-300 data-[state=checked]:bg-[#e85c5c] data-[state=checked]:border-[#e85c5c]" />
                  <Label htmlFor="cb8" className="text-xs text-zinc-500 dark:text-zinc-400 font-normal cursor-pointer">Valor Total Emitido Seguradora</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="cb4" className="border-zinc-300 data-[state=checked]:bg-[#e85c5c] data-[state=checked]:border-[#e85c5c]" />
                  <Label htmlFor="cb4" className="text-xs text-zinc-500 dark:text-zinc-400 font-normal cursor-pointer">Valor Total Emitido Comissão</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="cb9" className="border-zinc-300 data-[state=checked]:bg-[#e85c5c] data-[state=checked]:border-[#e85c5c]" />
                  <Label htmlFor="cb9" className="text-xs text-zinc-500 dark:text-zinc-400 font-normal cursor-pointer">Valor Total Emitido Lucro/Plus</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="cb5" className="border-zinc-300 data-[state=checked]:bg-[#e85c5c] data-[state=checked]:border-[#e85c5c]" />
                  <Label htmlFor="cb5" className="text-xs text-zinc-500 dark:text-zinc-400 font-normal cursor-pointer">Cotações Realizadas no Dia</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="cb10" className="border-zinc-300 data-[state=checked]:bg-[#e85c5c] data-[state=checked]:border-[#e85c5c]" />
                  <Label htmlFor="cb10" className="text-xs text-zinc-500 dark:text-zinc-400 font-normal cursor-pointer">Cotações Aprovadas no Dia</Label>
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <button 
                  type="submit"
                  className="px-8 py-2.5 bg-[#e85c5c] hover:bg-[#cf5151] text-white text-xs font-bold uppercase tracking-wide rounded transition-colors shadow-sm"
                >
                  Cadastrar
                </button>
              </div>
            </form>

            <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 my-8"></div>

            {/* Listagem */}
            <div className="flex flex-col gap-6">
              {/* Filters bar */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Exibir</span>
                  <select className="border border-zinc-200 dark:border-zinc-800 rounded-md p-1 bg-transparent">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                  </select>
                  <span className="text-muted-foreground">registros por página</span>
                </div>
                
                <div className="flex items-center gap-2 text-xs w-full md:w-auto">
                  <span className="text-muted-foreground shrink-0">Filtrar:</span>
                  <Input type="text" className="h-8 w-full md:w-[200px]" />
                </div>
              </div>

              {/* Tabela de listagem */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-[11px] whitespace-nowrap">
                  <thead>
                    <tr className="border-b-2 border-purple-700 text-purple-700 font-bold">
                      <th className="py-2.5 pr-4 pl-2 font-bold cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        Email
                      </th>
                      <th className="py-2.5 pr-4 pl-2 font-bold cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between">
                          Configurado Por
                          <span className="opacity-50 text-[8px]">◆</span>
                        </div>
                      </th>
                      <th className="py-2.5 px-2 w-[120px]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {reports.map((item) => (
                      <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                        <td className="py-3 px-2 font-medium">{item.email}</td>
                        <td className="py-3 px-2">{item.configuradoPor} às {item.data}</td>
                        <td className="py-3 px-2">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="w-6 h-6 rounded flex items-center justify-center bg-zinc-400 hover:bg-zinc-500 text-white transition-colors">
                              <Eye className="size-3.5" />
                            </button>
                            <button className="w-6 h-6 rounded flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white transition-colors">
                              <Pencil className="size-3.5" />
                            </button>
                            <button className="w-6 h-6 rounded flex items-center justify-center bg-brand-red hover:bg-brand-red/90 text-white transition-colors">
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground border-t border-zinc-200 dark:border-zinc-800 pt-4">
                <span>Mostrando 1 / 2 de 2 registro(s)</span>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  <button type="button" className="opacity-50 cursor-not-allowed hover:opacity-100 transition-opacity px-2">Anterior</button>
                  <button type="button" className="w-6 h-6 rounded-full bg-brand-red text-white flex items-center justify-center font-bold">1</button>
                  <button type="button" className="text-brand-red font-semibold opacity-50 cursor-not-allowed transition-opacity px-2">Próximo</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
