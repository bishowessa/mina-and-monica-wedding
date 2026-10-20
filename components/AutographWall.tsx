import { lockAdmin } from '@/actions/admin'

type AutographCard = {
  id: string
  name: string
  message: string
  createdAt: string
}

const FILLS = [
  { background: '#F9F5EF', color: '#5B1E2B', name: '#8A5A12', border: '#5B1E2B' },
  { background: '#F3E6D8', color: '#5B1E2B', name: '#8A5A12', border: '#7A2E3E' },
  { background: '#5B1E2B', color: '#F9F5EF', name: '#F0C14D', border: '#5B1E2B' },
  { background: '#E7D5C3', color: '#5B1E2B', name: '#8A5A12', border: '#5B1E2B' },
] as const

export default function AutographWall({ autographs }: { autographs: AutographCard[] }) {
  return (
    <main className="min-h-dvh px-5 py-14">
      <header className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <p className="font-script text-6xl text-[#5B1E2B]">Autographs</p>
        <h1 className="mt-1 font-arabic text-3xl text-[#5B1E2B]">رسائل الضيوف</h1>
        <p className="mt-3 font-arabic text-lg text-[#5B1E2B]/70">
          {autographs.length === 0 ? 'لا توجد رسائل بعد' : `${autographs.length.toLocaleString('ar-EG')} رسالة`}
        </p>
        <form action={lockAdmin} className="mt-5">
          <button
            type="submit"
            className="rounded-full border border-[#5B1E2B]/30 px-5 py-2 font-arabic text-base text-[#5B1E2B]"
          >
            خروج
          </button>
        </form>
      </header>

      {autographs.length > 0 && (
        <ul className="mx-auto mt-12 flex max-w-3xl flex-col gap-5">
          {autographs.map((autograph, index) => {
            const fill = FILLS[index % FILLS.length]

            return (
              <li key={autograph.id} className="list-none">
                <article
                  className="rounded-3xl border px-6 py-5 text-right shadow-[0_10px_24px_rgba(91,30,43,0.08)]"
                  style={{
                    background: fill.background,
                    color: fill.color,
                    borderColor: fill.border,
                  }}
                >
                  <p dir="auto" className="font-arabic text-xl leading-relaxed whitespace-pre-wrap break-words">
                    {autograph.message}
                  </p>
                  <p
                    dir="auto"
                    className="mt-4 font-arabic text-lg leading-tight break-words"
                    style={{ color: fill.name }}
                  >
                    {autograph.name}
                  </p>
                  <time
                    className="mt-1 block font-serif text-sm tracking-[0.08em] opacity-70"
                    dateTime={autograph.createdAt}
                  >
                    {new Date(autograph.createdAt).toLocaleDateString('ar-EG', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </time>
                </article>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
