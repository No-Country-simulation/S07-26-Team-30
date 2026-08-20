export type ChatLanguage = "es" | "en";

export interface PredefinedQuestion {
  id: string;
  question: string;
  answer: string;
}

// Las respuestas predefinidas son siempre en inglés, independientemente del
// idioma de la interfaz o de la consulta detectada.
export const predefinedQuestions: PredefinedQuestion[] = [
  {
    id: "what-is-assistant",
    question: "What is the PhysaFlow assistant?",
    answer:
      "I’m the PhysaFlow assistant. I can help you explore the report, find information, and understand its main concepts.",
  },
  {
    id: "how-to-use",
    question: "How can I use the assistant?",
    answer:
      "You can ask me about the report or choose one of the suggested questions. I’m here to help you find information quickly and easily.",
  },
  {
    id: "how-it-works",
    question: "How does the assistant generate its answers?",
    answer:
      "I use the information available in the report to find the most relevant content and generate answers based on its sources.",
  },
];