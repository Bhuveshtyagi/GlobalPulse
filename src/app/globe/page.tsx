"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import MarketTicker from "@/components/MarketTicker";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// World countries with their news-friendly country codes and latitude/longitude
const REGIONS = [
  { name: "United States", code: "us", emoji: "🇺🇸", lat: 38, lng: -97 },
  { name: "United Kingdom", code: "gb", emoji: "🇬🇧", lat: 55, lng: -3 },
  { name: "India", code: "in", emoji: "🇮🇳", lat: 20, lng: 77 },
  { name: "China", code: "cn", emoji: "🇨🇳", lat: 35, lng: 105 },
  { name: "Japan", code: "jp", emoji: "🇯🇵", lat: 36, lng: 138 },
  { name: "Germany", code: "de", emoji: "🇩🇪", lat: 51, lng: 9 },
  { name: "France", code: "fr", emoji: "🇫🇷", lat: 46, lng: 2 },
  { name: "Brazil", code: "br", emoji: "🇧🇷", lat: -14, lng: -51 },
  { name: "Australia", code: "au", emoji: "🇦🇺", lat: -25, lng: 133 },
  { name: "Canada", code: "ca", emoji: "🇨🇦", lat: 56, lng: -106 },
  { name: "Russia", code: "ru", emoji: "🇷🇺", lat: 61, lng: 105 },
  { name: "South Korea", code: "kr", emoji: "🇰🇷", lat: 35, lng: 127 },
  { name: "Mexico", code: "mx", emoji: "🇲🇽", lat: 23, lng: -102 },
  { name: "Italy", code: "it", emoji: "🇮🇹", lat: 41, lng: 12 },
  { name: "Spain", code: "es", emoji: "🇪🇸", lat: 40, lng: -3 },
  { name: "Saudi Arabia", code: "sa", emoji: "🇸🇦", lat: 23, lng: 45 },
  { name: "South Africa", code: "za", emoji: "🇿🇦", lat: -30, lng: 25 },
  { name: "Argentina", code: "ar", emoji: "🇦🇷", lat: -38, lng: -63 },
  { name: "Indonesia", code: "id", emoji: "🇮🇩", lat: -0.7, lng: 113 },
  { name: "Pakistan", code: "pk", emoji: "🇵🇰", lat: 30, lng: 69 },
];

// Map country names (from TopoJSON properties.name) -> ISO 3166-1 alpha-2 code
// Used to fetch real country flags from flagcdn.com
const NAME_TO_ISO2: Record<string, string> = {
  "Afghanistan": "af", "Albania": "al", "Algeria": "dz", "Angola": "ao", "Argentina": "ar",
  "Armenia": "am", "Australia": "au", "Austria": "at", "Azerbaijan": "az", "Bangladesh": "bd",
  "Belarus": "by", "Belgium": "be", "Bolivia": "bo", "Bosnia and Herzegovina": "ba", "Botswana": "bw",
  "Brazil": "br", "Bulgaria": "bg", "Cambodia": "kh", "Cameroon": "cm", "Canada": "ca",
  "Chile": "cl", "China": "cn", "Colombia": "co", "Croatia": "hr", "Cuba": "cu",
  "Czech Republic": "cz", "Czechia": "cz", "Denmark": "dk", "Ecuador": "ec", "Egypt": "eg",
  "Ethiopia": "et", "Finland": "fi", "France": "fr", "Germany": "de", "Ghana": "gh",
  "Greece": "gr", "Guatemala": "gt", "Guinea": "gn", "Hungary": "hu", "India": "in",
  "Indonesia": "id", "Iran": "ir", "Iraq": "iq", "Ireland": "ie", "Israel": "il",
  "Italy": "it", "Japan": "jp", "Jordan": "jo", "Kazakhstan": "kz", "Kenya": "ke",
  "Kuwait": "kw", "Laos": "la", "Lebanon": "lb", "Libya": "ly", "Malaysia": "my",
  "Mali": "ml", "Mexico": "mx", "Morocco": "ma", "Mozambique": "mz", "Myanmar": "mm",
  "Nepal": "np", "Netherlands": "nl", "New Zealand": "nz", "Nicaragua": "ni", "Niger": "ne",
  "Nigeria": "ng", "North Korea": "kp", "Norway": "no", "Oman": "om", "Pakistan": "pk",
  "Peru": "pe", "Philippines": "ph", "Poland": "pl", "Portugal": "pt", "Qatar": "qa",
  "Romania": "ro", "Russia": "ru", "Saudi Arabia": "sa", "Senegal": "sn", "Serbia": "rs",
  "Slovakia": "sk", "Somalia": "so", "South Africa": "za", "South Korea": "kr", "South Sudan": "ss",
  "Spain": "es", "Sri Lanka": "lk", "Sudan": "sd", "Sweden": "se", "Switzerland": "ch",
  "Syria": "sy", "Taiwan": "tw", "Tanzania": "tz", "Thailand": "th", "Tunisia": "tn",
  "Turkey": "tr", "Turkiye": "tr", "Uganda": "ug", "Ukraine": "ua", "United Arab Emirates": "ae",
  "United Kingdom": "gb", "United States": "us", "United States of America": "us",
  "Uruguay": "uy", "Uzbekistan": "uz", "Venezuela": "ve", "Vietnam": "vn",
  "Yemen": "ye", "Zambia": "zm", "Zimbabwe": "zw",
  "Democratic Republic of the Congo": "cd", "Congo": "cg", "Mongolia": "mn",
};

