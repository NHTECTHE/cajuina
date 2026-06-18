 "use client"

import * as React from "react"
import SidebarNav from "@/components/sidebar-nav"
import Topbar from "@/components/topbar"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [theme, setTheme] = React.useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light"
    try {
      return (localStorage.getItem("cajuina_sidebar_theme") as "light" | "dark") || "light"
    } catch { return "light" }
  })
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    if (typeof window === "undefined") return false
    try {
      return localStorage.getItem("cajuina_sidebar_collapsed") === "true"
    } catch { return false }
  })
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useLayoutEffect(() => {
    setMounted(true) // eslint-disable-line react-hooks/set-state-in-effect
  }, [])

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const root = window.document.documentElement
      if (theme === "dark") {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
    }
  }, [theme])

  const handleSetTheme = (newTheme: "light" | "dark") => {
    setTheme(newTheme)
    try {
      localStorage.setItem("cajuina_sidebar_theme", newTheme)
    } catch (e) {
      console.warn(e)
    }
  }

  const handleSetCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed)
    try {
      localStorage.setItem("cajuina_sidebar_collapsed", String(collapsed))
    } catch (e) {
      console.warn(e)
    }
  }

  // Prevent flash/hydration mismatch during SSR
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const layoutBackgrounds = {
    light: "bg-[#f4f5f7]",
    dark: "bg-[#07090e]"
  }

  return (
    <div className={cn(
      "min-h-screen w-full max-w-full flex gap-0 md:gap-4 transition-colors duration-300 overflow-hidden p-0 md:p-4 relative font-sans",
      layoutBackgrounds[theme]
    )}>
      {/* ──── GRADIENT ORNAMENT GLOWS (Sophisticated ambient lighting) ──── */}
      {theme === "dark" && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-brand-red/10 blur-[150px] pointer-events-none animate-pulse-slow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-650/10 blur-[150px] pointer-events-none animate-pulse-slow" />
        </>
      )}

      {theme === "light" && (
        <div className="absolute top-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-brand-red/[0.02] blur-[120px] pointer-events-none" />
      )}

      {/* ──── MOBILE OVERLAY BACKDROP ──── */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-45 md:hidden transition-opacity duration-300 animate-fade-in"
        />
      )}

      {/* ──── SIDEBAR ──── */}
      <SidebarNav
        theme={theme}
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* ──── MAIN CONTENT CONTAINER ──── */}
      <main className="flex-1 flex flex-col min-w-0 h-screen md:h-[calc(100vh-2rem)] overflow-y-auto no-scrollbar">
        {/* Dynamic Inner Card style for content */}
        <div className={cn(
          "flex-1 rounded-none md:rounded-3xl flex flex-col transition-colors duration-300 border-0 md:border overflow-hidden",
          theme === "light" 
            ? "bg-white border-zinc-200 shadow-sm" 
            : "bg-[#0b0e17] border-zinc-800/80 text-zinc-100 shadow-[0_8px_30px_rgba(0,0,0,0.1)]"
        )}>
          {/* ──── TOPBAR (Desktop & Mobile) ──── */}
          <Topbar
            theme={theme}
            setTheme={handleSetTheme}
            onMenuToggle={() => setIsMobileOpen(true)}
            isCollapsed={isCollapsed}
            onSidebarToggle={() => handleSetCollapsed(!isCollapsed)}
          />

          <div className="flex-1 p-6 md:p-8 flex flex-col overflow-y-auto no-scrollbar">
            {children}
          </div>
         </div>
      </main>
    </div>
  )
}
