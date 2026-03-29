"use client";

import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";
import { useEffect, useState, useCallback } from "react";

const INDICES = [
  { name: "NIFTY 50", value: 22453.15, change: "+182.40", pct: "+0.82%", trend: "up" },
  { name: "SENSEX", value: 73921.30, change: "+541.20", pct: "+0.74%", trend: "up" },
  { name: "NIFTY BANK", value: 47215.80, change: "-112.30", pct: "-0.24%", trend: "down" },
  { name: "NIFTY IT", value: 35124.50, change: "+412.10", pct: "+1.19%", trend: "up" },
  { name: "S&P 500", value: 5241.30, change: "+28.50", pct: "+0.55%", trend: "up" },
  { name: "NASDAQ", value: 16742.39, change: "-45.10", pct: "-0.27%", trend: "down" },
];

const TOP_MOVERS = [
  { symbol: "RELIANCE", price: "₹2,982", change: "+1.2%" },
  { symbol: "TATA MOTORS", price: "₹982", change: "+4.1%" },
  { symbol: "HDFC BANK", price: "₹1,452", change: "-0.5%" },
  { symbol: "INFY", price: "₹1,621", change: "+2.4%" },
  { symbol: "ADANI ENT", price: "₹3,124", change: "-1.8%" },
  { symbol: "WIPRO", price: "₹498", change: "+0.9%" },
];

// Generate a realistic-looking sparkline SVG path
function buildSparklinePath(trend: "up" | "down", width = 400, height = 120): string {
  const points: [number, number][] = [];
  const n = 40;
  let y = trend === "up" ? height * 0.7 : height * 0.3;
  for (let i = 0; i < n; i++) {
    y += (Math.random() - (trend === "up" ? 0.42 : 0.58)) * 12;
    y = Math.max(8, Math.min(height - 8, y));
    points.push([Math.round((i / (n - 1)) * width), Math.round(y)]);
  }
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
}

interface MarketArticle {
  title: string;
  description: string;
  source: string;
  time: string;
  link: string;
  image?: string | null;
}

