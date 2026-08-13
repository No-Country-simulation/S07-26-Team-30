export function Figure({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  return (
    <figure className="my-12">
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card p-2 shadow-card">
        <img src={src} alt={alt} className="w-full rounded-lg" />
      </div>
      {caption && (
        <figcaption className="mt-4 text-center">
          <span aria-hidden="true" className="mx-auto mb-2.5 block h-px w-10 bg-accent/60" />
          <span className="mx-auto block max-w-xl text-sm leading-relaxed text-muted-foreground text-pretty">
            {caption}
          </span>
        </figcaption>
      )}
    </figure>
  );
}
