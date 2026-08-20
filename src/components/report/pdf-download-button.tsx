import { Download } from "lucide-react";

export function PdfDownloadButton({ slug }: { slug: string }) {
  const href = `/api/reports/pdf?slug=${encodeURIComponent(slug)}`;
  return (
    <a
      href={href}
      className="group relative mt-5 flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-lg px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep"
      style={{
        background: "linear-gradient(135deg, #a27e2d, #d4a94e)",
        boxShadow: "0 4px 20px rgba(162,126,45,0.35)",
      }}
    >
      <span className="relative z-10 flex items-center gap-1.5">
        <Download aria-hidden="true" className="size-3.5" />
        Download PDF
      </span>
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "linear-gradient(135deg, #d4a94e, #a27e2d)" }}
      />
    </a>
  );
}
