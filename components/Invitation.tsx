'use client'

import { useEffect, useRef, useState } from 'react'
import { CloseLetterButton, CloseLetterOverlay } from '@/components/CloseLetter'
import GuestbookForm from '@/components/GuestbookForm'
import HeroSequence from '@/components/HeroSequence'
import PhotoGallery from '@/components/PhotoGallery'
import { assetUrl } from '@/lib/asset-versions'

const MUSIC_VOLUME = 0.4

type LetterPhase = 'open' | 'closing' | 'closed' | 'opening'

export default function Invitation() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const musicWantedRef = useRef(false)
  const sealedRef = useRef(false)
  const letterRef = useRef<LetterPhase>('open')
  const [scrollUnlocked, setScrollUnlocked] = useState(false)
  const [letter, setLetter] = useState<LetterPhase>('open')

  letterRef.current = letter

  useEffect(() => {
    document.body.style.overflow = !scrollUnlocked || letter !== 'open' ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [scrollUnlocked, letter])

  useEffect(() => {
    const syncMusicToTab = () => {
      const audio = audioRef.current
      if (!audio) return

      if (document.hidden) {
        audio.pause()
        return
      }

      if (!musicWantedRef.current || sealedRef.current) return
      audio.volume = MUSIC_VOLUME
      void audio.play().catch(() => {})
    }

    document.addEventListener('visibilitychange', syncMusicToTab)
    return () => document.removeEventListener('visibilitychange', syncMusicToTab)
  }, [])

  const resumeMusic = () => {
    sealedRef.current = false
    const audio = audioRef.current
    if (!musicWantedRef.current || !audio) return
    audio.volume = MUSIC_VOLUME
    void audio.play().catch(() => {})
  }

  const handleToggleLetter = () => {
    if (letterRef.current === 'open' || letterRef.current === 'opening') {
      letterRef.current = 'closing'
      setLetter('closing')
      return
    }

    letterRef.current = 'opening'
    resumeMusic()
    setLetter('opening')
  }

  const handleFullyClosed = () => {
    if (letterRef.current !== 'closing') return
    sealedRef.current = true
    audioRef.current?.pause()
    setLetter('closed')
  }

  const handleFullyOpened = () => {
    if (letterRef.current !== 'opening') return
    sealedRef.current = false
    setLetter('open')
  }

  return (
    <div className="relative isolate min-h-dvh bg-[#F9F5EF] text-[#5B1E2B]">
      <h1 className="sr-only">Mina &amp; Monica، السبت ٣١ اكتوبر، الساعة ٧ مساءً، كنيسة مارجرجس هليوبوليس</h1>
      <audio
        ref={audioRef}
        src={assetUrl('/bg-music.mp3')}
        preload="auto"
        loop
        className="hidden"
      />
      <HeroSequence
        audioRef={audioRef}
        musicWantedRef={musicWantedRef}
        onComplete={() => setScrollUnlocked(true)}
      />
      {scrollUnlocked && (
        <>
          <GuestbookForm />
          <PhotoGallery />
          {letter === 'open' && <CloseLetterButton label="أغلق الرسالة" onClick={handleToggleLetter} />}
        </>
      )}
      {letter !== 'open' && (
        <>
          <CloseLetterOverlay
            phase={letter}
            onClosed={handleFullyClosed}
            onOpened={handleFullyOpened}
          />
          <CloseLetterButton
            floating
            label={letter === 'opening' ? 'أغلق الرسالة' : 'افتح الرسالة'}
            onClick={handleToggleLetter}
          />
        </>
      )}
    </div>
  )
}
