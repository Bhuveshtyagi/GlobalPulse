import { supabaseServer as supabase } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { email, article_url, rating, review_text } = await req.json();

    if (!email || !article_url || !rating) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return Response.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // Upsert — one review per user per article, updating if they review again
    const { error } = await supabase
      .from('user_reviews')
      .upsert({
        user_email: email,
        article_url,
        rating,
        review_text: review_text?.trim() || null,
        created_at: new Date().toISOString(),
      }, { onConflict: 'user_email,article_url' });

    if (error) {
      console.error("Review save error:", error);
      return Response.json({ error: "Failed to save review" }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Review API Error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
