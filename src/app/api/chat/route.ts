import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";
import { StaticSearchProvider } from "@/lib/context-provider";
import { buildSystemPrompt, buildActionSystemPrompt, buildContext } from "@/lib/prompts";
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

export const maxDuration = 60;

// Detecta el idioma de la consulta con un diccionario ligero de palabras
// frecuentes. Devuelve undefined cuando la consulta es ambigua.
function detectLanguage(text: string): "es" | "en" | undefined {
  const normalized = text
    .toLowerCase()
    .replace(/[^a-záéíóúüñ\s]/g, " ");

  const esTokens = [
    "el", "la", "los", "las", "de", "del", "que", "qué", "para", "cómo",
    "cuál", "cuáles", "cuánto", "cuántos", "dónde", "cuándo", "porque",
    "porqué", "es", "son", "un", "una", "resumen", "resume", "resumir",
    "reporte", "informe", "metodología", "metodologia", "conclusión",
    "conclusiones", "explicar", "explica", "explicame", "explícame",
    "quiero", "necesito", "ayuda", "podés", "podes", "puedes", "querés",
    "queres", "háblame", "hablame", "contame", "dame", "hola", "gracias",
    "sí", "buenas", "chau", "esta", "este", "esto", "tiene", "tienen",
    "hay", "está", "están", "sabés", "sabes", "hacer", "hace", "me",
    "te", "se",
  ];
  const enTokens = [
    "the", "and", "what", "how", "why", "is", "are", "of", "for", "you",
    "i", "it", "to", "summary", "summarize", "explain", "methodology",
    "conclusion", "conclusions", "report", "tell", "give", "want", "need",
    "can", "do", "does", "this", "that", "these", "those", "have", "has",
    "there", "about", "with", "from", "hi", "hello", "thanks", "thank",
    "please", "help", "my", "your",
  ];

  const words = normalized.split(/\s+/).filter(Boolean);
  let esScore = 0;
  let enScore = 0;

  for (const word of words) {
    if (esTokens.includes(word)) esScore += 1;
    if (enTokens.includes(word)) enScore += 1;
  }

  // Las tildes y la ñ son una señal fuerte de español.
  if (/[áéíóúüñ]/i.test(text)) esScore += 2;

  if (esScore > enScore) return "es";
  if (enScore > esScore) return "en";
  return undefined;
}

export async function POST(req: Request) {
  const { messages, action, language } = await req.json();

  const lastMessage = messages[messages.length - 1];

  const query =
    typeof lastMessage?.content === "string" ? lastMessage.content : "";

  const selectedLanguage: "es" | "en" =
    language === "es" || language === "en" ? language : "en";

  // El idioma de la respuesta se detecta de la consulta; el selector del
  // cliente solo actúa como respaldo cuando la detección es ambigua.
  const responseLanguage: "es" | "en" =
    detectLanguage(query) ?? selectedLanguage;

  const isAction = typeof action === "string";

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

    // Si no se encuentra contexto relevante, respondemos de forma conversacional
    // (200) en vez de un error HTTP: el usuario sigue viendo un mensaje normal.
    if (!context || context.trim().length === 0) {
      console.warn(
        `No se encontró contexto relevante para la consulta: "${query}"`,
      );

      const fallbackMessage =
        responseLanguage === "es"
          ? "No encontré esa información en el reporte. Podés preguntarme por el resumen, la metodología o las conclusiones."
          : "I couldn't find that in the report. You can ask me about the summary, methodology, or conclusions.";

      return new Response(fallbackMessage, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          // El cliente usa este header para el mensaje de cierre ("¿Puedo
          // ayudarte con algo más?") en el idioma correcto.
          "X-Response-Language": responseLanguage,
        },
      });
    }

    // -------------------------------------------------------------------------
    // GROQ
    // -------------------------------------------------------------------------

    const result = streamText({
      model: groq("openai/gpt-oss-120b"),
      system: `${(isAction
          ? buildActionSystemPrompt(responseLanguage)
          : buildSystemPrompt(responseLanguage))}

Report context:
${context}`,
      messages,
      // Los botones de acción responden en 2-4 oraciones cortas; el tope
      // garantiza brevedad aunque el modelo intente expandirse.
      maxOutputTokens: isAction ? 160 : undefined,
    });

    return result.toTextStreamResponse({
      headers: {
        "X-Response-Language": responseLanguage,
      },
    });
  } catch (error: any) {
    console.error("Error en la API de chat:", {
      message: error.message,
      stack: error.stack,
      query: query,
      action: action,
      language: language,
    });

    if (error.status === 429) {
      return new Response(
        JSON.stringify({
          error:
            responseLanguage === "es"
              ? "Demasiadas solicitudes. Por favor, espere un momento e inténtelo de nuevo."
              : "Too many requests. Please wait a moment and try again.",
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
            responseLanguage === "es"
              ? "El servicio no está disponible en este momento. Por favor, inténtelo de nuevo más tarde."
              : "The service is unavailable right now. Please try again later.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    } else if (error.status >= 400) {
      return new Response(
        JSON.stringify({
          error:
            responseLanguage === "es"
              ? "Hubo un problema con su solicitud. Por favor, verifique los datos e inténtelo de nuevo."
              : "There was a problem with your request. Please check the details and try again.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    } else {
      return new Response(
        JSON.stringify({
          error:
            responseLanguage === "es"
              ? "Ocurrió un error inesperado. Por favor, inténtelo de nuevo."
              : "An unexpected error occurred. Please try again.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }
}