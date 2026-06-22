"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell,
  LogOut,
  Settings, 
  UserRound, 
  Check, 
  Info, 
  AlertCircle,
  Sidebar,
  Moon,
  Sun
} from "lucide-react"
import { cn } from "@/lib/utils"
import { logoutAction } from "@/app/actions/auth"
import { getUserAction } from "@/app/actions/user"

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
  type: "info" | "success" | "warning"
  read: boolean
}

export default function Topbar({ theme, setTheme, onMenuToggle, isCollapsed: _isCollapsed, onSidebarToggle }: TopbarProps) {
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

  // Simulated initial notifications
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([
    {
      id: "1",
      title: "Nova proposta emitida",
      description: "Proposta de Seguro Garantia cadastrada com sucesso.",
      time: "2 minutos atrás",
      type: "success",
      read: false
    },
    {
      id: "2",
      title: "Apólice prestes a vencer",
      description: "A apólice #84930 do Tomador vence em 15 dias.",
      time: "1 hora atrás",
      type: "warning",
      read: false
    },
    {
      id: "3",
      title: "Repasse confirmado",
      description: "O lote de repasse financeiro do mês foi liquidado.",
      time: "5 horas atrás",
      type: "info",
      read: false
    }
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleNotificationOpenChange = (open: boolean) => {
    setNotificationOpen(open)
    if (open) {
      // Mark all as read when opening
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
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
    light: "bg-white border-zinc-200 text-zinc-800",
    dark: "bg-[#0f1424] border-zinc-800/80 text-zinc-250 shadow-2xl"
  }

  const notificationIcon = {
    success: <Check className="size-4 text-emerald-500" />,
    warning: <AlertCircle className="size-4 text-amber-500" />,
    info: <Info className="size-4 text-blue-500" />
  }

  const notificationBg = {
    success: "bg-emerald-500/10 border-emerald-500/10",
    warning: "bg-amber-500/10 border-amber-500/10",
    info: "bg-blue-500/10 border-blue-500/10"
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
          <PopoverContent align="end" className={cn("w-80 p-0 rounded-2xl overflow-hidden border", dropdownStyles[theme])}>
            <div className="p-4 border-b border-zinc-200/10 bg-black/5 dark:bg-white/[0.02]">
              <h3 className="font-extrabold text-sm leading-tight">Notificações</h3>
              <p className="text-[10px] text-zinc-450 mt-0.5">Últimas atividades da corretora</p>
            </div>
            <div className="max-h-64 overflow-y-auto no-scrollbar p-2 space-y-1">
              {notifications.length === 0 ? (
                <div className="py-6 px-4 text-center text-xs text-zinc-450">
                  Nenhuma notificação recente.
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex gap-3 p-3 rounded-xl border text-left transition-colors duration-200 hover:bg-zinc-500/5",
                      item.read ? "bg-transparent border-transparent" : "bg-zinc-500/5 border-zinc-200/10"
                    )}
                  >
                    <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center shrink-0", notificationBg[item.type])}>
                      {notificationIcon[item.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{item.title}</p>
                      <p className="text-[10.5px] leading-snug text-zinc-450 mt-0.5">{item.description}</p>
                      <p className="text-[9px] text-zinc-500 mt-1.5 font-medium">{item.time}</p>
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
