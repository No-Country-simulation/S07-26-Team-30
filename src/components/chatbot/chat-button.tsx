"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import clsx from "clsx";
import { ChatDialog } from "./chat-dialog";

export function ChatButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
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
          priority
        />

        <X
          size={26}
          className={clsx(
            "absolute transition-all duration-200",
            open ? "rotate-90 opacity-100" : "rotate-0 opacity-0",
          )}
        />
      </button>

      <ChatDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}