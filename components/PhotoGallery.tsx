import VerticalGallery from '@/components/VerticalGallery'
import { galleryImages } from '@/lib/assets'

export default function PhotoGallery() {
  return (
    <section id="gallery" className="relative z-10 scroll-mt-6 px-5 py-16" aria-labelledby="gallery-title">
      <h2 id="gallery-title" className="text-center font-arabic text-4xl text-burgundy">
        معرض الصور
      </h2>
      <VerticalGallery images={galleryImages} />
    </section>
  )
}
