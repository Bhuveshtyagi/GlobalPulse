export async function POST(req: Request) {
  try {
    const { country, headlines } = await req.json();
    
    if (!headlines || headlines.length === 0) {
      return Response.json({ text: "No localized intelligence available to summarize for this region." });
    }

    const systemPrompt = `You are a top-tier global intelligence analyst for GlobalPulse. Provide a sharp, concise situational summary (under 100 words) of the current events in ${country} based ONLY on these recent headlines. Focus on major geopolitical, economic, or critical shifts. Be extremely analytical and professional.\n\nHeadlines:\n${headlines.join('\n')}`;

    console.log(`[PicoAPI] Requesting summary for ${country}...`);
    const response = await fetch(`https://backend.buildpicoapps.com/aero/run/llm-api?pk=${process.env.PICO_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: systemPrompt })
    });

    const data = await response.json();
    return Response.json({ text: data.status === 'success' ? data.text : "Intelligence Node Error: Connection to LLM failed." });
  } catch (error) {
    console.error("Summarization Error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
