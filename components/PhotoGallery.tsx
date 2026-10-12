import VerticalGallery from '@/components/VerticalGallery'
import { galleryImages } from '@/lib/assets'

export default function PhotoGallery() {
  return (
    <section id="gallery" className="relative z-10 scroll-mt-6 px-5 py-16" aria-label="ألبوم الصور">
      <VerticalGallery images={galleryImages} />
    </section>
  )
}
