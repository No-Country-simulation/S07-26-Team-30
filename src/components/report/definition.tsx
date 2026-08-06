import { slugify } from "@/lib/utils";

interface DefinitionProps {
  term: string;
  children: React.ReactNode;
}

export function Definition({ term, children }: DefinitionProps) {
  const id = slugify(term);
  return (
    <div id={id} className="my-4 rounded-lg border bg-muted/50 p-4">
      <dt className="font-semibold">{term}</dt>
      <dd className="mt-1 text-sm text-muted-foreground">{children}</dd>
    </div>
  );
}
