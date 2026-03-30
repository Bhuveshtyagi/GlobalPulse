import { supabaseServer } from "@/lib/supabase/server";
import InteractiveGlobe from "@/components/InteractiveGlobe";

const COUNTRY_COORDS: Record<string, [number, number]> = {
  "us": [37.0902, -95.7129],
  "gb": [55.3781, -3.4360],
  "in": [20.5937, 78.9629],
  "cn": [35.8617, 104.1954],
  "jp": [36.2048, 138.2529],
  "de": [51.1657, 10.4515],
  "fr": [46.2276, 2.2137],
  "ru": [61.5240, 105.3188],
  "br": [-14.2350, -51.9253],
  "au": [-25.2744, 133.7751],
  "ca": [56.1304, -106.3468],
  "za": [-30.5595, 22.9375],
  "il": [31.0461, 34.8516],
  "ua": [48.3794, 31.1656]
};

export const revalidate = 60;

export default async function GlobePage() {
  // Fetch up to 50 recent articles from Supabase
  const { data: articles, error } = await supabaseServer
    .from("articles")
    .select("id, title, country_codes")
    .order("published_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Globe data fetch error:", error);
  }

  // Pre-process items to match them with geo coordinates
  const mappedNews = (articles || []).map((a: any) => {
    let codes = a.country_codes;
    let fallbackCode = "us"; // Default cluster if unspecified
    
    // Attempt parse if Supabase returned a JSON string instead of array
    if (typeof codes === "string") {
      try { codes = JSON.parse(codes); } catch { codes = []; }
    }
    
    const code = Array.isArray(codes) && codes.length > 0 ? codes[0].toLowerCase() : fallbackCode;
    const coords = COUNTRY_COORDS[code] || 
                   // Randomly distribute around the equator if completely missing
                   [ (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 360 ];
                   
    // Give identical locations a tiny amount of jitter so dots don't exactly completely overlap and hide rings
    const jitter = 4;
    return {
      id: a.id,
      title: a.title,
      country: code,
      lat: coords[0] + ((Math.random() * jitter) - (jitter/2)),
      lng: coords[1] + ((Math.random() * jitter) - (jitter/2)),
    };
  });

  return (
    <main className="pt-[104px] min-h-screen bg-black overflow-hidden relative">
      <InteractiveGlobe news={mappedNews} />
      
      {/* Vignette effect for dramatic premium look */}
      <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />
    </main>
  );
}
