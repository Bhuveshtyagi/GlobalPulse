"use client";

import { useEffect, useState } from "react";

interface Point {
  time: string;
  close: number;
}

interface StooqChartProps {
  symbol: string;
  height?: number;
  mini?: boolean;
}

export default function StooqChart({ symbol, height = 380, mini = false }: StooqChartProps) {
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setPoints([]);
    fetch(`/api/market-data?symbol=${encodeURIComponent(symbol)}&mode=history`)
      .then(r => r.json())
      .then(data => {
        if (!data.history?.length) { setError(true); return; }
        setPoints(data.history.map((d: { time: string; close: number }) => ({ time: d.time, close: d.close })));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [symbol]);

  if (loading) {
    return (
      <div style={{ height }} className="flex items-center justify-center w-full">
        <div className="w-5 h-5 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || points.length < 2) {
    return (
      <div style={{ height }} className="flex items-center justify-center w-full">
        <span className="font-mono text-[9px] tracking-widest uppercase opacity-30">No data available</span>
      </div>
    );
  }

  const values = points.map(p => p.close);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const W = 400;
  const H = 120;
  const pad = mini ? 2 : 10;

  const toX = (i: number) => (i / (points.length - 1)) * (W - pad * 2) + pad;
  const toY = (v: number) => H - pad - ((v - min) / range) * (H - pad * 2);

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(p.close).toFixed(1)}`).join(" ");
  const fillD = `${pathD} L ${toX(points.length - 1).toFixed(1)} ${H} L ${toX(0).toFixed(1)} ${H} Z`;

  const first = values[0];
  const last = values[values.length - 1];
  const up = last >= first;
  const pct = (((last - first) / first) * 100).toFixed(2);
  const color = up ? "#22c55e" : "#ef4444";

  return (
    <div style={{ height, width: "100%" }} className="relative">
      {!mini && (
        <div className="flex items-baseline justify-between mb-2 px-1">
          <span className="font-serif text-2xl tracking-tighter">
            {last.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </span>
          <span className={`font-mono text-[10px] font-bold ${up ? "text-green-500" : "text-red-500"}`}>
            {up ? "▲" : "▼"} {pct}%
          </span>
        </div>
      )}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: mini ? "100%" : `calc(100% - ${mini ? 0 : 40}px)` }}
      >
        <defs>
          <linearGradient id={`fill-${symbol.replace(/[^a-z0-9]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={fillD} fill={`url(#fill-${symbol.replace(/[^a-z0-9]/gi, "")})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth={mini ? "1.5" : "2"} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {!mini && (
        <div className="flex justify-between font-mono text-[8px] opacity-25 mt-1 tracking-widest px-1">
          <span>{points[0]?.time?.slice(0, 7)}</span>
          <span>{points[Math.floor(points.length / 2)]?.time?.slice(0, 7)}</span>
          <span>{points[points.length - 1]?.time?.slice(0, 7)}</span>
        </div>
      )}
    </div>
  );
}
