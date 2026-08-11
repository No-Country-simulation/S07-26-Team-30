import { slugify } from "@/lib/utils";

interface DefinitionProps {
  term: string;
  children: React.ReactNode;
}

export function Definition({ term, children }: DefinitionProps) {
  const id = slugify(term);
  return (
    <div id={id} className="my-6 rounded-lg border bg-muted/50 p-5">
      <dt className="text-base font-semibold">{term}</dt>
      <dd className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted-foreground">
        {children}
      </dd>
    </div>
  );
}
