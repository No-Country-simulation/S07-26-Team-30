/**
 * Static keyword-based context provider for the PhysaFlow report.
 * Uses term frequency scoring against plain-text sections loaded from MDX files.
 *
 * Swap for a VectorSearchProvider (Pinecone, pgvector, etc.) when the
 * content grows beyond a single report — the ContextProvider interface
 * stays the same.
 */

export interface SearchResult {
  slug: string;
  title: string;
  content: string;
  score: number;
}

export interface ContextProvider {
  getRelevantContext(query: string): Promise<SearchResult[]>;
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

      this.sections.push({
        slug,
        title,
        content,
      });
    }

    this.loaded = true;
  }

  async getRelevantContext(query: string): Promise<SearchResult[]> {
    await this.ensureLoaded();

    const terms = query
      .toLowerCase()
      .split(/\W+/)
      .filter((t) => t.length > 2);

    // Si no conseguimos extraer términos útiles de la pregunta,
    // no enviamos contenido irrelevante al modelo.
    if (terms.length === 0) {
      return [];
    }

    const scored = this.sections
      .map((section) => ({
        section,
        score: scoreSection(section, terms),
      }))

      // Eliminamos las secciones sin coincidencias.
      .filter((result) => result.score > 0)

      // Las secciones más relevantes aparecen primero.
      .sort((a, b) => b.score - a.score)

      // Limitamos el contexto a las 3 secciones más relevantes.
      .slice(0, 3);

    // Si no encontramos información relevante, devolvemos un array vacío.
    if (scored.length === 0) {
      return [];
    }

    return scored.map(({ section, score }) => ({
      slug: section.slug,
      title: section.title,

      // Limpiamos HTML/MDX problemático antes de enviarlo al modelo.
      // Esto evita que el modelo copie <br>, <div>, etc.
      content: cleanContent(section.content),

      score,
    }));
  }

  // Devuelve secciones específicas del reporte para acciones predefinidas.
  async getSectionContext(slugs: string[]): Promise<SearchResult[]> {
    await this.ensureLoaded();

    return slugs
      .map((slug) => this.sections.find((section) => section.slug === slug))
      .filter((section): section is Section => Boolean(section))
      .map((section) => ({
        slug: section.slug,
        title: section.title,
        content: cleanContent(section.content),
        score: 1,
      }));
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

/**
 * Limpia contenido MDX/HTML antes de enviarlo al modelo.
 *
 * Importante:
 * No modifica los archivos originales del reporte.
 * Solamente transforma el texto que se utiliza como contexto del chatbot.
 */
function cleanContent(content: string): string {
  return content
    // Convierte saltos HTML en saltos de línea normales.
    .replace(/<br\s*\/?>/gi, "\n")

    // Elimina etiquetas HTML comunes.
    .replace(/<\/?(div|p|span|section|article)[^>]*>/gi, "")

    // Elimina cualquier otra etiqueta HTML simple.
    .replace(/<[^>]+>/g, "")

    // Limpia entidades HTML comunes.
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")

    // Evita demasiados saltos de línea consecutivos.
    .replace(/\n{3,}/g, "\n\n")

    .trim();
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
    const escapedTerm = escapeRegExp(term);
    const re = new RegExp(escapedTerm, "gi");
    const matches = body.match(re);

    if (matches) score += matches.length;
  }

  return score;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}