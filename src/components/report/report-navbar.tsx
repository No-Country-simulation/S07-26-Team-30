import Link from "next/link";

/**
 * TEST PLACEHOLDER — replace with the real report navbar.
 * The real navbar/hero will be developed by another person.
 */
export function ReportNavbar() {
  return (
    <nav className="border-b bg-muted/30">
      <div className="mx-auto flex h-12 max-w-3xl items-center justify-between px-4">
        <span className="text-sm font-semibold">Stranded Capacity Index</span>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a href="#introduction" className="hover:text-foreground">
            Introduction
          </a>
          <a href="#methodology" className="hover:text-foreground">
            Methodology
          </a>
          <a href="#taxonomy/facility" className="hover:text-foreground">
            Taxonomy
          </a>
          <Link href="/" className="rounded-md border px-2 py-1 hover:bg-muted">
            Home
          </Link>
        </div>
      </div>
    </nav>
  );
}
