import Parser from "rss-parser";
import { supabaseServer as supabase } from "@/lib/supabase/server";

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "media:content"],
      ["media:thumbnail", "media:thumbnail"],
      ["enclosure", "enclosure"],
    ]
  }
});

const NEWSDATA_API_KEY = process.env.NEWSDATA_API_KEY;

function sanitizeUrl(url: string | null): string | null {
  if (!url) return null;
  // Unwrap Google News redirect URLs so images work
  try {
    if (url.includes("news.google.com")) return null;
    const decoded = decodeURIComponent(url);
    if (decoded.startsWith("http")) return decoded;
    return url;
  } catch {
    return url;
  }
}

function extractRssImage(item: any): string | null {
  // Check all common RSS image fields
  const candidates = [
    item["media:content"]?.["$"]?.url,
    item["media:content"]?.url,
    item["media:thumbnail"]?.["$"]?.url,
    item["media:thumbnail"]?.url,
    item.enclosure?.url,
    item["media:group"]?.["media:thumbnail"]?.[0]?.["$"]?.url,
  ];
  for (const c of candidates) {
    if (c && typeof c === "string" && c.startsWith("http")) return c;
  }
  // Regex parse from content HTML
  if (item.content) {
    const m = item.content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (m?.[1]?.startsWith("http")) return m[1];
  }
  if (item["content:encoded"]) {
    const m = item["content:encoded"].match(/<img[^>]+src=["']([^"']+)["']/i);
    if (m?.[1]?.startsWith("http")) return m[1];
  }
  return null;
}