function getFlagUrl(name: string): string | null {
  const iso2 = NAME_TO_ISO2[name];
  if (!iso2) return null;
  return `https://flagcdn.com/w80/${iso2}.png`;
}

function FlagImage({ name, size = 48, className = "" }: { name: string; size?: number; className?: string }) {
  const flagUrl = getFlagUrl(name);
  if (!flagUrl) return <span className={`text-4xl ${className}`}>🌐</span>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={flagUrl}
      alt={`${name} flag`}
      width={size}
      height={size * 0.67}
      className={`object-cover shadow-sm ${className}`}
      style={{ width: size, height: size * 0.67 }}
      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
    />
  );
}

const LANG_MAP: Record<string, string> = {
  "us": "en", "gb": "en", "in": "hi,en", "cn": "zh", "jp": "ja",
  "de": "de", "fr": "fr", "br": "pt", "au": "en", "ca": "en",
  "ru": "ru", "kr": "ko", "mx": "es", "it": "it", "es": "es",
  "sa": "ar", "za": "en", "ar": "es", "id": "id", "pk": "ur,en"
};

interface GlobeArticle {
  title: string;
  description: string;
  source: string;
  time: string;
  link: string;
  image?: string | null;
}

type SelectedCountry = typeof REGIONS[0] | {name: string, isCustom: boolean};

