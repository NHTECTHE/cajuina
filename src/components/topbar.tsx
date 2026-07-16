"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell,
  LogOut,
  Settings,
  UserRound,
  Sidebar,
  Moon,
  Sun,
  FileText
} from "lucide-react"
import { cn } from "@/lib/utils"
import { logoutAction } from "@/app/actions/auth"
import { getUserAction } from "@/app/actions/user"
import { getNotificacoesAction, markNotificacoesAsReadAction } from "@/app/actions/notificacoes"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface TopbarProps {
  theme: "light" | "dark"
  setTheme: (theme: "light" | "dark") => void
  onMenuToggle: () => void
  isCollapsed: boolean
  onSidebarToggle: () => void
}

interface NotificationItem {
  id: string
  title: string
  description: string
  time: string
  status: string
  read: boolean
}

export default function Topbar({ theme, setTheme, onMenuToggle, onSidebarToggle }: TopbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)
  const [notificationOpen, setNotificationOpen] = React.useState(false)
  
  // User state
  const [userData, setUserData] = React.useState<{first_name?: string; email?: string; is_superuser?: boolean} | null>(null)

  React.useEffect(() => {
    async function loadUser() {
      const response = await getUserAction()
      if (response && response.data) {
        setUserData(response.data)
      }
    }
    loadUser()
  }, [])

  const [notifications, setNotifications] = React.useState<NotificationItem[]>([])

  React.useEffect(() => {
    async function loadNotifications() {
      const res = await getNotificacoesAction()
      if (res.data) {
        setNotifications(res.data)
      }
    }
    loadNotifications()
    
    // Optional: fetch every 30 seconds
    const intervalId = setInterval(loadNotifications, 30000)
    return () => clearInterval(intervalId)
  }, [])

  const unreadCount = notifications.filter(n => !n.lida && !n.read).length

  const handleNotificationOpenChange = async (open: boolean) => {
    setNotificationOpen(open)
    if (open && unreadCount > 0) {
      // Optimistically mark all as read
      setNotifications(prev => prev.map(n => ({ ...n, lida: true, read: true })))
      await markNotificacoesAsReadAction()
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logoutAction()
    router.push("/")
  }

  const getPageTitle = (path: string) => {
    if (path === "/dashboard") return "Home"
    if (path.startsWith("/dashboard/tomador")) return "Tomadores"
    if (path.startsWith("/dashboard/apolices")) return "Apólices"
    if (path.startsWith("/dashboard/cotacoes")) return "Cotações"
    if (path.startsWith("/dashboard/propostas")) return "Propostas"
    if (path.startsWith("/dashboard/financeiro")) return "Financeiro"
    if (path.startsWith("/dashboard/relatorios")) return "Relatórios"
    if (path.startsWith("/dashboard/ajustes")) return "Ajustes"
    return "Painel"
  }

  const title = getPageTitle(pathname || "")

  // Theme-specific styles
  const borderStyles = {
    light: "border-zinc-150 bg-white",
    dark: "border-zinc-800/65 bg-[#0b0e17]"
  }

  const dropdownStyles = {
    light: "bg-white border-zinc-200 text-zinc-800 shadow-lg",
    dark: "bg-zinc-900 border-zinc-800 text-zinc-250 shadow-2xl"
  }

  return (
    <header className={cn(
      "w-full flex items-center justify-between px-6 py-3.5 border-b transition-colors duration-300 shrink-0",
      borderStyles[theme]
    )}>
      {/* ──── LEFT CONTENT (TITLE & SIDEBAR TOGGLE) ──── */}
      <div className="flex items-center gap-3">
        {/* Sidebar toggle button (Unified for Desktop and Mobile) */}
        <button
          onClick={() => {
            if (window.innerWidth < 768) {
              onMenuToggle()
            } else {
              onSidebarToggle()
            }
          }}
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50 shrink-0",
            theme === "light" ? "hover:bg-zinc-100" : "hover:bg-zinc-900"
          )}
          title="Alternar menu"
        >
          <Sidebar className="size-5" />
        </button>

        {/* Dynamic Title */}
        <h1 className={cn(
          "text-[15px] md:text-lg font-extrabold tracking-tight select-none",
          theme === "dark" ? "text-white" : "text-zinc-900"
        )}>
          {title}
        </h1>
      </div>

      {/* ──── RIGHT CONTENT (ACTIONS) ──── */}
      <div className="flex items-center gap-2">
        {/* Notifications Popover */}
        <Popover open={notificationOpen} onOpenChange={handleNotificationOpenChange}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "relative w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50 shrink-0",
                theme === "light" ? "hover:bg-zinc-100" : "hover:bg-zinc-900"
              )}
              aria-label="Notificações"
            >
              <Bell className="size-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-red text-[9px] font-extrabold text-white items-center justify-center">
                    {unreadCount}
                  </span>
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className={cn("w-[280px] p-0 rounded-2xl overflow-hidden border shadow-2xl backdrop-blur-xl", dropdownStyles[theme])}>
            <div className="p-3 pb-2 border-b border-zinc-200/50 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-[12px] text-zinc-900 dark:text-zinc-100 leading-tight tracking-tight">Notificações</h3>
                <p className="text-[9px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">Você tem {unreadCount} nova{unreadCount !== 1 ? 's' : ''}</p>
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={() => setNotifications(prev => prev.map(n => ({ ...n, lida: true })))}
                  className="text-[9px] font-bold text-brand-red hover:bg-brand-red/10 px-1.5 py-0.5 rounded-md transition-colors"
                >
                  Marcar lidas
                </button>
              )}
            </div>
            <div className="max-h-[260px] overflow-y-auto p-1.5 space-y-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full">
              {notifications.length === 0 ? (
                <div className="py-6 px-3 flex flex-col items-center justify-center text-center gap-1.5">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center">
                    <Bell className="size-3.5 text-zinc-400" />
                  </div>
                  <p className="text-[10px] font-medium text-zinc-500">Nenhuma notificação recente</p>
                </div>
              ) : (
                notifications.slice(0, 4).map((item: any, i: number) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setNotificationOpen(false);
                      const title = (item.titulo || item.title || "").toLowerCase();
                      if (title.includes("tomador")) router.push("/dashboard/tomador");
                      else if (title.includes("cotação") || title.includes("cotacao")) router.push("/dashboard/cotacoes");
                      else if (title.includes("proposta")) router.push("/dashboard/propostas");
                      else if (title.includes("apólice") || title.includes("apolice")) router.push("/dashboard/apolices");
                    }}
                    className={cn(
                      "group flex gap-2 p-2 rounded-xl border text-left transition-all duration-300 cursor-pointer relative overflow-hidden",
                      !item.lida 
                        ? "bg-gradient-to-r from-brand-red/[0.03] to-transparent border-brand-red/20 dark:from-brand-red/[0.08] dark:border-brand-red/30 shadow-sm hover:shadow-md hover:border-brand-red/40" 
                        : "bg-white dark:bg-zinc-900/50 border-zinc-200/80 dark:border-zinc-800/80 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700"
                    )}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {!item.lida && (
                      <span className="absolute top-2.5 right-2 flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-red"></span>
                      </span>
                    )}
                    
                    {/* Icon */}
                    <div className={cn(
                      "mt-0.5 shrink-0 flex items-center justify-center w-6 h-6 rounded-full border",
                      !item.lida
                        ? "bg-brand-red/10 border-brand-red/20 text-brand-red dark:bg-brand-red/20 dark:border-brand-red/30"
                        : "bg-zinc-50 border-zinc-200 text-zinc-500 dark:bg-zinc-800/50 dark:border-zinc-700/50 dark:text-zinc-400"
                    )}>
                      {item.titulo?.toLowerCase().includes('tomador') ? (
                        <UserRound className="size-3" />
                      ) : (
                        <FileText className="size-3" />
                      )}
                    </div>

                    <div className="flex flex-col justify-center w-full min-w-0 pr-1">
                      <div className="flex items-start justify-between w-full gap-2">
                        <div className="flex flex-col gap-0.5">
                          <p className={cn(
                            "text-[11px] tracking-tight leading-tight",
                            !item.lida ? "font-bold text-zinc-900 dark:text-white" : "font-semibold text-zinc-700 dark:text-zinc-300"
                          )}>
                            {item.titulo || item.title}
                          </p>
                          <p className={cn(
                            "text-[10px] leading-snug line-clamp-1",
                            !item.lida ? "font-medium text-zinc-600 dark:text-zinc-400" : "text-zinc-500"
                          )}>
                            {item.mensagem || item.description}
                          </p>
                        </div>
                        
                        {(item.status_badge || item.status) && (
                          <span className={cn(
                            "shrink-0 px-1.5 py-[1px] text-[7px] font-bold uppercase rounded-sm shadow-sm ring-1",
                            !item.lida 
                              ? "bg-brand-red text-white ring-brand-red" 
                              : "bg-zinc-100 text-zinc-500 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700"
                          )}>
                            {item.status_badge || item.status}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-[8px] text-zinc-400 dark:text-zinc-500 font-medium mt-1">
                        {item.criado_em ? new Date(item.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : item.time?.split(',')[1] || item.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Theme Switcher Button */}
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors shrink-0",
            theme === "light" 
              ? "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950" 
              : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
          )}
          title={theme === "light" ? "Modo Escuro" : "Modo Claro"}
        >
          {theme === "light" ? <Moon className="size-4.5" /> : <Sun className="size-4.5" />}
        </button>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "h-9 px-1.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors active:scale-[0.98] shrink-0",
              theme === "light"
                ? "border-zinc-200 hover:bg-zinc-50"
                : "border-zinc-800/80 hover:bg-zinc-900"
            )}>
              <Avatar size="sm" className="ring-1 ring-brand-red/25">
                <AvatarFallback className="bg-brand-red text-white text-[10px] font-extrabold uppercase">
                  {userData?.first_name ? userData.first_name.substring(0, 2) : "US"}
                </AvatarFallback>
              </Avatar>
              <span className={cn(
                "hidden sm:inline text-xs font-bold pr-1",
                theme === "dark" ? "text-zinc-355" : "text-zinc-700"
              )}>
                {userData?.first_name || "Carregando..."}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={cn("w-64 p-1.5 rounded-2xl border shadow-xl backdrop-blur-xl", dropdownStyles[theme])}>
            {/* Header profile info */}
            <div className="px-3 py-2.5 mb-1.5 border-b border-zinc-200/10 bg-black/5 dark:bg-white/[0.01] rounded-xl">
              <p className="text-xs font-bold leading-tight truncate">{userData?.first_name || "Usuário"}</p>
              <p className="text-[10px] text-zinc-450 truncate mt-0.5">{userData?.email || "..."}</p>
              <Badge variant="secondary" className="mt-2 text-[9px] px-2 py-0.2 bg-brand-red/10 border-brand-red/10 text-brand-red font-bold">
                {userData?.is_superuser ? "Administrador" : "Tomador"}
              </Badge>
            </div>

            {/* Menu Items */}
            <DropdownMenuItem 
              onClick={() => router.push("/dashboard/ajustes")}
              className="group rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer"
            >
              <UserRound className="size-4 text-zinc-400 group-hover:text-inherit" />
              <span>Meu perfil</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => router.push("/dashboard/ajustes")}
              className="group rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer"
            >
              <Settings className="size-4 text-zinc-400 group-hover:text-inherit" />
              <span>Configurações</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1.5 border-zinc-250/10" />

            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="group rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut className="size-4 shrink-0 text-destructive/80" />
              <span>{isLoggingOut ? "Saindo..." : "Sair"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
