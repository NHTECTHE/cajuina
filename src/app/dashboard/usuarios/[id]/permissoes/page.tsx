"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, ShieldCheck, Save, Loader2, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// Tipos para o Catálogo do Backend
type Tela = {
  slug: string
  label: string
  rota: string
  permissao: string
}

type Acao = {
  codename: string
  label: string
}

type Modulo = {
  slug: string
  label: string
  telas: Tela[]
  acoes: Acao[]
}

export default function PermissoesUsuarioPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params?.id as string

  // Abas e estados
  const [currentTab, setCurrentTab] = React.useState("")
  const [isSaving, setIsSaving] = React.useState(false)

  // Catálogo do backend
  const [catalogo, setCatalogo] = React.useState<Modulo[]>([])

  // O estado 'permissions' guarda as seleções ([codename]: boolean)
  const [permissions, setPermissions] = React.useState<Record<string, boolean>>({})

  // Info do usuário
  const [usuarioInfo, setUsuarioInfo] = React.useState({
    nome: "Carregando...",
    cargo: "..."
  })

  // Inicializa buscando do Backend
  React.useEffect(() => {
    const fetchDados = async () => {
      try {
        // Busca info do usuário e catálogo de permissões paralelamente
        const [userRes, permRes, catRes] = await Promise.all([
          fetch(`/api/usuarios/${userId}/`),
          fetch(`/api/usuarios/${userId}/permissoes/`),
          fetch(`/api/permissoes/catalogo/`)
        ])

        if (userRes.ok) {
          const json = await userRes.json()
          const userData = json.data || json // Caso o backend retorne no formato { data: {...} }
          setUsuarioInfo({
            nome: userData.first_name || userData.email || "Usuário",
            cargo: userData.cargo || "Usuário"
          })
        }

        let backendPerms: string[] = []
        if (permRes.ok) {
          const permData = await permRes.json()
          // O backend novo retorna { data: { id, permissoes: [...] } }
          backendPerms = permData.data?.permissoes || permData.permissoes || []
        }

        if (catRes.ok) {
          const catData = await catRes.json()
          const modulos: Modulo[] = catData.data?.modulos || catData.modulos || []
          setCatalogo(modulos)
          
          if (modulos.length > 0) {
            setCurrentTab(modulos[0].slug)
          }

          const initial: Record<string, boolean> = {}
          modulos.forEach(modulo => {
            modulo.telas?.forEach(tela => {
              initial[tela.permissao] = backendPerms.includes(tela.permissao)
            })
            modulo.acoes?.forEach(acao => {
              initial[acao.codename] = backendPerms.includes(acao.codename)
            })
          })
          setPermissions(initial)
        }
      } catch (err) {
        console.error("Erro ao buscar dados", err)
      }
    }

    if (userId) {
      fetchDados()
    }
  }, [userId])

  const handleToggle = (codename: string) => {
    setPermissions(prev => ({
      ...prev,
      [codename]: !prev[codename]
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    // Converte as permissões ativas de volta para array
    const codenamesParaSalvar = Object.keys(permissions).filter(key => permissions[key])

    try {
      const res = await fetch(`/api/usuarios/${userId}/permissoes/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ permissoes: codenamesParaSalvar })
      })

      if (res.ok) {
        router.push("/dashboard/usuarios")
      } else {
        alert("Erro ao salvar permissões.")
      }
    } catch (err) {
      console.error(err)
      alert("Erro de conexão ao salvar.")
    } finally {
      setIsSaving(false)
    }
  }

  const activeCategory = catalogo.find(c => c.slug === currentTab)

  return (
    <div className="flex flex-col p-4 md:p-6 lg:p-8 gap-4 md:gap-6 w-full max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-500"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-brand-red flex items-center justify-center shrink-0">
            <ShieldCheck className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              Controle de Permissões
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
              Editando acessos de: <strong className="text-zinc-900 dark:text-zinc-200">{usuarioInfo.nome}</strong> 
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="uppercase text-[10px] font-bold tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded-full">
                {usuarioInfo.cargo}
              </span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => router.back()}
            className="flex-1 md:flex-none px-4 py-2 rounded-xl text-sm font-semibold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 dark:text-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-brand-red hover:bg-brand-red/90 transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Salvar
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start mt-6">
        
        {/* Tabs / Sidebar (Desktop) */}
        <div className="w-full lg:w-64 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 shrink-0">
          {catalogo.length === 0 && <p className="text-sm text-zinc-500">Carregando módulos...</p>}
          {catalogo.map(cat => (
            <button
              key={cat.slug}
              onClick={() => setCurrentTab(cat.slug)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left whitespace-nowrap lg:whitespace-normal",
                currentTab === cat.slug 
                  ? "bg-brand-red text-white shadow-md shadow-brand-red/20" 
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 w-full min-w-0 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <h2 className="font-bold text-zinc-900 dark:text-white">{activeCategory?.label || "Módulo"}</h2>
            <p className="text-xs text-zinc-500">Defina os acessos permitidos para este módulo.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th className="px-6 py-3 border-b border-zinc-100 dark:border-zinc-800">Permissão</th>
                  <th className="px-6 py-3 border-b border-zinc-100 dark:border-zinc-800 w-24">Tipo</th>
                  <th className="px-6 py-3 border-b border-zinc-100 dark:border-zinc-800 w-32 text-center">Acesso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                
                {/* Telas */}
                {activeCategory?.telas?.map((tela, idx) => {
                  const isChecked = !!permissions[tela.permissao]

                  return (
                    <tr 
                      key={`tela-${idx}`}
                      className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                    >
                      <td className="px-6 py-3.5">
                        <span className="font-medium text-zinc-900 dark:text-zinc-200 select-none">
                          {tela.label}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-xs">
                        <span className="bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 px-2 py-0.5 rounded-full font-medium">Tela</span>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <label 
                          className="relative inline-flex items-center cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={isChecked}
                            onChange={() => handleToggle(tela.permissao)}
                          />
                          <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-red/30 dark:peer-focus:ring-brand-red/50 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-brand-red"></div>
                        </label>
                      </td>
                    </tr>
                  )
                })}

                {/* Ações */}
                {activeCategory?.acoes?.map((acao, idx) => {
                  const isChecked = !!permissions[acao.codename]

                  return (
                    <tr 
                      key={`acao-${idx}`}
                      className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                    >
                      <td className="px-6 py-3.5">
                        <span className="font-medium text-zinc-900 dark:text-zinc-200 select-none">
                          {acao.label}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-xs">
                        <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">Ação</span>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <label 
                          className="relative inline-flex items-center cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={isChecked}
                            onChange={() => handleToggle(acao.codename)}
                          />
                          <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-red/30 dark:peer-focus:ring-brand-red/50 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-brand-red"></div>
                        </label>
                      </td>
                    </tr>
                  )
                })}

                {(!activeCategory?.telas?.length && !activeCategory?.acoes?.length) && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-zinc-500">
                      Nenhuma permissão encontrada para este módulo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
