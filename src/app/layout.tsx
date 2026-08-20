import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
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
  metadataBase: new URL("https://dev.physaflow.com"),
title: {
      default: "PhysaFlow — Stranded Capacity Index Report",
      template: "PhysaFlow — %s",
    },
  description:
    "An industry reference report on stranded capacity in AI data centers.",
  applicationName: "PhysaFlow",
  authors: [{ name: "PhysaFlow Engineering & Research Group" }],
  openGraph: {
    siteName: "PhysaFlow",
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [{ url: "/images/icon-notext.webp", type: "image/webp" }],
    apple: "/images/logohor.webp",
    shortcut: "/images/icon-notext.webp",
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${sansDisplay.variable} ${inter.variable} min-h-screen antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("physaflow-theme")==="dark"){document.documentElement.classList.add("dark")}}catch(e){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "PhysaFlow",
              url: "https://dev.physaflow.com",
              logo: "https://dev.physaflow.com/images/logohor.webp",
            }),
          }}
        />
        <ThemeProvider>
          <Header />
          {children}
          <Footer />
          <ChatButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
