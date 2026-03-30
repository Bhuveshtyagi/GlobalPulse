"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Search, Loader2, Sparkles, X, Activity } from "lucide-react";
import { useTheme } from "next-themes";

const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-104px)] flex flex-col items-center justify-center bg-bone dark:bg-black transition-colors duration-500">
      <div className="w-12 h-12 border-2 border-t-accent rounded-full animate-spin mb-4" />
      <span className="text-ink dark:text-white animate-pulse font-mono text-xs tracking-[0.3em]">ESTABLISHING SATELLITE LINK...</span>
    </div>
  )
});

interface NewsItem {
  id: string;
  title: string;
  country: string;
  lat: number;
  lng: number;
}

export default function InteractiveGlobe({ news }: { news: NewsItem[] }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const globeRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mounted, setMounted] = useState(false);
  
  // Globe data state
  const [countriesData, setCountriesData] = useState<any[]>([]);
  const [hoverD, setHoverD] = useState<any>(null);
  
  // Current active country for the intelligence panel
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  
  // Regional intelligence panel state
  const [countryNews, setCountryNews] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Resize observer
    setDimensions({ width: window.innerWidth, height: window.innerHeight - 104 });
    const onResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight - 104 });
    window.addEventListener("resize", onResize);
    
    // Fetch GeoJSON boundaries
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(data => setCountriesData(data.features))
      .catch(err => console.error("Failed to load map polygons:", err));
      
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    // Setup initial globe controls
    if (globeRef.current && mounted) {
      const controls = globeRef.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      controls.enableZoom = true;
    }
  }, [mounted]);

  const points = useMemo(() => news, [news]);

  // Click handler for fetching regional intelligence
  const handlePolygonClick = async (polygon: any) => {
    if (!polygon) return;
    
    setSelectedCountry(polygon);
    setSummary(null);
    setCountryNews([]);
    setNewsLoading(true);

    // Stop auto-rotation when user is interacting with a specific region
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = false;
    }

    const iso = (polygon.properties.ISO_A2 || "").toLowerCase();
    if (!iso) {
      setNewsLoading(false);
      return;
    }

    try {
      // Call backend route directly requesting news for that country
      const res = await fetch(`/api/news?country=${iso}&category=top&limit=10`);
      const data = await res.json();
      setCountryNews(data.articles || []);
    } catch (err) {
      console.error(err);
    } finally {
      setNewsLoading(false);
    }
  };

  // AI Summarize handler
  const handleSummarize = async () => {
    if (!countryNews.length || !selectedCountry) return;
    setSummaryLoading(true);
    
    try {
      // Extract top headlines to process
      const headlines = countryNews.slice(0, 10).map((n: any) => n.title);
      
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: selectedCountry.properties.ADMIN, headlines })
      });
      
      const data = await res.json();
      setSummary(data.text);
    } catch {
      setSummary("Error connecting to intelligence node. Signal Degraded.");
    } finally {
      setSummaryLoading(false);
    }
  };

  const closePanel = () => {
    setSelectedCountry(null);
    if (globeRef.current && mounted) {
      globeRef.current.controls().autoRotate = true;
    }
  };

  if (!mounted) return null;

  return (
    <div className="w-full h-full relative group font-sans">
      
      {/* HUD Info Overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none transition-opacity duration-500">
        <h2 className="text-xl font-mono text-ink dark:text-white tracking-widest uppercase flex items-center gap-2 drop-shadow-lg">
          <Activity className="w-5 h-5 text-accent" />
          Global Surveillance
        </h2>
        <p className="text-xs font-mono text-accent mt-1 max-w-sm drop-shadow-md bg-white/60 dark:bg-black/40 p-2 rounded backdrop-blur-sm border border-accent/20">
          Tracking {points.length} active incidents dynamically mapped. 
          <br/><span className="text-ink/80 dark:text-white/70">Hover over territories for names, and click to extract localized regional intelligence.</span>
        </p>
      </div>

      {/* Slide-out Regional Intelligence Side Panel */}
      <div 
        className={`absolute top-0 right-0 w-full md:w-[450px] h-[calc(100vh-104px)] bg-white/95 dark:bg-black/85 backdrop-blur-xl border-l border-ink/10 dark:border-bone/10 z-20 flex flex-col transform transition-transform duration-500 ease-out shadow-2xl ${
          selectedCountry ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedCountry && (
          <>
            {/* Panel Header */}
            <div className="p-6 border-b border-ink/10 dark:border-bone/10 flex items-center justify-between bg-ink/[0.02] dark:bg-white/[0.02]">
              <div className="flex items-center gap-4">
                {selectedCountry.properties.ISO_A2 && selectedCountry.properties.ISO_A2 !== "-99" ? (
                  <img src={`https://flagcdn.com/${selectedCountry.properties.ISO_A2.toLowerCase()}.svg`} alt="flag" className="w-12 h-auto rounded shadow-sm" />
                ) : (
                  <span className="text-4xl drop-shadow-lg">🌐</span>
                )}
                <div>
                  <h3 className="text-xl font-bold tracking-wider text-ink dark:text-bone uppercase line-clamp-1">
                    {selectedCountry.properties.ADMIN}
                  </h3>
                  <p className="text-[10px] font-mono text-accent uppercase tracking-widest mt-1">
                    Node: {selectedCountry.properties.ISO_A2} • Focus: Region
                  </p>
                </div>
              </div>
              <button onClick={closePanel} className="p-2 bg-ink/5 dark:bg-bone/5 hover:bg-accent/20 rounded-full text-ink/60 dark:text-bone/60 hover:text-accent transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Panel Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* AI Summarize Block */}
              {countryNews.length > 0 && (
                <div className="bg-gradient-to-br from-accent/10 to-transparent p-5 rounded-lg border border-accent/20 shadow-inner relative overflow-hidden">
                  {/* Decorative glowing orb in corner */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 blur-3xl rounded-full" />
                  
                  <div className="relative z-10">
                    <p className="text-xs text-ink/70 dark:text-bone/70 mb-4 font-mono">Execute AI synthesis on all collected regional raw data.</p>
                    
                    {!summary ? (
                      <button 
                        onClick={handleSummarize}
                        disabled={summaryLoading}
                        className="w-full py-3 px-4 bg-accent hover:bg-accent/80 text-white dark:text-black font-bold uppercase tracking-[0.2em] text-xs rounded transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] disabled:bg-ink/10 dark:disabled:bg-bone/20 disabled:text-ink/40 dark:disabled:text-bone/40 disabled:shadow-none"
                      >
                        {summaryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {summaryLoading ? "ANALYZING REPORTS..." : "Generate AI Summary"}
                      </button>
                    ) : (
                      <div className="pt-2">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-4 h-4 text-accent" />
                          <span className="text-[10px] font-mono text-accent uppercase tracking-widest">Executive Briefing</span>
                        </div>
                        <p className="text-sm text-ink/90 dark:text-bone/90 leading-relaxed font-serif bg-white/50 dark:bg-black/30 p-4 rounded border border-ink/5 dark:border-bone/5 shadow-inner">
                          {summary}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* News Feed state */}
              {newsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-ink/60 dark:text-bone/60">
                  <Loader2 className="w-8 h-8 animate-spin mb-4 text-accent" />
                  <p className="font-mono text-[10px] tracking-[0.3em] uppercase">INTERCEPTING SIGNALS...</p>
                </div>
              ) : countryNews.length === 0 ? (
                <div className="text-center py-12 bg-ink/[0.02] dark:bg-bone/[0.02] rounded border border-ink/10 dark:border-bone/10">
                  <Search className="w-8 h-8 mx-auto mb-3 text-ink/30 dark:text-bone/30" />
                  <p className="text-sm text-ink/50 dark:text-bone/50 tracking-wide">No recent classified incidents detected in this sector.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <h4 className="text-[10px] font-mono tracking-widest text-ink/50 dark:text-bone/50 uppercase">Raw Intercepts ({countryNews.length})</h4>
                  </div>
                  
                  {countryNews.map((article: any, idx: number) => (
                    <a key={idx} href={article.link || article.url} target="_blank" rel="noopener noreferrer" className="block group">
                      <div className="p-4 rounded border border-ink/10 dark:border-bone/10 bg-white/40 dark:bg-black/40 hover:border-accent/40 hover:bg-accent/5 transition-all shadow-sm">
                        <h5 className="text-sm font-semibold text-ink dark:text-bone group-hover:text-accent mb-2 line-clamp-3 leading-snug">{article.title}</h5>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-ink/10 dark:border-bone/10">
                          <span className="text-[9px] uppercase font-bold text-accent px-2 py-0.5 rounded bg-accent/10">{article.source || "Intel Node"}</span>
                          <span className="text-[9px] text-ink/40 dark:text-bone/40 font-mono">
                            {new Date(article.time || article.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl={isDark ? "//unpkg.com/three-globe/example/img/earth-dark.jpg" : "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"}
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl={isDark ? "//unpkg.com/three-globe/example/img/night-sky.png" : undefined}
        backgroundColor="rgba(0,0,0,0)"
        
        // Polygons (Countries)
        polygonsData={countriesData}
        polygonAltitude={d => d === hoverD ? 0.04 : 0.01}
        // Blue glowing highlight when hovered, almost invisible lines when not
        polygonCapColor={d => d === hoverD ? 'rgba(59, 130, 246, 0.4)' : (isDark ? 'rgba(255, 255, 255, 0.01)' : 'rgba(0, 0, 0, 0.02)')}
        polygonSideColor={() => isDark ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'}
        polygonStrokeColor={() => isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'}
        onPolygonHover={setHoverD}
        onPolygonClick={handlePolygonClick}
        
        // HTML Tooltip for Countries
        polygonLabel={(d: any) => {
          const iso = (d.properties.ISO_A2 || "").toLowerCase();
          const flagUrl = iso && iso !== "-99" ? `https://flagcdn.com/${iso}.svg` : "";
          const flagHtml = flagUrl ? `<img src="${flagUrl}" alt="flag" style="width: 24px; border-radius: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);" />` : '🌐';
          
          return `
            <div style="background: ${isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.85)'}; backdrop-filter: blur(8px); border: 1px solid rgba(59,130,246,0.4); border-radius: 6px; padding: 8px 14px; color: ${isDark ? 'white' : 'black'}; display: flex; flex-direction: column; align-items: flex-start; box-shadow: 0 4px 20px rgba(0,0,0,0.2);">
              <div style="display: flex; align-items: center; gap: 8px;">
                ${flagHtml}
                <strong style="text-transform: uppercase; letter-spacing: 1px; font-size: 14px;">${d.properties.ADMIN}</strong>
              </div>
              <div style="font-size: 9px; color: #3b82f6; margin-top: 6px; letter-spacing: 2px; font-family: monospace;">[ CLICK TO EXTRACT INTEL ]</div>
            </div>
          `;
        }}
        
        // Data points (Global breaking news nodes)
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointColor={() => "#3b82f6"}
        pointAltitude={0.05}
        pointRadius={0.3}
        pointsMerge={false}
        
        // Rings for aesthetic pulse effect around major news nodes
        ringsData={points}
        ringLat="lat"
        ringLng="lng"
        ringColor={() => "rgba(59, 130, 246, 0.8)"}
        ringMaxRadius={4}
        ringPropagationSpeed={2}
        ringRepeatPeriod={2000}
      />
    </div>
  );
}
