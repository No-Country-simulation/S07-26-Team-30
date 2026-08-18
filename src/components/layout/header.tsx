'use client'

import { useEffect, useRef, useState } from 'react'
import { Bars3Icon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import hero from "../../app/assets/proyecto_nuevo_7.png"
import logo from "../../../public/images/logohor.webp"

const navigation = [
  { name: 'Introduction', href: '/reports/stranded-capacity-index#1-executive-summary-introduction' },
  { name: 'Taxonomy', href: '/reports/stranded-capacity-index#2-taxonomy-of-stranded-capacity' },
  { name: 'Methodology', href: '/reports/stranded-capacity-index#05-methodology' },
  { name: 'References', href: '/reports/stranded-capacity-index#08-references' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const imageWrapRef = useRef<HTMLDivElement>(null)

  const scrollToContent = () => {
    const next = sectionRef.current?.nextElementSibling as HTMLElement | null
    if (!next) return
    const top = next.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  }

  // Parallax sutil sobre la imagen del hero: se mueve al 75% de la velocidad del scroll.
  useEffect(() => {
    const section = sectionRef.current
    const imageWrap = imageWrapRef.current
    if (!section || !imageWrap) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    const update = () => {
      raf = 0
      const cap = section.offsetHeight * 0.25
      const y = Math.min(window.scrollY * 0.25, cap)
      imageWrap.style.transform = `translateY(${y}px)`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <>
      <header
        style={{ backgroundColor: "rgb(15, 43, 32)" }}
        className="relative z-50 w-full transition-all duration-500 print:hidden"
      >
        <div className="mx-auto flex h-[170px] w-full max-w-[1400px] items-center justify-between px-6">
          <a href="https://dev.physaflow.com/" className="group flex items-center gap-3">
            <span className="sr-only">PhysaFlow</span>
            <Image
              src={logo}
              alt="PhysaFlow"
              className="h-[133px] w-auto rounded-sm transition-all group-hover:scale-105"
            />
          </a>
          <nav aria-label="Global" className="hidden items-center gap-8 md:flex">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-[1rem] font-medium text-white/60 transition-colors hover:text-[#d4a94e]"
              >
                {item.name}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-4 md:flex">
            <a
              href="/api/reports/pdf?slug=stranded-capacity-index"
              className="group relative overflow-hidden rounded-lg px-5 py-2.5 text-[1rem] font-bold text-white transition-all hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #a27e2d, #d4a94e)",
                boxShadow: "0 4px 20px rgba(162,126,45,0.35)",
              }}
            >
              <span className="relative z-10">Platform Login</span>
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: "linear-gradient(135deg, #d4a94e, #a27e2d)" }}
              />
            </a>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden transition-colors hover:text-[#d4a94e]"
            style={{ color: "rgba(255,255,255,0.8)" }}
            aria-label={mobileMenuOpen ? "Close menu" : "Open main menu"}
          >
            {mobileMenuOpen ? (
              <XMarkIcon aria-hidden="true" className="size-6" />
            ) : (
              <Bars3Icon aria-hidden="true" className="size-6" />
            )}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-[#0B1F17] md:hidden">
            <div className="mx-auto max-w-[1400px] space-y-1 px-6 py-4">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-base/7 font-semibold text-white/60 transition-colors hover:bg-white/5 hover:text-[#d4a94e]"
                >
                  {item.name}
                </a>
              ))}
              <a
                href="/api/reports/pdf?slug=stranded-capacity-index"
                onClick={() => setMobileMenuOpen(false)}
                className="group relative mt-4 flex w-full items-center justify-center overflow-hidden rounded-lg px-5 py-2.5 text-[1rem] font-bold text-white transition-all hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #a27e2d, #d4a94e)",
                  boxShadow: "0 4px 20px rgba(162,126,45,0.35)",
                }}
              >
                <span className="relative z-10">Download</span>
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: "linear-gradient(135deg, #d4a94e, #a27e2d)" }}
                />
              </a>
            </div>
          </div>
        )}
      </header>

      <section
        ref={sectionRef}
        className="relative h-[calc(100vh-170px)] w-full overflow-hidden print:hidden"
      >
        {/* Imagen de fondo con parallax: wrapper 140% anclado abajo para que
            nunca se vea un hueco al desplazarse */}
        <div
          ref={imageWrapRef}
          className="absolute inset-x-0 bottom-0 h-[140%] will-change-transform"
        >
          <Image
            src={hero}
            alt="Hero"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>

        {/* Degradado negro lineal ascendente */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"
        />

        {/* Texto centrado horizontal y verticalmente sobre la imagen */}
        <div className="relative z-10 flex h-full items-center px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1400px] text-center">
            <p className="m-0 font-display text-sm font-semibold uppercase tracking-[0.35em] text-[#d4a94e]">
              PhysaFlow
            </p>
            <h1 className="mt-2 mb-0 font-display text-4xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Stranded Capacity: The Hidden Constraint Behind AI Infrastructure
            </h1>
            <p className="mt-2 mb-0 font-display text-base font-medium text-white/70 sm:text-lg">
              August 20, 2026 | Report
            </p>
          </div>
        </div>

        {/* Botón de scroll flotando sobre la imagen y el degradado */}
        <button
          type="button"
          onClick={scrollToContent}
          aria-label="Read the report"
          className="group absolute bottom-[10vh] left-1/2 z-10 flex -translate-x-1/2 cursor-pointer flex-col items-center gap-3"
        >
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#d4a94e] transition-colors duration-300 group-hover:text-white">
            Read the report
          </span>
          <ChevronDownIcon
            aria-hidden="true"
            className="size-5 animate-levitate text-[#d4a94e] transition-all duration-300 group-hover:translate-y-1 group-hover:text-white group-hover:animate-none"
          />
        </button>
      </section>
    </>
  )
}


export default Header