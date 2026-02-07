import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

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

let cachedStatuses: Record<string, EndpointStatusResult> = {};
let lastStatusCheck = 0;
const STATUS_CACHE_TTL = 60000;

async function checkEndpointStatus(
  path: string
): Promise<EndpointStatusResult> {
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
    return {
      path,
      isOnline,
      responseTime,
      lastChecked: new Date().toISOString(),
    };
  } catch {
    return {
      path,
      isOnline: false,
      responseTime: null,
      lastChecked: new Date().toISOString(),
    };
  }
}

async function checkAllEndpoints(): Promise<Record<string, EndpointStatusResult>> {
  const now = Date.now();
  if (now - lastStatusCheck < STATUS_CACHE_TTL && Object.keys(cachedStatuses).length > 0) {
    return cachedStatuses;
  }

  const batchSize = 5;
  const results: Record<string, EndpointStatusResult> = {};

  for (let i = 0; i < endpointPaths.length; i += batchSize) {
    const batch = endpointPaths.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((path) => checkEndpointStatus(path))
    );
    batchResults.forEach((result) => {
      results[result.path] = result;
    });
  }

  cachedStatuses = results;
  lastStatusCheck = now;
  return results;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/endpoints/status", async (_req, res) => {
    try {
      const statuses = await checkAllEndpoints();
      res.json(statuses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/visitors/track", async (req, res) => {
    try {
      const { visitorId, page } = req.body;
      if (!visitorId) {
        return res.status(400).json({ error: "visitorId is required" });
      }
      await storage.trackVisit(visitorId, page || "/");
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/proxy", async (req, res) => {
    try {
      const targetPath = req.query.path as string;
      if (!targetPath) {
        return res.status(400).json({ error: "path parameter is required" });
      }

      const queryParams = { ...req.query };
      delete queryParams.path;
      const queryString = Object.entries(queryParams)
        .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
        .join("&");

      const url = `${BASE_API_URL}${targetPath}${queryString ? "?" + queryString : ""}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("text/html")) {
        return res.status(502).json({
          error: "API endpoint returned HTML instead of data. The endpoint may be unavailable or the API server may be down.",
          status: "unavailable",
        });
      }

      if (contentType.startsWith("image/")) {
        res.setHeader("Content-Type", contentType);
        const buffer = await response.arrayBuffer();
        return res.send(Buffer.from(buffer));
      }

      if (contentType.includes("audio/")) {
        res.setHeader("Content-Type", contentType);
        const buffer = await response.arrayBuffer();
        return res.send(Buffer.from(buffer));
      }

      const text = await response.text();
      try {
        const json = JSON.parse(text);
        res.json(json);
      } catch {
        res.json({ rawResponse: text });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Proxy request failed" });
    }
  });

  app.get("/api/visitors/stats", async (_req, res) => {
    try {
      const stats = await storage.getVisitorStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
