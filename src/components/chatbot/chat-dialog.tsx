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
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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

// Normaliza saltos HTML que puedan llegar desde el modelo
// antes de pasarlos a ReactMarkdown.
function normalizeMarkdown(content: string): string {
  return content
    .replace(/\\?<br\s*\/?>/gi, "\n")
    .replace(/<\/br>/gi, "\n")
    .trim();
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
  const [nearBottom, setNearBottom] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const questions = predefinedQuestions[language];

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open || !nearBottom) return;

    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, nearBottom]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;

    setNearBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 120);
  }

  function handleClearChat() {
    if (loading) return;

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

    const initialAssistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg, initialAssistantMsg]);
    setStreamingMessageId(initialAssistantMsg.id);
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
          language,
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

    const initialAssistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg, initialAssistantMsg]);
    setInput("");
    setStreamingMessageId(initialAssistantMsg.id);
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
          language,
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
      setStreamingMessageId(null);
    }
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

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={clsx(
              "chat-message-in flex min-w-0 items-start gap-3",
              msg.role === "user"
                ? "justify-end"
                : "justify-start",
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
                "min-w-0 max-w-[calc(100%-2.75rem)] rounded-2xl px-3 py-2 text-sm sm:max-w-[85%]",
                msg.role === "user"
                  ? "rounded-br-md bg-[#1F4A35] text-white dark:bg-[#24513E]"
                  : "rounded-bl-md bg-muted",
              )}
            >
              {msg.role === "assistant" ? (
                <div
                  className="
                    min-w-0 break-words
                    [&_h1]:mb-3 [&_h1]:text-base [&_h1]:font-semibold
                    [&_h2]:mb-3 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold
                    [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold
                    [&_p]:mb-3 [&_p]:leading-6
                    [&_p:last-child]:mb-0
                    [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5
                    [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5
                    [&_li]:mb-1 [&_li]:leading-6
                    [&_strong]:font-semibold
                    [&_em]:italic
                    [&_hr]:my-4 [&_hr]:border-border
                    [&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-3
                    [&_code]:break-words [&_code]:rounded [&_code]:bg-background/70 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs
                    [&_pre]:my-3 [&_pre]:max-w-full [&_pre]:overflow-hidden [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_pre]:rounded-md [&_pre]:bg-background/70 [&_pre]:p-3
                    [&_pre_code]:bg-transparent [&_pre_code]:p-0
                    [&_table]:my-3 [&_table]:w-full [&_table]:table-fixed [&_table]:text-xs
                    [&_thead]:bg-background/50
                    [&_th]:break-words [&_th]:border-b [&_th]:border-border [&_th]:px-2 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold
                    [&_td]:break-words [&_td]:border-b [&_td]:border-border [&_td]:px-2 [&_td]:py-2 [&_td]:align-top
                    [&_tr:last-child_td]:border-b-0
                  "
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({ children }) => (
                        <div className="w-full max-w-full overflow-hidden">
                          <table>{children}</table>
                        </div>
                      ),
                      a: ({ children, href }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="break-words underline underline-offset-2"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {normalizeMarkdown(msg.content)}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="whitespace-pre-wrap break-words">
                  {msg.content}
                </div>
              )}

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
            </div>

            {msg.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <User size={18} />
              </div>
            )}
          </div>
        ))}

        {loading && !streamingMessageId && messages.length > 0 && (
          <div className="chat-message-in flex items-start justify-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
              <Image
                src="/images/icon-notext.webp"
                alt="PhysaFlow"
                width={32}
                height={32}
                className="size-full object-cover"
              />
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