// Aggressive fast-scraper to get authentic images from destination URLs
async function scrapeOgImage(url: string | null): Promise<string | null> {
  if (!url || url.includes("news.google.com")) return null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second max timeout
    const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const html = await res.text();
    // Hunt for OpenGraph image tag natively
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) 
                 || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    // Hunt for Twitter card image natively
    const twMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    
    let scraped = ogMatch?.[1] || twMatch?.[1] || null;
    if (scraped && !scraped.startsWith("http")) return null; // handle relative paths badly
    // Unwrap & decode html entities
    if (scraped) scraped = scraped.replace(/&amp;/g, '&');
    return scraped;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "top";
  const page = parseInt(searchParams.get("page") || "1");
  const country = searchParams.get("country") || "";
  const search = searchParams.get("search") || "";
  const email = searchParams.get("email") || "";
  const limit = 10;

  try {
    const rawArticles: any[] = [];
    let targetCategories: string[] = [];

    // Personalization Algorithm: Resolve "For You"
    if (category === "For You" && email) {
      const { data: interactions } = await supabase
        .from('user_interactions')
        .select('category, read_time_seconds')
        .eq('user_email', email)
        .order('read_time_seconds', { ascending: false })
        .limit(20);
        
      if (interactions && interactions.length > 0) {
        const catMap = new Map();
        for (const ix of interactions) {
          if (!ix.category || ix.category === "top") continue;
          catMap.set(ix.category, (catMap.get(ix.category) || 0) + ix.read_time_seconds);
        }
        targetCategories = Array.from(catMap.entries())
          .sort((a,b) => b[1] - a[1])
          .map(e => e[0])
          .slice(0, 3);
      }
    }

    if (page === 1) {
      // 1. Fetch from Newsdata.io
      try {
        let newsdataUrl = `https://newsdata.io/api/1/news?apikey=${NEWSDATA_API_KEY}&language=en`;
        
        if (search) {
          newsdataUrl += `&q=${encodeURIComponent(search)}`;
        } else {
          const CATEGORY_MAP: Record<string, string> = {
            "For You": "top", "Trending": "top", "top": "top",
            "Politics": "politics", "World": "world", "National": "national", "Local": "domestic", "Law & Crime": "crime",
            "Business": "business", "Business / Economy": "business", "Stock Market": "business", "Cryptocurrency": "business",
            "Banking": "business", "Real Estate": "business", "Startups": "business",
            "Technology": "technology", "Artificial Intelligence": "technology", "Space Tech": "science",
            "Cybersecurity": "technology", "Science": "science", "Gadgets": "technology",
            "Lifestyle": "lifestyle", "Culture": "entertainment", "Movies": "entertainment",
            "Music": "entertainment", "Travel": "travel", "Relationships": "lifestyle",
            "Sports": "sports", "Football": "sports", "Cricket": "sports", "Basketball": "sports", "Esports": "sports",
            "Health / Medicine": "health", "Education": "education", "Environment": "environment",
          };
          const mappedCategory = (category === "For You" && targetCategories.length > 0)
            ? targetCategories.join(',')
            : CATEGORY_MAP[category] || "top";
          newsdataUrl += `&category=${mappedCategory}`;
        }
        if (country) newsdataUrl += `&country=${country}`;

        const res = await fetch(newsdataUrl, { next: { revalidate: 600 } });
        if (res.ok) {
          const data = await res.json();
          if (data.results) {
            const formatted = data.results.map((item: any, id: number) => ({
              id: `api_${id}_${Date.now()}`,
              title: item.title || "Untitled",
              description: item.description || item.content?.substring(0, 200) || "Click to read the full story...",
              link: item.link || `https://newsdata.io/${id}`,
              source: item.source_id || "Newsdata.io",
              image: item.image_url ? sanitizeUrl(item.image_url) : null,
              time: item.pubDate || new Date().toISOString(),
            }));
            rawArticles.push(...formatted);
          }
        }
      } catch (e) {
        console.error("Newsdata fetch failed:", e);
      }

      // 2. Fetch from RSS (skip for country-specific or search)
      if (!country && !search) {
        try {
          const gNewsCategory = ["For You", "Trending", "top"].includes(category)
            ? ""
            : `/headlines/section/topic/${category.toUpperCase().split(" ")[0]}`;
          const rssUrl = `https://news.google.com/rss${gNewsCategory}?hl=en-US&gl=US&ceid=US:en`;

          const feed = await parser.parseURL(rssUrl);
          const formattedRss = feed.items.slice(0, 15).map((item: any, id: number) => {
            let cleanDesc = item.contentSnippet || item.content || item.description || "";
            cleanDesc = cleanDesc.replace(/<[^>]+>/g, "").substring(0, 200).trim();

            return {
              id: `rss_${id}_${Date.now()}`,
              title: item.title?.replace(/\s*-\s*[^-]+$/, "").trim() || "Untitled",
              description: cleanDesc || "Expand for details...",
              link: item.link || `https://news.google.com/`,
              source: (item.source?.name || (item.title?.match(/\s*-\s*([^-]+)$/) || [])[1] || feed.title || "Google News").trim(),
              image: extractRssImage(item), // Google News RSS rarely has images — null is fine
              time: item.pubDate || new Date().toISOString(),
            };
          });
          rawArticles.push(...formattedRss);
        } catch (e) {
          console.error("RSS fetch failed:", e);
        }
      }

      // 3. Fallback to Aggressive Scraper for missing images via Promise.all
      const articlesNeedingImages = rawArticles.filter(a => !a.image && a.link);
      if (articlesNeedingImages.length > 0) {
        await Promise.allSettled(
          articlesNeedingImages.map(async (article) => {
            const ogImage = await scrapeOgImage(article.link);
            if (ogImage) article.image = ogImage;
          })
        );
      }

      // 4. Persist to Supabase
      if (rawArticles.length > 0) {
        const dbPayload = rawArticles
          .filter(a => a.link && a.title)
          .map(a => ({
            title: a.title,
            summary: a.description,
            source: a.source,
            url: a.link,
            category: category,
            image_url: a.image, // Now saving real authentic scraped images!
            content_hash: `${a.source}_${a.title.substring(0, 30)}`,
          }));
        await supabase.from("news").upsert(dbPayload, { onConflict: "url", ignoreDuplicates: true });
      }
    }

    // 4. Historical page from Supabase
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const query = supabase
      .from("news")
      .select("*")
      .order("timestamp", { ascending: false })
      .range(from, to);

    // Filter by category or search
    if (search) {
      query.ilike("title", `%${search}%`);
    } else if (category === "For You" && targetCategories.length > 0) {
      query.in("category", targetCategories);
    } else if (!["For You", "Trending", "top"].includes(category)) {
      query.eq("category", category);
    }

    const { data: dbArticles } = await query;

    if (dbArticles && dbArticles.length > 0) {
      const formattedDb = dbArticles.map(a => ({
        id: `db_${a.id}`,
        title: a.title,
        description: a.summary,
        link: a.url,
        source: a.source,
        image: a.image_url,
        time: a.timestamp,
      }));
      const combined = [...rawArticles, ...formattedDb];
      const unique = Array.from(new Map(combined.map(item => [item.link, item])).values());
      return Response.json({ articles: unique });
    }

    return Response.json({ articles: rawArticles });

  } catch (error) {
    console.error("Critical API error:", error);
    return Response.json({ error: "Failed to fetch news", articles: [] }, { status: 500 });
  }
}
