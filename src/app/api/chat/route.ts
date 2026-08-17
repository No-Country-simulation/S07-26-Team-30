import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";
import { StaticSearchProvider } from "@/lib/context-provider";
import { SYSTEM_PROMPT, buildContext } from "@/lib/prompts";
import {
  getChatbotAction,
  type ChatbotActionId,
} from "@/lib/chatbot-actions";
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
  const { messages, action } = await req.json();

  const lastMessage = messages[messages.length - 1];

  const query =
    typeof lastMessage?.content === "string" ? lastMessage.content : "";

  let context = "";

  // -------------------------------------------------------------------------
  // PREDEFINED ACTION
  // -------------------------------------------------------------------------
  //
  // Si el frontend envía una acción predefinida válida,
  // utilizamos directamente las secciones configuradas para esa acción.
  //
  // Esto evita depender de una búsqueda por palabras clave para acciones
  // que ya sabemos exactamente qué información necesitan.
  if (typeof action === "string") {
    const chatbotAction = getChatbotAction(
      action as ChatbotActionId,
    );

    if (chatbotAction) {
      const searchResults = await provider.getSectionContext(
        chatbotAction.sections,
      );

      context = buildContext(searchResults);
    }
  }

  // -------------------------------------------------------------------------
  // NORMAL QUESTION / RAG
  // -------------------------------------------------------------------------
  //
  // Si no recibimos una acción válida, mantenemos exactamente
  // el comportamiento anterior:
  //
  // pregunta → búsqueda relevante → contexto → Groq
  //
  // Esto garantiza que las preguntas normales sigan utilizando
  // el RAG implementado anteriormente.
  if (!context) {
    const searchResults = await provider.getRelevantContext(query);

    context = buildContext(searchResults);
  }

  // -------------------------------------------------------------------------
  // GROQ
  // -------------------------------------------------------------------------

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),

    // Groq recibe únicamente el contexto correspondiente a la consulta
    // o a la acción seleccionada.
    system: `${SYSTEM_PROMPT}\n\nReport context:\n${context}`,

    // Mantenemos exactamente el historial de mensajes existente.
    messages,
  });

  return result.toTextStreamResponse();
}