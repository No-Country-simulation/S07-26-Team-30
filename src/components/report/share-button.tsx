"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SHARE_TEXT =
  "An industry reference report on stranded capacity in AI data centers.";

/**
 * Share button for the report topbar. Shares the exact URL the user is
 * viewing (including the current section hash) via the native share sheet
 * when available, falling back to copying the link to the clipboard.
 */
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleShare = async () => {
    const url = window.location.href;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: SHARE_TEXT, url });
      } catch (error) {
        // AbortError means the user cancelled the native sheet — not an error.
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("Share failed:", error);
      }
      return;
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Clipboard write failed:", error);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={copied ? "Link copied" : "Share report"}
      className={cn(
        "flex shrink-0 cursor-pointer flex-col items-center gap-1 bg-transparent text-white transition-colors duration-200 hover:text-[#e8cf9a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
        copied && "text-[#e8cf9a]",
      )}
    >
      {copied ? (
        <Check aria-hidden="true" className="size-5" />
      ) : (
        <Share2 aria-hidden="true" className="size-5" />
      )}
      <span
        aria-live="polite"
        className="text-[0.625rem] font-semibold uppercase tracking-[0.2em]"
      >
        {copied ? "Copied!" : "Share"}
      </span>
    </button>
  );
}