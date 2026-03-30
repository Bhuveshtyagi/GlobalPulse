"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  LineSeries,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type LineSeriesPartialOptions,
} from "lightweight-charts";

interface OHLCPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface LightweightChartProps {
  symbol: string;
  height?: number;
  mini?: boolean;
}

export default function LightweightChart({ symbol, height = 380, mini = false }: LightweightChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Dispose old chart cleanly
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current = null;
    }

    const isDark =
      typeof window !== "undefined" &&
      document.documentElement.classList.contains("dark");

    const bg = "transparent";
    const textColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)";
    const gridColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";

    const chart = createChart(el, {
      width: el.clientWidth,
      height,
      layout: { background: { color: bg }, textColor },
      grid: { vertLines: { color: gridColor }, horzLines: { color: gridColor } },
      timeScale: {
        visible: !mini,
        borderColor: "transparent",
        timeVisible: false,
      },
      rightPriceScale: {
        visible: !mini,
        borderColor: "transparent",
      },
      crosshair: {
        vertLine: { style: LineStyle.Dashed, color: "rgba(156,163,175,0.4)" },
        horzLine: { style: LineStyle.Dashed, color: "rgba(156,163,175,0.4)" },
      },
      handleScroll: !mini,
      handleScale: !mini,
    });
    chartRef.current = chart;

    const lineOptions: LineSeriesPartialOptions = {
      color: "#e11d48",
      lineWidth: mini ? 1 : 2,
      crosshairMarkerVisible: !mini,
      priceLineVisible: !mini,
      lastValueVisible: !mini,
    };

    const series = chart.addSeries(LineSeries, lineOptions);
    seriesRef.current = series;

    // Resize observer
    const ro = new ResizeObserver(() => {
      chart.applyOptions({ width: el.clientWidth });
    });
    ro.observe(el);

    // Fetch history from our Stooq proxy
    setLoading(true);
    setError(false);
    fetch(`/api/market-data?symbol=${encodeURIComponent(symbol)}&mode=history`)
      .then(r => r.json())
      .then(data => {
        if (!data.history?.length) { setError(true); return; }
        const points: OHLCPoint[] = data.history;

        // Colour the line green if net positive, red if net negative
        const first = points[0].close;
        const last = points[points.length - 1].close;
        const up = last >= first;
        series.applyOptions({ color: up ? "#22c55e" : "#ef4444" });

        series.setData(
          points.map(p => ({ time: p.time as `${number}-${number}-${number}`, value: p.close }))
        );
        chart.timeScale().fitContent();
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [symbol, height, mini]);

  return (
    <div style={{ position: "relative", height, width: "100%" }}>
      {loading && !error && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="w-5 h-5 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
        </div>
      )}
      {error && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span className="font-mono text-[9px] tracking-widest uppercase opacity-30">No data</span>
        </div>
      )}
      <div ref={containerRef} style={{ width: "100%", height: "100%", opacity: loading ? 0 : 1, transition: "opacity 0.4s" }} />
    </div>
  );
}
