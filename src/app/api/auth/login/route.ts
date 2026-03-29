import { supabaseServer as supabaseAdmin } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: "Email and password are required." }, { status: 400 });
    }

    // Fetch user by email (use service role to bypass RLS)
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, email, \"full name\", password, created_at")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !user) {
      return Response.json({ error: "No account found with this email." }, { status: 404 });
    }

    // Compare password with bcrypt hash
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return Response.json({ error: "Incorrect password. Please try again." }, { status: 401 });
    }

    // Return user data (never return password hash to client)
    return Response.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user["full name"],
        createdAt: user.created_at,
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}
