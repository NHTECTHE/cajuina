"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, FolderTree, Plus, Search, Trash2, Power, PowerOff,
  Loader2, AlertCircle, CheckCircle2, X, Edit } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  type Modalidade,
  listModalidadesAction,
  createModalidadeAction,
  updateModalidadeAction,
  deleteModalidadeAction,
} from "@/app/actions/modalidades"

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

const EMPTY_FORM: Omit<Modalidade, "id" | "criado_em" | "atualizado_em"> = {
  nome: "",
  ativo: true,
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  modalidade: Partial<Modalidade> | null
  onClose: () => void
  onSaved: (m: Modalidade) => void
  onDelete?: (m: Modalidade) => void
}

function ModalidadeModal({ modalidade, onClose, onSaved, onDelete }: ModalProps) {
  const isEdit = !!modalidade?.id
  const [form, setForm] = React.useState({ ...EMPTY_FORM, ...modalidade })
  const [saving, setSaving] = React.useState(false)
  const [confirmSave, setConfirmSave] = React.useState(false)
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null)

  function set(field: string, value: any) {
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
    }

    const res = isEdit
      ? await updateModalidadeAction(modalidade!.id!, payload)
      : await createModalidadeAction(payload as Omit<Modalidade, "id" | "criado_em" | "atualizado_em">)

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
          "relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl",
          "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-red/10 text-brand-red flex items-center justify-center">
                <FolderTree className="size-4" />
              </div>
              <h2 className="text-[15px] font-bold text-zinc-900 dark:text-zinc-50">
                {isEdit ? "Editar Modalidade" : "Nova Modalidade"}
              </h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
              <X className="size-4.5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            <p className="text-[11.5px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              Dados da Modalidade
            </p>

            <Field label="Nome" required>
              <input className={inputCls} placeholder="Nome da modalidade (Ex: Garantia do Licitante)"
                value={form.nome} onChange={e => set("nome", e.target.value)} required />
            </Field>

            <label className="flex items-center gap-2 mt-2 cursor-pointer w-fit">
              <input type="checkbox" checked={form.ativo} onChange={e => set("ativo", e.target.checked)} className="rounded text-brand-red focus:ring-brand-red h-4 w-4 border-gray-300" />
              <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">Modalidade Ativa</span>
            </label>

            {feedback && <Feedback type={feedback.type} message={feedback.message} />}

            <div className="flex items-center justify-between pt-2 mt-2 border-t border-zinc-100 dark:border-zinc-800 pt-4">
              <div>
                {isEdit && onDelete && (
                  <button type="button" onClick={() => onDelete(modalidade as Modalidade)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300 active:scale-[0.98] transition-all duration-150 cursor-pointer">
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
            <p className="text-[14px] font-bold text-zinc-900 dark:text-zinc-50">Excluir Modalidade</p>
            <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-0.5">Esta ação não pode ser desfeita.</p>
          </div>
        </div>
        <p className="text-[13px] text-zinc-600 dark:text-zinc-400">
          Tem certeza que deseja excluir a modalidade <strong className="text-zinc-900 dark:text-zinc-100">{nome}</strong>?
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

// ─── Toggle confirm ───────────────────────────────────────────────────────────

function ToggleConfirm({ modalidade, onConfirm, onClose, loading }: {
  modalidade: Modalidade; onConfirm: () => void; onClose: () => void; loading: boolean
}) {
  const isActivating = !modalidade.ativo
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", isActivating ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600")}>
            {isActivating ? <Power className="size-4" /> : <PowerOff className="size-4" />}
          </div>
          <div>
            <p className="text-[14px] font-bold text-zinc-900 dark:text-zinc-50">{isActivating ? "Ativar Modalidade" : "Inativar Modalidade"}</p>
          </div>
        </div>
        <p className="text-[13px] text-zinc-600 dark:text-zinc-400">
          Tem certeza que deseja {isActivating ? "ativar" : "inativar"} a modalidade <strong className="text-zinc-900 dark:text-zinc-100">{modalidade.nome}</strong>?
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-[13px] font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold text-white active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60", isActivating ? "bg-emerald-600 hover:bg-emerald-700" : "bg-orange-600 hover:bg-orange-700")}>
            {loading ? <Loader2 className="size-3.5 animate-spin" /> : null}
            {loading ? "Aguarde..." : isActivating ? "Ativar" : "Inativar"}
          </button>
        </div>
      </div>
    </div>
  )
}


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ModalidadesPage() {
  const router = useRouter()
  const [modalidades, setModalidades] = React.useState<Modalidade[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [modal, setModal] = React.useState<"create" | Modalidade | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<Modalidade | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  const [toggleTarget, setToggleTarget] = React.useState<Modalidade | null>(null)
  const [toggling, setToggling] = React.useState(false)
  const [toast, setToast] = React.useState<{ type: "success" | "error"; message: string } | null>(null)

  async function load(q = search) {
    setLoading(true)
    const res = await listModalidadesAction(q)
    if (res.data) setModalidades(res.data)
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

  function handleSaved(_: Modalidade) {
    setModal(null)
    setToast({ type: "success", message: modal === "create" ? "Modalidade cadastrada!" : "Modalidade atualizada!" })
    load()
  }

  async function handleDelete() {
    if (!deleteTarget?.id) return
    setDeleting(true)
    const res = await deleteModalidadeAction(deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
    if (res.error) {
      setToast({ type: "error", message: res.error })
    } else {
      setToast({ type: "success", message: "Modalidade excluída." })
      setModalidades(prev => prev.filter(s => s.id !== deleteTarget.id))
    }
  }

  async function handleToggle() {
    if (!toggleTarget?.id) return
    setToggling(true)
    const newStatus = !toggleTarget.ativo
    const res = await updateModalidadeAction(toggleTarget.id, { ativo: newStatus })
    setToggling(false)
    setToggleTarget(null)
    if (res.error) {
      setToast({ type: "error", message: res.error })
    } else {
      setToast({ type: "success", message: `Modalidade ${newStatus ? 'ativada' : 'inativada'} com sucesso.` })
      load()
    }
  }

  return (
    <div className="flex-1 flex flex-col gap-5 p-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer shrink-0">
            <ArrowLeft className="size-4" />
          </button>
          <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Modalidades</h1>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            {modalidades.length} {modalidades.length === 1 ? "modalidade cadastrada" : "modalidades cadastradas"}
          </p>
        </div>
        </div>
        <button onClick={() => setModal("create")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold bg-brand-red text-white hover:bg-brand-red/90 active:scale-[0.98] transition-all cursor-pointer shadow-sm shadow-brand-red/20 self-start sm:self-auto">
          <Plus className="size-4" /> Nova Modalidade
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
        <input
          className={cn(inputCls, "pl-10 pr-4")}
          placeholder="Buscar por nome..."
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
        ) : modalidades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-400">
            <FolderTree className="size-10 opacity-30" />
            <p className="text-[13px]">Nenhuma modalidade encontrada.</p>
            <button onClick={() => setModal("create")}
              className="text-[12px] font-semibold text-brand-red hover:underline cursor-pointer">
              Cadastrar a primeira modalidade
            </button>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col p-4 gap-3">
              {modalidades.map((m) => (
                <div key={m.id} className="flex flex-col p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 shadow-sm gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[14px] text-zinc-900 dark:text-zinc-100">{m.nome}</span>
                    <div className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest", m.ativo ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600")}>
                      {m.ativo ? "Ativo" : "Inativo"}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
                    <button onClick={() => setToggleTarget(m)} title={m.ativo ? "Inativar" : "Ativar"} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors", m.ativo ? "text-orange-600 bg-orange-50 hover:bg-orange-100" : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100")}>
                      {m.ativo ? <PowerOff className="size-3.5" /> : <Power className="size-3.5" />}
                      {m.ativo ? "Inativar" : "Ativar"}
                    </button>
                    <button onClick={() => setModal(m)} title="Editar" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 hover:text-brand-red transition-colors">
                      <Edit className="size-3.5" />
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/40">
                    <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Status</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 w-full">Nome</th>
                    <th className="text-right px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {modalidades.map((m, i) => (
                    <tr key={m.id}
                      className={cn(
                        "border-b border-zinc-100 dark:border-zinc-800/60 transition-colors",
                        i % 2 === 0 ? "" : "bg-zinc-50/40 dark:bg-zinc-800/20",
                        "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                      )}>
                      <td className="px-4 py-3">
                        <div className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest", m.ativo ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600")}>
                          {m.ativo ? "Ativo" : "Inativo"}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">{m.nome}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setToggleTarget(m)} title={m.ativo ? "Inativar" : "Ativar"} className={cn("p-1.5 rounded-lg transition-colors", m.ativo ? "text-orange-500 hover:bg-orange-50" : "text-emerald-500 hover:bg-emerald-50")}>
                             {m.ativo ? <PowerOff className="size-4" /> : <Power className="size-4" />}
                          </button>
                          <button onClick={() => setModal(m)} title="Editar" className="p-1.5 rounded-lg text-zinc-400 hover:text-brand-red hover:bg-brand-red/10 transition-colors">
                             <Edit className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {modal !== null && (
        <ModalidadeModal
          modalidade={modal === "create" ? {} : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
          onDelete={(m) => { setModal(null); setDeleteTarget(m) }}
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
      {toggleTarget && (
        <ToggleConfirm
          modalidade={toggleTarget}
          onConfirm={handleToggle}
          onClose={() => setToggleTarget(null)}
          loading={toggling}
        />
      )}
    </div>
  )
}