export default function MarketPage() {
  const [selectedIndex, setSelectedIndex] = useState(INDICES[0]);
  const [sparklinePaths, setSparklinePaths] = useState<Record<string, string>>({});
  const [articles, setArticles] = useState<MarketArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [liveValues, setLiveValues] = useState<Record<string, number>>({});

  // Build sparklines on mount (client only — avoids hydration mismatch)
  useEffect(() => {
    const paths: Record<string, string> = {};
    INDICES.forEach(idx => { paths[idx.name] = buildSparklinePath(idx.trend as "up" | "down"); });
    setSparklinePaths(paths);
    const init: Record<string, number> = {};
    INDICES.forEach(idx => { init[idx.name] = idx.value; });
    setLiveValues(init);
  }, []);

  // Simulate live price fluctuation every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveValues(prev => {
        const next = { ...prev };
        INDICES.forEach(idx => {
          const delta = (Math.random() - 0.5) * (idx.value * 0.0008);
          next[idx.name] = +(prev[idx.name] + delta).toFixed(2);
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Fetch business/market news
  const fetchMarketNews = useCallback(async () => {
    setLoadingNews(true);
    try {
      const res = await fetch("/api/news?category=business&page=1");
      const data = await res.json();
      setArticles(data.articles || []);
    } catch { setArticles([]); }
    finally { setLoadingNews(false); }
  }, []);

  useEffect(() => { fetchMarketNews(); }, [fetchMarketNews]);

  const selectedPath = sparklinePaths[selectedIndex.name] || "";

  return (
    <main className="min-h-screen bg-bone dark:bg-[#0a0a0b] text-ink dark:text-bone transition-colors duration-500">
      <MarketTicker />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-36 pb-20">
        {/* Header */}
        <header className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <span className="w-12 h-[1px] bg-accent" />
            <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-accent font-bold">Live Market Intelligence</span>
          </div>
          <h1 className="font-serif text-6xl md:text-8xl tracking-tighter">
            Market <span className="italic text-ink/20 dark:text-bone/20">Pulse</span>
          </h1>
          <p className="font-sans text-sm opacity-50 mt-4">Real-time indices, movers, and business intelligence.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12">
          {/* Left: Chart + News */}
          <section className="space-y-12">
            {/* Index selector */}
            <div className="flex flex-wrap gap-2">
              {INDICES.map(idx => (
                <button
                  key={idx.name}
                  onClick={() => setSelectedIndex(idx)}
                  className={`px-4 py-2 font-mono text-[9px] tracking-widest uppercase border transition-all ${
                    selectedIndex.name === idx.name
                      ? "border-accent text-accent bg-accent/5"
                      : "border-ink/10 dark:border-bone/10 opacity-50 hover:opacity-100 hover:border-accent/30"
                  }`}
                >
                  {idx.name}
                </button>
              ))}
            </div>

            {/* Live SVG Chart */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedIndex.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border border-ink/10 dark:border-bone/10 bg-ink/2 dark:bg-bone/2 p-8 relative overflow-hidden"
              >
                {/* Grid lines */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{ backgroundImage: "linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)", backgroundSize: "40px 30px" }} />

                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="font-mono text-[10px] tracking-widest uppercase opacity-40 mb-1">{selectedIndex.name}</p>
                    <div className="flex items-baseline gap-4">
                      <motion.span
                        key={liveValues[selectedIndex.name]}
                        initial={{ opacity: 0.6 }}
                        animate={{ opacity: 1 }}
                        className="font-serif text-5xl tracking-tighter"
                      >
                        {liveValues[selectedIndex.name]?.toLocaleString("en-IN", { maximumFractionDigits: 2 }) ?? selectedIndex.value.toLocaleString()}
                      </motion.span>
                      <span className={`font-mono text-sm ${selectedIndex.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                        {selectedIndex.pct}
                      </span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 font-mono text-[10px] ${selectedIndex.trend === "up" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                    {selectedIndex.trend === "up" ? "▲ Bullish" : "▼ Bearish"}
                  </div>
                </div>

                {/* SVG Sparkline */}
                <div className="h-40 w-full relative">
                  {selectedPath && (
                    <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="w-full h-full">
                      {/* gradient fill */}
                      <defs>
                        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={selectedIndex.trend === "up" ? "#22c55e" : "#ef4444"} stopOpacity="0.2" />
                          <stop offset="100%" stopColor={selectedIndex.trend === "up" ? "#22c55e" : "#ef4444"} stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* fill area */}
                      <path
                        d={`${selectedPath} L 400 120 L 0 120 Z`}
                        fill="url(#chartFill)"
                      />
                      {/* animated line */}
                      <motion.path
                        d={selectedPath}
                        fill="none"
                        stroke={selectedIndex.trend === "up" ? "#22c55e" : "#ef4444"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </svg>
                  )}
                </div>

                <div className="flex justify-between font-mono text-[9px] opacity-30 mt-2 tracking-widest">
                  <span>09:15 AM</span><span>11:30 AM</span><span>01:00 PM</span><span>02:30 PM</span><span>03:30 PM</span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Indices grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-ink/5 dark:bg-bone/5 border border-ink/10 dark:border-bone/10">
              {INDICES.map(idx => (
                <button
                  key={idx.name}
                  onClick={() => setSelectedIndex(idx)}
                  className={`bg-bone dark:bg-[#0a0a0b] p-6 text-left hover:bg-accent/5 transition-colors group ${selectedIndex.name === idx.name ? "bg-accent/5" : ""}`}
                >
                  <p className="font-mono text-[9px] tracking-widest uppercase opacity-40 mb-2">{idx.name}</p>
                  <p className="font-serif text-2xl tracking-tighter">
                    {liveValues[idx.name]?.toLocaleString("en-IN", { maximumFractionDigits: 2 }) ?? idx.value.toLocaleString()}
                  </p>
                  <p className={`font-mono text-[9px] mt-1 ${idx.trend === "up" ? "text-green-500" : "text-red-500"}`}>{idx.pct}</p>
                </button>
              ))}
            </div>

            {/* Business News Feed */}
            <div>
              <div className="flex items-center gap-4 mb-8 pb-4 border-b border-ink/10 dark:border-bone/10">
                <span className="w-6 h-[1px] bg-accent" />
                <h2 className="font-mono text-[10px] tracking-[0.4em] uppercase font-bold">Latest Market & Business News</h2>
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse ml-auto" />
              </div>

              {loadingNews ? (
                <div className="py-12 flex items-center justify-center gap-4">
                  <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                  <p className="font-mono text-[10px] tracking-widest uppercase opacity-40 animate-pulse">Scanning frequencies...</p>
                </div>
              ) : articles.length === 0 ? (
                <p className="font-serif text-2xl italic opacity-20 py-12 text-center">No intel in this frequency</p>
              ) : (
                <div className="space-y-0">
                  {articles.slice(0, 10).map((article, i) => {
                    const hasImage = article.image && article.image.startsWith("http");
                    return (
                      <motion.a
                        key={i}
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="group flex gap-6 py-6 border-b border-ink/8 dark:border-bone/8 hover:bg-accent/3 transition-colors -mx-4 px-4"
                      >
                        {hasImage && (
                          <div className="flex-shrink-0 w-20 h-20 overflow-hidden bg-ink/5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={article.image!} 
                              alt={article.title} 
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                              loading="lazy" 
                              onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-[9px] tracking-widest uppercase opacity-40 mb-1">{article.source}</p>
                          <h3 className="font-serif text-lg leading-snug group-hover:text-accent transition-colors tracking-tight line-clamp-2">
                            {article.title}
                          </h3>
                        </div>
                      </motion.a>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Right Sidebar */}
          <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
            {/* Top Movers */}
            <div className="border border-ink/10 dark:border-bone/10 p-6">
              <h4 className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase mb-6 pb-4 border-b border-ink/10 dark:border-bone/10 flex items-center justify-between">
                Top Movers
                <span className="text-accent text-[9px]">● Live</span>
              </h4>
              <div className="space-y-3">
                {TOP_MOVERS.map((mover, i) => (
                  <motion.div
                    key={mover.symbol}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="flex items-center justify-between p-3 hover:bg-ink/3 dark:hover:bg-bone/3 transition-colors"
                  >
                    <div>
                      <div className="font-mono text-[11px] font-bold">{mover.symbol}</div>
                      <div className="font-mono text-[9px] opacity-40">{mover.price}</div>
                    </div>
                    <div className={`font-mono text-[10px] font-bold ${mover.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                      {mover.change}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Neural Alpha */}
            <div className="p-6 bg-ink text-bone dark:bg-bone dark:text-ink">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                <span className="font-mono text-[9px] tracking-widest uppercase text-accent">AI Signal</span>
              </div>
              <h5 className="font-serif text-xl mb-3 italic">Neural Alpha</h5>
              <p className="font-sans text-[11px] leading-relaxed opacity-70 mb-6">
                Our AI signals indicate a significant volatility surge in NIFTY IT within the next 48 hours based on cross-border sentiment analysis.
              </p>
              <button className="font-mono text-[9px] tracking-widest uppercase border border-white/20 dark:border-black/20 px-4 py-2 hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-colors w-full">
                Unlock Insights
              </button>
            </div>

            {/* Market Hours */}
            <div className="border border-ink/10 dark:border-bone/10 p-6">
              <h4 className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase mb-4 opacity-60">Market Hours</h4>
              <div className="space-y-2">
                {[
                  { name: "NSE / BSE", time: "9:15 – 3:30 PM IST", open: true },
                  { name: "NYSE / NASDAQ", time: "9:30 AM – 4:00 PM ET", open: false },
                  { name: "CRYPTO", time: "24/7 Global", open: true },
                ].map(m => (
                  <div key={m.name} className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-[9px] font-bold">{m.name}</p>
                      <p className="font-mono text-[8px] opacity-40">{m.time}</p>
                    </div>
                    <span className={`font-mono text-[8px] tracking-widest uppercase px-2 py-0.5 ${m.open ? "text-green-500 bg-green-500/10" : "text-red-400 bg-red-500/10"}`}>
                      {m.open ? "Open" : "Closed"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </main>
  );
}
