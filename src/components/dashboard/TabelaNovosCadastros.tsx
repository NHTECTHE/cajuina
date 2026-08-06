"use client"

import * as React from "react"

import { NovosCadastrosPagina, getNovosCadastros } from "@/services/api"
import { BlocoErro, Skeleton, useDadosDashboard } from "./BlocoEstado"

const TAMANHOS = [10, 25, 50]

export function TabelaNovosCadastros() {
  const [busca, setBusca] = React.useState("")
  const [buscaAplicada, setBuscaAplicada] = React.useState("")
  const [pagina, setPagina] = React.useState(1)
  const [tamanho, setTamanho] = React.useState(10)

  // Debounce da busca: evita uma requisição por tecla digitada.
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setBuscaAplicada(busca)
      setPagina(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [busca])

  const { dados, carregando, erro, recarregar } = useDadosDashboard<NovosCadastrosPagina>(
    () => getNovosCadastros({ search: buscaAplicada, page: pagina, pageSize: tamanho }),
    `${buscaAplicada}|${pagina}|${tamanho}`
  )

  const total = dados?.count ?? 0
  const totalPaginas = Math.max(1, Math.ceil(total / tamanho))
  const primeiro = total === 0 ? 0 : (pagina - 1) * tamanho + 1
  const ultimo = Math.min(pagina * tamanho, total)
  const linhas = dados?.results ?? []

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm p-6">
      <h3 className="text-brand-red font-light tracking-wide text-lg uppercase mb-1">
        Novos Cadastros
      </h3>
      <p className="text-[10px] text-zinc-400 mb-6">Tomadores cadastrados recentemente</p>

      <div className="flex flex-col md:flex-row items-center md:justify-between justify-end gap-4 mb-4 text-xs">
        <div className="hidden md:flex items-center gap-2">
          <span className="text-zinc-400">Exibir</span>
          <select
            className="border border-zinc-200 dark:border-zinc-800 rounded p-1 bg-transparent"
            value={tamanho}
            onChange={(e) => {
              setTamanho(Number(e.target.value))
              setPagina(1)
            }}
          >
            {TAMANHOS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <span className="text-zinc-400">registros por página</span>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-zinc-400">Filtrar:</span>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="border border-zinc-200 dark:border-zinc-800 rounded h-7 w-full md:w-40 px-2 bg-transparent"
          />
        </div>
      </div>

      {erro ? (
        <BlocoErro mensagem={erro} onRetry={recarregar} />
      ) : (
        <>
          <div className="w-full">
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-left text-[10px] whitespace-nowrap">
                <thead>
                  <tr className="border-b-2 border-brand-red/50 text-brand-red font-bold">
                    <th className="py-2 pr-4 pl-2">Nome</th>
                    <th className="py-2 px-2">Contato</th>
                    <th className="py-2 px-2">Telefone</th>
                    <th className="py-2 px-2">E-mail</th>
                    <th className="py-2 px-2">Realizado Por</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {carregando ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 5 }).map((__, j) => (
                          <td key={j} className="py-2 px-2">
                            <Skeleton className="h-3 w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : linhas.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-zinc-400">
                        Nenhum registro encontrado
                      </td>
                    </tr>
                  ) : (
                    linhas.map((linha) => (
                      <tr key={linha.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                        <td className="py-2 px-2">{linha.nome}</td>
                        <td className="py-2 px-2">{linha.contato || "—"}</td>
                        <td className="py-2 px-2">{linha.telefone || "—"}</td>
                        <td className="py-2 px-2">{linha.email || "—"}</td>
                        <td className="py-2 px-2">{linha.criado_por ?? "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden flex flex-col gap-3 mt-2">
              {carregando ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))
              ) : linhas.length === 0 ? (
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 text-center text-zinc-400 text-xs">
                  Nenhum registro encontrado
                </div>
              ) : (
                linhas.map((linha) => (
                  <div
                    key={linha.id}
                    className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs flex flex-col gap-2"
                  >
                    <span className="font-bold text-brand-red text-sm">{linha.nome}</span>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Contato:</span>
                      <span className="font-medium">{linha.contato || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Telefone:</span>
                      <span className="font-medium">{linha.telefone || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">E-mail:</span>
                      <span className="font-medium truncate ml-2">{linha.email || "—"}</span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-700 pt-2">
                      <span className="text-zinc-500">Realizado por:</span>
                      <span className="font-medium">{linha.criado_por ?? "—"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
            <span>
              Mostrando {primeiro} / {ultimo} de {total} registro(s)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina <= 1}
                className="disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="w-5 h-5 bg-brand-red text-white rounded-full flex items-center justify-center font-bold">
                {pagina}
              </span>
              <button
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={pagina >= totalPaginas}
                className="disabled:opacity-50"
              >
                Próximo
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
