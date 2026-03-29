"use client";

import { useEffect, useState } from "react";

interface MarketItem {
  symbol: string;
  price: string;
  pct: string;
  trend: string;
}

const FALLBACK: MarketItem[] = [
  { symbol: "NIFTY 50", price: "22,453", pct: "+0.82%", trend: "up" },
  { symbol: "SENSEX", price: "73,921", pct: "+0.74%", trend: "up" },
  { symbol: "S&P 500", price: "5,241", pct: "+0.55%", trend: "up" },
  { symbol: "NASDAQ", price: "16,742", pct: "-0.27%", trend: "down" },
  { symbol: "BTC/USD", price: "69,412", pct: "+2.1%", trend: "up" },
  { symbol: "ETH/USD", price: "3,842", pct: "+1.8%", trend: "up" },
  { symbol: "GOLD", price: "2,321", pct: "+0.3%", trend: "up" },
];

export default function MarketTicker() {
  const [data, setData] = useState<MarketItem[]>(FALLBACK);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/market", { cache: "no-store" });
        const json = await res.json();
        if (json.success && json.data?.length > 0) {
          setData(json.data);
          setLive(true);
        }
      } catch { /* keep fallback */ }
    };
    fetchData();
    const iv = setInterval(fetchData, 90000);
    return () => clearInterval(iv);
  }, []);

  // Duplicate items 4x for seamless infinite scroll via CSS
  const items = [...data, ...data, ...data, ...data];

  return (
    <div className="fixed top-0 left-0 w-full h-10 bg-bone dark:bg-[#0a0a0b] border-b border-ink/10 dark:border-bone/10 z-[60] flex items-center overflow-hidden">
      {/* Left label */}
      <div className="flex items-center gap-2 px-4 border-r border-ink/10 dark:border-bone/10 h-full flex-shrink-0 bg-accent/5">
        <span className={`w-1.5 h-1.5 rounded-full ${live ? "bg-green-500" : "bg-accent"} animate-pulse`} />
        <span className="font-mono text-[9px] font-bold tracking-[0.3em] text-accent uppercase whitespace-nowrap">
          {live ? "Live" : "Market"}
        </span>
      </div>

      {/* Scrolling ticker — pure CSS animation, no framer-motion jitter */}
      <div className="flex-1 overflow-hidden h-full flex items-center">
        <div
          className="flex items-center gap-10 h-full"
          style={{
            animation: "ticker-scroll 60s linear infinite",
            whiteSpace: "nowrap",
            willChange: "transform",
          }}
        >
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 font-mono text-[10px] tracking-wider flex-shrink-0">
              <span className="font-bold text-ink dark:text-bone">{item.symbol}</span>
              <span className="text-ink/60 dark:text-bone/60">{item.price}</span>
              <span className={`font-bold ${item.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                {item.pct}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right link */}
      <div className="px-4 border-l border-ink/10 dark:border-bone/10 h-full flex items-center flex-shrink-0 bg-bone dark:bg-[#0a0a0b]">
        <a href="/market" className="font-mono text-[9px] tracking-widest uppercase hover:text-accent transition-colors whitespace-nowrap group flex items-center gap-1.5">
          Full Intel <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
        </a>
      </div>

      {/* Inject keyframes via a style tag */}
      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
