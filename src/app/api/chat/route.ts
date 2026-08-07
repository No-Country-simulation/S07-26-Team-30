import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";
import { StaticSearchProvider } from "@/lib/context-provider";
import { SYSTEM_PROMPT, buildContext } from "@/lib/prompts";
import path from "node:path";

const reportDir = path.join(process.cwd(), "src/content/reports/stranded-capacity-index");

const provider = new StaticSearchProvider(reportDir, {
  introduction: "introduction.mdx",
  methodology: "methodology.mdx",
  "taxonomy/facility": "taxonomy/facility.mdx",
  "taxonomy/it": "taxonomy/it.mdx",
  "taxonomy/workload": "taxonomy/workload.mdx",
  citations: "citations.mdx",
  conclusion: "conclusion.mdx",
});

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const lastMessage = messages[messages.length - 1];
  const query = typeof lastMessage.content === "string" ? lastMessage.content : "";
  const context = await provider.getRelevantContext(query);

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: `${SYSTEM_PROMPT}\n\nReport context:\n${context}`,
    messages,
  });

  return result.toTextStreamResponse();
}