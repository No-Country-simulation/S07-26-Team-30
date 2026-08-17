"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Trash2 } from "lucide-react";
import type { ChatMessage } from "@/types";
import {
  predefinedQuestions,
  type ChatLanguage,
} from "@/lib/predefined-questions";
import {
  chatbotActions,
  type ChatbotAction,
} from "@/lib/chatbot-actions";

interface ChatDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ChatDialog({ open, onClose }: ChatDialogProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<ChatLanguage>("en");

  const bottomRef = useRef<HTMLDivElement>(null);

  const questions = predefinedQuestions[language];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleClearChat() {
    if (loading) return;

    setMessages([]);
    setInput("");
  }

  function handlePredefinedQuestion(
    question: (typeof questions)[number],
  ) {
    if (loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: question.question,
    };

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: question.answer,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
  }

  async function handleAction(action: ChatbotAction) {
    if (loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: action.label[language],
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          action: action.id,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          assistantContent += decoder.decode(value, {
            stream: true,
          });
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: assistantContent,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            language === "es"
              ? "Lo siento, no pude procesar esta acción."
              : "Sorry, I couldn't process this action.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          assistantContent += decoder.decode(value, {
            stream: true,
          });
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: assistantContent,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            language === "es"
              ? "Lo siento, no pude procesar tu solicitud."
              : "Sorry, I couldn't process your request.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed bottom-24 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-96 flex-col rounded-xl border bg-background shadow-2xl sm:right-6">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <span className="text-sm font-semibold">
          {language === "es"
            ? "Asistente de PhysaFlow"
            : "PhysaFlow Assistant"}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleClearChat}
            disabled={loading || messages.length === 0}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={
              language === "es"
                ? "Limpiar chat"
                : "Clear chat"
            }
            title={
              language === "es"
                ? "Limpiar chat"
                : "Clear chat"
            }
          >
            <Trash2 size={17} />
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label={
              language === "es"
                ? "Cerrar chat"
                : "Close chat"
            }
            className="rounded-md p-1.5 transition-colors hover:bg-muted"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex h-80 flex-col gap-3 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Language selector */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-muted-foreground">
              {language === "es" ? "Idioma" : "Language"}
            </span>

            <select
              value={language}
              onChange={(e) =>
                setLanguage(e.target.value as ChatLanguage)
              }
              className="rounded-md border bg-background px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-ring"
              aria-label={
                language === "es"
                  ? "Seleccionar idioma"
                  : "Select language"
              }
            >
              <option value="es">🇪🇸 Español</option>
              <option value="en">🇬🇧 English</option>
            </select>
          </div>

          {/* Predefined questions */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              {language === "es"
                ? "Preguntas sugeridas"
                : "Suggested questions"}
            </p>

            {questions.map((question) => (
              <button
                key={question.id}
                type="button"
                onClick={() => handlePredefinedQuestion(question)}
                disabled={loading}
                className="w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                {question.question}
              </button>
            ))}
          </div>

          {/* Predefined actions */}
          <div className="space-y-2 border-t pt-4">
            <p className="text-xs font-medium text-muted-foreground">
              {language === "es"
                ? "Explorar el reporte"
                : "Explore the report"}
            </p>

            {chatbotActions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => handleAction(action)}
                disabled={loading}
                className="w-full rounded-lg border px-3 py-2 text-left transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="block text-sm font-medium">
                  {action.label[language]}
                </span>

                <span className="mt-1 block text-xs text-muted-foreground">
                  {action.description[language]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat messages */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              msg.role === "user"
                ? "self-end bg-primary text-primary-foreground"
                : "self-start bg-muted"
            }`}
          >
            {msg.content}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            language === "es"
              ? "Preguntá sobre el reporte…"
              : "Ask about the report…"
          }
          className="min-w-0 flex-1 rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />

        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-md bg-primary p-2 text-primary-foreground disabled:opacity-50"
          aria-label={
            language === "es" ? "Enviar" : "Send"
          }
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}