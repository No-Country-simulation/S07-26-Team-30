export type ChatLanguage = "es" | "en";

export interface PredefinedQuestion {
  id: string;
  question: string;
  answer: string;
}

export const predefinedQuestions: Record<
  ChatLanguage,
  PredefinedQuestion[]
> = {
  es: [
    {
      id: "what-is-assistant",
      question: "¿Qué es el asistente de PhysaFlow?",
      answer:
        "Soy el asistente de PhysaFlow. Puedo ayudarte a explorar el reporte, encontrar información y entender sus principales conceptos.",
    },
    {
      id: "how-to-use",
      question: "¿Cómo puedo usar el asistente?",
      answer:
        "Podés preguntarme sobre el reporte o elegir una de las preguntas sugeridas. Estoy acá para ayudarte a encontrar la información de forma simple y rápida.",
    },
    {
      id: "how-it-works",
      question: "¿Cómo genera sus respuestas?",
      answer:
        "Utilizo la información disponible en el reporte para buscar el contenido más relevante y generar respuestas basadas en sus fuentes.",
    },
  ],

  en: [
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
  ],
};