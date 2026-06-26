"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Users, Plus, Search, Trash2,
  Loader2, AlertCircle, CheckCircle2, X, ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  type Usuario,
  listUsuariosAction,
  createUsuarioAction,
  updateUsuarioAction,
  deleteUsuarioAction,
} from "@/app/actions/usuarios"

// ─── Constants ───────────────────────────────────────────────────────────────

const CARGO_OPTIONS = [
  { value: "", label: "Selecione" },
  { value: "administrador", label: "Administrador" },
  { value: "financeiro", label: "Financeiro" },
  { value: "usuario", label: "Usuário" },
  { value: "corretor", label: "Corretor" },
  { value: "produtor", label: "Produtor" },
  { value: "auto", label: "Auto" },
  { value: "tomador", label: "Tomador" },
]

const CARGO_COLORS: Record<string, string> = {
  administrador: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  financeiro: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  usuario: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  corretor: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  produtor: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  auto: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  tomador: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
}

const EMPTY_FORM: Omit<Usuario, "id"> = {
  first_name: "",
  email: "",
  username: "",
  cargo: "",
  password: "",
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Feedback({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div className={cn(
      "flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium",
      type === "success"
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
        : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
    )}>
      {type === "success" ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
      {message}
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = cn(
  "w-full rounded-xl border border-zinc-200 dark:border-zinc-700",
  "bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50",
  "placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-red/40"
)

// ─── Modal ───────────────────────────────────────────────────────────────────

interface ModalProps {
  usuario: Usuario | null
  onClose: () => void
  onSaved: (u: Usuario) => void
  onDelete: (u: Usuario) => void
}

function UsuarioModal({ usuario, onClose, onSaved, onDelete }: ModalProps) {
  const isEditing = !!usuario?.id
  const [form, setForm] = React.useState<Omit<Usuario, "id">>(
    usuario ? { first_name: usuario.first_name, email: usuario.email, username: usuario.username, cargo: usuario.cargo, password: "" }
            : EMPTY_FORM
  )
  const [loading, setLoading] = React.useState(false)
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  function set(field: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setFeedback(null)

    const payload: Partial<Usuario> = {
      first_name: form.first_name,
      email: form.email,
      username: form.username,
      cargo: form.cargo,
    }
    if (form.password) payload.password = form.password

    let result
    if (isEditing && usuario?.id) {
      result = await updateUsuarioAction(usuario.id, payload)
    } else {
      result = await createUsuarioAction(payload as Omit<Usuario, "id">)
    }

    setLoading(false)
    if (result.error) {
      setFeedback({ type: "error", message: result.error })
    } else if (result.data) {
      setFeedback({ type: "success", message: isEditing ? "Usuário atualizado!" : "Usuário criado!" })
      setTimeout(() => { onSaved(result.data!) }, 800)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-800 relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Users className="size-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                {isEditing ? "Editar Usuário" : "Novo Usuário"}
              </p>
              {isEditing && (
                <p className="text-[11px] text-zinc-400">{usuario?.email}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nome" required>
              <input
                className={inputCls}
                value={form.first_name}
                onChange={e => set("first_name", e.target.value)}
                placeholder="Nome completo"
                required
              />
            </Field>
            <Field label="Email" required>
              <input
                type="email"
                className={inputCls}
                value={form.email}
                onChange={e => set("email", e.target.value)}
                placeholder="email@empresa.com"
                required
              />
            </Field>
            <Field label="Usuário" required>
              <input
                className={inputCls}
                value={form.username}
                onChange={e => set("username", e.target.value)}
                placeholder="joao.silva"
                required
              />
            </Field>
            <Field label="Cargo" required>
              <div className="relative">
                <select
                  className={cn(inputCls, "appearance-none pr-8 cursor-pointer")}
                  value={form.cargo}
                  onChange={e => set("cargo", e.target.value)}
                  required
                >
                  {CARGO_OPTIONS.map(o => (
                    <option key={o.value} value={o.value} disabled={o.value === ""}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
              </div>
            </Field>
            <Field label={isEditing ? "Nova Senha" : "Senha"}>
              <input
                type="password"
                className={inputCls}
                value={form.password}
                onChange={e => set("password", e.target.value)}
                placeholder={isEditing ? "Deixe em branco para manter a senha atual" : "Deixe em branco para usar 123456"}
              />
            </Field>
          </div>

          {feedback && <Feedback type={feedback.type} message={feedback.message} />}

          <div className="flex items-center justify-between pt-1">
            {isEditing && usuario?.id ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
              >
                <Trash2 className="size-4" /> Excluir
              </button>
            ) : <div />}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red/90 disabled:opacity-60 transition-colors"
              >
                {loading && <Loader2 className="size-4 animate-spin" />}
                {isEditing ? "Salvar alterações" : "Criar usuário"}
              </button>
            </div>
          </div>
        </form>

        {/* Delete confirm overlay */}
        {confirmDelete && usuario && (
          <DeleteConfirm
            nome={usuario.first_name}
            onConfirm={async () => {
              setLoading(true)
              const res = await deleteUsuarioAction(usuario.id!)
              setLoading(false)
              if (res.error) {
                setFeedback({ type: "error", message: res.error })
                setConfirmDelete(false)
              } else {
                onDelete(usuario)
              }
            }}
            onClose={() => setConfirmDelete(false)}
            loading={loading}
          />
        )}
      </div>
    </div>
  )
}

function DeleteConfirm({ nome, onConfirm, onClose, loading }: {
  nome: string; onConfirm: () => void; onClose: () => void; loading: boolean
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm p-6">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
          <Trash2 className="size-5 text-red-500" />
        </div>
        <div>
          <p className="font-bold text-zinc-900 dark:text-zinc-50">Excluir usuário?</p>
          <p className="text-sm text-zinc-500 mt-1">&quot;{nome}&quot; será removido permanentemente.</p>
        </div>
        <div className="flex gap-2 justify-center">
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-600 dark:text-zinc-300"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UsuariosPage() {
  const router = useRouter()
  const [usuarios, setUsuarios] = React.useState<Usuario[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [modal, setModal] = React.useState<{ open: boolean; usuario: Usuario | null }>({ open: false, usuario: null })

  async function load(q = search) {
    setLoading(true)
    setError(null)
    const res = await listUsuariosAction(q)
    setLoading(false)
    if (res.error) setError(res.error)
    else setUsuarios(res.data ?? [])
  }

  React.useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    load(search)
  }

  function handleSaved(_: Usuario) {
    setModal({ open: false, usuario: null })
    load()
  }

  function handleDelete(_: Usuario) {
    setModal({ open: false, usuario: null })
    load()
  }

  return (
    <div className="flex-1 flex flex-col gap-6 py-2">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer shrink-0">
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              Usuários
            </h1>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1">
              Gerencie os usuários do sistema.
            </p>
          </div>
        </div>
        <button
          onClick={() => setModal({ open: true, usuario: null })}
          className="flex items-center gap-2 rounded-xl bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red/90 transition-colors shrink-0"
        >
          <Plus className="size-4" /> Novo Usuário
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
          <input
            className={cn(
              "w-full rounded-xl border border-zinc-200 dark:border-zinc-700",
              "bg-white dark:bg-zinc-800 pl-9 pr-4 py-2 text-sm",
              "placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-red/40"
            )}
            placeholder="Buscar por nome, email ou usuário..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
        >
          Buscar
        </button>
      </form>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-zinc-400">
          <Loader2 className="size-6 animate-spin mr-2" /> Carregando...
        </div>
      ) : error ? (
        <Feedback type="error" message={error} />
      ) : usuarios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-2">
          <Users className="size-10 opacity-30" />
          <p className="text-sm">Nenhum usuário encontrado.</p>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-3">
            {usuarios.map(u => (
              <div key={u.id} className="flex flex-col p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[14px] text-zinc-900 dark:text-zinc-100">{u.first_name}</span>
                  <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize", CARGO_COLORS[u.cargo] ?? CARGO_COLORS.usuario)}>
                    {CARGO_OPTIONS.find(o => o.value === u.cargo)?.label ?? u.cargo}
                  </span>
                </div>
                <div className="flex flex-col gap-1 text-[12px] text-zinc-500 dark:text-zinc-400">
                  <p><span className="font-medium text-zinc-600 dark:text-zinc-300">Email:</span> {u.email}</p>
                  <p><span className="font-medium text-zinc-600 dark:text-zinc-300">Usuário:</span> {u.username}</p>
                </div>
                <div className="flex justify-end border-t border-zinc-100 dark:border-zinc-800 pt-2 mt-1">
                  <button onClick={() => setModal({ open: true, usuario: u })} className="text-[12px] font-semibold text-brand-red hover:text-brand-red/80 transition-colors">
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[2fr_2fr_1fr_1fr_80px] bg-zinc-50 dark:bg-zinc-900/50 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <span>Nome</span>
              <span>Email</span>
              <span>Usuário</span>
              <span>Cargo</span>
              <span></span>
            </div>
            {/* Table rows */}
            {usuarios.map(u => (
              <div
                key={u.id}
                className="grid grid-cols-[2fr_2fr_1fr_1fr_80px] items-center px-4 py-3 border-b last:border-b-0 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
              >
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate">{u.first_name}</span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{u.email}</span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{u.username}</span>
                <span>
                  <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize", CARGO_COLORS[u.cargo] ?? CARGO_COLORS.usuario)}>
                    {CARGO_OPTIONS.find(o => o.value === u.cargo)?.label ?? u.cargo}
                  </span>
                </span>
                <button
                  onClick={() => setModal({ open: true, usuario: u })}
                  className="text-[11px] font-semibold text-brand-red hover:text-brand-red/80 transition-colors"
                >
                  Editar
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      {modal.open && (
        <UsuarioModal
          usuario={modal.usuario}
          onClose={() => setModal({ open: false, usuario: null })}
          onSaved={handleSaved}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
