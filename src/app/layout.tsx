import type { Metadata } from "next";
import "@/app/globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ChatButton } from "@/components/chatbot/chat-button";

export const metadata: Metadata = {
  title: "PhysaFlow — Stranded Capacity Index Report",
  description:
    "An industry reference report on stranded capacity in AI data centers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Header />
        {children}
        <Footer />
        <ChatButton />
      </body>
    </html>
  );
}