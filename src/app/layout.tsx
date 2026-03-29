import type { Metadata } from "next";
import { Inter, Playfair_Display, Space_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import Chatbot from "@/components/Chatbot";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const BASE_URL = "https://globalpulse.vercel.app"; // Update with your real domain

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "GlobalPulse — Real-Time Global Intelligence",
    template: "%s | GlobalPulse",
  },
  description:
    "GlobalPulse delivers AI-powered real-time news, geopolitical analysis, and financial intelligence from 190+ countries. Free. No paywalls.",
  keywords: [
    "news", "global news", "geopolitics", "finance news", "AI news",
    "real-time news", "intelligence briefing", "world news", "politics",
    "market data", "breaking news", "GlobalPulse",
  ],
  authors: [{ name: "Bhuvesh Tyagi", url: BASE_URL }],
  creator: "Bhuvesh Tyagi",
  publisher: "GlobalPulse",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "GlobalPulse",
    title: "GlobalPulse — Real-Time Global Intelligence",
    description:
      "AI-powered news and geopolitical analysis from 190+ countries. Free. No paywalls.",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "GlobalPulse — Real-Time Global Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GlobalPulse — Real-Time Global Intelligence",
    description: "AI-powered news and geopolitical analysis from 190+ countries.",
    images: [`${BASE_URL}/og-image.png`],
    creator: "@globalpulse",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  category: "news",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} ${spaceMono.variable} antialiased paper-texture`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <Chatbot />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
