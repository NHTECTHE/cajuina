"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  FilePlus, 
  Box, 
  Calendar, 
  Receipt, 
  MonitorSmartphone,
  ClipboardCheck,
  PiggyBank,
  Building2,
  FileSignature,
  ChevronRight,
  X,
  FileText
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

const ferramentas = [
  {
    title: "Incluir Apólice",
    subtitle: "Clique para cadastrar uma Apólice",
    iconBg: "bg-red-50 dark:bg-red-500/10",
    iconColor: "text-red-500",
    icon: FilePlus,
  },
  {
    title: "Incluir Apólice - Junto",
    subtitle: "Clique para adicionar uma Apólice",
    iconBg: "bg-cyan-50 dark:bg-cyan-500/10",
    iconColor: "text-cyan-500",
    icon: Box,
  },
  {
    title: "Incluir Apólice - Junto (Período)",
    subtitle: "Clique para adicionar uma Apólice",
    iconBg: "bg-teal-50 dark:bg-teal-500/10",
    iconColor: "text-teal-500",
    icon: Calendar,
  },
  {
    title: "Incluir Apólice - BMG",
    subtitle: "Clique para adicionar uma Apólice",
    iconBg: "bg-orange-50 dark:bg-orange-500/10",
    iconColor: "text-orange-500",
    icon: Box,
  },
  {
    title: "Incluir Apólice - JNS",
    subtitle: "Clique para adicionar uma Apólice",
    iconBg: "bg-cyan-50 dark:bg-cyan-500/10",
    iconColor: "text-cyan-500",
    icon: Box,
  },
  {
    title: "Carta Nomeação",
    subtitle: "Clique para gerar Carta Nomeação",
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    iconColor: "text-amber-500",
    icon: Receipt,
  },
  {
    title: "Relatório Diário",
    subtitle: "Clique para configurar",
    iconBg: "bg-zinc-100 dark:bg-zinc-500/10",
    iconColor: "text-zinc-500",
    icon: ClipboardCheck,
  },
  
  {
    title: "Tomadores Sem Emitir",
    subtitle: "Clique para verificar os tomadores",
    iconBg: "bg-red-50 dark:bg-red-500/10",
    iconColor: "text-red-500",
    icon: Building2,
  }
 
]

export function FerramentasPage() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  const handleToolClick = (title: string) => {
    if (title === "Incluir Apólice") {
      setIsModalOpen(true)
    } else if (title === "Incluir Apólice - Junto") {
      router.push("/dashboard/ferramentas/incluir-apolice-junto")
    } else if (title === "Incluir Apólice - Junto (Período)") {
      router.push("/dashboard/ferramentas/incluir-apolice-junto-periodo")
    } else if (title === "Incluir Apólice - JNS") {
      router.push("/dashboard/ferramentas/incluir-apolice-jns")
    } else if (title === "Carta Nomeação") {
      router.push("/dashboard/ferramentas/carta-nomeacao")
    } else if (title === "Relatório Diário") {
      router.push("/dashboard/ferramentas/relatorio-diario")
    } else if (title === "Tomadores Sem Emitir") {
      router.push("/dashboard/ferramentas/tomadores-sem-emitir")
    } else if (title === "Incluir Apólice - BMG") {
      router.push("/dashboard/ferramentas/incluir-apolice-bmg")
    }
  }

  return (
    <div className="flex-1 flex flex-col gap-8 py-2 w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
          Ferramentas
        </h1>
        <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1">
          Acesse ferramentas extras e utilitários do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 relative">
        {ferramentas.map(({ title, subtitle, icon: Icon, iconBg, iconColor }, idx) => (
          <button
            key={idx}
            onClick={() => handleToolClick(title)}
            className={cn(
              "group flex items-center text-left rounded-2xl border border-zinc-100 dark:border-zinc-800/60",
              "bg-white dark:bg-zinc-900 p-6 shadow-sm relative z-10",
              "hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800",
              "active:scale-[0.98] transition-all duration-200 cursor-pointer"
            )}
          >
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 mr-5",
              iconBg, iconColor
            )}>
              <Icon className="size-7" />
            </div>
            
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-[14px] font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-brand-red transition-colors duration-150 truncate">
                {title}
              </p>
              <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-1.5 leading-snug truncate">
                {subtitle}
              </p>
            </div>

            <ChevronRight className="size-5 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 transition-colors shrink-0" />
          </button>
        ))}

        <div className="hidden lg:block absolute right-0 bottom-0 opacity-[0.10] pointer-events-none w-72 h-40 bg-[url('/6.png')] bg-contain bg-no-repeat bg-right grayscale z-0" />
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[550px] p-5 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl">
          <DialogHeader className="mb-3">
            <DialogTitle className="text-xl font-black text-zinc-900 dark:text-zinc-50">Selecione</DialogTitle>
            <DialogDescription className="hidden">Escolha o tipo de apólice</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => router.push("/dashboard/ferramentas/incluir-apolice/risco-engenharia")}
              className="group flex flex-col items-center text-center p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center mb-3 text-cyan-500 group-hover:scale-110 transition-transform">
                <FileText className="size-6" />
              </div>
              <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-cyan-500 transition-colors">Risco de Engenharia</span>
              <span className="text-[10px] text-zinc-400 mt-1">Clique para incluir risco de eng.</span>
            </button>

            <button
              onClick={() => router.push("/dashboard/ferramentas/incluir-apolice/seguro-garantia")}
              className="group flex flex-col items-center text-center p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-red/10 flex items-center justify-center mb-3 text-brand-red group-hover:scale-110 transition-transform">
                <FilePlus className="size-6" />
              </div>
              <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-brand-red transition-colors">Seguro Garantia</span>
              <span className="text-[10px] text-zinc-400 mt-1">Clique para cadastrar apólice</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
