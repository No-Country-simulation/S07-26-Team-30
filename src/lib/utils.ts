export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Distancia (px) desde el borde superior del viewport a la que un heading
 * se considera "actual". Es la única fuente de verdad usada también por los
 * scroll margins del CSS (--reading-offset en globals.css).
 */
export function readReadingOffset(): number {
  if (typeof window === "undefined") return 112;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--reading-offset")
    .trim();
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return 112;
  return raw.endsWith("rem") ? n * 16 : n;
}
