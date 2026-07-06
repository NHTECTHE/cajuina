"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Building2, Loader2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  getSeguradoraAction,
  updateSeguradoraAction,
  deleteSeguradoraAction,
  type Seguradora,
} from "@/app/actions/seguradoras"
import { Feedback, Field, inputCls, CurrencyInput, LogoAvatar } from "../_components"
import { Switch } from "@/components/ui/switch"

export default function SeguradoraDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = Number(params?.id)

  const [seguradora, setSeguradora] = React.useState<Seguradora | null>(null)
  const [form, setForm] = React.useState<Omit<Seguradora, "id" | "logo" | "criado_em" | "atualizado_em"> | null>(null)
  const [logoFile, setLogoFile] = React.useState<File | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [notFound, setNotFound] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null)

  React.useEffect(() => {
    let active = true
    getSeguradoraAction(id).then(res => {
      if (!active) return
      if (res.error || !res.data) {
        setNotFound(true)
      } else {
        const s = res.data
        setSeguradora(s)
        setForm({
          nome: s.nome,
          meta: s.meta,
          premio_minimo: s.premio_minimo,
          taxa_comissao: s.taxa_comissao,
          dia_vencimento: s.dia_vencimento,
          ativo: s.ativo,
        })
      }
      setLoading(false)
    })
    return () => { active = false }
  }, [id])

  function set<K extends keyof NonNullable<typeof form>>(field: K, value: NonNullable<typeof form>[K]) {
    setForm(f => f ? { ...f, [field]: value } : f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    setSaving(true)
    setFeedback(null)

    const payload = {
      ...form,
      taxa_comissao: form.taxa_comissao === "" ? null : form.taxa_comissao,
      dia_vencimento: form.dia_vencimento === null ? null : Number(form.dia_vencimento),
    }

    const res = await updateSeguradoraAction(id, payload, logoFile)
    setSaving(false)
    if (res.error) {
      setFeedback({ type: "error", message: res.error })
    } else {
      setSeguradora(res.data!)
      setLogoFile(null)
      setFeedback({ type: "success", message: "Seguradora atualizada!" })
    }
  }

  async function handleDelete() {
    setDeleting(true)
    const res = await deleteSeguradoraAction(id)
    setDeleting(false)
    if (res.error) {
      setConfirmDelete(false)
      setFeedback({ type: "error", message: res.error })
    } else {
      router.push("/dashboard/seguradoras")
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-brand-red opacity-60" />
      </div>
    )
  }

  if (notFound || !form || !seguradora) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3 text-zinc-400">
        <Building2 className="size-10 opacity-30" />
        <p className="text-[13px]">Seguradora não encontrada.</p>
        <Link href="/dashboard/seguradoras" className="text-[12px] font-semibold text-brand-red hover:underline cursor-pointer">
          Voltar para a listagem
        </Link>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col gap-5 max-w-2xl mx-auto w-full">

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12.5px] text-zinc-400 dark:text-zinc-500">
        <Link href="/dashboard/seguradoras" className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer">
          Seguradoras
        </Link>
        <span>/</span>
        <span className="text-zinc-600 dark:text-zinc-300 font-medium">{seguradora.nome}</span>
      </div>

      <form onSubmit={handleSubmit}
        className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm divide-y divide-zinc-100 dark:divide-zinc-800">

        {/* Header: voltar + logo + nome + status */}
        <div className="p-6 flex items-center gap-4">
          <Link href="/dashboard/seguradoras"
            className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
            <ArrowLeft className="size-4.5" />
          </Link>

          <LogoAvatar currentUrl={seguradora.logo} onChange={setLogoFile} />

          <div className="min-w-0 flex-1">
            <input
              className="w-full bg-transparent text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 focus:outline-none focus:border-b focus:border-brand-red/60 truncate"
              value={form.nome}
              onChange={e => set("nome", e.target.value)}
              required
              aria-label="Nome da seguradora"
            />
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                "inline-flex items-center gap-1.5 text-[11.5px] font-semibold",
                form.ativo ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-500"
              )}>
                <span className={cn("size-1.5 rounded-full", form.ativo ? "bg-emerald-500" : "bg-zinc-400")} />
                {form.ativo ? "Ativa" : "Inativa"}
              </span>
              <span className="text-zinc-300 dark:text-zinc-600">·</span>
              <span className="text-[12.5px] text-zinc-400 dark:text-zinc-500">
                Cadastrada em {seguradora.criado_em ? new Date(seguradora.criado_em).toLocaleDateString("pt-BR") : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Financeiro */}
        <div className="p-6 flex flex-col gap-4">
          <p className="text-[11.5px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            Financeiro
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Meta">
              <CurrencyInput value={form.meta} onChange={v => set("meta", v)} />
            </Field>
            <Field label="Prêmio Mínimo" required>
              <CurrencyInput value={form.premio_minimo} onChange={v => set("premio_minimo", v ?? "")} required />
            </Field>
          </div>
        </div>

        {/* Configuração */}
        <div className="p-6 flex flex-col gap-4">
          <p className="text-[11.5px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            Configuração
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Taxa Comissão (%)">
              <input className={inputCls} type="number" step="0.01" min="0" max="100"
                placeholder="0,00"
                value={form.taxa_comissao ?? ""}
                onChange={e => set("taxa_comissao", e.target.value || null)} />
            </Field>
            <Field label="Dia Vencimento">
              <input className={inputCls} type="number" min="1" max="31"
                placeholder="1 – 31"
                value={form.dia_vencimento ?? ""}
                onChange={e => set("dia_vencimento", e.target.value ? Number(e.target.value) : null)} />
            </Field>
            <Field label="Seguradora Ativa">
              <div className="flex items-center h-9">
                <Switch
                  checked={form.ativo ?? false}
                  onCheckedChange={(checked) => set("ativo", checked)}
                />
              </div>
            </Field>
          </div>
        </div>

        {feedback && <div className="p-6"><Feedback type={feedback.type} message={feedback.message} /></div>}

        {/* Ações */}
        <div className="p-4 flex items-center justify-between">
          <button type="button" onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer">
            <Trash2 className="size-4" />
            Excluir seguradora
          </button>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold bg-brand-red text-white hover:bg-brand-red/90 active:scale-[0.98] transition-all duration-150 cursor-pointer disabled:opacity-60 shadow-sm shadow-brand-red/20">
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDelete(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="size-4" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-zinc-900 dark:text-zinc-50">Excluir Seguradora</p>
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-0.5">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            <p className="text-[13px] text-zinc-600 dark:text-zinc-400">
              Tem certeza que deseja excluir <strong className="text-zinc-900 dark:text-zinc-100">{seguradora.nome}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 rounded-xl text-[13px] font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60">
                {deleting ? <Loader2 className="size-3.5 animate-spin" /> : null}
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
