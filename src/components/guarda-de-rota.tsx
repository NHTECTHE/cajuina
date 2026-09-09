"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { usePermissoes } from "@/lib/permissoes"

const SEMPRE_LIBERADAS = ["/dashboard/sem-acesso", "/dashboard/perfil"]

const EXIGENCIAS_ESPECIAIS: { prefixo: RegExp; permissao: string }[] = [
  {
    prefixo: /^\/dashboard\/usuarios\/[^/]+\/permissoes$/,
    permissao: "permissoes.gerenciar_permissoes",
  },
]

function rotaBase(pathname: string, telas: string[]): string | null {
  // "/dashboard" casa só exato: como prefixo ele liberaria todas as rotas
  // do dashboard para quem tem apenas acessar_dashboard.
  const casam = telas
    .filter((t) =>
      t === "/dashboard"
        ? pathname === "/dashboard"
        : pathname === t || pathname.startsWith(t + "/")
    )
    .sort((a, b) => b.length - a.length)
  return casam[0] ?? null
}

export function GuardaDeRota({ children }: { children: React.ReactNode }) {
  const { dados, carregando, erro, pode } = usePermissoes()
  const pathname = usePathname()
  const router = useRouter()

  const telas = React.useMemo(() => dados?.telas ?? [], [dados])

  const permitido = React.useMemo(() => {
    if (SEMPRE_LIBERADAS.includes(pathname)) return true

    const especial = EXIGENCIAS_ESPECIAIS.find((e) => e.prefixo.test(pathname))
    if (especial) return pode(especial.permissao)

    return rotaBase(pathname, telas) !== null
  }, [pathname, telas, pode])

  React.useEffect(() => {
    if (carregando || permitido) return
    const destino = telas.length > 0 ? telas[0] : "/dashboard/sem-acesso"
    router.replace(destino === pathname ? "/dashboard/sem-acesso" : destino)
  }, [carregando, permitido, telas, pathname, router])

  if (carregando) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-red-500" />
      </div>
    )
  }

  if (erro) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
          Não foi possível carregar suas permissões
        </h1>
        <p className="max-w-md text-sm text-zinc-500 dark:text-zinc-400">
          Recarregue a página. Se continuar, entre em contato com o suporte.
        </p>
      </div>
    )
  }

  if (!permitido) return null

  return <>{children}</>
}
