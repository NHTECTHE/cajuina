"use client"

import * as React from "react"
import { 
  Users, 
  FileText, 
  MessageSquare,
  ArrowRight,
  FileSpreadsheet,
  FileCheck,
  CreditCard
} from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex-1 flex flex-col justify-between h-full">
      
      {/* ──── TOP CONTENT ──── */}
      <div className="max-w-4xl w-full mx-auto py-8 flex flex-col justify-center flex-1">
        
        {/* Welcome Section */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-inherit">
            Página Inicial
          </h1>
          <p className="opacity-70 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
            Bem-vindo ao seu painel. Esta é a área administrativa da corretora, onde você pode acessar as principais ferramentas da plataforma.
          </p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mb-12">
          
          {/* Card 1: Tomador */}
          <div className="group bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-2xl p-6 hover:shadow-lg hover:border-brand-red/25 dark:hover:border-brand-red/30 transition-all duration-300 flex flex-col justify-between cursor-pointer">
            <div>
              <div className="w-10 h-10 rounded-xl bg-brand-red/10 text-brand-red flex items-center justify-center mb-4 transition-all duration-300">
                <Users className="size-5" />
              </div>
              <h3 className="font-bold text-inherit text-[15px] mb-1 group-hover:text-brand-red transition-colors duration-200">
                Tomadores
              </h3>
              <p className="opacity-50 text-xs leading-normal">
                Gerenciamento completo e busca de segurados.
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-5 text-[11px] font-bold opacity-60 group-hover:text-brand-red transition-colors duration-200">
              <span>Acessar</span>
              <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
          </div>

          {/* Card 2: Apólices */}
          <div className="group bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-2xl p-6 hover:shadow-lg hover:border-brand-red/25 dark:hover:border-brand-red/30 transition-all duration-300 flex flex-col justify-between cursor-pointer">
            <div>
              <div className="w-10 h-10 rounded-xl bg-brand-red/10 text-brand-red flex items-center justify-center mb-4 transition-all duration-300">
                <FileText className="size-5" />
              </div>
              <h3 className="font-bold text-inherit text-[15px] mb-1 group-hover:text-brand-red transition-colors duration-200">
                Apólices
              </h3>
              <p className="opacity-50 text-xs leading-normal">
                Visualizar, editar e emitir novos contratos.
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-5 text-[11px] font-bold opacity-60 group-hover:text-brand-red transition-colors duration-200">
              <span>Acessar</span>
              <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
          </div>

          {/* Card 3: Cotações */}
          <div className="group bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-2xl p-6 hover:shadow-lg hover:border-brand-red/25 dark:hover:border-brand-red/30 transition-all duration-300 flex flex-col justify-between cursor-pointer">
            <div>
              <div className="w-10 h-10 rounded-xl bg-brand-red/10 text-brand-red flex items-center justify-center mb-4 transition-all duration-300">
                <FileSpreadsheet className="size-5" />
              </div>
              <h3 className="font-bold text-inherit text-[15px] mb-1 group-hover:text-brand-red transition-colors duration-200">
                Cotações
              </h3>
              <p className="opacity-50 text-xs leading-normal">
                Calcular taxas e simular novos orçamentos.
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-5 text-[11px] font-bold opacity-60 group-hover:text-brand-red transition-colors duration-200">
              <span>Acessar</span>
              <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
          </div>

          {/* Card 4: Propostas */}
          <div className="group bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-2xl p-6 hover:shadow-lg hover:border-brand-red/25 dark:hover:border-brand-red/30 transition-all duration-300 flex flex-col justify-between cursor-pointer">
            <div>
              <div className="w-10 h-10 rounded-xl bg-brand-red/10 text-brand-red flex items-center justify-center mb-4 transition-all duration-300">
                <FileCheck className="size-5" />
              </div>
              <h3 className="font-bold text-inherit text-[15px] mb-1 group-hover:text-brand-red transition-colors duration-200">
                Propostas
              </h3>
              <p className="opacity-50 text-xs leading-normal">
                Verificar andamento e aprovações de propostas.
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-5 text-[11px] font-bold opacity-60 group-hover:text-brand-red transition-colors duration-200">
              <span>Acessar</span>
              <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
          </div>

          {/* Card 5: Financeiro */}
          <div className="group bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-2xl p-6 hover:shadow-lg hover:border-brand-red/25 dark:hover:border-brand-red/30 transition-all duration-300 flex flex-col justify-between cursor-pointer">
            <div>
              <div className="w-10 h-10 rounded-xl bg-brand-red/10 text-brand-red flex items-center justify-center mb-4 transition-all duration-300">
                <CreditCard className="size-5" />
              </div>
              <h3 className="font-bold text-inherit text-[15px] mb-1 group-hover:text-brand-red transition-colors duration-200">
                Financeiro
              </h3>
              <p className="opacity-50 text-xs leading-normal">
                Controle de faturas, comissões e repasses.
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-5 text-[11px] font-bold opacity-60 group-hover:text-brand-red transition-colors duration-200">
              <span>Acessar</span>
              <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
          </div>

          {/* Card 6: Suporte */}
          <div className="group bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/40 rounded-2xl p-6 hover:shadow-lg hover:border-brand-red/25 dark:hover:border-brand-red/30 transition-all duration-300 flex flex-col justify-between cursor-pointer">
            <div>
              <div className="w-10 h-10 rounded-xl bg-brand-red/10 text-brand-red flex items-center justify-center mb-4 transition-all duration-300">
                <MessageSquare className="size-5" />
              </div>
              <h3 className="font-bold text-inherit text-[15px] mb-1 group-hover:text-brand-red transition-colors duration-200">
                Suporte
              </h3>
              <p className="opacity-50 text-xs leading-normal">
                Falar com a nossa equipe de desenvolvimento.
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-5 text-[11px] font-bold opacity-60 group-hover:text-brand-red transition-colors duration-200">
              <span>Contatar</span>
              <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
          </div>

        </div>

      </div>

      {/* ──── FOOTER ──── */}
      <footer className="py-4 border-t border-zinc-200/20 w-full">
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
          <div className="flex items-center gap-4 text-xs opacity-40">
            <a href="#" className="hover:opacity-100 transition-opacity">Termos</a>
            <span>•</span>
            <a href="#" className="hover:opacity-100 transition-opacity">Privacidade</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
