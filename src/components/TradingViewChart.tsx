"use client";

import { useEffect, useRef } from "react";

interface TradingViewMiniChartProps {
  symbol: string;
  timeFrame?: string;
  height?: number;
  showTimeScale?: boolean;
}

export default function TradingViewChart({
  symbol,
  timeFrame = "1D",
  height = 380,
  showTimeScale = true,
}: TradingViewMiniChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Clear previous chart
    el.innerHTML = "";

    // Inject script tag (ensuring it gets re-evaluated each time symbol changes)
    const scriptId = "tradingview-mini-chart-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "module";
      script.src = "https://widgets.tradingview-widget.com/w/en/tv-mini-chart.js";
      document.head.appendChild(script);
    }

    // Inject the web component HTML
    el.innerHTML = `<tv-mini-chart
      symbol="${symbol}"
      time-frame="${timeFrame}"
      line-chart-type="Line"
      ${showTimeScale ? "show-time-scale" : ""}
      transparent
      colorTheme="dark"
      width="100%"
      height="${height}"
    ></tv-mini-chart>`;
  }, [symbol, timeFrame, height, showTimeScale]);

  return <div ref={containerRef} style={{ height: `${height}px`, width: "100%" }} />;
}
