import Image from "next/image";
import { ChevronDown } from "lucide-react";
import hero from "@/app/assets/proyecto_nuevo_7.png";

export function LandingHero() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <Image
        src={hero}
        alt="PhysaFlow hero"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 z-0 object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/25"
      />

      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-3xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <p className="mb-6 flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#e8cf9a]">
              <span aria-hidden="true" className="h-px w-8 bg-[#e8cf9a]/70" />
              PhysaFlow Research
              <span aria-hidden="true" className="h-px w-8 bg-[#e8cf9a]/70" />
            </p>
            <h1
              style={{ color: "white", fontFamily: "serif" }}
              className="text-5xl font-semibold tracking-tight text-balance [text-shadow:0_1px_28px_rgba(0,0,0,0.45)] sm:text-7xl"
            >
              The Reference Report on Isolated Capacity in AI Data Centers
            </h1>
            <h3
              style={{ color: "white", fontFamily: "serif" }}
              className="mx-auto mt-8 max-w-2xl text-lg font-medium text-pretty [text-shadow:0_1px_20px_rgba(0,0,0,0.4)] sm:text-xl/8"
            >
              A taxonomy developed by PhysaFlow to identify, classify, and
              understand isolated capacity in modern data centers, analyzing
              the layers of physical infrastructure, IT infrastructure, and
              workload scheduling.
            </h3>
            <div className="mt-10 flex items-center justify-center gap-x-4">
              <a
                href="#"
                className="rounded-md bg-accent px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Download the report
              </a>
              <a
                href="#"
                className="group inline-flex items-center gap-2 rounded-md border border-accent/60 bg-transparent px-6 py-3 text-sm font-semibold text-[#e8cf9a] transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:bg-accent/10 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Explore Key Insights
                <span
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <a
        href="#01-executive-summary"
        aria-label="Scroll to the report"
        className="group absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-1.5 text-white/70 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        <span className="text-[0.625rem] font-semibold uppercase tracking-[0.3em] transition-colors group-hover:text-[#e8cf9a]">
          Scroll
        </span>
        <ChevronDown
          aria-hidden="true"
          className="size-4 animate-scroll-hint transition-colors group-hover:text-[#e8cf9a]"
        />
      </a>
    </div>
  );
}

export default LandingHero;
