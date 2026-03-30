import { NextRequest, NextResponse } from "next/server";

// Yahoo Finance symbol mapping
const SYMBOL_MAP: Record<string, string> = {
  "NSE:NIFTY": "^NSEI",
  "BSE:SENSEX": "^BSESN",
  "NSE:BANKNIFTY": "^NSEBANK",
  "NSE:CNXIT": "^CNXIT",
  "SP:SPX": "^GSPC",
  "NASDAQ:NDX": "^NDX",
  // Watchlist quotes
  "RELIANCE": "RELIANCE.NS",
  "TCS": "TCS.NS",
  "HDFCBANK": "HDFCBANK.NS",
  "INFY": "INFY.NS",
  "AAPL": "AAPL",
  "NVDA": "NVDA",
};

// Fetch live quote for a symbol
async function fetchQuote(yahooSym: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSym)}?interval=1d&range=1d`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "application/json",
    },
    next: { revalidate: 60 }
  });
  
  if (!res.ok) throw new Error("Yahoo Finance quote fetch failed");
  const data = await res.json();
  const meta = data?.chart?.result?.[0]?.meta;
  const indicators = data?.chart?.result?.[0]?.indicators?.quote?.[0];
  
  if (!meta) return null;
  
  return {
    price: meta.regularMarketPrice ?? 0,
    open: indicators?.open?.[0] ?? meta.chartPreviousClose ?? 0,
    high: meta.regularMarketDayHigh ?? 0,
    low: meta.regularMarketDayLow ?? 0,
    volume: meta.regularMarketVolume ?? 0,
  };
}

// Fetch 90-day OHLC historical data for a symbol (for chart)
async function fetchHistory(yahooSym: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSym)}?interval=1d&range=6mo`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "application/json",
    },
    next: { revalidate: 3600 }
  });
  
  if (!res.ok) throw new Error("Yahoo Finance history fetch failed");
  
  const data = await res.json();
  const result = data?.chart?.result?.[0];
  if (!result || !result.timestamp) return [];
  
  const timestamps = result.timestamp;
  const quote = result.indicators?.quote?.[0];
  if (!quote) return [];
  
  const rows: { time: string; open: number; high: number; low: number; close: number }[] = [];
  
  for (let i = 0; i < timestamps.length; i++) {
    const ts = timestamps[i];
    const open = quote.open?.[i];
    const high = quote.high?.[i];
    const low = quote.low?.[i];
    const close = quote.close?.[i];
    
    // Yahoo might have nulls in data arrays for holidays/glitches
    if (open == null || close == null) continue;
    
    // Format YYYY-MM-DD (convert to IST context for Indian stocks, but standard UTC strings also work for LightweightCharts)
    const date = new Date(ts * 1000);
    // Use manual date formatting to ensure YYYY-MM-DD
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    
    rows.push({
      time: `${y}-${m}-${d}`,
      open,
      high,
      low,
      close,
    });
  }
  
  // Return last 90 trading days to match previous logic
  return rows.slice(-90);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  const mode = searchParams.get("mode") ?? "history"; // "history" | "quote"

  if (!symbol) return NextResponse.json({ error: "symbol required" }, { status: 400 });

  const yahooSym = SYMBOL_MAP[symbol] ?? symbol;

  try {
    if (mode === "quote") {
      const quote = await fetchQuote(yahooSym);
      if (!quote) return NextResponse.json({ error: "No data" }, { status: 404 });
      return NextResponse.json({ success: true, symbol, quote });
    } else {
      const history = await fetchHistory(yahooSym);
      if (!history.length) return NextResponse.json({ error: "No history" }, { status: 404 });
      return NextResponse.json({ success: true, symbol, history });
    }
  } catch (err) {
    console.error("market-data error:", err);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
