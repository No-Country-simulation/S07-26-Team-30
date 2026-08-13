import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

export function PdfDownloadButton({
  slug,
  variant = "primary",
}: {
  slug: string;
  variant?: "primary" | "compact";
}) {
  const href = `/api/reports/pdf?slug=${encodeURIComponent(slug)}`;
  if (variant === "compact") {
    return (
      <a
        href={href}
        className={cn("mt-5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#f5f3ec] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#b69454] hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep")}
      >
        <Download aria-hidden="true" className="size-3.5" />
        Download PDF
      </a>
    );
  }
  return (
    <a
      href={href}
      className={cn("rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-[#f5f3ec] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#b69454] hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white")}
    >
      Download the report
    </a>
  );
}
