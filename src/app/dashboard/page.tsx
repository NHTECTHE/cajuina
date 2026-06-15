"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { 
  LogOut, 
  Users, 
  FileText, 
  MessageSquare,
  ArrowRight,
  ShieldCheck
} from "lucide-react"
import { logoutAction } from "../actions/auth"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logoutAction()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-white text-zinc-800 flex flex-col font-sans selection:bg-brand-red/10 selection:text-brand-red">
      
      {/* ──── HEADER ──── */}
      <header className="border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/2 - 1.png"
              alt="Cajuína Seguros"
              width={120}
              height={40}
              className="h-8 w-auto object-contain"
              priority
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-zinc-150 flex items-center justify-center font-bold text-zinc-700 text-xs border border-zinc-200">
                AD
              </div>
              <span className="text-sm font-medium text-zinc-600 hidden sm:block">Administrador</span>
            </div>
            
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-600 hover:text-red-600 hover:bg-red-50 border border-zinc-200 hover:border-red-150 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <LogOut className="size-3.5" />
              <span>{isLoggingOut ? "Saindo..." : "Sair"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ──── MAIN CONTENT ──── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 md:py-20 flex flex-col justify-center">
        
        {/* Welcome Section */}
        <div className="text-center mb-12 animate-fade-in">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-brand-red border border-red-100 mb-4">
            <ShieldCheck className="size-3.5" />
            Sessão ativa com sucesso
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight mb-4">
            tela inicial
          </h1>
          <p className="text-zinc-500 text-[15px] md:text-base max-w-lg mx-auto leading-relaxed">
            Bem-vindo ao seu painel. Esta é a área administrativa da corretora, onde você pode acessar as principais ferramentas da plataforma.
          </p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mb-12">
          
          {/* Card 1 */}
          <div className="group bg-white border border-zinc-200 rounded-2xl p-6 hover:shadow-lg hover:shadow-zinc-100 hover:border-brand-red/25 transition-all duration-300 flex flex-col justify-between cursor-pointer">
            <div>
              <div className="w-10 h-10 rounded-xl bg-zinc-50 text-zinc-600 flex items-center justify-center mb-4 group-hover:bg-red-50 group-hover:text-brand-red transition-all duration-300">
                <Users className="size-5" />
              </div>
              <h3 className="font-bold text-zinc-900 text-[15px] mb-1 group-hover:text-brand-red transition-colors duration-200">
                Clientes
              </h3>
              <p className="text-zinc-400 text-xs leading-normal">
                Gerenciamento completo e busca de segurados.
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-5 text-[11px] font-bold text-zinc-400 group-hover:text-brand-red transition-colors duration-200">
              <span>Acessar</span>
              <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="group bg-white border border-zinc-200 rounded-2xl p-6 hover:shadow-lg hover:shadow-zinc-100 hover:border-brand-red/25 transition-all duration-300 flex flex-col justify-between cursor-pointer">
            <div>
              <div className="w-10 h-10 rounded-xl bg-zinc-50 text-zinc-600 flex items-center justify-center mb-4 group-hover:bg-red-50 group-hover:text-brand-red transition-all duration-300">
                <FileText className="size-5" />
              </div>
              <h3 className="font-bold text-zinc-900 text-[15px] mb-1 group-hover:text-brand-red transition-colors duration-200">
                Apólices
              </h3>
              <p className="text-zinc-400 text-xs leading-normal">
                Visualizar, editar e emitir novos contratos.
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-5 text-[11px] font-bold text-zinc-400 group-hover:text-brand-red transition-colors duration-200">
              <span>Acessar</span>
              <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="group bg-white border border-zinc-200 rounded-2xl p-6 hover:shadow-lg hover:shadow-zinc-100 hover:border-brand-red/25 transition-all duration-300 flex flex-col justify-between cursor-pointer">
            <div>
              <div className="w-10 h-10 rounded-xl bg-zinc-50 text-zinc-600 flex items-center justify-center mb-4 group-hover:bg-red-50 group-hover:text-brand-red transition-all duration-300">
                <MessageSquare className="size-5" />
              </div>
              <h3 className="font-bold text-zinc-900 text-[15px] mb-1 group-hover:text-brand-red transition-colors duration-200">
                Suporte
              </h3>
              <p className="text-zinc-400 text-xs leading-normal">
                Fale direto com a central de atendimento.
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-5 text-[11px] font-bold text-zinc-400 group-hover:text-brand-red transition-colors duration-200">
              <span>Contatar</span>
              <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
          </div>

        </div>

      </main>

      {/* ──── FOOTER ──── */}
      <footer className="mt-auto py-6 border-t border-zinc-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-400">
            Desenvolvido por <span className="text-purple-600 font-semibold">Nhtec</span> © 2021 – 2026
          </p>
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <a href="#" className="hover:text-zinc-600 transition-colors">Termos</a>
            <span className="text-zinc-200">•</span>
            <a href="#" className="hover:text-zinc-600 transition-colors">Privacidade</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
