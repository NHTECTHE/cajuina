"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import {
  Home,
  Users,
  ShieldCheck,
  Coins,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  X,
  Wrench,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { logoutAction } from "@/app/actions/auth"
import { getUserAction } from "@/app/actions/user"

interface SidebarNavProps {
  theme: "light" | "dark"
  isCollapsed: boolean
  isMobileOpen: boolean
  setIsMobileOpen: (open: boolean) => void
}

export default function SidebarNav({ 
  theme, 
  isCollapsed, 
  isMobileOpen,
  setIsMobileOpen
}: SidebarNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

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

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setIsMobileOpen(false)
    await logoutAction()
    router.push("/")
  }

  const handleMenuClick = (href: string) => {
    router.push(href)
    setIsMobileOpen(false)
  }

  const menuGroups = [
    {
      title: "Geral",
      items: [
        { label: "Home", href: "/dashboard", icon: Home },
      ]
    },
    {
      title: "Operações",
      items: [
        { label: "Tomador", href: "/dashboard/tomador", icon: Users },
        { label: "Apólices", href: "/dashboard/apolices", icon: ShieldCheck },
        { label: "Cotações", href: "/dashboard/cotacoes", icon: Coins },
        { label: "Propostas", href: "/dashboard/propostas", icon: FileText },
      ]
    },
    {
      title: "Gestão",
      items: [
        { label: "Financeiro", href: "/dashboard/financeiro", icon: CreditCard },
        { label: "Relatórios", href: "/dashboard/relatorios", icon: BarChart3 },
      ]
    },
    {
      title: "Sistema",
      items: [
        { label: "Ferramentas", href: "/dashboard/ferramentas", icon: Wrench },
        { label: "Ajustes", href: "/dashboard/ajustes", icon: Settings },
      ]
    }
  ]

  // Styles based on theme
  const sidebarStyles = {
    light: "bg-white border border-zinc-200 text-zinc-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
    dark: "bg-[#0c101b] border border-zinc-800/80 text-zinc-300 shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
  }

  const groupTitleStyles = {
    light: "text-zinc-400 font-bold uppercase tracking-wider text-[10px]",
    dark: "text-zinc-500 font-bold uppercase tracking-wider text-[10px]"
  }

  const itemStyles = {
    light: {
      active: "bg-brand-red text-white shadow-md shadow-brand-red/20",
      inactive: "hover:bg-zinc-100 hover:text-zinc-900 text-zinc-650"
    },
    dark: {
      active: "bg-brand-red text-white shadow-md shadow-brand-red/30",
      inactive: "hover:bg-white/5 hover:text-white text-zinc-450"
    }
  }

  const profileBorderStyles = {
    light: "border-t border-zinc-100",
    dark: "border-t border-zinc-800/60"
  }

  return (
    <aside
      className={cn(
        "flex flex-col transition-all duration-300 select-none",
        sidebarStyles[theme],
        // Positioning: fixed covering height of viewport on mobile, relative inside grid on desktop
        "fixed md:relative z-50 md:z-40 shadow-2xl md:shadow-none",
        "inset-y-0 left-0 md:inset-auto rounded-none md:rounded-3xl",
        "h-[100dvh] md:h-[calc(100vh-2rem)]",
        // Visibility on mobile: translate-x-full off-screen, translate-x-0 on-screen
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        // Width behavior: 280px width on mobile, variable on desktop
        "w-[280px] md:w-64",
        isCollapsed ? "md:w-20" : "md:w-64"
      )}
    >
      {/* ──── HEADER / LOGO ──── */}
      <div className={cn(
        "px-6 flex items-center border-b border-zinc-250/5 dark:border-zinc-800/10 shrink-0",
        (isCollapsed && !isMobileOpen) ? "justify-center h-[65px]" : "justify-between h-[65px]"
      )}>
        <div className="flex items-center gap-3">
          {isCollapsed && !isMobileOpen ? (
            <Image
              src="/4 - 2.png"
              alt="Cajuína"
              width={32}
              height={32}
              className="w-8 h-8 rounded-lg object-contain shrink-0"
              priority
            />
          ) : (
              <Image
                src={theme === "dark" ? "/5 - 5.png" : "/2 - 1.png"}
                alt="Cajuína Corretora de Seguros"
                width={240}
                height={240}
                className="h-28 w-auto object-contain shrink-0 select-none -my-10 scale-[1.15] origin-left"
                priority
              />
          )}
        </div>

        {/* Mobile close button (Visible only when full-screen drawer is open) */}
        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className={cn(
              "md:hidden w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer border transition-colors",
              theme === "light" 
                ? "border-zinc-200 bg-zinc-50 text-zinc-650 hover:bg-zinc-100" 
                : "border-zinc-800 bg-zinc-900 text-zinc-355 hover:bg-zinc-850"
            )}
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* ──── NAVIGATION CONTENT ──── */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 pb-4 space-y-5">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-2">
            {(!isCollapsed || isMobileOpen) && (
              <h4 className={cn("px-3 mb-1", groupTitleStyles[theme])}>
                {group.title}
              </h4>
            )}
            <div className="space-y-1">
              {group.items.map((item, itemIdx) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                
                const linkContent = (
                  <button
                    onClick={() => handleMenuClick(item.href)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-medium tracking-wide transition-all duration-200 cursor-pointer active:scale-[0.98]",
                      isActive 
                        ? itemStyles[theme].active 
                        : itemStyles[theme].inactive,
                      (isCollapsed && !isMobileOpen) ? "justify-center" : ""
                    )}
                  >
                    <Icon className="size-4.5 shrink-0" />
                    {(!isCollapsed || isMobileOpen) && <span>{item.label}</span>}
                  </button>
                )

                if (isCollapsed && !isMobileOpen) {
                  return (
                    <Tooltip key={itemIdx}>
                      <TooltipTrigger asChild>
                        {linkContent}
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-semibold text-xs py-1 px-2.5 rounded-md">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  )
                }

                return <React.Fragment key={itemIdx}>{linkContent}</React.Fragment>
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ──── USER PROFILE / LOGOUT (BOTTOM) ──── */}
      <div className={cn("p-4 pb-8 md:pb-4", profileBorderStyles[theme])}>
        <div className={cn("flex items-center gap-3", (isCollapsed && !isMobileOpen) ? "justify-center" : "")}>
          <div className="w-9 h-9 rounded-full bg-brand-red flex items-center justify-center font-bold text-white text-xs shrink-0 border border-white/10 shadow-sm uppercase">
            {userData?.first_name ? userData.first_name.substring(0, 2) : "US"}
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-[11.5px] font-bold truncate leading-tight",
                theme === "dark" ? "text-zinc-200" : "text-zinc-900"
              )}>
                {userData?.first_name || "Carregando..."}
              </p>
              <p className="text-[9.5px] truncate mt-0.5 text-zinc-400">
                {userData?.email || "..."}
              </p>
            </div>
          )}
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11.5px] font-bold mt-3 transition-all duration-200 cursor-pointer disabled:opacity-50",
            theme === "light"
              ? "text-zinc-500 hover:text-red-600 hover:bg-red-50"
              : "text-zinc-400 hover:text-red-400 hover:bg-red-950/20",
            (isCollapsed && !isMobileOpen) ? "justify-center" : ""
          )}
          title="Sair da conta"
        >
          <LogOut className="size-3.5 shrink-0" />
          {(!isCollapsed || isMobileOpen) && <span>{isLoggingOut ? "Saindo..." : "Sair"}</span>}
        </button>
      </div>
    </aside>
  )
}
