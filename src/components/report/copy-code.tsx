"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Renders a framed code block with a Copy button. The code text is passed as
 * children (a string), so it can be copied verbatim including indentation.
 */
export function CopyCode({
  label = "code",
  children,
}: {
  label?: string;
  children: string;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — leave the block selectable instead.
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border/80 bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 bg-[#f2ecdd] px-4 py-2 dark:bg-[#14251e]">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-accent-deep">
          {label}
        </span>
        <button
          type="button"
          onClick={onCopy}
          className="flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-foreground transition-colors hover:border-accent hover:text-accent-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep"
        >
          {copied ? (
            <Check aria-hidden="true" className="size-3.5" />
          ) : (
            <Copy aria-hidden="true" className="size-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="m-0 overflow-x-auto bg-white p-4 text-sm leading-relaxed text-foreground dark:bg-card">
        <code>{children}</code>
      </pre>
    </div>
  );
}