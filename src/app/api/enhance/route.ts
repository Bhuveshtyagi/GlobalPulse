import { supabaseServer as supabase } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const { url, title, description, content } = await req.json();
  if (!url) return Response.json({ error: "Missing URL" }, { status: 400 });

  try {
    // 1. Check Database for cached AI generated content
    const { data: existing } = await supabase.from('news').select('*').eq('url', url).single();
    if (existing && existing.summary) {
      return Response.json({
        summary: existing.summary,
        why_it_matters: existing.why_it_matters,
        ai_headline: existing.ai_headline
      });
    }

    // 2. Generate Intelligence via PicoApps
    const prompt = `Analyze this news article:\nTitle: ${title}\nContent: ${content || description || 'N/A'}\n\nProvide a strict JSON response with exactly three keys:\n1. "ai_headline": A shorter, punchier rewritten headline (under 60 chars).\n2. "summary": A strict 2-line summary of the key facts.\n3. "why_it_matters": A 1-2 sentence explanation of the broader geopolitical or financial consequences.\n\nOnly output valid JSON. No markdown ticks.`;

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

    // 4. Save to Database
    await supabase.from('news').upsert({
      url,
      ai_headline: parsed.ai_headline || title,
      summary: parsed.summary || 'Summary generation failed.',
      why_it_matters: parsed.why_it_matters || 'Impact unclear.'
    });

    return Response.json(parsed);
  } catch (error) {
    console.error("Enhance API Error:", error);
    return Response.json({ 
      summary: "Signal degraded. AI analysis failed.", 
      why_it_matters: "Error parsing intelligence stream.",
      ai_headline: title
    }, { status: 200 }); 
  }
}
