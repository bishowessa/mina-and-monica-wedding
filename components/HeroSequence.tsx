'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState, type RefObject } from 'react'
import EnvelopeVideo from '@/components/EnvelopeVideo'
import { COUPLE_CUTOUT } from '@/lib/assets'
import { assetUrl } from '@/lib/asset-versions'
import { cn } from '@/lib/utils'

const MAP_URL =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent('كنيسة مارجرجس هليوبوليس')

const CEREMONY_MS = new Date('2026-10-31T19:00:00+02:00').getTime()
const MUSIC_VOLUME = 0.4
const HOLD_MS = 2000

const NAME_PARTS = [
  { text: 'Mina', className: 'font-names text-[5.5rem] leading-[0.95] text-[#5B1E2B]' },
  { text: '&', className: "font-[Arial,Helvetica,sans-serif] text-[2.75rem] leading-none font-medium not-italic text-[#5B1E2B]" },
  { text: 'Monica', className: 'font-names text-[5.5rem] leading-[0.95] text-[#5B1E2B]' },
] as const

const DETAIL_LINES = ['السبت ٣١ اكتوبر', 'الساعة ٧', 'كنيسة مارجرجس هليوبوليس'] as const

type HeroSequenceProps = {
  audioRef: RefObject<HTMLAudioElement | null>
  musicWantedRef: RefObject<boolean>
  onComplete: () => void
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
        <div key={part.label} className="flex min-w-[3.4rem] flex-col items-center">
          <span className="font-serif text-[1.85rem] leading-none tabular-nums text-[#F9F5EF]">
            {part.value == null ? '--' : String(part.value).padStart(2, '0')}
          </span>
          <span className="mt-2 font-arabic text-[0.7rem] text-[#F9F5EF]/80">{part.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function HeroSequence({ audioRef, musicWantedRef, onComplete }: HeroSequenceProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const onCompleteRef = useRef(onComplete)
  const photoHoldStarted = useRef(false)
  const namesHoldStarted = useRef(false)
  const locationHoldStarted = useRef(false)
  const verseHoldStarted = useRef(false)
  const revealStarted = useRef(false)
  const holds = useRef<number[]>([])

  const [introScene, setIntroScene] = useState(0)
  const [awaitingClick, setAwaitingClick] = useState(true)
  const [muted, setMuted] = useState(true)
  const [nameCount, setNameCount] = useState(1)

  onCompleteRef.current = onComplete

  useEffect(() => {
    const timers = holds.current
    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [])

  const holdThen = (start: () => void) => {
    const id = window.setTimeout(start, HOLD_MS)
    holds.current.push(id)
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video || introScene !== 0) return

    video.muted = true
    video.playsInline = true
    video.pause()

    const onEnded = () => setIntroScene((current) => (current === 0 ? 1 : current))
    video.addEventListener('ended', onEnded)

    return () => video.removeEventListener('ended', onEnded)
  }, [introScene])

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
      setIntroScene(1)
      return
    }

    video.muted = false
    video.volume = 1
    void video.play().catch(() => {
      video.muted = true
      void video.play().catch(() => setIntroScene(1))
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
    if (video && introScene === 0) video.muted = nextMuted
    setMuted(nextMuted)
  }

  return (
    <section className="relative min-h-dvh w-full overflow-hidden bg-[#F9F5EF]" aria-label="دعوة الزفاف">
      <AnimatePresence mode="wait">
        {introScene === 0 && (
          <motion.div
            key="envelope"
            className="absolute inset-0 bg-[#F9F5EF]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
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
        )}

        {introScene === 1 && (
          <motion.div
            key="photo"
            className="absolute inset-0 flex items-center justify-center bg-[#F9F5EF]"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.7, ease: 'easeOut' } }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            onAnimationComplete={() => {
              if (photoHoldStarted.current) return
              photoHoldStarted.current = true
              holdThen(() => setIntroScene(2))
            }}
          >
            <img
              src={assetUrl(COUPLE_CUTOUT)}
              alt="Mina and Monica"
              width={1856}
              height={2304}
              draggable={false}
              className="h-[72dvh] w-[84%] object-cover select-none"
            />
          </motion.div>
        )}

        {introScene === 2 && (
          <motion.div
            key="names"
            className="absolute inset-0 flex items-center justify-center bg-[#F9F5EF] px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <div dir="ltr" className="flex flex-col items-center overflow-visible text-center">
              {NAME_PARTS.slice(0, nameCount).map((part, index) => (
                <motion.span
                  key={part.text}
                  className={part.className}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.28, ease: 'easeOut' }}
                  onAnimationComplete={() => {
                    if (index < NAME_PARTS.length - 1) {
                      setNameCount(index + 2)
                      return
                    }
                    if (namesHoldStarted.current) return
                    namesHoldStarted.current = true
                    holdThen(() => setIntroScene(3))
                  }}
                >
                  {part.text}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {introScene === 3 && (
          <motion.div
            key="location"
            className="absolute inset-0 flex items-center justify-center bg-[#F9F5EF] px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            onAnimationComplete={() => {
              if (locationHoldStarted.current) return
              locationHoldStarted.current = true
              holdThen(() => setIntroScene(4))
            }}
          >
            <div dir="rtl" className="flex flex-col items-center gap-3 text-center text-[#5B1E2B]">
              {DETAIL_LINES.map((line, index) => (
                <p
                  key={line}
                  className={cn(
                    'font-arabic',
                    index === 0 ? 'text-[2rem] leading-tight' : 'text-[1.35rem] leading-snug',
                  )}
                >
                  {line}
                </p>
              ))}
            </div>
          </motion.div>
        )}

        {introScene === 4 && (
          <motion.div
            key="verse"
            className="absolute inset-0 flex items-center justify-center bg-[#F9F5EF] px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            onAnimationComplete={() => {
              if (verseHoldStarted.current) return
              verseHoldStarted.current = true
              holdThen(() => setIntroScene(5))
            }}
          >
            <blockquote className="max-w-sm text-center">
              <p dir="ltr" className="font-serif text-[1.55rem] leading-relaxed text-[#5B1E2B] italic">
                And I have given them the glory that You gave Me, that they may be one just as We are one.
              </p>
              <footer dir="ltr" className="mt-6 font-serif text-sm tracking-[0.22em] text-[#5B1E2B]/70 uppercase">
                John 17
              </footer>
            </blockquote>
          </motion.div>
        )}

        {introScene === 5 && (
          <motion.div
            key="reveal"
            className="relative min-h-dvh w-full"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
          >
            <img
              src={assetUrl(COUPLE_CUTOUT)}
              alt=""
              width={1856}
              height={2304}
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover select-none"
            />
            <div className="absolute inset-0 bg-black/40" />
            <motion.div
              className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              onAnimationStart={() => {
                if (revealStarted.current) return
                revealStarted.current = true
                onCompleteRef.current()
              }}
            >
              <div dir="ltr" className="flex flex-nowrap items-baseline justify-center gap-x-2 whitespace-nowrap text-[#F9F5EF]">
                <span className="font-names text-[3.15rem] leading-none">Mina</span>
                <span className="font-[Arial,Helvetica,sans-serif] text-[1.65rem] leading-none font-medium not-italic">&amp;</span>
                <span className="font-names text-[3.15rem] leading-none">Monica</span>
              </div>

              <div dir="rtl" className="mt-8 flex flex-col items-center gap-2 text-[#F9F5EF]">
                <p className="font-arabic text-[1.85rem] leading-tight">السبت ٣١ اكتوبر</p>
                <p className="font-arabic text-[1.25rem] leading-snug">الساعة ٧</p>
                <p className="font-arabic text-[1.25rem] leading-snug">كنيسة مارجرجس هليوبوليس</p>
              </div>

              <a
                href={MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex rounded-full border border-[#F9F5EF] px-6 py-2.5 font-arabic text-lg text-[#F9F5EF]"
              >
                عرض على الخريطة
              </a>

              <div className="mt-8">
                <CountdownClock />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
