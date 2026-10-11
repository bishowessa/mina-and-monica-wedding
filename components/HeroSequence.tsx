'use client'

import { Images, Volume2, VolumeX } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import EnvelopeVideo from '@/components/EnvelopeVideo'
import { COUPLE_CUTOUT } from '@/lib/assets'
import { assetUrl } from '@/lib/asset-versions'
import { cn } from '@/lib/utils'

const MAP_URL =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent('كنيسة مارجرجس هليوبوليس')

const CEREMONY_MS = new Date('2026-10-31T19:00:00+02:00').getTime()
const MUSIC_VOLUME = 0.4
const HOLD_MS = 2400
const ENTER_MS = 700
const MOVE_MS = 950

const DETAILS = [
  { ar: 'السبت ٣١ اكتوبر', en: 'Saturday, October 31st' },
  { ar: 'الساعة ٧ مساءً', en: '7:00 PM' },
  { ar: 'كنيسة مارجرجس هليوبوليس', en: 'St. George Church Heliopolis' },
] as const

type HeroSequenceProps = {
  audioRef: RefObject<HTMLAudioElement | null>
  musicWantedRef: RefObject<boolean>
  onComplete: () => void
}

type Deltas = { names: number; details: number; verse: number }

function offsetToCenter(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  return window.innerHeight / 2 - (rect.top + rect.height / 2)
}

