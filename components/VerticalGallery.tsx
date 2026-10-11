'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { assetUrl } from '@/lib/asset-versions'

export type GalleryImage = {
  src: string
  alt: string
  width?: number
  height?: number
}

const MASK = 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)'

type VerticalGalleryProps = {
  images: readonly GalleryImage[]
}

export default function VerticalGallery({ images }: VerticalGalleryProps) {
  const reduceMotion = useReducedMotion()

  if (images.length === 0) return null

  if (reduceMotion) {
    return (
      <div className="mx-auto mt-12 flex w-32 flex-col gap-8 sm:w-48">
        {images.map((image) => (
          <img
            key={image.src}
            src={assetUrl(image.src)}
            alt={image.alt}
            width={image.width}
            height={image.height}
            className="aspect-[3/4] w-full shrink-0 rounded-2xl object-cover shadow-lg"
          />
        ))}
      </div>
    )
  }

  const copiesPerHalf = Math.max(1, Math.ceil(4 / images.length))
  const half = Array.from({ length: copiesPerHalf }, () => [...images]).flat()
  const duration = Math.max(28, half.length * 3.2)

  return (
    <div
      className="relative mx-auto mt-12 h-104 w-32 overflow-hidden sm:w-48"
      style={{ maskImage: MASK, WebkitMaskImage: MASK }}
    >
      <motion.div
        className="flex flex-col"
        animate={{ y: ['0%', '-50%'] }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex flex-col gap-8 pb-8" aria-hidden={copy === 1}>
            {half.map((image, index) => (
              <img
                key={`${image.src}-${copy}-${index}`}
                src={assetUrl(image.src)}
                alt={copy === 0 && index < images.length ? image.alt : ''}
                width={image.width}
                height={image.height}
                className="aspect-[3/4] w-full shrink-0 rounded-2xl object-cover shadow-lg"
              />
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
