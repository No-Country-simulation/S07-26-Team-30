"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Send,
  Trash2,
  User,
  FileText,
  FlaskConical,
  FolderTree,
  Target,
} from "lucide-react";
import type { ChatMessage } from "@/types";
import {
  predefinedQuestions,
  type ChatLanguage,
} from "@/lib/predefined-questions";
import {
  chatbotActions,
  type ChatbotAction,
  type ChatbotActionId,
} from "@/lib/chatbot-actions";
import clsx from "clsx";

interface ChatDialogProps {
  open: boolean;
  onClose: () => void;
}

// Limpia cualquier formato Markdown residual que pueda llegar del modelo
// y lo convierte en texto plano conversacional.
function stripMarkdown(content: string): string {
  return content
    .replace(/\\?<br\s*\/?>/gi, "\n")
    .replace(/<\/br>/gi, "\n")
    .split("\n")
    .map((line) => {
      let text = line.trim();

      // Títulos: "# Título"
      text = text.replace(/^#{1,6}\s+/, "");
      // Citas: "> texto"
      text = text.replace(/^\s*>\s?/, "");
      // Listas: "- item", "* item", "+ item", "1. item", "1) item"
      text = text.replace(/^\s*([-*+]|\d+[.)])\s+/, "");
      // Separadores horizontales: "---", "***", "___"
      if (/^([-*_]\s*){3,}$/.test(text)) return "";
      // Tablas: "| a | b |" y filas separadoras "|---|---|"
      if (/^\|.*\|\s*$/.test(text)) {
        text = text.replace(/^\||\|$/g, "").replace(/\|/g, " · ").trim();
        if (/^[\s·:-]+$/.test(text)) return "";
      }
      return text;
    })
    .join("\n")
    .replace(/\*\*([^*]+)\*\*/g, "$1") // **negrita**
    .replace(/\*([^*\n]+)\*/g, "$1") // *cursiva*
    .replace(/_([^_\n]+)_/g, "$1") // _cursiva_
    .replace(/`([^`]+)`/g, "$1") // `código`
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [texto](url)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Divide la respuesta del modelo en mensajes conversacionales: un mensaje por
// párrafo. Los párrafos largos sin saltos de línea se dividen en grupos de
// ~2 oraciones para que nunca llegue una pared de texto como una sola burbuja.
function splitResponse(content: string): string[] {
  const paragraphs = content
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const segments: string[] = [];
  for (const paragraph of paragraphs) {
    // Evita romper decimales ("3.2%") o siglas con puntos al dividir oraciones.
    const hasDecimals = /\d\.\d/.test(paragraph);
    const sentences =
      paragraph
        .match(/[^.!?]+(?:[.!?]+|$)/g)
        ?.map((s) => s.trim())
        .filter(Boolean) ?? [];

    if (!hasDecimals && paragraph.length > 240 && sentences.length > 2) {
      for (let i = 0; i < sentences.length; i += 2) {
        segments.push(sentences.slice(i, i + 2).join(" "));
      }
    } else {
      segments.push(paragraph);
    }
  }
  return segments;
}

// Componente simple para el indicador de escritura
function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1 self-start rounded-2xl rounded-bl-md border bg-muted px-3.5 py-3">
      <div
        className="chat-dot h-1.5 w-1.5 rounded-full bg-accent"
        style={{ animationDelay: "0ms" }}
      />
      <div
        className="chat-dot h-1.5 w-1.5 rounded-full bg-accent"
        style={{ animationDelay: "150ms" }}
      />
      <div
        className="chat-dot h-1.5 w-1.5 rounded-full bg-accent"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}

function getActionIcon(actionId: ChatbotActionId) {
  switch (actionId) {
    case "summary":
      return FileText;
    case "methodology":
      return FlaskConical;
    case "taxonomy":
      return FolderTree;
    case "conclusions":
      return Target;
    default:
      return FileText;
  }
}

export function ChatDialog({ open, onClose }: ChatDialogProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<ChatLanguage>("en");
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null,
  );
  // Revelado escalonado: cuando la respuesta se parte en varios mensajes,
  // se muestran de a uno con un retraso fijo entre cada uno.
  const [pendingSegments, setPendingSegments] = useState<string[] | null>(
    null,
  );
  const [revealedCount, setRevealedCount] = useState(0);
  const [nearBottom, setNearBottom] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const revealTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const questions = predefinedQuestions;

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open || !nearBottom) return;

    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, nearBottom, pendingSegments, revealedCount]);

  // Limpia el timer del revelado escalonado si el componente se desmonta.
  useEffect(() => {
    return () => {
      if (revealTimerRef.current) clearInterval(revealTimerRef.current);
    };
  }, []);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;

    setNearBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 120);
  }

  function handleClearChat() {
    if (loading) return;

    if (revealTimerRef.current) {
      clearInterval(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    setPendingSegments(null);
    setRevealedCount(0);
    setMessages([]);
    setInput("");
    setStreamingMessageId(null);
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

    // Las respuestas predefinidas son siempre en inglés, así que el mensaje
    // de cierre también.
    const closingMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Can I help you with anything else?",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg, closingMsg]);
  }

  // Turno del asistente: agrega el mensaje placeholder, streamea la respuesta
  // y al terminar la convierte en varios mensajes (una burbuja por segmento).
  async function runAssistantTurn(
    history: ChatMessage[],
    language: ChatLanguage,
    opts: { action?: string } = {},
  ) {
    const placeholder: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, placeholder]);
    setStreamingMessageId(placeholder.id);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: history.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          language,
          ...(opts.action ? { action: opts.action } : {}),
        }),
      });

      if (!res.ok) {
        // La API devuelve el motivo real en el body (JSON); lo usamos en vez
        // de un mensaje genérico.
        let serverError = "";
        try {
          const data = await res.json();
          if (typeof data?.error === "string") serverError = data.error;
        } catch {
          // Body no JSON: usamos el fallback genérico.
        }
        throw new Error(serverError || `Request failed (${res.status})`);
      }

      // El idioma real de la respuesta lo decide el server (detección); el
      // header nos dice qué idioma usar para el mensaje de cierre.
      const responseLanguage: "es" | "en" =
        res.headers.get("X-Response-Language") === "es" ? "es" : "en";

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

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === placeholder.id
                ? { ...msg, content: assistantContent }
                : msg,
            ),
          );
        }
      }

      // Al terminar el streaming: la respuesta se parte en mensajes y al final
      // se agrega un mensaje de cierre en el idioma en que respondió el
      // chatbot. Cada mensaje se "envía" de a uno con 2 segundos de retraso.
      const segments = splitResponse(assistantContent);

      if (segments.length === 0) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === placeholder.id
              ? {
                  ...msg,
                  content:
                    language === "es"
                      ? "No recibí una respuesta válida. Intentá de nuevo."
                      : "I didn't get a valid response. Please try again.",
                }
              : msg,
          ),
        );
        setLoading(false);
        setStreamingMessageId(null);
        return;
      }

      const closingMessage =
        responseLanguage === "es"
          ? "¿Puedo ayudarte con algo más?"
          : "Can I help you with anything else?";

      const finalSegments = [...segments, closingMessage];

      // Revelado escalonado: el primer mensaje aparece ya, los siguientes
      // cada 2 segundos (los puntitos de escritura se muestran entre medio).
      setPendingSegments(finalSegments);
      setRevealedCount(1);

      let revealed = 1;
      revealTimerRef.current = setInterval(() => {
        revealed += 1;
        setRevealedCount(revealed);

        if (revealed >= finalSegments.length) {
          if (revealTimerRef.current) {
            clearInterval(revealTimerRef.current);
            revealTimerRef.current = null;
          }

          // Una vez revelados todos, el placeholder se convierte en mensajes
          // reales (una burbuja por segmento).
          setMessages((prev) =>
            prev.flatMap((msg) => {
              if (msg.id !== placeholder.id) return [msg];
              return finalSegments.map((content, i) => ({
                id: i === 0 ? msg.id : crypto.randomUUID(),
                role: "assistant" as const,
                content,
                timestamp: msg.timestamp,
              }));
            }),
          );
          setPendingSegments(null);
          setRevealedCount(0);
          setLoading(false);
          setStreamingMessageId(null);
        }
      }, 2000);
    } catch (err) {
      const fallback =
        language === "es"
          ? opts.action
            ? "Lo siento, no pude procesar esta acción."
            : "Lo siento, no pude procesar tu solicitud."
          : opts.action
            ? "Sorry, I couldn't process this action."
            : "Sorry, I couldn't process your request.";

      const message =
        err instanceof Error && err.message.trim() !== ""
          ? err.message
          : fallback;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === placeholder.id ? { ...msg, content: message } : msg,
        ),
      );
      setLoading(false);
      setStreamingMessageId(null);
    }
  }

  async function handleAction(action: ChatbotAction) {
    if (loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: action.label[language],
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);

    await runAssistantTurn([...messages, userMsg], language, {
      action: action.id,
    });
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

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    await runAssistantTurn([...messages, userMsg], language);
  }

  const dialogTitle =
    language === "es" ? "Asistente de PhysaFlow" : "PhysaFlow Assistant";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={dialogTitle}
      aria-hidden={!open}
      inert={!open}
      style={{ transformOrigin: "bottom right" }}
      className={clsx(
        "fixed bottom-24 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl transition-all duration-200 ease-out sm:right-6 md:max-w-lg lg:max-w-xl",
        open
          ? "opacity-100 scale-100 translate-y-0"
          : "pointer-events-none opacity-0 scale-95 translate-y-2",
      )}
    >
      <div className="flex items-center justify-between border-b border-black/10 bg-gradient-to-r from-[#0F2B20] to-[#143D2C] px-4 py-3 dark:border-white/10 dark:from-[#143D2C] dark:to-[#1A3A2E]">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full">
            <Image
              src="/images/icon-notext.webp"
              alt=""
              width={28}
              height={28}
              className="size-full object-cover"
            />
          </div>

          <div className="min-w-0">
            <p className="m-0 truncate text-sm font-semibold text-white">
              {dialogTitle}
            </p>

            <div className="flex items-center gap-1.5">
              <span className="chat-pulse-dot h-1.5 w-1.5 rounded-full bg-green-400" />
              <span className="text-[10px] text-white/70">
                {language === "es" ? "En línea" : "Online"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleClearChat}
            disabled={loading || messages.length === 0}
            className="rounded-md p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={
              language === "es" ? "Limpiar chat" : "Clear chat"
            }
            title={
              language === "es" ? "Limpiar chat" : "Clear chat"
            }
          >
            <Trash2 size={17} />
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label={
              language === "es" ? "Cerrar chat" : "Close chat"
            }
            className="rounded-md p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex h-80 min-w-0 flex-col gap-3 overflow-y-auto p-4 scroll-smooth [scrollbar-color:var(--color-border)_transparent] [scrollbar-width:thin] md:h-96"
      >
        {messages.length === 0 && (
          <div className="space-y-4">
            <div
              className="chat-message-in flex items-center justify-between gap-3"
              style={{ animationDelay: "0ms" }}
            >
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

            <div
              className="chat-message-in space-y-2"
              style={{ animationDelay: "80ms" }}
            >
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
                  className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-left text-sm transition-all duration-150 hover:border-accent/60 hover:bg-accent-soft hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {question.question}
                </button>
              ))}
            </div>

            <div
              className="chat-message-in space-y-2 border-t pt-4"
              style={{ animationDelay: "160ms" }}
            >
              <p className="text-xs font-medium text-muted-foreground">
                {language === "es"
                  ? "Explorar el reporte"
                  : "Explore the report"}
              </p>

              {chatbotActions.map((action) => {
                const Icon = getActionIcon(action.id);

                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => handleAction(action)}
                    disabled={loading}
                    className="w-full rounded-xl border border-border bg-card px-3 py-3 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-lift disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-deep">
                        <Icon size={16} />
                      </span>

                      <span className="text-sm font-medium">
                        {action.label[language].replace(/^\S+\s/, "")}
                      </span>
                    </span>

                    <span className="mt-1 block text-xs text-muted-foreground">
                      {action.description[language]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isStreaming =
            msg.role === "assistant" &&
            msg.id === streamingMessageId &&
            loading;

          // Durante el streaming se muestra una sola burbuja creciendo.
          // Durante el revelado escalonado solo se muestran los mensajes
          // que ya fueron "enviados".
          const segments = isStreaming
            ? pendingSegments
              ? pendingSegments.slice(0, revealedCount)
              : msg.content.trim() !== ""
                ? [msg.content]
                : []
            : msg.role === "assistant"
              ? splitResponse(msg.content)
              : [msg.content];

          return (
            <div
              key={msg.id}
              className={clsx(
                "chat-message-in flex min-w-0 items-start gap-3",
                msg.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                  <Image
                    src="/images/icon-notext.webp"
                    alt="PhysaFlow"
                    width={32}
                    height={32}
                    className="size-full object-cover"
                  />
                </div>
              )}

              <div
                className={clsx(
                  "flex min-w-0 max-w-[calc(100%-2.75rem)] flex-col gap-2 sm:max-w-[85%]",
                  msg.role === "user" ? "items-end" : "items-start",
                )}
              >
                {segments.length === 0 ? (
                  <TypingIndicator />
                ) : (
                  segments.map((segment, i) => {
                    const isLast = i === segments.length - 1;

                    return (
                      <div
                        key={i}
                        className={clsx(
                          "rounded-2xl px-3 py-2 text-sm",
                          msg.role === "user"
                            ? "rounded-br-md bg-[#1F4A35] text-white dark:bg-[#24513E]"
                            : "rounded-bl-md bg-muted",
                        )}
                      >
                        <div className="whitespace-pre-wrap break-words">
                          {msg.role === "assistant"
                            ? stripMarkdown(segment)
                            : segment}
                        </div>

                        {isLast && !isStreaming && (
                          <div
                            className={clsx(
                              "mt-2 text-right text-xs",
                              msg.role === "user"
                                ? "text-white/70"
                                : "text-muted-foreground",
                            )}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {isStreaming && segments.length > 0 && <TypingIndicator />}
              </div>

              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <User size={18} />
                </div>
              )}
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t p-3"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            language === "es"
              ? "Preguntá sobre el reporte…"
              : "Ask about the report…"
          }
          className="min-w-0 flex-1 rounded-md border bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-accent/60"
        />

        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-xl bg-[#0F2B20] p-2.5 text-white transition-all duration-150 hover:scale-105 hover:bg-[#1F4A35] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 dark:bg-accent dark:text-accent-foreground dark:hover:bg-accent/90"
          aria-label={language === "es" ? "Enviar" : "Send"}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}