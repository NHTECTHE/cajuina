"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { createSeguradoraAction, type Seguradora } from "@/app/actions/seguradoras"
import { Feedback, Field, inputCls, CurrencyInput, LogoAvatar } from "../_components"

const EMPTY_FORM = {
  nome: "",
  meta: null as string | null,
  premio_minimo: "",
  taxa_comissao: null as string | null,
  dia_vencimento: null as number | null,
}

export default function NovaSeguradoraPage() {
  const router = useRouter()
  const [form, setForm] = React.useState(EMPTY_FORM)
  const [logoFile, setLogoFile] = React.useState<File | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null)

  function set<K extends keyof typeof EMPTY_FORM>(field: K, value: typeof EMPTY_FORM[K]) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setFeedback(null)

    const payload = {
      ...form,
      taxa_comissao: form.taxa_comissao === "" ? null : form.taxa_comissao,
      dia_vencimento: form.dia_vencimento === null ? null : Number(form.dia_vencimento),
    }

    const res = await createSeguradoraAction(
      payload as Omit<Seguradora, "id" | "logo" | "criado_em" | "atualizado_em">,
      logoFile,
    )

    setSaving(false)
    if (res.error) {
      setFeedback({ type: "error", message: res.error })
      return
    }
    router.push(`/dashboard/seguradoras/${res.data!.id}`)
  }

  return (
    <div className="flex-1 flex flex-col gap-5 max-w-2xl mx-auto w-full">

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12.5px] text-zinc-400 dark:text-zinc-500">
        <Link href="/dashboard/seguradoras" className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer">
          Seguradoras
        </Link>
        <span>/</span>
        <span className="text-zinc-600 dark:text-zinc-300 font-medium">Nova seguradora</span>
      </div>

      <form onSubmit={handleSubmit}
        className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm divide-y divide-zinc-100 dark:divide-zinc-800">

        {/* Header: voltar + logo + nome */}
        <div className="p-6 flex items-center gap-4">
          <Link href="/dashboard/seguradoras"
            className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
            <ArrowLeft className="size-4.5" />
          </Link>

          <LogoAvatar currentUrl={null} onChange={setLogoFile} />

          <div className="min-w-0 flex-1">
            <input
              className="w-full bg-transparent text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:outline-none focus:border-b focus:border-brand-red/60 truncate"
              placeholder="Razão social da seguradora"
              value={form.nome}
              onChange={e => set("nome", e.target.value)}
              required
              aria-label="Nome da seguradora"
            />
            <p className="text-[12.5px] text-zinc-400 dark:text-zinc-500 mt-0.5">
              Nova seguradora
            </p>
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
          </div>
        </div>

        {feedback && <div className="p-6"><Feedback type={feedback.type} message={feedback.message} /></div>}

        {/* Ações */}
        <div className="p-4 flex items-center justify-end gap-2">
          <Link href="/dashboard/seguradoras"
            className="px-4 py-2.5 rounded-xl text-[13px] font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
            Cancelar
          </Link>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold bg-brand-red text-white hover:bg-brand-red/90 active:scale-[0.98] transition-all duration-150 cursor-pointer disabled:opacity-60 shadow-sm shadow-brand-red/20">
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            {saving ? "Salvando..." : "Cadastrar"}
          </button>
        </div>
      </form>
    </div>
  )
}