export default function GlobePage() {
  const [selected, setSelected] = useState<SelectedCountry | null>(null);
  const [articles, setArticles] = useState<GlobeArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [hoveredMapName, setHoveredMapName] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ name: string; x: number; y: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const handleMapMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect || !hoveredMapName) return;
    setTooltip({ name: hoveredMapName, x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, [hoveredMapName]);

  useEffect(() => {
    if (!hoveredMapName) setTooltip(null);
  }, [hoveredMapName]);

  const fetchCountryNews = async (country: SelectedCountry) => {
    setSelected(country as any);
    setLoading(true);
    setArticles([]);

    try {
      const endpoint = ('code' in country) 
        ? `/api/news?category=top&country=${country.code}`
        : `/api/news?search=${encodeURIComponent(country.name)}`;
        
      const res = await fetch(endpoint);
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (e) {
      console.error("Country news fetch failed:", e);
    } finally {
      setLoading(false);
    }
  };



  return (
    <main className="min-h-screen bg-bone dark:bg-[#0a0a0b] text-ink dark:text-bone">
      <MarketTicker />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-36 pb-20">
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-3">
            <span className="w-8 h-[1px] bg-accent" />
            <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-accent font-bold">World Intelligence</span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl tracking-tighter">
            The <span className="italic text-ink/20 dark:text-bone/20">Globe</span>
          </h1>
          <p className="font-sans text-sm text-ink/50 dark:text-bone/50 mt-4 max-w-md">
            Select any country to view its live news intelligence feed.
          </p>
        </header>

        {/* 2D Vector Map Container */}
        <div className="w-full relative bg-ink/5 dark:bg-bone/5 border border-ink/10 dark:border-bone/10 rounded-sm mb-16 overflow-hidden flex flex-col md:flex-row items-center">
          {/* subtle grid background */}
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(0,0,0,1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,1)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
          
          <div
            ref={mapRef}
            className="relative w-full md:w-2/3 aspect-[16/9] md:aspect-auto md:h-[550px] flex items-center justify-center p-4"
            onMouseMove={handleMapMouseMove}
          >
            {/* Cursor tooltip */}
            {tooltip && (
              <div
                className="absolute z-20 pointer-events-none bg-bone dark:bg-[#0a0a0b] border border-ink/10 dark:border-bone/10 px-3 py-2 shadow-xl flex items-center gap-2 text-sm font-mono tracking-widest uppercase"
                style={{ left: tooltip.x + 12, top: tooltip.y - 12, transform: "translateY(-50%)" }}
              >
                <FlagImage name={tooltip.name} size={20} />
                <span className="font-mono text-[9px] tracking-widest uppercase whitespace-nowrap">{tooltip.name}</span>
              </div>
            )}
            <ComposableMap 
              projection="geoMercator" 
              projectionConfig={{ scale: 140 }}
              className="w-full h-full object-contain drop-shadow-sm"
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={selected?.name === geo.properties.name ? "var(--accent)" : "currentColor"}
                      stroke="currentColor"
                      onMouseEnter={() => setHoveredMapName(geo.properties.name)}
                      onMouseLeave={() => setHoveredMapName(null)}
                      onClick={() => fetchCountryNews({ name: geo.properties.name, isCustom: true })}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "rgba(var(--accent-rgb), 0.3)", outline: "none", cursor: "pointer" },
                        pressed: { fill: "var(--accent)", outline: "none" },
                      }}
                      className="text-ink/5 dark:text-bone/5 stroke-ink/20 dark:stroke-bone/20 transition-colors"
                    />
                  ))
                }
              </Geographies>

              {REGIONS.map((region) => {
                const isSelected = selected && 'code' in selected && selected.code === region.code;
                const isHovered = hoveredCountry === region.code;
                return (
                  <Marker 
                    key={region.code} 
                    coordinates={[region.lng, region.lat]}
                    onMouseEnter={() => setHoveredCountry(region.code)}
                    onMouseLeave={() => setHoveredCountry(null)}
                    onClick={() => fetchCountryNews(region)}
                    className="cursor-pointer"
                  >
                    <motion.circle 
                      r={isSelected ? 8 : (isHovered ? 6 : 4)} 
                      fill="var(--accent)"
                      fillOpacity={isSelected ? 1 : 0.6}
                      className="transition-all duration-300 pointer-events-none"
                    />
                    <text
                      textAnchor="middle"
                      y={-12}
                      className="font-mono text-[8px] font-bold tracking-widest fill-ink dark:fill-bone pointer-events-none"
                      style={{ opacity: isHovered || isSelected ? 1 : 0 }}
                    >
                      {region.name.toUpperCase()}
                    </text>
                  </Marker>
                );
              })}
            </ComposableMap>
          </div>

          <div className="w-full md:w-1/3 p-8 md:p-16 z-10 flex flex-col justify-center border-t md:border-t-0 md:border-l border-ink/10 dark:border-bone/10 bg-bone/50 dark:bg-ink/50 backdrop-blur-sm h-full self-stretch">
            {selected ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={selected.name}>
                <div className="mb-6">
                  <FlagImage name={selected.name} size={72} className="shadow-md" />
                </div>
                <h2 className="font-serif text-5xl md:text-6xl tracking-tighter mb-4">{selected.name}</h2>
                <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.2em] uppercase text-accent mb-8">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  Target Acquired
                </div>
                <p className="font-sans text-sm leading-relaxed text-ink/60 dark:text-bone/60 max-w-sm">
                  Intelligence feeds synced for {selected.name}. {('lat' in selected) ? `Coordinates locked at ${selected.lat}°, ${selected.lng}°.` : "Global search pattern locked on target."}
                </p>
              </motion.div>
            ) : (
              <div className="flex flex-col items-start opacity-40">
                <div className="font-serif italic text-3xl mb-4">
                  {hoveredMapName ? hoveredMapName : "Awaiting Signal"}
                </div>
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase max-w-xs">
                  {hoveredMapName ? "Click to lock target and intercept intel" : "Hover and click any country on the map to establish an intelligence link and intercept live data."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* News Feed */}
        <AnimatePresence mode="wait">
          {selected && (
            <motion.section
              key={selected.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-ink/10 dark:border-bone/10">
                <FlagImage name={selected.name} size={36} className="shadow-sm flex-shrink-0" />
                <div>
                  <h2 className="font-serif text-3xl tracking-tighter">{selected.name}</h2>
                  <p className="font-mono text-[9px] tracking-widest uppercase text-ink/40 dark:text-bone/40 mt-1">
                    Live Intelligence Feed
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="space-y-0">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="py-8 border-b border-ink/10 dark:border-bone/10 animate-pulse">
                      <div className="h-5 bg-ink/10 dark:bg-bone/10 rounded w-3/4 mb-3" />
                      <div className="h-3 bg-ink/6 dark:bg-bone/6 rounded w-full mb-2" />
                      <div className="h-3 bg-ink/6 dark:bg-bone/6 rounded w-4/5" />
                    </div>
                  ))}
                </div>
              ) : articles.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="font-serif text-2xl italic opacity-30">No intelligence available for this region</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {articles.slice(0, 12).map((article, i) => {
                    const hasImage = article.image && (article.image.startsWith("http") || article.image.startsWith("/"));
                    return (
                      <motion.a
                        key={i}
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group block"
                      >
                        {hasImage && (
                          <div className="aspect-video overflow-hidden mb-4 bg-ink/5 dark:bg-bone/5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={article.image!}
                              alt={article.title}
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <p className="font-mono text-[9px] tracking-widest uppercase text-ink/40 dark:text-bone/40 mb-2">{article.source}</p>
                        <h3 className="font-serif text-xl leading-tight group-hover:text-accent transition-colors mb-2 tracking-tight">
                          {article.title.substring(0, 80)}{article.title.length > 80 ? "..." : ""}
                        </h3>
                        <p className="font-sans text-xs text-ink/50 dark:text-bone/50 leading-relaxed">
                          {article.description?.substring(0, 100)}{article.description?.length > 100 ? "..." : ""}
                        </p>
                      </motion.a>
                    );
                  })}
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        {!selected && (
          <div className="text-center py-20">
            <p className="font-serif text-3xl italic opacity-20">Select a country to begin</p>
          </div>
        )}
      </div>
    </main>
  );
}
