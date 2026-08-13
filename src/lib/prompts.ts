/**
 * System prompt and context formatting for the PhysaFlow chatbot.
 *
 * The system prompt defines the rules the AI must follow when answering.
 * buildContext() is responsible for transforming the search results into
 * a structured context that can be sent to the language model.
 */

// NUEVO:
// Importamos solamente el tipo SearchResult.
//
// Usamos "import type" porque no necesitamos traer código de
// context-provider.ts en tiempo de ejecución; solamente necesitamos
// conocer la estructura de los datos que recibe buildContext().
import type { SearchResult } from "@/lib/context-provider";

export const SYSTEM_PROMPT = `You are a research assistant answering questions about the PhysaFlow "Stranded Capacity Index" report.

Rules:
- Answer ONLY based on the provided context.
- If the answer is not in the context, say "I don't have information about that in the report."
- Do not use outside knowledge, assumptions, or speculation.
- When using information from the report, cite the relevant section name and its [Source N] identifier when possible.
- Do not invent, modify, or guess source identifiers.
- Be concise and factual.
- If the user asks something outside the report's scope, politely decline.`;

// NUEVO:
// Antes esta función recibía un string[]:
//
//   ["contenido 1", "contenido 2", "contenido 3"]
//
// Ahora recibe SearchResult[], que contiene información adicional
// sobre cada resultado:
//
//   - slug    → identificador de la sección
//   - title   → título visible de la sección
//   - content → contenido encontrado
//   - score   → relevancia calculada por el buscador
//
// De esta forma podemos darle al modelo contexto + una referencia
// clara de dónde proviene cada bloque.
export function buildContext(results: SearchResult[]): string {
  return results
    .map(
      (result, index) =>
        `[Source ${index + 1}]
Section: ${result.slug}
Title: ${result.title}

${result.content}`,
    )
    .join("\n\n");
}
