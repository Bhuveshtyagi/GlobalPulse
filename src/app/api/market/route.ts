// Use Yahoo Finance v7 quotes API - fetches all symbols in one call
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
    const symbolList = SYMBOLS.map(s => s.symbol).join(",");
    
    // Yahoo Finance v7 quote endpoint — fetches all in one call
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbolList)}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketPreviousClose,shortName`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Yahoo Finance responded ${res.status}`);
    
    const json = await res.json();
    const quotes = json?.quoteResponse?.result ?? [];

    if (!quotes.length) throw new Error("No quotes returned");

    const data = quotes.map((q: any) => {
      const meta = SYMBOLS.find(s => s.symbol === q.symbol);
      const price = q.regularMarketPrice ?? 0;
      const change = q.regularMarketChange ?? 0;
      const pct = q.regularMarketChangePercent ?? 0;
      const trend = change >= 0 ? "up" : "down";

      // Format price nicely
      let formattedPrice: string;
      if (price >= 1000) {
        formattedPrice = price.toLocaleString("en-IN", { maximumFractionDigits: 2 });
      } else {
        formattedPrice = price.toFixed(2);
      }

      return {
        symbol: meta?.label ?? q.symbol,
        price: formattedPrice,
        rawPrice: price,
        change: `${change >= 0 ? "+" : ""}${Math.abs(change).toFixed(2)}`,
        pct: `${change >= 0 ? "+" : ""}${pct.toFixed(2)}%`,
        trend,
        category: meta?.category ?? "global",
      };
    });

    return Response.json({ success: true, data, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("Market route error:", err);
    // Return clearly labeled mock data so user knows it's an estimate
    return Response.json({
      success: false,
      data: [],
      error: String(err),
    }, { status: 500 });
  }
}
