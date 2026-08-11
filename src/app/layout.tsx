import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";
import "@/app/globals.css";
import { Footer } from "@/components/layout/footer";
import { ChatButton } from "@/components/chatbot/chat-button";

const sansDisplay = DM_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
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
        {children}
        <Footer />
        <ChatButton />
      </body>
    </html>
  );
}
