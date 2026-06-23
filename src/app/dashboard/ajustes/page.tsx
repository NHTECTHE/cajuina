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
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

const CARDS = [
  {
    label: "Corretores",
    description: "Visualize e gerencie os corretores",
    icon: UserCheck,
    href: "/dashboard/corretores",
    color: "bg-sky-500",
  },
  {
    label: "Segurados",
    description: "Visualize e gerencie os segurados",
    icon: ShieldCheck,
    href: "/dashboard/segurados",
    color: "bg-zinc-500",
  },
  {
    label: "Produtores",
    description: "Visualize e gerencie os produtores",
    icon: UserCog,
    href: "/dashboard/produtores",
    color: "bg-brand-red",
  },
  {
    label: "Seguradoras",
    description: "Visualize e gerencie as seguradoras",
    icon: Globe,
    href: "/dashboard/seguradoras",
    color: "bg-amber-500",
  },
  {
    label: "Usuários",
    description: "Visualize e gerencie os usuários",
    icon: Users,
    href: "/dashboard/usuarios",
    color: "bg-emerald-500",
  },
  {
    label: "Modalidades",
    description: "Visualize e gerencie as modalidades",
    icon: LayoutGrid,
    href: "/dashboard/modalidades",
    color: "bg-violet-500",
  },
  {
    label: "Alterar Senha",
    description: "Altere sua senha de acesso",
    icon: KeyRound,
    href: "/dashboard/ajustes/senha",
    color: "bg-zinc-600",
  },
  {
    label: "Alerta Login",
    description: "Configure alertas de acesso à conta",
    icon: BellRing,
    href: "/dashboard/ajustes/alerta-login",
    color: "bg-sky-500",
  },
]

export default function AjustesPage() {
  const router = useRouter()

  return (
    <div className="flex-1 flex flex-col gap-6 py-2">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
          Ajustes
        </h1>
        <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1">
          Configure e gerencie as opções do sistema.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map(({ label, description, icon: Icon, href, color }) => (
          <button
            key={label}
            onClick={() => router.push(href)}
            className={cn(
              "group text-left rounded-2xl border border-zinc-200 dark:border-zinc-800/60",
              "bg-white dark:bg-zinc-900/50 shadow-sm",
              "hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700",
              "active:scale-[0.98] transition-all duration-200 cursor-pointer",
              "flex flex-col overflow-hidden"
            )}
          >
            {/* Icon area */}
            <div className="p-5 pb-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                color
              )}>
                <Icon className="size-5 text-white" />
              </div>
              <p className="text-[13px] font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-brand-red transition-colors duration-150">
                {label}
              </p>
              <p className="text-[11.5px] text-zinc-400 dark:text-zinc-500 mt-0.5 leading-snug">
                {description}
              </p>
            </div>

            {/* Footer */}
            <div className={cn(
              "mt-auto px-5 py-3 border-t border-zinc-100 dark:border-zinc-800/60",
              "flex items-center gap-1 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500",
              "group-hover:text-brand-red transition-colors duration-150"
            )}>
              <span>Acessar</span>
              <ArrowRight className="size-3 transition-transform duration-150 group-hover:translate-x-0.5" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
