import { NextRequest, NextResponse } from "next/server";

// Stooq symbol mapping for free, no-key market data
const SYMBOL_MAP: Record<string, string> = {
  "NSE:NIFTY": "^nsei",
  "BSE:SENSEX": "^bsesn",
  "NSE:BANKNIFTY": "^nsebank",
  "NSE:CNXIT": "^cnxit",
  "SP:SPX": "^spx",
  "NASDAQ:NDX": "^ndq",
  // Watchlist quotes
  "RELIANCE": "reliance.ns",
  "TCS": "tcs.ns",
  "HDFCBANK": "hdfcbank.ns",
  "INFY": "infy.ns",
  "AAPL": "aapl.us",
  "NVDA": "nvda.us",
};

interface StooqQuote {
  s: string;
  d: string;
  o: string;
  h: string;
  l: string;
  c: string;
  v: string;
}

interface StooqHistoricalRow {
  Date: string;
  Open: string;
  High: string;
  Low: string;
  Close: string;
  Volume: string;
}

// Fetch live quote for a symbol
async function fetchQuote(stooqSym: string) {
  const url = `https://stooq.com/q/l/?s=${encodeURIComponent(stooqSym)}&f=sd2t2ohlcv&h&e=json`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  const data = await res.json();
  const quote: StooqQuote = data?.symbols?.[0];
  if (!quote || quote.c === "N/D") return null;
  return {
    price: parseFloat(quote.c),
    open: parseFloat(quote.o),
    high: parseFloat(quote.h),
    low: parseFloat(quote.l),
    volume: parseInt(quote.v ?? "0"),
  };
}

// Fetch 60-day OHLC historical data for a symbol (for chart)
async function fetchHistory(stooqSym: string) {
  const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(stooqSym)}&i=d`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  const csv = await res.text();
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];

  // header: Date,Open,High,Low,Close,Volume
  const rows: { time: string; open: number; high: number; low: number; close: number }[] = [];
  for (let i = 1; i < Math.min(lines.length, 91); i++) { // last 90 trading days
    const cols = lines[i].split(",");
    if (cols.length < 5) continue;
    const row: StooqHistoricalRow = { Date: cols[0], Open: cols[1], High: cols[2], Low: cols[3], Close: cols[4], Volume: cols[5] ?? "0" };
    const close = parseFloat(row.Close);
    if (isNaN(close)) continue;
    rows.push({
      time: row.Date,
      open: parseFloat(row.Open),
      high: parseFloat(row.High),
      low: parseFloat(row.Low),
      close,
    });
  }
  // Stooq returns newest first — reverse to get chronological
  return rows.reverse();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  const mode = searchParams.get("mode") ?? "history"; // "history" | "quote"

  if (!symbol) return NextResponse.json({ error: "symbol required" }, { status: 400 });

  const stooqSym = SYMBOL_MAP[symbol] ?? symbol;

  try {
    if (mode === "quote") {
      const quote = await fetchQuote(stooqSym);
      if (!quote) return NextResponse.json({ error: "No data" }, { status: 404 });
      return NextResponse.json({ success: true, symbol, quote });
    } else {
      const history = await fetchHistory(stooqSym);
      if (!history.length) return NextResponse.json({ error: "No history" }, { status: 404 });
      return NextResponse.json({ success: true, symbol, history });
    }
  } catch (err) {
    console.error("market-data error:", err);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
