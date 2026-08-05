"use client"

import * as React from "react"
import { AlertCircle } from "lucide-react"

/** Retângulo cinza pulsante usado como placeholder de carregamento. */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-zinc-200 dark:bg-zinc-800 ${className}`}
      aria-hidden="true"
    />
  )
}

/** Erro de um bloco isolado — não derruba o resto da dashboard. */
export function BlocoErro({ mensagem, onRetry }: { mensagem: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
      <AlertCircle className="size-6 text-red-500" />
      <p className="text-[12px] text-zinc-500 dark:text-zinc-400 max-w-xs">{mensagem}</p>
      <button
        onClick={onRetry}
        className="text-brand-red text-[12px] font-bold hover:underline"
      >
        Tentar novamente
      </button>
    </div>
  )
}

/** Estado vazio de tabelas e gráficos. */
export function BlocoVazio({ mensagem }: { mensagem: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <p className="text-[12px] text-zinc-400">{mensagem}</p>
    </div>
  )
}

/** Formata Decimal serializado como string em BRL, sem passar por float. */
export function formatarBRL(valor: string | null | undefined): string {
  if (valor == null) return "R$ 0,00"
  const numero = Number(valor)
  if (Number.isNaN(numero)) return "R$ 0,00"
  return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

/**
 * Hook de carregamento com estados de loading, erro e retry.
 *
 * `chave` identifica os parâmetros da busca: quando muda, refaz a requisição.
 * Passe uma string derivada dos filtros (ex.: `${busca}|${pagina}`), não um
 * array de dependências — o lint do React exige literal ali.
 *
 * Também refaz quando a aba volta ao foco, para refletir cadastros feitos
 * em outra aba ou em outra rota.
 */
export function useDadosDashboard<T>(carregar: () => Promise<T>, chave: string) {
  const [dados, setDados] = React.useState<T | null>(null)
  const [carregando, setCarregando] = React.useState(true)
  const [erro, setErro] = React.useState<string | null>(null)
  const [tentativa, setTentativa] = React.useState(0)

  // A função de carga muda de identidade a cada render; guardamos a mais
  // recente num ref para que o efeito de busca dependa só de chave/tentativa.
  const carregarRef = React.useRef(carregar)
  React.useEffect(() => {
    carregarRef.current = carregar
  })

  React.useEffect(() => {
    let cancelado = false

    async function buscar() {
      setCarregando(true)
      setErro(null)
      try {
        const resultado = await carregarRef.current()
        if (!cancelado) setDados(resultado)
      } catch (e: unknown) {
        if (!cancelado) {
          setErro(e instanceof Error ? e.message : "Não foi possível carregar os dados.")
        }
      } finally {
        if (!cancelado) setCarregando(false)
      }
    }

    void buscar()

    return () => {
      cancelado = true
    }
  }, [chave, tentativa])

  const recarregar = React.useCallback(() => setTentativa((t) => t + 1), [])

  React.useEffect(() => {
    function aoVoltarAoFoco() {
      if (document.visibilityState === "visible") setTentativa((t) => t + 1)
    }
    document.addEventListener("visibilitychange", aoVoltarAoFoco)
    return () => document.removeEventListener("visibilitychange", aoVoltarAoFoco)
  }, [])

  return { dados, carregando, erro, recarregar }
}
