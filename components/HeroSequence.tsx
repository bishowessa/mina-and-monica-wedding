'use client'

import { Cross, Heart, Images, MapPin, Volume2, VolumeX } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import EnvelopeVideo from '@/components/EnvelopeVideo'
import { COUPLE_CUTOUT } from '@/lib/assets'
import { assetUrl } from '@/lib/asset-versions'
import { cn } from '@/lib/utils'

const MAP_URL =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent('كنيسة الشهيد العظيم مارجرجس بهليوبوليس - مصر الجديدة')

const CEREMONY_MS = new Date('2026-10-31T19:00:00+02:00').getTime()
const MUSIC_VOLUME = 0.4
const HOLD_MS = 2200
const ENTER_MS = 700
const MOVE_MS = 950
const EASE = [0.16, 1, 0.3, 1] as const

const WHEN = [
  { ar: 'السبت ٣١ اكتوبر', en: 'Saturday, October 31st' },
  { ar: 'الساعة ٧ مساءً', en: '7:00 PM' },
] as const

type HeroSequenceProps = {
  audioRef: RefObject<HTMLAudioElement | null>
  musicWantedRef: RefObject<boolean>
  onComplete: () => void
}

type Deltas = { opening: number; names: number; when: number; church: number }

function stageShift(element: HTMLElement, occupiedBottom: number) {
  const rect = element.getBoundingClientRect()
  const floor = window.innerHeight - 24
  const top = Math.min(occupiedBottom + 16, floor - 48)
  const mid = top + (floor - top) / 2
  let y = mid - (rect.top + rect.height / 2)
  const stagedTop = rect.top + y
  if (stagedTop < occupiedBottom + 10) y += occupiedBottom + 10 - stagedTop
  return y
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
    <div className="flex items-start justify-center gap-2.5" role="timer" aria-label="العد التنازلي للزفاف">
      {parts.map((part) => (
        <div key={part.label} className="flex min-w-[3rem] flex-col items-center">
          <span className="font-serif text-[1.65rem] leading-none font-semibold text-[#5B1E2B] [font-variant-numeric:lining-nums_tabular-nums]">
            {part.value == null ? '--' : String(part.value).padStart(2, '0')}
          </span>
          <span className="mt-1 font-arabic text-sm leading-none text-[#5B1E2B]/80">{part.label}</span>
        </div>
      ))}
    </div>
  )
}

function flyPose(ready: boolean, step: number, showAt: number, delta: number, scale: number) {
  if (!ready) return { opacity: 0, y: 0, scale }
  if (step < showAt) return { opacity: 0, y: delta, scale }
  if (step === showAt) return { opacity: 1, y: delta, scale }
  return { opacity: 1, y: 0, scale: 1 }
}

