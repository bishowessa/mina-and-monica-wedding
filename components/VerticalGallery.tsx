'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { assetUrl } from '@/lib/asset-versions'

export type GalleryImage = {
  src: string
  alt: string
  width?: number
  height?: number
}

const MASK = 'linear-gradient(to bottom, transparent, black 8%, black 92%, transparent)'

type VerticalGalleryProps = {
  images: readonly GalleryImage[]
}

function splitColumns(images: readonly GalleryImage[]) {
  const columns: GalleryImage[][] = [[], [], []]
  images.forEach((image, index) => {
    columns[index % 3].push(image)
  })
  return columns
}

function FilmColumn({
  images,
  direction,
}: {
  images: readonly GalleryImage[]
  direction: 'up' | 'down'
}) {
  if (images.length === 0) return null

  const duration = Math.max(26, images.length * 4.2)

  return (
    <div
      className="relative h-104 min-w-0 flex-1 overflow-hidden"
      style={{ maskImage: MASK, WebkitMaskImage: MASK }}
    >
      <motion.div
        className="flex flex-col"
        animate={direction === 'up' ? { y: ['0%', '-50%'] } : { y: ['-50%', '0%'] }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex flex-col gap-3 pb-3" aria-hidden={copy === 1}>
            {images.map((image, index) => (
              <img
                key={`${image.src}-${copy}-${index}`}
                src={assetUrl(image.src)}
                alt={copy === 0 ? image.alt : ''}
                width={image.width}
                height={image.height}
                className="aspect-[3/4] w-full shrink-0 rounded-xl object-cover shadow-lg"
              />
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export default function VerticalGallery({ images }: VerticalGalleryProps) {
  const reduceMotion = useReducedMotion()
  if (images.length === 0) return null

  const columns = splitColumns(images)
  const directions = ['up', 'down', 'up'] as const

  if (reduceMotion) {
    return (
      <div className="mt-10 grid grid-cols-3 gap-3">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="flex flex-col gap-3">
            {column.slice(0, 3).map((image) => (
              <img
                key={image.src}
                src={assetUrl(image.src)}
                alt={image.alt}
                width={image.width}
                height={image.height}
                className="aspect-[3/4] w-full rounded-xl object-cover shadow-lg"
              />
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mt-10 flex gap-3">
      {columns.map((column, index) => (
        <FilmColumn key={directions[index] + index} images={column} direction={directions[index]} />
      ))}
    </div>
  )
}
