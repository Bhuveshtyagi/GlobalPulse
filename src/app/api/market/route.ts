// Use Yahoo Finance v8 chart API - fetches symbols concurrently to avoid 401s
const SYMBOLS = [
  { symbol: "^NSEI", label: "NIFTY 50", category: "india" },
  { symbol: "^BSESN", label: "SENSEX", category: "india" },
  { symbol: "^NSEBANK", label: "BANK NIFTY", category: "india" },
  { symbol: "^GSPC", label: "S&P 500", category: "global" },
  { symbol: "^IXIC", label: "NASDAQ", category: "global" },
  { symbol: "BTC-USD", label: "BTC/USD", category: "crypto" },
  { symbol: "ETH-USD", label: "ETH/USD", category: "crypto" },
  { symbol: "GC=F", label: "GOLD", category: "commodity" },
  { symbol: "CL=F", label: "CRUDE OIL", category: "commodity" },
];

export const revalidate = 60;

export async function GET() {
  try {
    const promises = SYMBOLS.map(async (meta) => {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(meta.symbol)}?interval=1d&range=1d`;
      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json",
          },
          next: { revalidate: 60 },
        });

        if (!res.ok) return null;
        
        const json = await res.json();
        const m = json?.chart?.result?.[0]?.meta;
        if (!m) return null;

        const price = m.regularMarketPrice ?? 0;
        const prevClose = m.chartPreviousClose ?? price;
        const change = price - prevClose;
        const pct = prevClose ? (change / prevClose) * 100 : 0;
        const trend = change >= 0 ? "up" : "down";

        let formattedPrice: string;
        if (price >= 1000) {
          formattedPrice = price.toLocaleString("en-IN", { maximumFractionDigits: 2 });
        } else {
          formattedPrice = price.toFixed(2);
        }

        return {
          symbol: meta.label,
          price: formattedPrice,
          rawPrice: price,
          change: `${change >= 0 ? "+" : ""}${Math.abs(change).toFixed(2)}`,
          pct: `${change >= 0 ? "+" : ""}${pct.toFixed(2)}%`,
          trend,
          category: meta.category,
        };
      } catch {
        return null;
      }
    });

    const results = await Promise.all(promises);
    const data = results.filter(Boolean);

    if (!data.length) throw new Error("No quotes returned");

    return Response.json({ success: true, data, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("Market route error:", err);
    return Response.json({
      success: false,
      data: [],
      error: String(err),
    }, { status: 500 });
  }
}