export default function HeroSequence({ audioRef, musicWantedRef, onComplete }: HeroSequenceProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const onCompleteRef = useRef(onComplete)
  const revealedScroll = useRef(false)
  const openingRef = useRef<HTMLDivElement>(null)
  const namesRef = useRef<HTMLDivElement>(null)
  const whenRef = useRef<HTMLDivElement>(null)
  const churchRef = useRef<HTMLDivElement>(null)

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
    const opening = openingRef.current
    const names = namesRef.current
    const when = whenRef.current
    const church = churchRef.current
    if (!opening || !names || !when || !church) return

    const bottom = (element: HTMLElement) => element.getBoundingClientRect().bottom
    setDeltas({
      opening: stageShift(opening, 28),
      names: stageShift(names, bottom(opening)),
      when: stageShift(when, bottom(names)),
      church: stageShift(church, bottom(when)),
    })
  }, [step, deltas])

  useEffect(() => {
    if (step < 2 || step > 7 || (step === 2 && !deltas)) return
    const delay = step === 7 ? MOVE_MS : step === 2 ? 2800 : ENTER_MS + HOLD_MS
    const id = window.setTimeout(() => setStep((current) => current + 1), delay)
    return () => window.clearTimeout(id)
  }, [step, deltas])

  useEffect(() => {
    if (step !== 8 || revealedScroll.current) return
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
      audio.loop = true
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

  const openingPose = flyPose(Boolean(deltas), step, 3, deltas?.opening ?? 0, 1.06)
  const namesPose = flyPose(Boolean(deltas), step, 4, deltas?.names ?? 0, 1.32)
  const whenPose = flyPose(Boolean(deltas), step, 5, deltas?.when ?? 0, 1.1)
  const churchPose = flyPose(Boolean(deltas), step, 6, deltas?.church ?? 0, 1.08)
  const finalePose = step >= 8 ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }

  return (
    <section className="relative h-dvh w-full overflow-hidden bg-[#F9F5EF]" aria-label="دعوة الزفاف">
      <motion.div
        className={cn('absolute inset-0 z-20', step >= 2 && 'pointer-events-none')}
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
                <span className="font-serif text-[1.2rem] font-semibold tracking-[0.14em] uppercase">
                  Open the envelope
                </span>
                <span aria-hidden="true" className="font-serif text-lg opacity-40">
                  /
                </span>
                <span className="font-arabic text-[2.15rem] leading-none">افتح الظرف</span>
              </span>
            </span>
          </button>
        )}
      </motion.div>

      {step >= 2 && (
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.2, ease: 'easeInOut' }}
        >
          <img
            src={assetUrl(COUPLE_CUTOUT)}
            alt="Mina and Monica"
            width={952}
            height={2400}
            draggable={false}
            className="h-full w-full object-cover object-[center_42%] select-none"
          />
        </motion.div>
      )}

      {step >= 2 && (
        <motion.div
          className="absolute inset-0 z-[1] bg-black/70"
          initial={false}
          animate={{ opacity: step >= 3 ? 1 : 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          aria-hidden="true"
        />
      )}

      {step >= 2 && (
        <article className="@container relative z-10 flex h-full flex-col items-center justify-between px-3 pt-4 pb-3 text-center text-[#F9F5EF]">
          <motion.div
            ref={openingRef}
            className="flex flex-col items-center"
            initial={false}
            animate={openingPose}
            transition={{ duration: step === 3 ? 0.7 : 0.95, ease: EASE }}
            style={{ originX: 0.5, originY: 0.5 }}
          >
            <div className="relative flex size-9 items-center justify-center" aria-hidden="true">
              <Cross className="size-8" strokeWidth={1.25} />
              <Heart className="absolute size-3 fill-[#F9F5EF] text-[#F9F5EF]" strokeWidth={1.5} />
            </div>
            <blockquote className="mx-auto mt-2 max-w-[22rem]">
              <p className="font-verse text-[1.35rem] leading-[1.75]">
                وَأَنَا قَدْ أَعْطَيْتُهُمُ الْمَجْدَ الَّذِي أَعْطَيْتَنِي، لِيَكُونُوا وَاحِدًا كَمَا أَنَّنَا نَحْنُ وَاحِدٌ.
              </p>
              <p dir="ltr" className="mt-1 font-serif text-[1.15rem] leading-snug font-semibold italic">
                And I have given them the glory that You gave Me, that they may be one just as We are one.
              </p>
              <footer className="mt-1 flex items-baseline justify-center gap-x-2 text-[#F9F5EF]/80">
                <span className="font-arabic text-base">يوحنا ١٧</span>
                <span dir="ltr" className="font-serif text-sm font-semibold tracking-[0.18em] uppercase">
                  John 17
                </span>
              </footer>
            </blockquote>
          </motion.div>

          <motion.div
            ref={namesRef}
            dir="ltr"
            className="flex flex-nowrap items-baseline justify-center gap-x-1.5 whitespace-nowrap"
            initial={false}
            animate={namesPose}
            transition={{ duration: step === 4 ? 0.7 : 0.95, ease: EASE }}
            style={{ originX: 0.5, originY: 0.5 }}
          >
            <span className="font-names text-[3.35rem] leading-none">Mina</span>
            <span className="font-[Arial,Helvetica,sans-serif] text-[1.7rem] leading-none font-medium not-italic">&amp;</span>
            <span className="font-names text-[3.35rem] leading-none">Monica</span>
          </motion.div>

          <motion.div
            ref={whenRef}
            className="flex flex-col items-center gap-1.5"
            initial={false}
            animate={whenPose}
            transition={{ duration: step === 5 ? 0.7 : 0.95, ease: EASE }}
            style={{ originX: 0.5, originY: 0.5 }}
          >
            {WHEN.map((line) => (
              <div key={line.en}>
                <p className="font-arabic text-[1.35rem] leading-tight">{line.ar}</p>
                <p dir="ltr" className="font-serif text-[1.2rem] leading-tight font-semibold tracking-wide">
                  {line.en}
                </p>
              </div>
            ))}
          </motion.div>

          <motion.div
            ref={churchRef}
            className="flex w-full items-center justify-center gap-2"
            initial={false}
            animate={churchPose}
            transition={{ duration: step === 6 ? 0.7 : 0.95, ease: EASE }}
            style={{ originX: 0.5, originY: 0.5 }}
          >
            <div className="min-w-0 text-center">
              <p className="whitespace-nowrap font-arabic text-[clamp(0.72rem,3.35cqi,1.05rem)] leading-none">
                كنيسة الشهيد العظيم مارجرجس بهليوبوليس - مصر الجديدة
              </p>
              <p dir="ltr" className="mt-0.5 font-serif text-[1.15rem] leading-tight font-semibold tracking-wide">
                St. George Church Heliopolis
              </p>
            </div>
            <a
              href={MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
              aria-label="عرض الكنيسة على الخريطة"
              className={cn(
                'flex shrink-0 cursor-pointer items-center gap-1.5',
                step < 6 && 'pointer-events-none',
              )}
            >
              <span className="animate-point-right text-lg leading-none" aria-hidden="true">
                👉
              </span>
              <span className="relative inline-flex size-9 items-center justify-center rounded-full border border-[#F9F5EF] text-[#F9F5EF] transition duration-300 hover:scale-110 hover:brightness-125">
                <span
                  className="absolute inset-0 animate-ping rounded-full bg-[#5B1E2B]/40"
                  aria-hidden="true"
                />
                <motion.span
                  className="relative flex items-center justify-center"
                  animate={{ y: [-2, 2] }}
                  transition={{ duration: 2.6, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
                >
                  <MapPin className="size-4" aria-hidden="true" />
                </motion.span>
              </span>
            </a>
          </motion.div>

          <motion.div
            className="flex w-full flex-col items-center gap-2.5"
            initial={false}
            animate={finalePose}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="rounded-2xl border border-[#5B1E2B]/30 bg-[#F9F5EF]/92 px-3 py-2 shadow-sm">
              <CountdownClock />
            </div>
            <div className="flex flex-row flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={scrollToGuestbook}
                disabled={step < 8}
                className="inline-flex items-center justify-center gap-x-1.5 rounded-full border border-[#5B1E2B] bg-[#5B1E2B] px-3.5 py-2 text-[#F9F5EF] shadow-sm disabled:cursor-default"
              >
                <span className="font-arabic text-lg leading-none">اكتبلنا رسالة</span>
                <span aria-hidden="true" className="opacity-50">
                  /
                </span>
                <span dir="ltr" className="font-serif text-[0.95rem] font-semibold tracking-[0.03em]">
                  Write a Message
                </span>
              </button>
              <button
                type="button"
                onClick={scrollToGallery}
                disabled={step < 8}
                className="inline-flex items-center justify-center gap-x-1.5 rounded-full border border-[#5B1E2B] bg-[#F9F5EF] px-3.5 py-2 text-[#5B1E2B] shadow-sm disabled:cursor-default"
              >
                <Images className="size-4 shrink-0" aria-hidden="true" />
                <span className="font-arabic text-lg leading-none">ألبوم الصور</span>
              </button>
            </div>
          </motion.div>
        </article>
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
