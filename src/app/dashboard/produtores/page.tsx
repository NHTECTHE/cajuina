"use client"

import * as React from "react"
import {
  UserCog, Plus, Search, Trash2,
  Loader2, AlertCircle, CheckCircle2, X, ChevronDown, ChevronsUpDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  type Produtor,
  listProdutoresAction,
  createProdutorAction,
  updateProdutorAction,
  deleteProdutorAction,
} from "@/app/actions/produtores"
import { listCorretoresAction, type Corretor } from "@/app/actions/corretores"

// ─── Constants ───────────────────────────────────────────────────────────────

const RECEBIMENTO_OPTIONS = [
  { value: "", label: "Selecione" },
  { value: "lucro", label: "Lucro" },
  { value: "comissao", label: "Comissão" },
  { value: "premio", label: "Prêmio" },
]

const EMPTY_FORM = {
  nome: "",
  corretora_id: null as number | null,
  email: "",
  telefone: "",
  recebimento: "",
  percentual: null as string | null,
  meta: null as string | null,
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTel(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11)
  if (d.length <= 10)
    return d.replace(/(\d{2})(\d{4})(\d{0,4})/, (_, a, b, c) => `(${a}) ${b}${c ? `-${c}` : ""}`)
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, (_, a, b, c) => `(${a}) ${b}${c ? `-${c}` : ""}`)
}

// ─── Sub-components ──────────────────────────────────────────────────────────

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

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12.5px] font-semibold text-zinc-600 dark:text-zinc-400">
        {label}{required && <span className="text-brand-red ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = cn(
  "w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60",
  "px-3.5 py-2.5 text-[13px] text-zinc-900 dark:text-zinc-100",
  "placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60",
  "transition-all duration-150 disabled:opacity-50"
)

// ─── CorretorCombobox ─────────────────────────────────────────────────────────

