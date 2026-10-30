// Cloudflare Worker: keeps your Anthropic API key private.
// Settings > Variables: secret ANTHROPIC_API_KEY, text ALLOWED_ORIGIN (e.g. https://yourname.github.io)
const PROMPT = `You are a plant pathologist helping small farmers in India. Look at the attached photo of a crop plant.
Reply with ONLY one JSON object with keys "valid" (false if no plant/leaf is visible), "en" and "hi" (same content in English and in simple Hindi).
Each of "en" and "hi" has: "plant" (crop name), "disease" (most likely disease, pest or deficiency; if healthy say so), "healthy" (boolean), "confidence" ("high","medium" or "low"), "severity" ("none","mild","moderate" or "severe"), "symptoms" (max 3 short strings of what is visible), "cure" (3 to 5 short steps: a low-cost or organic option first, then a chemical option naming the active ingredient with the label-recommended dose, and what to remove or stop doing), "prevention" (max 3 short strings), "expert" (one sentence on when to contact an agriculture expert).
Use simple words a farmer understands. If unsure between diseases, name the most likely one and say so in "expert". Never invent a certain diagnosis from an unclear photo.`;

export default {
  async fetch(req, env) {
    const cors = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    };
    const out = (o, status = 200) =>
      new Response(JSON.stringify(o), { status, headers: { ...cors, "Content-Type": "application/json" } });
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST" || req.headers.get("Origin") !== env.ALLOWED_ORIGIN) return out({ error: "forbidden" }, 403);

    let image;
    try { ({ image } = await req.json()); } catch { return out({ error: "bad request" }, 400); }
    if (typeof image !== "string" || image.length < 100 || image.length > 3_000_000) return out({ error: "bad image" }, 400);

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-5-5",
        max_tokens: 2000,
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: image } },
          { type: "text", text: PROMPT },
        ] }],
      }),
    });
    if (r.status === 429) return out({ error: "rate" }, 429);
    if (!r.ok) return out({ error: "upstream" }, 502);
    const text = ((await r.json()).content || []).map(b => b.text || "").join("");
    try {
      return out(JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)));
    } catch { return out({ error: "unreadable" }, 502); }
  },
};
