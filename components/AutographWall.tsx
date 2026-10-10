import { lockAdmin } from '@/actions/admin'

type AutographCard = {
  id: string
  name: string
  message: string
  createdAt: string
}

const SHAPES = [
  {
    name: 'circle',
    clip: 'circle(50% at 50% 50%)',
    pad: '18% 16%',
  },
  {
    name: 'triangle',
    clip: 'polygon(50% 0%, 100% 100%, 0% 100%)',
    pad: '34% 16% 10%',
  },
  {
    name: 'pentagon',
    clip: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
    pad: '22% 16% 12%',
  },
  {
    name: 'hexagon',
    clip: 'polygon(25% 4%, 75% 4%, 100% 50%, 75% 96%, 25% 96%, 0% 50%)',
    pad: '16% 18%',
  },
  {
    name: 'diamond',
    clip: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    pad: '28% 20%',
  },
] as const

const FILLS = [
  { background: '#5B1E2B', color: '#F9F5EF' },
  { background: '#F3E6D8', color: '#5B1E2B' },
  { background: '#7A2E3E', color: '#F9F5EF' },
  { background: '#E7D5C3', color: '#5B1E2B' },
] as const

const TILTS = [-7, 4, -3, 6, -5, 3, 5, -4]

function widthFor(message: string) {
  if (message.length > 280) return '17.5rem'
  if (message.length > 140) return '16rem'
  return '14.5rem'
}

export default function AutographWall({ autographs }: { autographs: AutographCard[] }) {
  return (
    <main className="min-h-dvh px-5 py-14">
      <header className="mx-auto flex max-w-5xl flex-col items-center text-center">
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
        <ul className="mx-auto mt-12 flex max-w-6xl flex-wrap items-center justify-center gap-8">
          {autographs.map((autograph, index) => {
            const shape =
              autograph.message.length > 180
                ? SHAPES[index % 2 === 0 ? 0 : 3]
                : SHAPES[index % SHAPES.length]
            const fill = FILLS[index % FILLS.length]
            const tilt = TILTS[index % TILTS.length]

            return (
              <li key={autograph.id} className="list-none">
                <article
                  className="flex items-center justify-center text-center shadow-none transition duration-300 hover:rotate-0"
                  style={{
                    width: widthFor(autograph.message),
                    minHeight: widthFor(autograph.message),
                    clipPath: shape.clip,
                    padding: shape.pad,
                    background: fill.background,
                    color: fill.color,
                    transform: `rotate(${tilt}deg)`,
                    filter: 'drop-shadow(0 16px 22px rgba(91, 30, 43, 0.16))',
                  }}
                >
                  <div className="flex w-full flex-col items-center gap-3">
                    <p dir="auto" className="font-arabic text-[1.05rem] leading-relaxed break-words">
                      {autograph.message}
                    </p>
                    <p dir="auto" className="font-arabic text-xl leading-none">
                      {autograph.name}
                    </p>
                    <time className="font-serif text-xs tracking-[0.14em] uppercase opacity-70" dateTime={autograph.createdAt}>
                      {new Date(autograph.createdAt).toLocaleDateString('ar-EG', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </time>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
