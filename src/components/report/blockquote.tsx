interface BlockquoteProps {
  children: React.ReactNode;
  source?: string;
}

export function Blockquote({ children, source }: BlockquoteProps) {
  return (
    <blockquote className="my-6 border-l-4 border-primary pl-4 italic">
      {children}
      {source && (
        <footer className="mt-1 text-sm not-italic text-muted-foreground">
          — {source}
        </footer>
      )}
    </blockquote>
  );
}