"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  UserCheck,
  ShieldCheck,
  Users,
  Globe,
  UserCog,
  LayoutGrid,
  KeyRound,
  BellRing,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

const ITEMS = [
  {
    label: "Corretores",
    description: "Gerencie o cadastro de corretores",
    icon: UserCheck,
    href: "/dashboard/corretores",
    iconBg: "bg-blue-50 dark:bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    label: "Usuários",
    description: "Gerencie os usuários do sistema",
    icon: Users,
    href: "/dashboard/usuarios",
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    label: "Segurados",
    description: "Gerencie o cadastro de segurados",
    icon: ShieldCheck,
    href: "/dashboard/segurados",
    iconBg: "bg-purple-50 dark:bg-purple-500/10",
    iconColor: "text-purple-500",
  },
  {
    label: "Produtores",
    description: "Gerencie o cadastro de produtores",
    icon: UserCog,
    href: "/dashboard/produtores",
    iconBg: "bg-red-50 dark:bg-brand-red/10",
    iconColor: "text-brand-red",
  },
  {
    label: "Modalidades",
    description: "Gerencie as modalidades de seguro",
    icon: LayoutGrid,
    href: "/dashboard/modalidades",
    iconBg: "bg-purple-50 dark:bg-purple-500/10",
    iconColor: "text-purple-500",
  },
  {
    label: "Seguradoras",
    description: "Gerencie o cadastro de seguradoras",
    icon: Globe,
    href: "/dashboard/seguradoras",
    iconBg: "bg-orange-50 dark:bg-orange-500/10",
    iconColor: "text-orange-500",
  },
  {
    label: "Alterar Senha",
    description: "Altere sua senha de acesso",
    icon: KeyRound,
    href: "/dashboard/alterar-senha",
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    label: "Alerta Login",
    description: "Configure alertas de acesso à conta",
    icon: BellRing,
    href: "/dashboard/ajustes/alerta-login",
    iconBg: "bg-orange-50 dark:bg-orange-500/10",
    iconColor: "text-orange-500",
  },
]

export default function AjustesPage() {
  const router = useRouter()

  return (
    <div className="flex-1 flex flex-col gap-8 py-2 w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
          Ajustes
        </h1>
        <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1">
          Configure e gerencie as opções do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative">
        {ITEMS.map(({ label, description, icon: Icon, href, iconBg, iconColor }) => (
          <button
            key={label}
            onClick={() => router.push(href)}
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
              <p className="text-[16px] font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-brand-red transition-colors duration-150 truncate">
                {label}
              </p>
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1.5 leading-snug truncate">
                {description}
              </p>
            </div>

            <ChevronRight className="size-5 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 transition-colors shrink-0" />
          </button>
        ))}

        <div className="hidden lg:block absolute right-0 bottom-0 opacity-[0.10] pointer-events-none w-72 h-40 bg-[url('/6.png')] bg-contain bg-no-repeat bg-right grayscale z-0" />
      </div>
    </div>
  )
}
