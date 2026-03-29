import { supabaseServer as supabaseAdmin } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password, fullName } = await req.json();

    if (!email || !password || !fullName) {
      return Response.json({ error: "All fields are required." }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    // Check if email already exists
    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      return Response.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    // Hash password with bcrypt (10 rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user — note: column is "full name" with a space
    const { data: newUser, error } = await supabaseAdmin
      .from("users")
      .insert({
        email: email.toLowerCase(),
        "full name": fullName,
        password: hashedPassword,
      })
      .select("id, email, \"full name\", created_at")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return Response.json({ error: "Failed to create account. Please try again." }, { status: 500 });
    }

    return Response.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser["full name"],
        createdAt: newUser.created_at,
      }
    }, { status: 201 });

  } catch (err) {
    console.error("Signup error:", err);
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}