function CorretorCombobox({ corretores, loading, value, onChange }: {
  corretores: Corretor[]
  loading: boolean
  value: number | null
  onChange: (id: number | null) => void
}) {
  const selected = corretores.find(c => c.id === value) ?? null
  const [query, setQuery] = React.useState(selected?.nome ?? "")
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const filtered = query.trim()
    ? corretores.filter(c => c.nome.toLowerCase().includes(query.toLowerCase()))
    : corretores

  React.useEffect(() => {
    setQuery(selected?.nome ?? "") // eslint-disable-line react-hooks/set-state-in-effect
  }, [selected?.nome])

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery(selected?.nome ?? "")
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [selected?.nome])

  function handleSelect(c: Corretor) {
    onChange(c.id!)
    setQuery(c.nome)
    setOpen(false)
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange(null)
    setQuery("")
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          className={cn(inputCls, "pr-9")}
          placeholder={loading ? "Carregando..." : "Buscar corretora..."}
          value={query}
          disabled={loading}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          autoComplete="off"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={value ? handleClear : () => setOpen(o => !o)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
        >
          {value
            ? <X className="size-3.5" />
            : <ChevronsUpDown className="size-3.5" />}
        </button>
      </div>

      {open && !loading && (
        <div className={cn(
          "absolute z-50 top-full mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700",
          "bg-white dark:bg-zinc-900 shadow-lg overflow-hidden"
        )}>
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-[12.5px] text-zinc-400">Nenhuma corretora encontrada.</p>
          ) : (
            <ul className="max-h-52 overflow-y-auto">
              {filtered.map(c => (
                <li
                  key={c.id}
                  onMouseDown={() => handleSelect(c)}
                  className={cn(
                    "px-4 py-2.5 text-[13px] cursor-pointer transition-colors",
                    c.id === value
                      ? "bg-brand-red/10 text-brand-red font-semibold"
                      : "text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  )}
                >
                  {c.nome}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  produtor: Partial<Produtor> | null
  onClose: () => void
  onSaved: (p: Produtor) => void
  onDelete?: (p: Produtor) => void
}

function ProdutorModal({ produtor, onClose, onSaved, onDelete }: ModalProps) {
  const isEdit = !!produtor?.id
  const [form, setForm] = React.useState({
    ...EMPTY_FORM,
    nome: produtor?.nome ?? "",
    corretora_id: produtor?.corretora_id ?? null,
    email: produtor?.email ?? "",
    telefone: produtor?.telefone ?? "",
    recebimento: produtor?.recebimento ?? "",
    percentual: produtor?.percentual ?? null,
    meta: produtor?.meta ?? null,
  })
  const [corretores, setCorretores] = React.useState<Corretor[]>([])
  const [loadingCorretores, setLoadingCorretores] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [confirmSave, setConfirmSave] = React.useState(false)
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null)

  React.useEffect(() => {
    listCorretoresAction().then(res => {
      if (res.data) setCorretores(res.data.filter(c => c.ativo !== false))
      setLoadingCorretores(false)
    })
  }, [])

  function set(field: string, value: string | number | null) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEdit) { setConfirmSave(true); return }
    doSave()
  }

  async function doSave() {
    setConfirmSave(false)
    setSaving(true)
    setFeedback(null)

    const payload = {
      ...form,
      percentual: form.percentual === "" || form.percentual === null ? null : form.percentual,
      meta: form.meta === "" || form.meta === null ? null : form.meta,
    }

    const res = isEdit
      ? await updateProdutorAction(produtor!.id!, payload)
      : await createProdutorAction(payload as Omit<Produtor, "id" | "criado_em" | "atualizado_em">)

    setSaving(false)
    if (res.error) {
      setFeedback({ type: "error", message: res.error })
    } else {
      onSaved(res.data!)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className={cn(
          "relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl",
          "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-red/10 text-brand-red flex items-center justify-center">
                <UserCog className="size-4" />
              </div>
              <h2 className="text-[15px] font-bold text-zinc-900 dark:text-zinc-50">
                {isEdit ? "Editar Produtor" : "Novo Produtor"}
              </h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
              <X className="size-4.5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            <p className="text-[11.5px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              Dados do Produtor
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nome" required>
                <input className={inputCls} placeholder="Nome completo"
                  value={form.nome} onChange={e => set("nome", e.target.value)} required />
              </Field>
              <Field label="Corretora">
                <CorretorCombobox
                  corretores={corretores}
                  loading={loadingCorretores}
                  value={form.corretora_id}
                  onChange={id => set("corretora_id", id)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="E-mail">
                <input className={inputCls} type="email" placeholder="produtor@email.com"
                  value={form.email} onChange={e => set("email", e.target.value)} />
              </Field>
              <Field label="Telefone">
                <input className={inputCls} placeholder="(00) 00000-0000"
                  value={form.telefone}
                  onChange={e => set("telefone", formatTel(e.target.value))} />
              </Field>
            </div>

            <p className="text-[11.5px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pt-1">
              Comissão & Metas
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Recebimento">
                <div className="relative">
                  <select className={cn(inputCls, "appearance-none pr-9 cursor-pointer")}
                    value={form.recebimento} onChange={e => set("recebimento", e.target.value)}>
                    {RECEBIMENTO_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400 pointer-events-none" />
                </div>
              </Field>
              <Field label="Percentual (%)">
                <input className={inputCls} type="number" step="0.01" min="0" max="100"
                  placeholder="0.00"
                  value={form.percentual ?? ""}
                  onChange={e => set("percentual", e.target.value)} />
              </Field>
              <Field label="Meta (R$)">
                <input className={inputCls} type="number" step="0.01" min="0"
                  placeholder="0.00"
                  value={form.meta ?? ""}
                  onChange={e => set("meta", e.target.value)} />
              </Field>
            </div>

            {feedback && <Feedback type={feedback.type} message={feedback.message} />}

            <div className="flex items-center justify-between pt-2">
              <div>
                {isEdit && onDelete && (
                  <button type="button" onClick={() => onDelete(produtor as Produtor)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold bg-red-600 text-white border border-red-600 hover:bg-red-700 hover:border-red-700 active:scale-[0.98] transition-all duration-150 cursor-pointer">
                    <Trash2 className="size-4" />
                    Excluir
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-[13px] font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold bg-brand-red text-white hover:bg-brand-red/90 active:scale-[0.98] transition-all duration-150 cursor-pointer disabled:opacity-60 shadow-sm shadow-brand-red/20">
                  {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                  {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Cadastrar"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmação de salvar edição */}
      {confirmSave && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmSave(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 flex flex-col gap-4">
            <div>
              <p className="text-[14px] font-bold text-zinc-900 dark:text-zinc-50">Confirmar alterações</p>
              <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400 mt-1">
                Tem certeza que deseja salvar as alterações em <strong className="text-zinc-900 dark:text-zinc-100">{form.nome}</strong>?
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmSave(false)}
                className="px-4 py-2 rounded-xl text-[13px] font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                Cancelar
              </button>
              <button onClick={doSave}
                className="px-5 py-2 rounded-xl text-[13px] font-bold bg-brand-red text-white hover:bg-brand-red/90 active:scale-[0.98] transition-all cursor-pointer shadow-sm shadow-brand-red/20">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ nome, onConfirm, onClose, loading }: {
  nome: string; onConfirm: () => void; onClose: () => void; loading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center shrink-0">
            <Trash2 className="size-4" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-zinc-900 dark:text-zinc-50">Excluir Produtor</p>
            <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-0.5">Esta ação não pode ser desfeita.</p>
          </div>
        </div>
        <p className="text-[13px] text-zinc-600 dark:text-zinc-400">
          Tem certeza que deseja excluir <strong className="text-zinc-900 dark:text-zinc-100">{nome}</strong>?
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-[13px] font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60">
            {loading ? <Loader2 className="size-3.5 animate-spin" /> : null}
            {loading ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProdutoresPage() {
  const [produtores, setProdutores] = React.useState<Produtor[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [modal, setModal] = React.useState<"create" | Produtor | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<Produtor | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  const [toast, setToast] = React.useState<{ type: "success" | "error"; message: string } | null>(null)

  async function load(q = search) {
    setLoading(true)
    const res = await listProdutoresAction(q)
    if (res.data) setProdutores(res.data)
    setLoading(false)
  }

  React.useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect

  React.useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    load(search)
  }

  function handleSaved(_: Produtor) {
    setModal(null)
    setToast({ type: "success", message: modal === "create" ? "Produtor cadastrado!" : "Produtor atualizado!" })
    load()
  }

  async function handleDelete() {
    if (!deleteTarget?.id) return
    setDeleting(true)
    const res = await deleteProdutorAction(deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
    if (res.error) {
      setToast({ type: "error", message: res.error })
    } else {
      setToast({ type: "success", message: "Produtor excluído." })
      setProdutores(prev => prev.filter(p => p.id !== deleteTarget.id))
    }
  }

  return (
    <div className="flex-1 flex flex-col gap-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Produtores</h1>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            {produtores.length} {produtores.length === 1 ? "produtor cadastrado" : "produtores cadastrados"}
          </p>
        </div>
        <button onClick={() => setModal("create")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold bg-brand-red text-white hover:bg-brand-red/90 active:scale-[0.98] transition-all cursor-pointer shadow-sm shadow-brand-red/20 self-start sm:self-auto">
          <Plus className="size-4" /> Novo Produtor
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
        <input
          className={cn(inputCls, "pl-10 pr-4")}
          placeholder="Buscar por nome ou corretora..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </form>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
          <Feedback type={toast.type} message={toast.message} />
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-brand-red opacity-60" />
          </div>
        ) : produtores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-400">
            <UserCog className="size-10 opacity-30" />
            <p className="text-[13px]">Nenhum produtor encontrado.</p>
            <button onClick={() => setModal("create")}
              className="text-[12px] font-semibold text-brand-red hover:underline cursor-pointer">
              Cadastrar o primeiro produtor
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/40">
                  {["Nome", "Corretora", "E-mail", "Telefone", "Recebimento", "Percentual", "Meta"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {produtores.map((p, i) => (
                  <tr key={p.id}
                    onClick={() => setModal(p)}
                    className={cn(
                      "border-b border-zinc-100 dark:border-zinc-800/60 transition-colors cursor-pointer",
                      i % 2 === 0 ? "" : "bg-zinc-50/40 dark:bg-zinc-800/20",
                      "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                    )}>
                    <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">{p.nome}</td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{p.corretora_nome || "—"}</td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{p.email || "—"}</td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{p.telefone || "—"}</td>
                    <td className="px-4 py-3">
                      {p.recebimento ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 uppercase">
                          {p.recebimento}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 font-mono text-[12px]">
                      {p.percentual != null ? `${p.percentual}%` : "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 font-mono text-[12px]">
                      {p.meta != null
                        ? Number(p.meta).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal !== null && (
        <ProdutorModal
          produtor={modal === "create" ? {} : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
          onDelete={(p) => { setModal(null); setDeleteTarget(p) }}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          nome={deleteTarget.nome}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
