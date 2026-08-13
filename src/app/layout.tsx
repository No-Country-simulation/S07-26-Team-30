import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";
import "@/app/globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ChatButton } from "@/components/chatbot/chat-button";

const sansDisplay = DM_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

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
      <body
        className={`${sansDisplay.variable} ${inter.variable} min-h-screen antialiased`}
      >
        <Header />
        {children}
        <Footer />
        <ChatButton />
      </body>
    </html>
  );
}
