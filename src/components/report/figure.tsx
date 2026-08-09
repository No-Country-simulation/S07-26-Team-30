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
    <figure className="my-10">
      <img src={src} alt={alt} className="rounded-lg border" />
      {caption && (
        <figcaption className="mt-2.5 text-center text-[0.875rem] leading-relaxed text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
