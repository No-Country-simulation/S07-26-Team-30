import Image from "next/image";
import hero from "@/app/assets/proyecto_nuevo_7.png";

export function LandingHero() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Image
        src={hero}
        alt="PhysaFlow hero"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 z-0 object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1
              style={{ color: "white", fontFamily: "serif" }}
              className="text-5xl font-semibold tracking-tight text-balance sm:text-7xl"
            >
              The Reference Report on Isolated Capacity in AI Data Centers
            </h1>
            <h3
              style={{ color: "white", fontFamily: "serif" }}
              className="mt-8 text-lg font-medium text-pretty sm:text-xl/8"
            >
              A taxonomy developed by PhysaFlow to identify, classify, and
              understand isolated capacity in modern data centers, analyzing
              the layers of physical infrastructure, IT infrastructure, and
              workload scheduling.
            </h3>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                style={{ backgroundColor: "#C6A158" }}
                href="#"
                className="rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:opacity-90"
              >
                Download the report
              </a>
              <a
                style={{ backgroundColor: "#0B1F17", color: "#C6A158" }}
                href="#"
                className="rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:opacity-90"
              >
                Explore Key Insights
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingHero;