function CountdownClock() {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    const tick = () => setNow(Date.now())
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  const remaining = now == null ? null : Math.max(0, CEREMONY_MS - now)
  const parts = [
    { label: 'أيام', value: remaining == null ? null : Math.floor(remaining / 86_400_000) },
    { label: 'ساعات', value: remaining == null ? null : Math.floor((remaining % 86_400_000) / 3_600_000) },
    { label: 'دقائق', value: remaining == null ? null : Math.floor((remaining % 3_600_000) / 60_000) },
    { label: 'ثوانٍ', value: remaining == null ? null : Math.floor((remaining % 60_000) / 1_000) },
  ]

  return (
    <div className="flex items-start justify-center gap-3" role="timer" aria-label="العد التنازلي للزفاف">
      {parts.map((part) => (
        <div key={part.label} className="flex min-w-[3.2rem] flex-col items-center">
          <span className="font-serif text-[1.55rem] leading-none tabular-nums text-[#5B1E2B]">
            {part.value == null ? '--' : String(part.value).padStart(2, '0')}
          </span>
          <span className="mt-1.5 font-arabic text-[0.7rem] text-[#5B1E2B]/75">{part.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function HeroSequence({ audioRef, musicWantedRef, onComplete }: HeroSequenceProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const onCompleteRef = useRef(onComplete)
  const revealedScroll = useRef(false)
  const namesRef = useRef<HTMLDivElement>(null)
  const detailsRef = useRef<HTMLDivElement>(null)
  const verseRef = useRef<HTMLQuoteElement>(null)

  const [step, setStep] = useState(0)
  const [deltas, setDeltas] = useState<Deltas | null>(null)
  const [awaitingClick, setAwaitingClick] = useState(true)
  const [muted, setMuted] = useState(true)

  onCompleteRef.current = onComplete

  useEffect(() => {
    const video = videoRef.current
    if (!video || step !== 0) return

    video.muted = true
    video.playsInline = true
    video.pause()

    const onEnded = () => setStep(1)
    video.addEventListener('ended', onEnded)

    return () => video.removeEventListener('ended', onEnded)
  }, [step])

  useEffect(() => {
    if (step !== 1) return
    const id = window.setTimeout(() => setStep(2), 700)
    return () => window.clearTimeout(id)
  }, [step])

  useLayoutEffect(() => {
    if (step !== 2 || deltas) return
    const names = namesRef.current
    const details = detailsRef.current
    const verse = verseRef.current
    if (!names || !details || !verse) return

    setDeltas({
      names: offsetToCenter(names),
      details: offsetToCenter(details),
      verse: offsetToCenter(verse),
    })
  }, [step, deltas])

  useEffect(() => {
    if (step < 2 || step > 6 || (step === 2 && !deltas)) return
    const delay = step === 6 ? MOVE_MS : ENTER_MS + HOLD_MS
    const id = window.setTimeout(() => setStep((current) => current + 1), delay)
    return () => window.clearTimeout(id)
  }, [step, deltas])

  useEffect(() => {
    if (step !== 7 || revealedScroll.current) return
    revealedScroll.current = true
    onCompleteRef.current()
  }, [step])

  const openEnvelope = () => {
    if (!awaitingClick) return
    setAwaitingClick(false)

    const audio = audioRef.current
    if (audio) {
      musicWantedRef.current = true
      audio.loop = true
      audio.muted = false
      audio.volume = MUSIC_VOLUME
      void audio.play().then(() => {
        if (document.hidden) audio.pause()
        setMuted(false)
      }).catch(() => {
        musicWantedRef.current = false
        setMuted(true)
      })
    }

    const video = videoRef.current
    if (!video) {
      setStep(1)
      return
    }

    video.muted = false
    video.volume = 1
    void video.play().catch(() => {
      video.muted = true
      void video.play().catch(() => setStep(1))
    })
  }

  const toggleMute = () => {
    const nextMuted = !muted
    const audio = audioRef.current
    const video = videoRef.current
    if (audio) {
      musicWantedRef.current = !nextMuted
      audio.muted = nextMuted
      if (!nextMuted) {
        audio.volume = MUSIC_VOLUME
        void audio.play().then(() => {
          if (document.hidden) audio.pause()
        }).catch(() => {})
      } else {
        audio.pause()
      }
    }
    if (video && step === 0) video.muted = nextMuted
    setMuted(nextMuted)
  }

  const scrollToGuestbook = () => {
    document.getElementById('guestbook')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const scrollToGallery = () => {
    document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const photoPose = step < 3 ? { opacity: 1, scale: 0.78 } : { opacity: 1, scale: 1 }

  const namesPose = !deltas
    ? { opacity: 0, y: 0, scale: 1.35 }
    : step < 3
      ? { opacity: 0, y: deltas.names, scale: 1.35 }
      : step === 3
        ? { opacity: 1, y: deltas.names, scale: 1.35 }
        : { opacity: 1, y: 0, scale: 1 }

  const detailsPose = !deltas
    ? { opacity: 0, y: 0, scale: 1.12 }
    : step < 4
      ? { opacity: 0, y: deltas.details, scale: 1.12 }
      : step === 4
        ? { opacity: 1, y: deltas.details, scale: 1.12 }
        : { opacity: 1, y: 0, scale: 1 }

  const versePose = step < 5
    ? { opacity: 0, y: 18, scale: 0.98 }
    : { opacity: 1, y: 0, scale: 1 }

  const finalePose = step >= 7 ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }
  const uiReady = step >= 7

  return (
    <section className="relative h-dvh w-full overflow-hidden bg-[#F9F5EF]" aria-label="دعوة الزفاف">
      <motion.div
        className={cn('absolute inset-0', step >= 2 && 'pointer-events-none')}
        animate={{ opacity: step === 0 ? 1 : 0 }}
        transition={{ duration: step === 0 ? 0 : 0.7, ease: 'easeOut' }}
      >
        <EnvelopeVideo ref={videoRef} />
        {awaitingClick && (
          <button
            type="button"
            onClick={openEnvelope}
            className="absolute inset-0 z-30 flex cursor-pointer items-end justify-center bg-transparent pb-[15%] text-[#5B1E2B]"
            aria-label="Open the envelope / افتح الظرف"
          >
            <span className="animate-invitation-float px-6 text-center">
              <span dir="ltr" className="inline-flex flex-wrap items-baseline justify-center gap-x-2">
                <span className="font-serif text-[1.02rem] tracking-[0.16em] uppercase">
                  Open the envelope
                </span>
                <span aria-hidden="true" className="font-serif text-lg opacity-40">
                  /
                </span>
                <span className="font-arabic text-[1.85rem] leading-none">افتح الظرف</span>
              </span>
            </span>
          </button>
        )}
      </motion.div>

      {step >= 2 && (
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ opacity: 0, scale: 0.86 }}
          animate={photoPose}
          transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
          style={{ originX: 0.5, originY: 0.5 }}
        >
          <img
            src={assetUrl(COUPLE_CUTOUT)}
            alt="Mina and Monica"
            width={1856}
            height={2304}
            draggable={false}
            className="h-full w-full object-cover object-[center_58%] select-none"
          />
        </motion.div>
      )}

      {step >= 2 && (
        <motion.div
          className="absolute inset-0 z-[1] bg-[#1a0c10]/50"
          initial={false}
          animate={{ opacity: step >= 3 ? 1 : 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          aria-hidden="true"
        />
      )}

      {step >= 2 && (
        <article className="relative z-10 flex h-full flex-col px-5 pt-8 pb-24 text-[#F9F5EF]">
          <motion.div
            ref={namesRef}
            dir="ltr"
            className="mt-6 flex flex-nowrap items-baseline justify-center gap-x-1.5 whitespace-nowrap"
            initial={false}
            animate={namesPose}
            transition={{ duration: step < 4 ? 0.7 : 0.95, ease: [0.16, 1, 0.3, 1] }}
            style={{ originX: 0.5, originY: 0.5 }}
          >
            <span className="font-names text-[3.35rem] leading-none">Mina</span>
            <span className="font-[Arial,Helvetica,sans-serif] text-[1.7rem] leading-none font-medium not-italic">&amp;</span>
            <span className="font-names text-[3.35rem] leading-none">Monica</span>
          </motion.div>

          <motion.div
            ref={detailsRef}
            className="mt-4 flex flex-col items-center gap-1.5 text-center"
            initial={false}
            animate={detailsPose}
            transition={{ duration: step < 5 ? 0.7 : 0.95, ease: [0.16, 1, 0.3, 1] }}
            style={{ originX: 0.5, originY: 0.5 }}
          >
            {DETAILS.map((line) => (
              <div key={line.en}>
                <p className="font-arabic text-[1.15rem] leading-snug">{line.ar}</p>
                <p dir="ltr" className="font-serif text-[1.08rem] leading-snug tracking-wide text-[#F9F5EF]/90">
                  {line.en}
                </p>
              </div>
            ))}
            <a
              href={MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'mt-2 inline-flex rounded-full border border-[#F9F5EF] px-6 py-2 font-arabic text-base text-[#F9F5EF]',
                step < 4 && 'pointer-events-none',
              )}
            >
              عرض على الخريطة
            </a>
          </motion.div>

          <motion.blockquote
            ref={verseRef}
            className="mx-auto mt-5 max-w-[22rem] text-center"
            initial={false}
            animate={versePose}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ originX: 0.5, originY: 0 }}
          >
            <p className="font-verse text-[1.22rem] leading-[1.95]">
              وَأَنَا قَدْ أَعْطَيْتُهُمُ الْمَجْدَ الَّذِي أَعْطَيْتَنِي، لِيَكُونُوا وَاحِدًا كَمَا أَنَّنَا نَحْنُ وَاحِدٌ.
            </p>
            <p dir="ltr" className="mt-1.5 font-serif text-[0.98rem] leading-snug text-[#F9F5EF]/80 italic">
              And I have given them the glory that You gave Me, that they may be one just as We are one.
            </p>
            <footer className="mt-2 flex items-baseline justify-center gap-x-2 text-[#F9F5EF]/70">
              <span className="font-arabic text-sm">يوحنا ١٧</span>
              <span dir="ltr" className="font-serif text-xs tracking-[0.22em] uppercase">
                John 17
              </span>
            </footer>
          </motion.blockquote>

          <motion.div
            className="mt-auto flex flex-col items-center"
            initial={false}
            animate={finalePose}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="rounded-2xl border border-[#5B1E2B]/30 bg-[#F9F5EF]/92 p-4 shadow-sm">
              <CountdownClock />
            </div>
          </motion.div>
        </article>
      )}

      {step >= 2 && (
        <motion.div
          className="absolute inset-x-0 bottom-4 z-20 flex flex-row flex-wrap items-center justify-center gap-4 px-4"
          initial={false}
          animate={finalePose}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <button
            type="button"
            onClick={scrollToGuestbook}
            disabled={!uiReady}
            className="inline-flex items-center justify-center gap-x-1.5 rounded-full border border-[#5B1E2B] bg-[#5B1E2B] px-4 py-2.5 text-center text-[#F9F5EF] shadow-sm disabled:cursor-default"
          >
            <span className="font-arabic text-base leading-none">اكتبلنا رسالة</span>
            <span aria-hidden="true" className="opacity-50">
              /
            </span>
            <span dir="ltr" className="font-serif text-[0.85rem] tracking-[0.04em]">
              Write a Message
            </span>
          </button>
          <button
            type="button"
            onClick={scrollToGallery}
            disabled={!uiReady}
            className="inline-flex items-center justify-center gap-x-1.5 rounded-full border border-[#5B1E2B] bg-[#F9F5EF] px-4 py-2.5 text-[#5B1E2B] shadow-sm disabled:cursor-default"
          >
            <Images className="size-4 shrink-0" aria-hidden="true" />
            <span className="font-arabic text-base leading-none">ألبوم الصور</span>
          </button>
        </motion.div>
      )}

      <button
        type="button"
        onClick={toggleMute}
        className={cn(
          'phone-fab z-50 flex size-11 items-center justify-center rounded-full',
          'border border-[#F9F5EF]/30 bg-[#5B1E2B]/75 text-[#F9F5EF] backdrop-blur-sm',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F9F5EF]/60',
          awaitingClick ? 'pointer-events-none opacity-0' : 'opacity-100',
        )}
        aria-label={muted ? 'تشغيل الصوت' : 'كتم الصوت'}
        aria-pressed={!muted}
      >
        {muted ? <VolumeX className="size-5" aria-hidden="true" /> : <Volume2 className="size-5" aria-hidden="true" />}
      </button>
    </section>
  )
}
