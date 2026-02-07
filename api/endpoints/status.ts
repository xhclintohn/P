import type { VercelRequest, VercelResponse } from "@vercel/node";

const BASE_API_URL = "https://toxic-api-site.vercel.app";

const endpointPaths = [
  "/ai/oss",
  "/download/capcut",
  "/download/facebook",
  "/download/snackvideo",
  "/download/x",
  "/download/mediafire",
  "/download/tiktok",
  "/download/instagram",
  "/download/youtube",
  "/download/pinterest",
  "/download/spotify",
  "/random/ba",
  "/random/waifu",
  "/random/papayang",
  "/random/anime",
  "/random/meme",
  "/random/quote",
  "/random/joke",
  "/random/fact",
  "/tools/unblur",
  "/tools/screenshot",
  "/tools/qrcode",
  "/tools/shorten",
  "/tools/palette",
  "/search/google",
  "/search/wikipedia",
  "/search/github",
  "/search/npm",
  "/search/lyrics",
  "/info/ip",
  "/info/weather",
  "/info/currency",
  "/info/whois",
  "/info/translate",
  "/convert/tts",
  "/convert/base64/encode",
  "/convert/base64/decode",
  "/convert/md2html",
  "/api/status",
  "/api/health",
  "/api/endpoints",
  "/api/cache/stats",
  "/api/stats/top",
  "/random/sports",
  "/random/dadjoke",
  "/random/riddle",
  "/random/pickup",
  "/random/wyr",
  "/random/tod",
  "/ai/imagine",
  "/ai/summarize",
  "/search/anime",
  "/search/movie",
  "/search/sticker",
  "/tools/text2img",
  "/tools/removebg",
  "/info/country",
  "/info/crypto",
];

interface EndpointStatusResult {
  path: string;
  isOnline: boolean;
  responseTime: number | null;
  lastChecked: string;
}

async function checkEndpointStatus(path: string): Promise<EndpointStatusResult> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(`${BASE_API_URL}${path}`, {
      signal: controller.signal,
      method: "GET",
    });
    clearTimeout(timeout);
    const responseTime = Date.now() - start;
    const isOnline = response.status < 500;
    return { path, isOnline, responseTime, lastChecked: new Date().toISOString() };
  } catch {
    return { path, isOnline: false, responseTime: null, lastChecked: new Date().toISOString() };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const batchSize = 5;
    const results: Record<string, EndpointStatusResult> = {};

    for (let i = 0; i < endpointPaths.length; i += batchSize) {
      const batch = endpointPaths.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map((p) => checkEndpointStatus(p)));
      batchResults.forEach((result) => {
        results[result.path] = result;
      });
    }

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    return res.status(200).json(results);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
