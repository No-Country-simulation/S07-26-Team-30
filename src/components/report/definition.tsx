import { slugify } from "@/lib/utils";

interface DefinitionProps {
  term: string;
  children: React.ReactNode;
}

export function Definition({ term, children }: DefinitionProps) {
  const id = slugify(term);
  return (
    <div
      id={id}
      className="my-8 rounded-xl border border-l-2 border-l-accent bg-card p-6 shadow-card"
    >
      <dt className="text-base font-semibold text-accent-deep">{term}</dt>
      <dd className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
        {children}
      </dd>
    </div>
  );
}
