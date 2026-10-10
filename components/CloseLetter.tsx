'use client'

import { useEffect, useRef, useState } from 'react'
import EnvelopeVideo from '@/components/EnvelopeVideo'
import { cn } from '@/lib/utils'

type LetterPhase = 'closing' | 'closed' | 'opening'

type CloseLetterButtonProps = {
  label: string
  onClick: () => void
  floating?: boolean
}

export function CloseLetterButton({ label, onClick, floating = false }: CloseLetterButtonProps) {
  const button = (
    <button
      type="button"
      onClick={onClick}
      className="pointer-events-auto rounded-full border border-[#5B1E2B] bg-[#F9F5EF] px-10 py-3 font-arabic text-lg text-[#5B1E2B] transition hover:bg-[#5B1E2B] hover:text-[#F9F5EF]"
    >
      {label}
    </button>
  )

  if (floating) {
    return (
      <div className="phone-screen z-[110] flex items-end justify-center pb-10 pointer-events-none">{button}</div>
    )
  }

  return (
    <footer className="relative z-10 flex flex-col items-center gap-8 px-6 pt-8 pb-28">
      <div className="h-px w-16 bg-[#5B1E2B]/35" aria-hidden="true" />
      {button}
    </footer>
  )
}

type CloseLetterOverlayProps = {
  phase: LetterPhase
  onClosed: () => void
  onOpened: () => void
}

export function CloseLetterOverlay({ phase, onClosed, onOpened }: CloseLetterOverlayProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const onClosedRef = useRef(onClosed)
  const onOpenedRef = useRef(onOpened)
  const [ready, setReady] = useState(phase !== 'closing')

  onClosedRef.current = onClosed
  onOpenedRef.current = onOpened

  useEffect(() => {
    rootRef.current?.focus()
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || phase === 'closed') return

    let stopped = false
    let watchdog = 0

    if (phase === 'opening') {
      setReady(true)
      video.muted = true
      video.playsInline = true
      const onEnded = () => {
        if (!stopped) onOpenedRef.current()
      }
      video.addEventListener('ended', onEnded)
      void video.play().catch(() => {
        if (!stopped) onOpenedRef.current()
      })
      return () => {
        stopped = true
        video.removeEventListener('ended', onEnded)
        video.pause()
      }
    }

    const finish = () => {
      if (stopped) return
      stopped = true
      window.clearTimeout(watchdog)
      video.pause()
      try {
        video.currentTime = 0
      } catch {
        /* Hold the last frame that managed to paint. */
      }
      setReady(true)
      onClosedRef.current()
    }

    const pump = () => {
      if (stopped) return
      const frame = 1 / 24
      if (video.currentTime <= frame + 0.01) {
        finish()
        return
      }

      let advanced = false
      const next = () => {
        if (advanced || stopped) return
        advanced = true
        video.removeEventListener('seeked', next)
        window.clearTimeout(watchdog)
        pump()
      }

      video.addEventListener('seeked', next)
      watchdog = window.setTimeout(next, 90)
      video.currentTime = Math.max(0, video.currentTime - frame)
    }

    const armReverse = () => {
      if (stopped) return
      const duration = video.duration
      if (!Number.isFinite(duration) || duration <= 0) {
        setReady(true)
        onClosedRef.current()
        return
      }

      video.pause()
      video.muted = true

      if (video.currentTime > 0.2) {
        setReady(true)
        pump()
        return
      }

      const onSeeked = () => {
        if (video.currentTime < duration - 0.4) return
        video.removeEventListener('seeked', onSeeked)
        window.clearTimeout(watchdog)
        setReady(true)
        pump()
      }

      video.addEventListener('seeked', onSeeked)
      watchdog = window.setTimeout(() => {
        video.removeEventListener('seeked', onSeeked)
        if (stopped) return
        setReady(true)
        if (video.currentTime > 0.2) pump()
        else onClosedRef.current()
      }, 700)

      try {
        video.currentTime = Math.max(0, duration - 0.05)
      } catch {
        window.clearTimeout(watchdog)
        setReady(true)
        onClosedRef.current()
      }
    }

    if (video.readyState >= 1) armReverse()
    else video.addEventListener('loadedmetadata', armReverse, { once: true })

    return () => {
      stopped = true
      window.clearTimeout(watchdog)
      video.pause()
    }
  }, [phase])

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={phase === 'opening' ? 'افتح الرسالة' : 'أغلق الرسالة'}
      className="phone-screen z-[100] bg-[#F9F5EF] outline-none"
    >
      <div className={cn('absolute inset-0 transition-opacity duration-300', ready ? 'opacity-100' : 'opacity-0')}>
        <EnvelopeVideo ref={videoRef} poster={false} />
      </div>
    </div>
  )
}
