/**
 * Static keyword-based context provider for the PhysaFlow report.
 * Uses term frequency scoring against plain-text sections loaded from MDX files.
 *
 * Swap for a VectorSearchProvider (Pinecone, pgvector, etc.) when the
 * content grows beyond a single report — the ContextProvider interface
 * stays the same.
 */
export interface ContextProvider {
  getRelevantContext(query: string): Promise<string>;
}

// ---------------------------------------------------------------------------

import fs from "node:fs/promises";
import path from "node:path";

interface Section {
  slug: string;
  title: string;
  content: string;
}

export class StaticSearchProvider implements ContextProvider {
  private sections: Section[] = [];
  private loaded = false;

  constructor(
    private reportDir: string,
    private fileMap: Record<string, string>,
  ) {}

  private async ensureLoaded() {
    if (this.loaded) return;
    this.sections = [];

    for (const [slug, filePath] of Object.entries(this.fileMap)) {
      const fullPath = path.join(this.reportDir, filePath);
      const raw = await fs.readFile(fullPath, "utf-8");
      const title = extractTitle(raw);
      const content = stripFrontmatter(raw);
      this.sections.push({ slug, title, content });
    }

    this.loaded = true;
  }

  async getRelevantContext(query: string): Promise<string> {
    await this.ensureLoaded();

    const terms = query
      .toLowerCase()
      .split(/\W+/)
      .filter((t) => t.length > 2);

    if (terms.length === 0) {
      return this.sections
        .slice(0, 3)
        .map((s) => `## ${s.title}\n${s.content}`)
        .join("\n\n");
    }

    const scored = this.sections
      .map((section) => ({
        section,
        score: scoreSection(section, terms),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return scored
      .map((s) => `## ${s.section.title}\n${s.section.content}`)
      .join("\n\n");
  }
}

// -- helpers ----------------------------------------------------------------

function extractTitle(raw: string): string {
  const match = raw.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "Untitled";
}

function stripFrontmatter(raw: string): string {
  return raw.replace(/^---[\s\S]*?---\n/, "").trim();
}

function scoreSection(section: Section, terms: string[]): number {
  const body = section.content.toLowerCase();
  let score = 0;

  const title = section.title.toLowerCase();
  for (const term of terms) {
    if (title.includes(term)) score += 5;
    if (title.split(/\s+/).includes(term)) score += 10;
  }

  for (const term of terms) {
    const re = new RegExp(term, "gi");
    const matches = body.match(re);
    if (matches) score += matches.length;
  }

  return score;
}