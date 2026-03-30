"use client";

import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";
import { useEffect, useState, useCallback } from "react";
import TradingViewChart from "@/components/TradingViewChart";

const MARKET_SYMBOLS = [
  { name: "NIFTY 50", symbol: "NSE:NIFTY" },
  { name: "SENSEX", symbol: "BSE:SENSEX" },
  { name: "NIFTY BANK", symbol: "NSE:BANKNIFTY" },
  { name: "NIFTY IT", symbol: "NSE:CNXIT" },
  { name: "S&P 500", symbol: "SP:SPX" },
  { name: "NASDAQ 100", symbol: "NASDAQ:NDX" },
];

const TOP_MOVERS = [
  { symbol: "RELIANCE", price: "Live", change: "NSE" },
  { symbol: "TCS", price: "Live", change: "NSE" },
  { symbol: "HDFCBANK", price: "Live", change: "NSE" },
  { symbol: "INFY", price: "Live", change: "NSE" },
  { symbol: "AAPL", price: "Live", change: "NASDAQ" },
  { symbol: "NVDA", price: "Live", change: "NASDAQ" },
];

interface MarketArticle {
  title: string;
  description: string;
  source: string;
  time: string;
  link: string;
  image?: string | null;
}

export default function MarketPage() {
  const [selectedSymbol, setSelectedSymbol] = useState(MARKET_SYMBOLS[0]);
  const [articles, setArticles] = useState<MarketArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

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

  return (
    <main className="min-h-screen bg-bone dark:bg-[#0a0a0b] text-ink dark:text-bone transition-colors duration-500">
      <MarketTicker />
      <Navbar />

      {/* TradingView Script is managed inside TradingViewChart wrapper */}

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-36 pb-20">
        {/* Header */}
        <header className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <span className="w-12 h-[1px] bg-accent" />
            <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-accent font-bold">Verified Market Intelligence</span>
          </div>
          <h1 className="font-serif text-6xl md:text-8xl tracking-tighter">
            Market <span className="italic text-ink/20 dark:text-bone/20">Pulse</span>
          </h1>
          <p className="font-sans text-sm opacity-50 mt-4">Real-time indices powered by TradingView.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12">
          {/* Left: Chart + News */}
          <section className="space-y-12">
            {/* Index selector */}
            <div className="flex flex-wrap gap-2">
              {MARKET_SYMBOLS.map(idx => (
                <button
                  key={idx.symbol}
                  onClick={() => setSelectedSymbol(idx)}
                  className={`px-4 py-2 font-mono text-[9px] tracking-widest uppercase border transition-all ${
                    selectedSymbol.symbol === idx.symbol
                      ? "border-accent text-accent bg-accent/5"
                      : "border-ink/10 dark:border-bone/10 opacity-50 hover:opacity-100 hover:border-accent/30"
                  }`}
                >
                  {idx.name}
                </button>
              ))}
            </div>

            {/* Live TradingView Main Chart */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedSymbol.symbol}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border border-ink/10 dark:border-bone/10 bg-ink/2 dark:bg-bone/2 p-4 relative overflow-hidden h-[400px] w-full"
              >
                <TradingViewChart symbol={selectedSymbol.symbol} timeFrame="1D" height={380} showTimeScale />
              </motion.div>
            </AnimatePresence>

            {/* Indices mini-charts grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-ink/5 dark:bg-bone/5 border border-ink/10 dark:border-bone/10">
              {MARKET_SYMBOLS.map(idx => (
                <button
                  key={idx.symbol}
                  onClick={() => setSelectedSymbol(idx)}
                  className={`bg-bone dark:bg-[#0a0a0b] p-4 text-left hover:bg-accent/5 transition-colors group ${selectedSymbol.symbol === idx.symbol ? "bg-accent/5" : ""}`}
                >
                  <p className="font-mono text-[9px] tracking-widest uppercase opacity-40 mb-2">{idx.name}</p>
                  <div className="h-24 w-full pointer-events-none">
                  <TradingViewChart symbol={idx.symbol} timeFrame="1M" height={96} showTimeScale={false} />
                  </div>
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
            {/* Top Movers (Fixed placeholders for TradingView) */}
            <div className="border border-ink/10 dark:border-bone/10 p-6">
              <h4 className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase mb-6 pb-4 border-b border-ink/10 dark:border-bone/10 flex items-center justify-between">
                Market Watchlist
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
                    <div className="font-mono text-[10px] font-bold opacity-60">
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
                Our AI signals indicate a significant volatility surge in Global Tech within the next 48 hours based on cross-border sentiment analysis.
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
