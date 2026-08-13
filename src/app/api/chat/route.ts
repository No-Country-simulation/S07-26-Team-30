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
  remediation: "06-remediation.mdx",
  "how-to-cite": "07-how-to-cite.mdx",
  references: "08-references.mdx",
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return new Response(
        "Por favor configura GROQ_API_KEY en tu archivo .env.local para usar el asistente de IA.",
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    const query =
      typeof lastMessage?.content === "string" ? lastMessage.content : "";
    const context = await provider.getRelevantContext(query);

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: `${SYSTEM_PROMPT}\n\nReport context:\n${context}`,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    return new Response(
      error.message || "Error procesando solicitud de chat",
      { status: 500 }
    );
  }
}

