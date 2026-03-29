import { supabaseServer as supabase } from '@/lib/supabase/server';

export const maxDuration = 60; // Allow Vercel functions to run up to 60s for batch processing.
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized Cron Attempt', { status: 401 });
  }

  console.log("CRON JOB INIT: Searching for unanalyzed global data...");

  try {
    const rawArticles: any[] = [];
    const NEWSDATA_API_KEY = process.env.NEWSDATA_API_KEY;

    if (NEWSDATA_API_KEY) {
      const res = await fetch(`https://newsdata.io/api/1/news?apikey=${NEWSDATA_API_KEY}&language=en&category=top,business,politics&size=10`);
      if (res.ok) {
        const data = await res.json();
        if (data.results) {
          rawArticles.push(...data.results.map((item: any) => ({
            title: item.title,
            description: item.description || item.content?.substring(0, 200) || "",
            url: item.link,
            source: item.source_id || "Newsdata.io",
            image_url: item.image_url,
            category: "top",
            content_hash: `${item.source_id}_${item.title?.substring(0, 30)}`
          })));
        }
      }
    }

    if (rawArticles.length === 0) return Response.json({ status: "No articles fetched from provider." });

    const unique = Array.from(new Map(rawArticles.filter(a => a.url).map(a => [a.url, a])).values());
    const urls = unique.map(a => a.url);
    const { data: existing } = await supabase.from('news').select('url').in('url', urls).not('ai_headline', 'is', null);
    const existingUrls = new Set(existing?.map(e => e.url) || []);
    const toProcess = unique.filter(a => !existingUrls.has(a.url)).slice(0, 5);

    console.log(`CRON STATUS: Found ${toProcess.length} raw articles needing intelligence extraction.`);
    const processed = [];

    for (const article of toProcess) {
      const prompt = `Analyze this news article:\nTitle: ${article.title}\nContent: ${article.description}\n\nProvide a strict JSON response with exactly three keys:\n1. "ai_headline": A shorter, punchier rewritten headline (under 60 chars).\n2. "summary": A strict 2-line summary of the key facts.\n3. "why_it_matters": A 1-2 sentence explanation of the broader geopolitical or financial consequences.\n\nOnly output valid JSON. No markdown ticks.`;

      try {
        const response = await fetch(`https://backend.buildpicoapps.com/aero/run/llm-api?pk=${process.env.PICO_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        const data = await response.json();
        if (data.status !== 'success') throw new Error("API Failure");

        const text = data.text;
        const cleanJson = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        
        processed.push({
          ...article,
          ai_headline: parsed.ai_headline || article.title,
          summary: parsed.summary || article.description,
          why_it_matters: parsed.why_it_matters || "Geopolitical impact unclear."
        });
        
        console.log(`CRON SUCCESS: Processed intelligence payload for -> ${article.title}`);
      } catch (err) {
        console.error("CRON FAIL: PicoApps pipeline broke on article:", article.title, err);
        processed.push(article);
      }
    }

    if (processed.length > 0) {
      const { error } = await supabase.from('news').upsert(processed, { onConflict: 'url' });
      if (error) console.error("CRON DB ERROR:", error);
    }

    return Response.json({ 
      status: "Pipeline Cycle Complete", 
      processed_via_ai: processed.length, 
      skipped_already_cached: unique.length - toProcess.length 
    });

  } catch (error) {
    console.error("Fatal Cron Job Collapse:", error);
    return Response.json({ error: "Failed to process cron cycle." }, { status: 500 });
  }
}
