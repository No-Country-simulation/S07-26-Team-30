/**
 * Lightweight keyword search for MVP.
 *
 * Kept as a separate utility in case the API route or other consumers need
 * direct search without the full ContextProvider abstraction.
 */

export function keywordSearch(
  query: string,
  texts: { slug: string; content: string }[],
  topK = 3,
): string[] {
  const terms = query
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => t.length > 2);

  if (terms.length === 0) return texts.slice(0, topK).map((t) => t.content);

  const scored = texts.map((t) => ({
    content: t.content,
    score: terms.reduce(
      (acc, term) => acc + (t.content.toLowerCase().match(new RegExp(term, "g"))?.length ?? 0),
      0,
    ),
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((r) => r.content);
}