import { supabaseServer as supabase } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes("@")) {
      return Response.json({ success: false, error: "Invalid email" }, { status: 400 });
    }

    const { error } = await supabase
      .from("newsletter")
      .insert([{ email }]);

    if (error) {
      if (error.code === "23505") {
        return Response.json({ success: true, message: "Already subscribed." });
      }
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
