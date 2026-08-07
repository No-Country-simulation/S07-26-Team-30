import type { Metadata } from "next";
import "@/app/globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ChatButton } from "@/components/chatbot/chat-button";




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body /*className="min-h-screen antialiased"*/>
        <Header/>
        {children}
        <Footer />
        <ChatButton />
      </body>
    </html>
  );
}