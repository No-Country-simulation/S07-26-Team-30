"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronUp } from "lucide-react";
import clsx from "clsx";
import { ChatDialog } from "./chat-dialog";

export function ChatButton() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);

  function toggleOpen() {
    setOpen(!open);
    setMinimized(false);
  }

  function handleClose() {
    setOpen(false);
    setMinimized(false);
  }

  return (
    <>
      {open && minimized ? (
        <button
          onClick={() => setMinimized(false)}
          className="chat-pop-in fixed bottom-6 right-6 z-50 flex cursor-pointer items-center gap-2 rounded-full border-2 border-[#0F2B20] bg-white py-1.5 pl-1.5 pr-4 text-[#0F2B20] shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-lift active:scale-95 print:hidden dark:border-accent dark:bg-[#14251e] dark:text-accent"
          aria-label="Maximize chat"
          aria-expanded={open}
        >
          <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full">
            <Image
              src="/images/icon-notext.webp"
              alt=""
              width={40}
              height={40}
              className="size-full object-cover"
            />
          </span>

          <span className="text-sm font-semibold">PhysaFlow</span>

          <ChevronUp size={18} className="transition-transform" />
        </button>
      ) : (
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
      )}

      <ChatDialog
        open={open && !minimized}
        onClose={handleClose}
        onMinimize={() => setMinimized(true)}
      />
    </>
  );
}