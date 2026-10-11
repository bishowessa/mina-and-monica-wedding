'use client'

import { createAutograph } from '@/actions/guestbook'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState, type FormEvent } from 'react'

export default function GuestbookForm() {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 4200)
    return () => window.clearTimeout(id)
  }, [toast])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (pending) return

    const trimmedName = name.trim()
    const trimmedMessage = message.trim()
    if (!trimmedName || !trimmedMessage) {
      setError('الاسم والرسالة مطلوبان.')
      return
    }

    setPending(true)
    setError(null)

    try {
      const result = await createAutograph({ name: trimmedName, message: trimmedMessage })
      if (!result.ok) {
        setError(result.error)
        return
      }

      setName('')
      setMessage('')
      setToast('تم حفظ رسالتك، شكراً لك')
    } catch {
      setError('تعذر حفظ الرسالة. حاول مرة أخرى.')
    } finally {
      setPending(false)
    }
  }

  return (
    <section id="guestbook" className="relative z-10 scroll-mt-6 px-5 py-20" aria-labelledby="guestbook-title">
      <div className="mx-auto max-w-lg">
        <h2 id="guestbook-title" className="text-center font-arabic text-5xl text-[#5B1E2B]">
          اترك رسالة
        </h2>

        <form
          onSubmit={handleSubmit}
          aria-busy={pending}
          className="mt-10 flex flex-col gap-5 rounded-[1.75rem] border border-[#5B1E2B]/20 bg-[#F9F5EF] px-5 py-8"
        >
          <label className="flex flex-col gap-2" htmlFor="guest-name">
            <span className="font-arabic text-xl text-[#5B1E2B]">الاسم</span>
            <input
              id="guest-name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              required
              autoComplete="name"
              dir="auto"
              disabled={pending}
              placeholder="اسمك"
              className="w-full rounded-2xl border border-[#5B1E2B] bg-[#F9F5EF] px-4 py-3 font-arabic text-xl text-[#5B1E2B] outline-none placeholder:text-[#5B1E2B]/40 focus:ring-2 focus:ring-[#5B1E2B]/25 disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-2" htmlFor="guest-message">
            <span className="font-arabic text-xl text-[#5B1E2B]">الرسالة</span>
            <textarea
              id="guest-message"
              name="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={600}
              required
              rows={5}
              dir="auto"
              disabled={pending}
              placeholder="اكتب رسالتك هنا"
              className="w-full resize-none rounded-2xl border border-[#5B1E2B] bg-[#F9F5EF] px-4 py-3 font-arabic text-xl text-[#5B1E2B] outline-none placeholder:text-[#5B1E2B]/40 focus:ring-2 focus:ring-[#5B1E2B]/25 disabled:opacity-60"
            />
          </label>

          {error && (
            <p role="alert" className="font-arabic text-base text-[#5B1E2B]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-1 inline-flex h-14 items-center justify-center rounded-full bg-[#5B1E2B] px-8 font-arabic text-xl text-[#F9F5EF] transition hover:bg-[#471722] disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? 'جاري الإرسال…' : 'إرسال'}
          </button>
        </form>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-[#5B1E2B] px-6 py-3 font-arabic text-base text-[#F9F5EF] shadow-[0_12px_40px_rgba(91,30,43,0.28)]"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
