"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Send, Trash2, User, Minimize2 } from "lucide-react";
import type { ChatMessage } from "@/types";
import { predefinedQuestions } from "@/lib/predefined-questions";
import clsx from "clsx";

interface ChatDialogProps {
  open: boolean;
  onMinimize?: () => void;
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

export function ChatDialog({
  open,
  onMinimize,
}: ChatDialogProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
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
  // Secuencia de bienvenida: al abrir el chat vacío, primero se muestran los
  // puntitos de escritura, luego el mensaje de bienvenida y al final las
  // preguntas sugeridas con animación.
  const [welcomeStage, setWelcomeStage] = useState<
    "typing" | "questions"
  >("typing");

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const revealTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const welcomeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const welcomeQuestionsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const predefinedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  // Distingue la re-apertura del chat (minimizar -> abrir) de la re-ejecución
  // del efecto cuando el saludo se agrega a messages.
  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  // Secuencia de bienvenida: al abrir con el chat vacío, el asistente
  // "escribe" (puntitos), luego envía el saludo como un mensaje real (con
  // hora) y al final aparecen las preguntas sugeridas, una a una, como
  // mensajes del usuario.
  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = open;
    if (!open) return;

    // Re-apertura desde minimizado con historial: restaura el stage sin
    // reiniciar la secuencia. Si el usuario ya participó, la bienvenida no
    // reaparece; si solo está el saludo, las preguntas sugeridas vuelven.
    if (!wasOpen && messages.length > 0) {
      setWelcomeStage(
        messages.some((m) => m.role === "user") ? "typing" : "questions",
      );
      return;
    }

    // El saludo se agregó (messages.length cambió con el chat abierto):
    // los timers de la secuencia siguen vivos, no tocar el stage.
    if (messages.length > 0) return;

    setWelcomeStage("typing");
    welcomeTimerRef.current = setTimeout(() => {
      setMessages([
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Hi there! I'm the PhysaFlow virtual assistant. I can help you explore the Stranded Capacity Index report, find information, and understand its main concepts. How can I help you?",
          timestamp: Date.now(),
        },
      ]);
      setWelcomeStage("typing");
    }, 900);
    welcomeQuestionsTimerRef.current = setTimeout(
      () => setWelcomeStage("questions"),
      2100,
    );

