'use client'

import { useState } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import hero from "../../app/assets/proyecto_nuevo_7.png"
import logo from "../../../public/images/logohor.webp"

const navigation = [
  { name: 'Introduction', href: '/reports/stranded-capacity-index#01-executive-summary' },
  { name: 'Taxonomy', href: '/reports/stranded-capacity-index#02-facility-layer' },
  { name: 'Methodology', href: '/reports/stranded-capacity-index#05-methodology' },
  { name: 'References', href: '/reports/stranded-capacity-index#08-references' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Image src={hero} alt="Hero" fill priority sizes="100vw" className="absolute inset-0 z-0 object-cover" />
      <div className= "absolute inset-0 bg-black/40"/>
      <header
        style={{ backgroundColor: "rgba(17, 48, 36, 0.95)" }}
        className="absolute inset-x-0 top-0 z-50 w-full transition-all duration-500"
      >
        <div className="mx-auto flex h-[170px] w-full max-w-[1400px] items-center justify-between px-6">
          <a href="#" className="group flex items-center gap-3">
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
                className="text-[1rem] font-medium text-white/60 transition-colors hover:text-[#e8cf9a]"
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
              <span className="relative z-10">Download</span>
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: "linear-gradient(135deg, #d4a94e, #a27e2d)" }}
              />
            </a>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden transition-colors hover:text-[#e8cf9a]"
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
                  className="block rounded-lg px-3 py-2 text-base/7 font-semibold text-white/60 transition-colors hover:bg-white/5 hover:text-[#e8cf9a]"
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

      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-288.75"
          />
        </div>
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 style={{color:'white' , fontFamily:'serif'}} className="text-5xl font-semibold tracking-tight text-balance text-white-900 sm:text-7xl">
              The Reference Report on Isolated Capacity in AI Data Centers
            </h1>
            <h3 style={{color:'white', fontFamily:'serif'}} className="mt-8 text-lg font-medium text-pretty text-white-500 sm:text-xl/8">
              A taxonomy developed by PhysaFlow to identify, classify, and understand isolated capacity in modern data centers, analyzing the layers of physical infrastructure, IT infrastructure, and workload scheduling.
            </h3>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a style={{backgroundColor:'#C6A158'}}
                href="#"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Download the report 
              </a>
              <a style={{backgroundColor:'#0B1F17', color:'#C6A158'}} href="#" className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                Explore Key Insights<span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-288.75"
          />
        </div>
      </div>
    </div>
  )
}


export default Header