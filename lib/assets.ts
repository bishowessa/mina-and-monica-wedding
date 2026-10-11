/** Couple portrait. Replace with a transparent PNG cutout when the new artwork is ready. */
export const COUPLE_CUTOUT = '/1.jpeg'

const GALLERY_SIZE: ReadonlyArray<readonly [number, number]> = [
  [1160, 1579],
  [1003, 1504],
  [960, 1280],
  [1200, 1600],
  [1200, 1600],
  [1200, 1600],
  [1200, 1600],
  [1200, 1600],
  [1200, 1600],
  [1600, 1200],
  [960, 1280],
  [960, 1280],
  [960, 1280],
  [960, 1280],
  [3120, 4160],
  [3024, 4032],
  [960, 1280],
  [960, 1280],
  [960, 1280],
  [720, 1280],
  [1200, 1600],
  [1200, 1600],
  [1200, 1600],
  [1200, 1600],
  [1200, 1600],
  [1536, 2048],
  [1194, 1592],
  [960, 1280],
  [960, 1280],
  [960, 1280],
]

export const galleryImages = GALLERY_SIZE.map(([width, height], index) => {
  const number = String(index + 1).padStart(2, '0')
  return {
    src: `/gallery/${number}.jpeg`,
    alt: 'مينا ومونيكا',
    width,
    height,
  }
})
