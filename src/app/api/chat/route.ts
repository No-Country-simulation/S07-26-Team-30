import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";
import { StaticSearchProvider } from "@/lib/context-provider";
import { SYSTEM_PROMPT, buildContext } from "@/lib/prompts";
import { getChatbotAction, type ChatbotActionId } from "@/lib/chatbot-actions";
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

  try {
    // -------------------------------------------------------------------------
    // PREDEFINED ACTION
    // -------------------------------------------------------------------------
    if (typeof action === "string") {
      const chatbotAction = getChatbotAction(action as ChatbotActionId);

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
    if (!context) {
      const searchResults = await provider.getRelevantContext(query);
      context = buildContext(searchResults);
    }

    // Si no se encuentra contexto relevante
    if (!context || context.trim().length === 0) {
      console.warn(
        `No se encontró contexto relevante para la consulta: "${query}"`,
      );
      return new Response(
        JSON.stringify({
          error:
            "Lo siento, no se encontró información relevante para su pregunta en el reporte.",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // -------------------------------------------------------------------------
    // GROQ
    // -------------------------------------------------------------------------

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: `${SYSTEM_PROMPT}\\n\\nReport context:\\n${context}`,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Error en la API de chat:", {
      message: error.message,
      stack: error.stack,
      query: query,
      action: action,
      // Considerar añadir un identificador único para la solicitud si está disponible
    });

    // Manejo de errores específicos de Groq/API
    if (error.status === 429) {
      return new Response(
        JSON.stringify({
          error:
            "Demasiadas solicitudes. Por favor, espere un momento e inténtelo de nuevo.",
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        },
      );
    } else if (error.status >= 500) {
      return new Response(
        JSON.stringify({
          error:
            "El servicio no está disponible en este momento. Por favor, inténtelo de nuevo más tarde.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    } else if (error.status >= 400) {
      // Otros errores de cliente que no sean 429
      return new Response(
        JSON.stringify({
          error:
            "Hubo un problema con su solicitud. Por favor, verifique los datos e inténtelo de nuevo.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    } else {
      // Errores inesperados
      return new Response(
        JSON.stringify({
          error: "Ocurrió un error inesperado. Por favor, inténtelo de nuevo.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }
}
