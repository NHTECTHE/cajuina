"use client"

import * as React from "react"

export type MinhasPermissoes = {
  cargo: string
  is_superuser: boolean
  permissoes: string[]
  telas: string[]
}

type Estado = {
  dados: MinhasPermissoes | null
  carregando: boolean
  erro: boolean
  pode: (codename: string) => boolean
  podeAbrir: (rota: string) => boolean
}

const VAZIO: MinhasPermissoes = {
  cargo: "",
  is_superuser: false,
  permissoes: [],
  telas: [],
}

const PermissoesContext = React.createContext<Estado | null>(null)

export function PermissoesProvider({ children }: { children: React.ReactNode }) {
  const [dados, setDados] = React.useState<MinhasPermissoes | null>(null)
  const [carregando, setCarregando] = React.useState(true)
  const [erro, setErro] = React.useState(false)

  React.useEffect(() => {
    let vivo = true
    ;(async () => {
      try {
        const res = await fetch("/api/permissoes/me", { cache: "no-store" })
        if (!res.ok) throw new Error(String(res.status))
        const json = await res.json()
        if (vivo) setDados(json?.data ?? VAZIO)
      } catch {
        if (vivo) setErro(true)
      } finally {
        if (vivo) setCarregando(false)
      }
    })()
    return () => {
      vivo = false
    }
  }, [])

  const valor = React.useMemo<Estado>(() => {
    const atual = dados ?? VAZIO
    const permissoes = new Set(atual.permissoes)
    const telas = new Set(atual.telas)
    return {
      dados,
      carregando,
      erro,
      pode: (codename) => permissoes.has(codename),
      podeAbrir: (rota) => telas.has(rota),
    }
  }, [dados, carregando, erro])

  return (
    <PermissoesContext.Provider value={valor}>{children}</PermissoesContext.Provider>
  )
}

export function usePermissoes(): Estado {
  const ctx = React.useContext(PermissoesContext)
  if (!ctx) {
    throw new Error("usePermissoes precisa estar dentro de <PermissoesProvider>")
  }
  return ctx
}
