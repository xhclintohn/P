import type { VercelRequest, VercelResponse } from "@vercel/node";

const BASE_API_URL = "https://api-ten-chi-14.vercel.app";

const endpointPaths = [
  "/ai/claude",
  "/ai/gemini",
  "/ai/notegpt",
  "/ai/imagine",
  "/ai/vider",
  "/download/facebook",
  "/download/instagram",
  "/download/x",
  "/download/douyin",
  "/download/youtube",
  "/download/mediafire",
  "/download/terabox",
  "/download/capcut",
  "/download/snackvideo",
  "/anime/doronime",
  "/anime/otakdesu",
  "/anime/donghua",
  "/manga/komikcast",
  "/manga/komikindo",
  "/drama/oppadrama",
  "/drama/dramabox",
  "/anime/nanobana",
  "/game/enka",
  "/game/ff-character",
  "/game/character-guide",
  "/search/song",
  "/search/fdroid",
  "/search/meme",
  "/search/sounds",
  "/tools/upscale",
  "/tools/transcript",
  "/tools/currency",
  "/tools/korean-name",
  "/tools/ascii",
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
    const contentType = response.headers.get("content-type") || "";
    const isHtml = contentType.includes("text/html");
    const isOnline = response.status < 500 && !isHtml;
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
