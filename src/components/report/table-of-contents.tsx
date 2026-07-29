import { slugify } from "@/lib/utils";

interface TocItem {
  label: string;
  depth: number;
}

export function TableOfContents({ items }: { items: TocItem[] }) {
  return (
    <nav className="my-8 rounded-lg border bg-muted/30 p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        On this page
      </h2>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.label}>
            <a
              href={`#${slugify(item.label)}`}
              className="text-sm text-muted-foreground hover:text-foreground"
              style={{ paddingLeft: `${(item.depth - 1) * 1}rem` }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}