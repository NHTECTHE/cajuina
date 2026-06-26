"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, LockKeyhole, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { changePasswordAction } from "@/app/actions/alterar-senha"

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

function PasswordInput({ value, onChange, placeholder, required }: { value: string, onChange: (v: string) => void, placeholder: string, required?: boolean }) {
  const [show, setShow] = React.useState(false)
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={cn(
          "w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60",
          "pl-3.5 pr-10 py-2.5 text-[13px] text-zinc-900 dark:text-zinc-100",
          "placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60",
          "transition-all duration-150"
        )}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}

export default function AlterarSenhaPage() {
  const router = useRouter()
  const [oldPassword, setOldPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFeedback(null)

    if (newPassword !== confirmPassword) {
      setFeedback({ type: "error", message: "A nova senha e a confirmação não coincidem." })
      return
    }

    if (newPassword.length < 6) {
      setFeedback({ type: "error", message: "A nova senha deve ter pelo menos 6 caracteres." })
      return
    }

    setSaving(true)
    const res = await changePasswordAction({
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: confirmPassword
    })
    setSaving(false)

    if (res.error) {
      // Se for um objeto com mensagens de erro do serializer
      if (typeof res.error === 'object') {
        const errorMsg = Object.values(res.error).flat().join(" ")
        setFeedback({ type: "error", message: errorMsg })
      } else {
        setFeedback({ type: "error", message: res.error as string })
      }
    } else {
      setFeedback({ type: "success", message: res.message || "Senha alterada com sucesso!" })
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center px-6 pt-2 pb-6 w-full min-h-[calc(100vh-100px)]">
      <div className="w-full max-w-xl flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer shrink-0">
            <ArrowLeft className="size-4" />
          </button>
          <div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Alterar Senha</h1>
        <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5">
          Atualize a sua senha de acesso ao sistema.
        </p>
      </div>
        </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-red/10 text-brand-red flex items-center justify-center shrink-0">
            <LockKeyhole className="size-5" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-zinc-900 dark:text-zinc-50">Segurança da Conta</h2>
            <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400">Recomendamos usar uma senha forte e não reutilizá-ela em outros sites.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold text-zinc-600 dark:text-zinc-400">
              Senha Atual <span className="text-brand-red ml-0.5">*</span>
            </label>
            <PasswordInput
              value={oldPassword}
              onChange={setOldPassword}
              placeholder="Digite sua senha atual"
              required
            />
          </div>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800/80 my-2" />

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold text-zinc-600 dark:text-zinc-400">
              Nova Senha <span className="text-brand-red ml-0.5">*</span>
            </label>
            <PasswordInput
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Digite a nova senha"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold text-zinc-600 dark:text-zinc-400">
              Confirmar Nova Senha <span className="text-brand-red ml-0.5">*</span>
            </label>
            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Repita a nova senha"
              required
            />
          </div>

          {feedback && (
            <div className="mt-2 animate-fade-in-up">
              <Feedback type={feedback.type} message={feedback.message} />
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving || !oldPassword || !newPassword || !confirmPassword}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold bg-brand-red text-white hover:bg-brand-red/90 active:scale-[0.98] transition-all duration-150 cursor-pointer disabled:opacity-60 shadow-sm shadow-brand-red/20"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              {saving ? "Salvando..." : "Salvar nova senha"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  )
}
