'use client'

import { forwardRef, memo } from 'react'
import { assetUrl } from '@/lib/asset-versions'

const ENVELOPE_VIDEO_SRC = assetUrl('/envelope.mp4')
const ENVELOPE_POSTER_SRC = assetUrl('/envelope-poster.jpg')

interface EnvelopeVideoProps {
  poster?: boolean
}

/**
 * Static video layer. Parents drive playback through the ref so React
 * state updates never restart the element.
 */
const EnvelopeVideo = memo(
  forwardRef<HTMLVideoElement, EnvelopeVideoProps>(function EnvelopeVideo({ poster = true }, ref) {
    return (
      <video
        ref={ref}
        src={ENVELOPE_VIDEO_SRC}
        poster={poster ? ENVELOPE_POSTER_SRC : undefined}
        className="absolute inset-0 h-full w-full bg-[#F9F5EF] object-cover object-center"
        preload="auto"
        muted
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        loop={false}
        {...({ 'webkit-playsinline': 'true', 'x-webkit-airplay': 'deny' } as Record<string, string>)}
      />
    )
  })
)

EnvelopeVideo.displayName = 'EnvelopeVideo'

export default EnvelopeVideo
