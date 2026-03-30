export async function GET() {
  return Response.json({
    envCheck: {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseService: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      picoKey: !!process.env.PICO_API_KEY,
      cronSecret: !!process.env.CRON_SECRET_KEY,
    },
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}
