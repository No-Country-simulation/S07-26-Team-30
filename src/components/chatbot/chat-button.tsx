"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import clsx from "clsx";
import { ChatDialog } from "./chat-dialog";

export function ChatButton() {
  const [open, setOpen] = useState(false);
  // Aparece con 1 segundo de delay en cada carga del sitio; se oculta al
  // abrir el chat o con la X. No se persiste: al refrescar (F5) vuelve.
  const [showTip, setShowTip] = useState(false);
  const dismissedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!dismissedRef.current) setShowTip(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  function dismissTip() {
    dismissedRef.current = true;
    setShowTip(false);
  }

  function toggleOpen() {
    dismissTip();
    setOpen(!open);
  }

  return (
    <>
      {showTip && !open && (
        <div
          role="tooltip"
          className="chat-pop-in fixed bottom-24 right-6 z-50 flex max-w-[15rem] items-center gap-2 rounded-2xl border border-[#0F2B20]/10 bg-white px-3.5 py-2.5 text-[#0F2B20] shadow-lg print:hidden"
        >
          <p className="text-sm">Can I help you with anything?</p>

          <button
            type="button"
            onClick={dismissTip}
            aria-label="Dismiss message"
            className="cursor-pointer shrink-0 rounded-full p-0.5 text-[#0F2B20]/60 transition-colors hover:bg-[#0F2B20]/10 hover:text-[#0F2B20]"
          >
            <X size={14} />
          </button>

          <span className="absolute -bottom-1 right-5 h-2 w-2 rotate-45 border-b border-r border-[#0F2B20]/10 bg-white" />
        </div>
      )}

      <button
        onClick={toggleOpen}
        className="chat-pop-in fixed bottom-6 right-6 z-50 flex size-14 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-[#0F2B20] bg-white text-[#0F2B20] shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-lift active:scale-95 print:hidden dark:border-accent dark:bg-[#14251e] dark:text-accent"
        aria-label={open ? "Close chat" : "Open chat"}
        aria-expanded={open}
      >
        <Image
          src="/images/icon-notext.webp"
          alt=""
          width={56}
          height={56}
          className={clsx(
            "size-full object-cover transition-opacity duration-200",
            open && "opacity-0",
          )}
        />

        <X
          size={26}
          className={clsx(
            "absolute transition-all duration-200",
            open ? "rotate-90 opacity-100" : "rotate-0 opacity-0",
          )}
        />
      </button>

      <ChatDialog
        open={open}
        onClose={() => setOpen(false)}
        onMinimize={() => setOpen(false)}
      />
    </>
  );
}