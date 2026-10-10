export default function VerseSection() {
  return (
    <section id="verse" className="relative z-10 px-6 py-24" aria-labelledby="verse-title">
      <blockquote className="mx-auto max-w-md text-center">
        <p id="verse-title" dir="ltr" className="font-serif text-[1.65rem] leading-relaxed text-[#5B1E2B] italic">
          And I have given them the glory that You gave Me, that they may be one just as We are one.
        </p>
        <footer dir="ltr" className="mt-6 font-serif text-sm tracking-[0.22em] text-[#5B1E2B]/70 uppercase">
          John 17
        </footer>
      </blockquote>
    </section>
  )
}
