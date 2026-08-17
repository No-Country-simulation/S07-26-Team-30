"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Trash2, User, Bot } from "lucide-react"; // Se añaden User y Bot para avatares
import type { ChatMessage } from "@/types";
import {
  predefinedQuestions,
  type ChatLanguage,
} from "@/lib/predefined-questions";
import {
  chatbotActions,
  type ChatbotAction,
} from "@/lib/chatbot-actions";
import clsx from 'clsx'; // Importar clsx

interface ChatDialogProps {
  open: boolean;
  onClose: () => void;
}

// Componente simple para el indicador de escritura
function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1 self-start rounded-lg bg-muted px-3 py-2 text-sm">
      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-0"></div>
      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-100"></div>
      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-200"></div>
    </div>
  );
}

export function ChatDialog({ open, onClose }: ChatDialogProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<ChatLanguage>("en");
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null); // Nuevo estado para el mensaje en streaming

  const bottomRef = useRef<HTMLDivElement>(null);

  const questions = predefinedQuestions[language];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleClearChat() {
    if (loading) return;

    setMessages([]);
    setInput("");
    setStreamingMessageId(null); // Limpiar el ID del mensaje en streaming
  }

  function handlePredefinedQuestion(
    question: (typeof questions)[number],
  ) {
    if (loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: question.question,
      timestamp: Date.now(),
    };

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: question.answer,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
  }

  async function handleAction(action: ChatbotAction) {
    if (loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: action.label[language],
      timestamp: Date.now(),
    };

    // Añadir el mensaje del usuario y un mensaje vacío del asistente para streaming
    const initialAssistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg, initialAssistantMsg]);
    setStreamingMessageId(initialAssistantMsg.id); // Establecer el ID del mensaje en streaming
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

          // Actualizar el contenido del mensaje en streaming
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === initialAssistantMsg.id
                ? { ...msg, content: assistantContent }
                : msg,
            ),
          );
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === initialAssistantMsg.id
            ? {
                ...msg,
                content:
                  language === "es"
                    ? "Lo siento, no pude procesar esta acción."
                    : "Sorry, I couldn't process this action.",
              }
            : msg,
        ),
      );
    } finally {
      setLoading(false);
      setStreamingMessageId(null); // Limpiar el ID del mensaje en streaming
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    // Añadir el mensaje del usuario y un mensaje vacío del asistente para streaming
    const initialAssistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg, initialAssistantMsg]);
    setInput("");
    setStreamingMessageId(initialAssistantMsg.id); // Establecer el ID del mensaje en streaming
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

          // Actualizar el contenido del mensaje en streaming
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === initialAssistantMsg.id
                ? { ...msg, content: assistantContent }
                : msg,
            ),
          );
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === initialAssistantMsg.id
            ? {
                ...msg,
                content:
                  language === "es"
                    ? "Lo siento, no pude procesar tu solicitud."
                    : "Sorry, I couldn't process your request.",
              }
            : msg,
        ),
      );
    } finally {
      setLoading(false);
      setStreamingMessageId(null); // Limpiar el ID del mensaje en streaming
    }
  }

  if (!open) return null;

  return (
    <div className="fixed bottom-24 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-md flex-col rounded-xl border bg-background shadow-2xl sm:right-6 md:max-w-lg lg:max-w-xl"> {/* Ajustes para responsive */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <span className="text-sm font-semibold">
          {language === "es"
            ? "Asistente de PhysaFlow"
            : "PhysaFlow Assistant"}
        </span>

        <div className="flex items-center gap-1">
          {/* Botón de "Nueva Conversación" (actualmente "Limpiar chat") */}
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
            {/* Si quisieras cambiarlo a un icono de "nuevo" y texto:
            <RefreshCw size={17} /> // O un icono de "+"
            */}
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

      <div className="flex h-80 flex-col gap-3 overflow-y-auto p-4 md:h-96"> {/* Ajuste de altura para responsive */}
        {messages.length === 0 && (
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
        )}

        {/* Chat messages */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={clsx(
              "flex items-start gap-3",
              msg.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            {msg.role === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Bot size={18} className="text-muted-foreground" />
              </div>
            )}
            <div
              className={clsx(
                "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted",
              )}
            >
              {msg.content}
              <div className="mt-1 text-right text-xs text-gray-500">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
            {msg.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
                <User size={18} />
              </div>
            )}
          </div>
        ))}

        {loading && !streamingMessageId && messages.length > 0 && ( // Mostrar TypingIndicator si no hay un mensaje en streaming
          <div className="flex items-start gap-3 justify-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <Bot size={18} className="text-muted-foreground" />
            </div>
            <TypingIndicator />
          </div>
        )}

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