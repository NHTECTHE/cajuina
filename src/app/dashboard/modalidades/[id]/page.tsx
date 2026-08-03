"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Loader2, Save, Building2, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { TableSkeleton } from "@/components/ui/skeleton"
import {
  getMatrizAction,
  updateMatrizAction,
  type SeguradoraSimples,
  type ModalidadeMatrizLinha
} from "@/app/actions/modalidades"

function Feedback({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div role="alert" aria-live="polite" className={cn(
      "flex items-center gap-2.5 rounded-xl px-4 py-3 text-[13px] font-medium border",
      type === "success"
        ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400"
        : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400"
    )}>
      {type === "success" ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
      {message}
    </div>
  )
}

export default function CodigosModalidadePage() {
  const router = useRouter()
  const params = useParams()
  const modId = Number(params?.id)
  
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [toast, setToast] = React.useState<{ type: "success" | "error"; message: string } | null>(null)
  
  const [modalidade, setModalidade] = React.useState<ModalidadeMatrizLinha | null>(null)
  const [seguradoras, setSeguradoras] = React.useState<SeguradoraSimples[]>([])
  
  // All modalities to be sent back on save
  const [allModalidades, setAllModalidades] = React.useState<ModalidadeMatrizLinha[]>([])
  
  const [codigos, setCodigos] = React.useState<Record<number, string>>({})

  async function load() {
    if (!modId || isNaN(modId)) return
    
    const res = await getMatrizAction()
    
    if (res.data) {
      setSeguradoras(res.data.seguradoras)
      setAllModalidades(res.data.modalidades)
      
      const mod = res.data.modalidades.find(m => m.id === modId)
      if (mod) {
        setModalidade(mod)
        // Convert the string-keyed codigos to number-keyed
        const mappedCodigos: Record<number, string> = {}
        Object.entries(mod.codigos).forEach(([k, v]) => {
          mappedCodigos[Number(k)] = v
        })
        setCodigos(mappedCodigos)
      } else {
        setToast({ type: "error", message: "Modalidade não encontrada." })
      }
    } else if (res.error) {
      setToast({ type: "error", message: res.error })
    }
    
    setLoading(false)
  }

  React.useEffect(() => { load() }, [modId]) // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect

  React.useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  function handleCodigoChange(segId: number, val: string) {
    setCodigos(prev => ({ ...prev, [segId]: val }))
  }

  async function handleSave() {
    if (!modalidade) return
    setSaving(true)
    
    const linhas = allModalidades.map(m => {
      // Use edited codes for current modality, existing codes for others
      const isCurrent = m.id === modId
      const rowCodigos = isCurrent ? codigos : m.codigos
      
      return {
        modalidade: m.id,
        itens: seguradoras.map(s => ({
          seguradora: s.id,
          codigo_seguradora: (isCurrent ? rowCodigos[s.id] : m.codigos[String(s.id)]) || "",
          ativo: true
        }))
      }
    })
    
    const res = await updateMatrizAction(linhas)
    setSaving(false)
    
    if (res.error) {
      setToast({ type: "error", message: res.error })
    } else {
      setToast({ type: "success", message: "Códigos atualizados com sucesso!" })
      setTimeout(() => {
        router.push("/dashboard/modalidades")
      }, 1500)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col gap-5 p-6 h-full">
        <TableSkeleton rows={4} />
      </div>
    )
  }

  if (!modalidade) {
    return (
      <div className="flex-1 flex flex-col gap-5 p-6 h-full">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer shrink-0">
            <ArrowLeft className="size-4" />
          </button>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Modalidade não encontrada</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col gap-5 p-6 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer shrink-0">
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              Códigos nas Seguradoras
            </h1>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Modalidade: <strong className="text-zinc-900 dark:text-zinc-100">{modalidade.nome}</strong>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button type="button" onClick={() => router.back()} disabled={saving}
            className="px-4 py-2.5 rounded-xl text-[13px] font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50">
            Cancelar
          </button>
          <button type="button" onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold bg-brand-red text-white hover:bg-brand-red/90 active:scale-[0.98] transition-all duration-150 cursor-pointer disabled:opacity-60 shadow-sm shadow-brand-red/20">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saving ? "Salvando..." : "Salvar Códigos"}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
          <Feedback type={toast.type} message={toast.message} />
        </div>
      )}

      {/* Content */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 shadow-sm flex flex-col p-6">
        {seguradoras.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3 text-zinc-400">
            <Building2 className="size-10 opacity-30" />
            <p className="text-[13px]">Nenhuma seguradora cadastrada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {seguradoras.map(s => (
              <div key={s.id} className="flex flex-col gap-1.5 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-800/20 hover:border-brand-red/30 transition-colors group">
                <label className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">
                  {s.nome}
                </label>
                <input
                  type="text"
                  value={codigos[s.id] || ""}
                  onChange={(e) => handleCodigoChange(s.id, e.target.value)}
                  placeholder="Código (opcional)"
                  className={cn(
                    "w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900",
                    "px-3 py-2.5 text-[13px] text-zinc-900 dark:text-zinc-100",
                    "placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60",
                    "transition-all duration-150"
                  )}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
