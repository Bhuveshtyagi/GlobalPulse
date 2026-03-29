export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || "";

    // Inject real-time news into the system prompt
    let liveNewsContext = "";
    try {
      const newsRes = await fetch(`https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_API_KEY}&language=en&category=top,business,politics&size=10`);
      const newsData = await newsRes.json();
      if (newsData && newsData.results) {
        liveNewsContext = "\n\nLATEST LIVE HEADLINES:\n" + newsData.results.map((n: any) => `- ${n.title}`).join('\n');
      }
    } catch (err) {
      console.error("Failed to fetch live context for Chatbot", err);
    }

    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const systemPrompt = `You are an expert geopolitical and financial intelligence analyst for GlobalPulse. Today's date is ${currentDate}. You give opinions based on research regarding geopolitics, finance, and consequences. Be cold, analytical, and professional.${liveNewsContext}\n\nUser Question: ${lastMessage}\n\nRespond as the analyst. Do not use markdown code blocks for the response itself.`;

    const response = await fetch(`https://backend.buildpicoapps.com/aero/run/llm-api?pk=${process.env.PICO_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: systemPrompt })
    });

    const data = await response.json();
    const aiText = data.status === 'success' ? data.text : "Signal Degraded. Intelligence Node Error.";

    // Encapsulate in a stream to keep frontend compatibility
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(aiText));
        controller.close();
      }
    });

    return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response("Error connecting to intelligence node.", { status: 500 });
  }
}