    return () => {
      // Solo limpia los timers si el chat se cerró. Si el efecto re-corre
      // porque messages.length cambió (el saludo se agregó), los timers de
      // la secuencia deben seguir vivos.
      if (!open) {
        clearTimeout(welcomeTimerRef.current ?? undefined);
        clearTimeout(welcomeQuestionsTimerRef.current ?? undefined);
      }
    };
  }, [open, messages.length]);

  useEffect(() => {
    if (!open || !nearBottom) return;

    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [
    messages,
    open,
    nearBottom,
    pendingSegments,
    revealedCount,
    welcomeStage,
  ]);

  // Limpia los timers de la secuencia de bienvenida, el revelado escalonado
  // y las respuestas predefinidas si el componente se desmonta.
  useEffect(() => {
    return () => {
      if (revealTimerRef.current) clearInterval(revealTimerRef.current);
      if (welcomeTimerRef.current) clearTimeout(welcomeTimerRef.current);
      if (welcomeQuestionsTimerRef.current)
        clearTimeout(welcomeQuestionsTimerRef.current);
      if (predefinedTimerRef.current) clearTimeout(predefinedTimerRef.current);
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
    if (predefinedTimerRef.current) {
      clearTimeout(predefinedTimerRef.current);
      predefinedTimerRef.current = null;
    }
    if (welcomeTimerRef.current) {
      clearTimeout(welcomeTimerRef.current);
      welcomeTimerRef.current = null;
    }
    if (welcomeQuestionsTimerRef.current) {
      clearTimeout(welcomeQuestionsTimerRef.current);
      welcomeQuestionsTimerRef.current = null;
    }
    setWelcomeStage("typing");
    setPendingSegments(null);
    setRevealedCount(0);
    setMessages([]);
    setInput("");
    setStreamingMessageId(null);
  }

  // Revelado escalonado compartido: muestra los segmentos de a uno cada
  // 2 segundos y al final convierte el placeholder en mensajes reales
  // (una burbuja por segmento). Lo usan las respuestas del modelo y las
  // respuestas predefinidas hardcodeadas.
  function startStaggeredReveal(
    placeholder: ChatMessage,
    finalSegments: string[],
  ) {
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
  }

  function handlePredefinedQuestion(
    question: (typeof predefinedQuestions)[number],
  ) {
    if (loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: question.question,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);

    // El asistente "escribe" primero (puntitos) y después revela la
    // respuesta hardcodeada con el mismo retraso que las respuestas del
    // modelo.
    const placeholder: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, placeholder]);
    setStreamingMessageId(placeholder.id);
    setLoading(true);

    predefinedTimerRef.current = setTimeout(() => {
      // Las respuestas predefinidas son siempre en inglés, así que el
      // mensaje de cierre también.
      const segments = splitResponse(question.answer);
      const finalSegments = [
        ...segments,
        "Can I help you with anything else?",
      ];

      startStaggeredReveal(placeholder, finalSegments);
    }, 900);
  }

  // Turno del asistente: agrega el mensaje placeholder, streamea la respuesta
  // y al terminar la convierte en varios mensajes (una burbuja por segmento).
  async function runAssistantTurn(history: ChatMessage[]) {
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
                    "I didn't get a valid response. Please try again.",
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
      startStaggeredReveal(placeholder, finalSegments);
    } catch (err) {
      const fallback = "Sorry, I couldn't process your request.";

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

    await runAssistantTurn([...messages, userMsg]);
  }

  const dialogTitle = "PhysaFlow Assistant";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={dialogTitle}
      aria-hidden={!open}
      inert={!open}
      style={{ transformOrigin: "bottom right" }}
      className={clsx(
        "fixed bottom-24 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-xs flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl transition-all duration-200 ease-out print:hidden sm:right-6 md:max-w-sm lg:max-w-md",
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
              <span className="text-[10px] text-white/70">Online</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleClearChat}
            disabled={loading || messages.length === 0}
            className="cursor-pointer rounded-md p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Clear chat"
            title="Clear chat"
          >
            <Trash2 size={17} />
          </button>

          <button
            type="button"
            onClick={onMinimize}
            aria-label="Minimize chat"
            title="Minimize chat"
            className="cursor-pointer rounded-md p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <Minimize2 size={17} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="chat-backdrop flex h-80 min-w-0 flex-col gap-3 overflow-y-auto p-4 scroll-smooth [scrollbar-color:var(--color-border)_transparent] [scrollbar-width:thin] md:h-96"
      >
        {messages.length === 0 && welcomeStage === "typing" && (
          <div
            className="chat-message-in flex min-w-0 items-start gap-3"
            style={{ animationDelay: "0ms" }}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
              <Image
                src="/images/icon-notext.webp"
                alt="PhysaFlow"
                width={32}
                height={32}
                className="size-full object-cover"
              />
            </div>

            <div className="flex min-w-0 max-w-[calc(100%-2.75rem)] flex-col gap-2">
              <TypingIndicator />
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

                        {(!isStreaming || pendingSegments !== null) && (
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

        {welcomeStage === "questions" &&
          messages.length === 1 &&
          !messages.some((m) => m.role === "user") && (
            <div className="flex flex-col items-end gap-2">
              {predefinedQuestions.map((question, i) => (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => handlePredefinedQuestion(question)}
                  disabled={loading}
                  className="chat-message-in w-full max-w-[85%] cursor-pointer rounded-xl border border-border bg-card px-3 py-2.5 text-left text-sm transition-all duration-150 hover:border-accent/60 hover:bg-accent-soft hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  {question.question}
                </button>
              ))}
            </div>
          )}

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
          placeholder="Ask about the report…"
          className="min-w-0 flex-1 rounded-md border bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-accent/60"
        />

        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-xl bg-[#0F2B20] p-2.5 text-white transition-all duration-150 hover:scale-105 hover:bg-[#1F4A35] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 dark:bg-accent dark:text-accent-foreground dark:hover:bg-accent/90"
          aria-label="Send"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}