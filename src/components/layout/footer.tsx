export function Footer() {
  const reportLinks = [
    { label: "Report Index", href: "/reports/stranded-capacity-index" },
    {
      label: "Methodology",
      href: "/reports/stranded-capacity-index/05-methodology",
    },
    {
      label: "How to Cite",
      href: "/reports/stranded-capacity-index/07-how-to-cite",
    },
    {
      label: "References",
      href: "/reports/stranded-capacity-index/08-references",
    },
  ];

  return (
    <footer className="border-t border-border/70 bg-background py-12 text-center print:hidden">
      <span
        aria-hidden="true"
        className="mx-auto mb-4 block size-1 rotate-45 bg-accent"
      />
      <p className="text-sm text-muted-foreground">
        PhysaFlow — Stranded Capacity Index Report
      </p>
      <nav
        aria-label="Footer"
        className="mx-auto mt-4 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-2"
      >
        {reportLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-sm text-muted-foreground transition-colors hover:text-accent"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}