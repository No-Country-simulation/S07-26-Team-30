import type { ChatLanguage } from "@/lib/predefined-questions";

export type ChatbotActionId =
  | "summary"
  | "methodology"
  | "taxonomy"
  | "conclusions";

export interface ChatbotAction {
  id: ChatbotActionId;
  label: Record<ChatLanguage, string>;
  description: Record<ChatLanguage, string>;
  sections: string[];
}

export const chatbotActions: ChatbotAction[] = [
  {
    id: "summary",
    label: {
      es: "📄 Resumir el reporte",
      en: "📄 Summarize the report",
    },
    description: {
      es: "Obtené una visión general de los principales conceptos y hallazgos del reporte.",
      en: "Get an overview of the report's main concepts and findings.",
    },
    sections: [
      "executive-summary",
      "facility-layer",
      "it-layer",
      "workload-layer",
      "methodology",
    ],
  },

  {
    id: "methodology",
    label: {
      es: "🔬 Explicar la metodología",
      en: "🔬 Explain the methodology",
    },
    description: {
      es: "Conocé cómo se mide y analiza la capacidad no utilizada.",
      en: "Learn how stranded capacity is measured and analyzed.",
    },
    sections: ["methodology"],
  },

  {
    id: "taxonomy",
    label: {
      es: "🗂️ Explicar la taxonomía",
      en: "🗂️ Explain the taxonomy",
    },
    description: {
      es: "Entendé cómo se clasifica la capacidad no utilizada en el reporte.",
      en: "Understand how stranded capacity is classified in the report.",
    },
    sections: ["facility-layer"],
  },

  {
    id: "conclusions",
    label: {
      es: "🎯 Principales conclusiones",
      en: "🎯 Main conclusions",
    },
    description: {
      es: "Conocé los principales hallazgos y conclusiones del reporte.",
      en: "Explore the report's main findings and conclusions.",
    },
    sections: ["executive-summary"],
  },
];

export function getChatbotAction(
  actionId: ChatbotActionId,
): ChatbotAction | undefined {
  return chatbotActions.find((action) => action.id === actionId);
}