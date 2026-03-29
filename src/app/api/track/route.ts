import { supabaseServer as supabase } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { email, url, category, readTimeSeconds } = await req.json();
    if (!email || !url) return Response.json({ error: "Missing required fields" }, { status: 400 });

    // Secure edge check for interaction existence
    const { data: existing } = await supabase
      .from('user_interactions')
      .select('*')
      .eq('user_email', email)
      .eq('article_url', url)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('user_interactions')
        .update({
          clicks: existing.clicks + 1,
          read_time_seconds: existing.read_time_seconds + (readTimeSeconds || 0),
          last_interaction: new Date().toISOString()
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('user_interactions')
        .insert({
          user_email: email,
          article_url: url,
          category: category || 'top',
          clicks: 1,
          read_time_seconds: readTimeSeconds || 0,
        });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Telemetry API Error:", err);
    return Response.json({ error: "Server error during telemetry ingestion" }, { status: 500 });
  }
}
