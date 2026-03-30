import { supabaseServer as supabase } from '@/lib/supabase/server';

export const maxDuration = 60; // Allow Vercel functions to run up to 60s for batch processing.
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET_KEY || process.env.CRON_SECRET;

  // 1. Enhanced Security: Support both header and query param
  const isAuthorized = (cronSecret && (
    authHeader === `Bearer ${cronSecret}` || 
    secret === cronSecret
  ));

  if (!isAuthorized) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 2. Smart Auto-Fetch: Check last_fetch_at in Supabase
    const { data: settings } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'last_fetch_at')
      .single();

    const lastFetch = settings?.value ? new Date(settings.value as string) : new Date(0);
    const now = new Date();
    const minutesSinceLastFetch = (now.getTime() - lastFetch.getTime()) / (1000 * 60);

    if (minutesSinceLastFetch < 10) {
      console.log(`CRON SKIP: Last fetch was ${Math.round(minutesSinceLastFetch)}m ago. Minimum 10m required.`);
      return Response.json({ status: "skipped", reason: "Throttled (10m rule)", minutes_remaining: Math.round(10 - minutesSinceLastFetch) });
    }

    console.log("CRON JOB INIT: Fetching fresh global intelligence...");

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

    if (rawArticles.length > 0) {
      const unique = Array.from(new Map(rawArticles.filter(a => a.url).map(a => [a.url, a])).values());
      const urls = unique.map(a => a.url);
      const { data: existing } = await supabase.from('news').select('url').in('url', urls).not('ai_headline', 'is', null);
      const existingUrls = new Set(existing?.map(e => e.url) || []);
      const toProcess = unique.filter(a => !existingUrls.has(a.url)).slice(0, 5);

      console.log(`CRON STATUS: Processing ${toProcess.length} new articles.`);
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
          if (data.status === 'success') {
            const cleanJson = data.text.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            processed.push({ ...article, ...parsed });
          } else {
            processed.push(article);
          }
        } catch (err) {
          processed.push(article);
        }
      }

      if (processed.length > 0) {
        await supabase.from('news').upsert(processed, { onConflict: 'url' });
      }

      // 3. Update last_fetch_at in Database
      await supabase.from('system_settings').upsert({ key: 'last_fetch_at', value: now.toISOString() }, { onConflict: 'key' });

      return Response.json({ status: "success", articles_processed: processed.length });
    }

    return Response.json({ status: "No new articles found." });

  } catch (error) {
    console.error("CRON ERROR:", error);
    return Response.json({ error: "Failed to process cron cycle." }, { status: 500 });
  }
}
