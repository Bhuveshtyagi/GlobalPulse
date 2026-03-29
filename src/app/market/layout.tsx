import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Market Intelligence",
  description:
    "Real-time global stock market data, indices, cryptocurrency prices, and financial intelligence on GlobalPulse.",
  openGraph: {
    title: "Market Intelligence | GlobalPulse",
    description: "Real-time stocks, indices, and crypto data all in one place.",
    url: "https://globalpulse.vercel.app/market",
  },
  twitter: {
    title: "Market Intelligence | GlobalPulse",
    description: "Real-time stocks, indices, and crypto data all in one place.",
  },
};

export { default } from "./page";
