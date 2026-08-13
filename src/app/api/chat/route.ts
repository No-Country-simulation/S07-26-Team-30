import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";
import { StaticSearchProvider } from "@/lib/context-provider";
import { SYSTEM_PROMPT, buildContext } from "@/lib/prompts";
import path from "node:path";

const reportDir = path.join(
  process.cwd(),
  "src/content/reports/stranded-capacity-index",
);

const provider = new StaticSearchProvider(reportDir, {
  "executive-summary": "01-executive-summary.mdx",
  "facility-layer": "02-facility-layer.mdx",
  "it-layer": "03-it-layer.mdx",
  "workload-layer": "04-workload-layer.mdx",
  methodology: "05-methodology.mdx",
  "how-to-cite": "07-how-to-cite.mdx",
  references: "08-references.mdx",
});

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const lastMessage = messages[messages.length - 1];

  const query =
    typeof lastMessage.content === "string" ? lastMessage.content : "";

  // El provider se encarga de buscar las secciones más relevantes
  // del reporte y devuelve un array de SearchResult[].
  //
  // Importante: acá todavía no tenemos un string listo para enviarle
  // al modelo. Tenemos datos estructurados con slug, title, content y score.
  const searchResults = await provider.getRelevantContext(query);

  // NUEVO:
  // buildContext() se encarga de transformar los resultados estructurados
  // del buscador en un texto organizado para el modelo.
  //
  // Esto separa responsabilidades:
  //
  //   provider    → busca información
  //   buildContext → prepara esa información
  //   Groq         → utiliza esa información para responder
  //
  // Antes enviábamos directamente "context", que anteriormente era un string.
  // Ahora necesitamos convertir SearchResult[] antes de enviarlo al modelo.
  const context = buildContext(searchResults);

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),

    // Ahora Groq recibe el contexto ya formateado.
    //
    // Esto significa que podrá ver estructuras como:
    //
    // [Source 1]
    // Section: facility-layer
    // Title: Layer 1: Facility
    //
    // ...contenido...
    //
    // De esta manera puede identificar de qué sección proviene
    // la información utilizada en la respuesta.
    system: `${SYSTEM_PROMPT}\n\nReport context:\n${context}`,

    // Mantenemos exactamente el historial de mensajes que ya utilizábamos.
    messages,
  });

  return result.toTextStreamResponse();
}
