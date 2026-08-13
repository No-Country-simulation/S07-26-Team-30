import { slugify } from "@/lib/utils";

interface TocItem {
  label: string;
  depth: number;
}

export function TableOfContents({ items }: { items: TocItem[] }) {
  return (
    <nav className="my-12 rounded-xl border border-border bg-card p-6 shadow-card">
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-deep">
        On this page
      </h2>
      <span aria-hidden="true" className="mt-3 block h-px w-10 bg-accent/70" />
      <ul className="mt-5 space-y-0.5">
        {items.map((item) => (
          <li key={item.label}>
            <a
              href={`#${slugify(item.label)}`}
              className="group flex items-baseline gap-2 rounded-sm py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              style={{ paddingLeft: `${(item.depth - 1) * 1}rem` }}
            >
              <span>{item.label}</span>
              <span
                aria-hidden="true"
                className="flex-1 border-b border-dotted border-border/80 transition-colors group-hover:border-accent/60"
              />
              <span
                aria-hidden="true"
                className="w-7 select-none text-right tabular-nums text-transparent"
              >
                00
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
