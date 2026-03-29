import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Globe — World News Map",
  description:
    "Explore breaking news across the globe. Click any country to see real-time stories, AI-powered summaries, and geopolitical analysis on GlobalPulse.",
  openGraph: {
    title: "Globe — World News Map | GlobalPulse",
    description: "Interactive world map of real-time breaking news by country.",
    url: "https://globalpulse.vercel.app/globe",
  },
  twitter: {
    title: "Globe — World News Map | GlobalPulse",
    description: "Interactive world map of real-time breaking news by country.",
  },
};

export { default } from "./page";
