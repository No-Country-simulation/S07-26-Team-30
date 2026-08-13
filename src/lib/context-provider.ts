/**
 * Static keyword-based context provider for the PhysaFlow report.
 * Uses term frequency scoring against plain-text sections loaded from MDX files.
 *
 * Swap for a VectorSearchProvider (Pinecone, pgvector, etc.) when the
 * content grows beyond a single report — the ContextProvider interface
 * stays the same.
 */

// NUEVO:
// Antes el provider devolvía directamente un string con el contexto.
// Ahora definimos un resultado estructurado.
//
// ¿Por qué?
// Porque el buscador debería preocuparse por ENCONTRAR información,
// no por decidir cómo presentársela al modelo.
//
// Más adelante, prompts.ts / buildContext() podrá recibir estos resultados
// y encargarse de convertirlos en el formato que Groq necesita.
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

    // NUEVO:
    // Si no conseguimos extraer términos útiles de la pregunta,
    // devolvemos un array vacío.
    //
    // Antes devolvíamos las primeras 3 secciones del reporte.
    // Eso podía provocar que el modelo recibiera información que
    // realmente no tenía relación con la pregunta.
    if (terms.length === 0) {
      return [];
    }

    const scored = this.sections
      .map((section) => ({
        section,
        score: scoreSection(section, terms),
      }))

      // NUEVO:
      // Eliminamos las secciones que no tuvieron ninguna coincidencia.
      //
      // De esta manera, una pregunta que no tenga relación con el reporte
      // no termina recibiendo contenido simplemente porque "necesitamos"
      // devolver tres resultados.
      .filter((result) => result.score > 0)

      // Mantenemos la lógica que ya teníamos:
      // las secciones con mayor puntuación aparecen primero.
      .sort((a, b) => b.score - a.score)

      // También mantenemos el límite de 3 resultados.
      //
      // Esto evita enviar todo el reporte al modelo y ayuda a mantener
      // el contexto enfocado en la pregunta actual.
      .slice(0, 3);

    // NUEVO:
    // Si ninguna sección coincide con la consulta, devolvemos [].
    //
    // Esto será importante para que la capa que utiliza este provider
    // pueda detectar fácilmente:
    //
    // "No encontré información relevante en el reporte."
    if (scored.length === 0) {
      return [];
    }

    // NUEVO:
    // En lugar de transformar cada resultado en texto acá,
    // devolvemos sus datos estructurados.
    //
    // Por ejemplo:
    //
    // {
    //   slug: "facility-layer",
    //   title: "Layer 1: Facility",
    //   content: "...",
    //   score: 17
    // }
    //
    // La presentación de estos datos será responsabilidad de buildContext().
    return scored.map(({ section, score }) => ({
      slug: section.slug,
      title: section.title,
      content: section.content,
      score,
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

function scoreSection(section: Section, terms: string[]): number {
  const body = section.content.toLowerCase();
  let score = 0;

  const title = section.title.toLowerCase();

  for (const term of terms) {
    if (title.includes(term)) score += 5;
    if (title.split(/\s+/).includes(term)) score += 10;
  }

  for (const term of terms) {
    // NUEVO:
    // Escapamos el término antes de utilizarlo dentro de RegExp.
    //
    // Esto hace que la búsqueda trate la palabra del usuario como texto
    // literal y no como una expresión regular.
    const escapedTerm = escapeRegExp(term);
    const re = new RegExp(escapedTerm, "gi");
    const matches = body.match(re);

    if (matches) score += matches.length;
  }

  return score;
}

// NUEVO:
// Escapa caracteres especiales para poder utilizarlos de forma segura
// dentro de una expresión regular.
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
