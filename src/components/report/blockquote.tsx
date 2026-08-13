interface BlockquoteProps {
  children: React.ReactNode;
  source?: string;
}

export function Blockquote({ children, source }: BlockquoteProps) {
  return (
    <blockquote className="relative my-12 pl-7">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-4 left-2 select-none font-serif text-6xl leading-none text-accent/30"
      >
        “
      </span>
      <div className="font-serif text-2xl font-medium italic leading-snug text-pretty text-foreground [&>p]:mb-1.5">
        {children}
      </div>
      {source && (
        <footer className="mt-3 text-sm not-italic tracking-wide text-muted-foreground">
          — {source}
        </footer>
      )}
    </blockquote>
  );
}
