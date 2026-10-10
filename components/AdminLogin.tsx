'use client'

import { unlockAdmin } from '@/actions/admin'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

export default function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (pending) return

    setPending(true)
    setError(null)

    try {
      const result = await unlockAdmin(password)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setPassword('')
      router.refresh()
    } catch {
      setError('تعذر الدخول. حاول مرة أخرى.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-16">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-[1.75rem] border border-[#5B1E2B]/20 bg-[#F9F5EF] px-6 py-10 text-center shadow-[0_18px_50px_rgba(91,30,43,0.08)]"
      >
        <p className="font-script text-5xl text-[#5B1E2B]">Autographs</p>
        <h1 className="mt-2 font-arabic text-2xl text-[#5B1E2B]">رسائل الضيوف</h1>
        <p className="mt-3 font-arabic text-base leading-relaxed text-[#5B1E2B]/75">
          هذه الصفحة خاصة. أدخل كلمة المرور لعرض الرسائل.
        </p>

        {configured ? (
          <label className="mt-8 flex flex-col gap-2 text-right" htmlFor="admin-password">
            <span className="font-arabic text-base text-[#5B1E2B]">كلمة المرور</span>
            <input
              id="admin-password"
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              disabled={pending}
              dir="ltr"
              className="w-full rounded-2xl border border-[#5B1E2B] bg-[#F9F5EF] px-4 py-3 text-left font-serif text-lg text-[#5B1E2B] outline-none focus:ring-2 focus:ring-[#5B1E2B]/25 disabled:opacity-60"
            />
          </label>
        ) : (
          <p className="mt-8 font-arabic text-base leading-relaxed text-[#5B1E2B]">
            أضف ADMIN_PASSWORD في ملف .env ثم أعد تشغيل الموقع.
          </p>
        )}

        {error && (
          <p role="alert" className="mt-4 font-arabic text-base text-[#5B1E2B]">
            {error}
          </p>
        )}

        {configured && (
          <button
            type="submit"
            disabled={pending}
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#5B1E2B] px-8 font-arabic text-lg text-[#F9F5EF] disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? 'جاري الدخول…' : 'دخول'}
          </button>
        )}
      </form>
    </main>
  )
}
