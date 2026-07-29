"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { ChatDialog } from "./chat-dialog";

export function ChatButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:opacity-90"
        aria-label="Open chat"
      >
        <MessageCircle size={24} />
      </button>

      <ChatDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}