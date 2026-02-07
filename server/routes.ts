import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const loadScraper = (name: string) => {
  const mod = createRequire(__filename)(path.join(__dirname, '..', 'scrapers', name));
  return mod;
};

const endpointPaths = [
  "/ai/claude", "/ai/gemini", "/ai/notegpt", "/ai/imagine", "/ai/vider",
  "/download/facebook", "/download/instagram", "/download/x", "/download/douyin",
  "/download/youtube", "/download/youtube2", "/download/mediafire", "/download/terabox",
  "/download/downr",
  "/anime/doronime", "/anime/otakdesu", "/anime/donghua", "/anime/nanobana",
  "/manga/komikcast", "/manga/komikindo",
  "/drama/oppadrama", "/drama/dramabox",
  "/game/enka", "/game/ff-character", "/game/character-guide",
  "/search/song", "/search/fdroid", "/search/meme", "/search/sounds",
  "/tools/upscale", "/tools/transcript", "/tools/currency", "/tools/korean-name", "/tools/ascii",
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

async function checkEndpointStatus(basePath: string, apiBasePath: string): Promise<EndpointStatusResult> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const url = `${apiBasePath}${basePath}`;
    const response = await fetch(url, { signal: controller.signal, method: "GET" });
    clearTimeout(timeout);
    const responseTime = Date.now() - start;
    const contentType = response.headers.get("content-type") || "";
    const isHtml = contentType.includes("text/html");
    const isOnline = response.status < 500 && !isHtml;
    return { path: basePath, isOnline, responseTime, lastChecked: new Date().toISOString() };
  } catch {
    return { path: basePath, isOnline: false, responseTime: null, lastChecked: new Date().toISOString() };
  }
}

async function checkAllEndpoints(selfUrl: string): Promise<Record<string, EndpointStatusResult>> {
  const now = Date.now();
  if (now - lastStatusCheck < STATUS_CACHE_TTL && Object.keys(cachedStatuses).length > 0) {
    return cachedStatuses;
  }

  const batchSize = 6;
  const results: Record<string, EndpointStatusResult> = {};

  for (let i = 0; i < endpointPaths.length; i += batchSize) {
    const batch = endpointPaths.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((p) => checkEndpointStatus(p, selfUrl))
    );
    batchResults.forEach((result) => { results[result.path] = result; });
  }

  cachedStatuses = results;
  lastStatusCheck = now;
  return results;
}

function wrapHandler(fn: (req: Request, res: Response) => Promise<any>) {
  return async (req: Request, res: Response) => {
    try {
      await fn(req, res);
    } catch (error: any) {
      console.error(`API Error [${req.path}]:`, error.message);
      if (!res.headersSent) {
        res.status(500).json({
          status: false,
          error: error.message || "Internal server error",
          path: req.path
        });
      }
    }
  };
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Serve apis.html as a standalone static file before SPA catch-all
  app.get("/apis.html", (_req, res) => {
    const apisPath = path.join(__dirname, "..", "apis.html");
    if (fs.existsSync(apisPath)) {
      res.sendFile(apisPath);
    } else {
      res.status(404).send("Not found");
    }
  });

  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  }));

  // ---------- AI ROUTES ----------
  app.get("/ai/claude", wrapHandler(async (req, res) => {
    const { claude } = loadScraper("cloude");
    const text = (req.query.text as string) || "Hello";
    const result = await claude(text);
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  app.get("/ai/gemini", wrapHandler(async (req, res) => {
    const { Gemini } = loadScraper("gemini");
    const text = (req.query.text as string) || "Hello";
    const model = (req.query.model as string) || "gemini-2-5-flash";
    const gemini = new Gemini();
    const result = await gemini.sendMessage(text, model);
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  app.get("/ai/notegpt", wrapHandler(async (req, res) => {
    const { NoteGPTChat } = loadScraper("notegpt");
    const text = (req.query.text as string) || "Hello";
    const chat = new NoteGPTChat();
    const result = await chat.chat(text);
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  app.get("/ai/imagine", wrapHandler(async (req, res) => {
    const { UnrestrictedAIScraper } = loadScraper("unrestrictedaiscraper");
    const prompt = (req.query.prompt as string) || "beautiful sunset";
    const style = (req.query.style as string) || "photorealistic";
    const ai = new UnrestrictedAIScraper();
    const result = await ai.generateImage(prompt, style);
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  app.get("/ai/vider", wrapHandler(async (req, res) => {
    const { viderAi, viderImage } = loadScraper("vider");
    const prompt = (req.query.prompt as string);
    const taskId = (req.query.id as string);
    if (taskId) {
      const result = await viderImage(taskId);
      return res.json({ status: true, creator: "Toxic-APIs", data: result });
    }
    if (!prompt) return res.status(400).json({ status: false, error: "prompt or id parameter required" });
    const id = await viderAi(prompt);
    res.json({ status: true, creator: "Toxic-APIs", data: { taskId: id, message: "Task created. Use ?id=TASK_ID to check result." } });
  }));

  // ---------- DOWNLOADER ROUTES ----------
  app.get("/download/facebook", wrapHandler(async (req, res) => {
    const { downloadFacebookVideoSaveFBS } = loadScraper("fbdown");
    const url = req.query.url as string;
    if (!url) return res.status(400).json({ status: false, error: "url parameter required" });
    const result = await downloadFacebookVideoSaveFBS(url);
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  app.get("/download/instagram", wrapHandler(async (req, res) => {
    const { inflact } = loadScraper("instagram");
    const url = req.query.url as string;
    if (!url) return res.status(400).json({ status: false, error: "url parameter required" });
    const result = await inflact(url);
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  app.get("/download/x", wrapHandler(async (req, res) => {
    const { x2twitter } = loadScraper("x2twitter");
    const url = req.query.url as string;
    if (!url) return res.status(400).json({ status: false, error: "url parameter required" });
    const result = await x2twitter(url);
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  app.get("/download/douyin", wrapHandler(async (req, res) => {
    const { snapdouyin } = loadScraper("douyin");
    const url = req.query.url as string;
    if (!url) return res.status(400).json({ status: false, error: "url parameter required" });
    const result = await snapdouyin(url);
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  app.get("/download/youtube", wrapHandler(async (req, res) => {
    const { ytmp3 } = loadScraper("ytdown");
    const url = req.query.url as string;
    if (!url) return res.status(400).json({ status: false, error: "url parameter required" });
    const bitrate = (req.query.bitrate as string) || "128";
    const mode = (req.query.mode as string) || "video";
    const result = await ytmp3(bitrate, mode, url);
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  app.get("/download/youtube2", wrapHandler(async (req, res) => {
    const { ytdown2 } = loadScraper("ytdown2");
    const url = req.query.url as string;
    if (!url) return res.status(400).json({ status: false, error: "url parameter required" });
    const result = await ytdown2(url);
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  app.get("/download/mediafire", wrapHandler(async (req, res) => {
    const { mediafire } = loadScraper("mediafire");
    const url = req.query.url as string;
    if (!url) return res.status(400).json({ status: false, error: "url parameter required" });
    const result = await mediafire(url);
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  app.get("/download/terabox", wrapHandler(async (req, res) => {
    const { teraboxdl } = loadScraper("teraboxdl");
    const url = req.query.url as string;
    if (!url) return res.status(400).json({ status: false, error: "url parameter required" });
    const result = await teraboxdl(url);
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  app.get("/download/downr", wrapHandler(async (req, res) => {
    const { DownrScraper } = loadScraper("downr");
    const url = req.query.url as string;
    if (!url) return res.status(400).json({ status: false, error: "url parameter required" });
    const scraper = new DownrScraper();
    const result = await scraper.getVideoInfo(url);
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  // ---------- ANIME & MANGA ROUTES ----------
  app.get("/anime/doronime", wrapHandler(async (req, res) => {
    const { DoronimeScraper } = loadScraper("doronime");
    const q = (req.query.q as string) || "";
    const url = req.query.url as string;
    const scraper = new DoronimeScraper();
    if (url) {
      const result = await scraper.getDetails(url);
      return res.json({ status: true, creator: "Toxic-APIs", data: result });
    }
    if (!q) return res.status(400).json({ status: false, error: "q or url parameter required" });
    const result = await scraper.search(q);
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  app.get("/anime/otakdesu", wrapHandler(async (req, res) => {
    const { AnimeScraper } = loadScraper("otakdesu");
    const q = (req.query.q as string) || "";
    const scraper = new AnimeScraper();
    if (!q) {
      const result = await scraper.getLatest();
      return res.json({ status: true, creator: "Toxic-APIs", data: result });
    }
    const result = await scraper.search(q);
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  app.get("/anime/donghua", wrapHandler(async (req, res) => {
    const { donghua, detail } = loadScraper("donghuafilm");
    const q = req.query.q as string;
    const url = req.query.url as string;
    if (url) {
      const result = await detail(url);
      return res.json({ status: true, creator: "Toxic-APIs", data: result });
    }
    if (!q) return res.status(400).json({ status: false, error: "q or url parameter required" });
    const result = await donghua(q);
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  app.get("/anime/nanobana", wrapHandler(async (req, res) => {
    res.json({
      status: true,
      creator: "Toxic-APIs",
      data: { message: "Nanobana AI image generation requires file upload. Use POST with image file." }
    });
  }));

  app.get("/manga/komikcast", wrapHandler(async (req, res) => {
    const komikcast = loadScraper("komikcast");
    const q = req.query.q as string;
    const slug = req.query.slug as string;
    const page = parseInt(req.query.page as string) || 1;
    if (slug) {
      const result = await komikcast.detail(slug);
      return res.json({ status: true, creator: "Toxic-APIs", data: result });
    }
    if (q) {
      const result = await komikcast.search(q, page);
      return res.json({ status: true, creator: "Toxic-APIs", data: result });
    }
    const result = await komikcast.trending(page);
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  app.get("/manga/komikindo", wrapHandler(async (req, res) => {
    const { searchKomik, getDetail } = loadScraper("komikindo");
    const q = req.query.q as string;
    const url = req.query.url as string;
    if (url) {
      const result = await getDetail(url);
      return res.json({ status: true, creator: "Toxic-APIs", data: result });
    }
    if (!q) return res.status(400).json({ status: false, error: "q or url parameter required" });
    const result = await searchKomik(q);
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  app.get("/drama/oppadrama", wrapHandler(async (req, res) => {
    const oppadrama = loadScraper("oppadrama");
    const q = req.query.q as string;
    const url = req.query.url as string;
    if (url) {
      const result = await oppadrama.getDetail(url);
      return res.json({ status: true, creator: "Toxic-APIs", data: result });
    }
    if (!q) return res.status(400).json({ status: false, error: "q or url parameter required" });
    const result = await oppadrama.search(q);
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  app.get("/drama/dramabox", wrapHandler(async (req, res) => {
    const { dramabox, episode } = loadScraper("dramabox");
    const q = req.query.q as string;
    const url = req.query.url as string;
    if (url) {
      const result = await episode(url);
      return res.json({ status: true, creator: "Toxic-APIs", data: result });
    }
    if (!q) return res.status(400).json({ status: false, error: "q or url parameter required" });
    const result = await dramabox(q);
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  // ---------- GAMING ROUTES ----------
  app.get("/game/enka", wrapHandler(async (req, res) => {
    const { EnkaNetworkScraper } = loadScraper("enkanetwork");
    const uid = (req.query.uid as string) || "800103030";
    const scraper = new EnkaNetworkScraper(uid);
    const result = await scraper.scrape();
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  app.get("/game/ff-character", wrapHandler(async (req, res) => {
    const { ffKarakter } = loadScraper("ffKarakter");
    const result = await ffKarakter();
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  app.get("/game/character-guide", wrapHandler(async (req, res) => {
    const { scrapeCharacterGuide } = loadScraper("characterGuide");
    const name = (req.query.name as string) || "Raiden Shogun";
    const result = await scrapeCharacterGuide(name);
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  // ---------- SEARCH ROUTES ----------
  app.get("/search/song", wrapHandler(async (req, res) => {
    const { songfinder } = loadScraper("songfinder");
    const q = req.query.q as string;
    if (!q) return res.status(400).json({ status: false, error: "q parameter required" });
    const result = await songfinder(q);
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  app.get("/search/fdroid", wrapHandler(async (req, res) => {
    const fdroid = loadScraper("fdroid");
    const q = req.query.q as string;
    const url = req.query.url as string;
    if (url) {
      const result = await fdroid.details(url);
      return res.json({ status: true, creator: "Toxic-APIs", data: result });
    }
    if (!q) return res.status(400).json({ status: false, error: "q or url parameter required" });
    const result = await fdroid.search(q);
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  app.get("/search/meme", wrapHandler(async (req, res) => {
    const { ImgFlipScraper } = loadScraper("imgflip");
    const q = (req.query.q as string) || "";
    const scraper = new ImgFlipScraper();
    const result = q ? await scraper.searchMemes(q) : await scraper.scrapePopularMemes();
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  app.get("/search/sounds", wrapHandler(async (req, res) => {
    const { MyInstantsScraper } = loadScraper("myinstants");
    const scraper = new MyInstantsScraper();
    const result = await scraper.getAllInstantsWithDetails();
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  // ---------- TOOLS ROUTES ----------
  app.get("/tools/upscale", wrapHandler(async (req, res) => {
    const { imglargerGet } = loadScraper("imglarger");
    const code = req.query.code as string;
    if (!code) return res.status(400).json({
      status: false,
      error: "Image upscaling requires file upload (POST) to get a code, then use ?code=CODE to check status"
    });
    const result = await imglargerGet(code);
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  app.get("/tools/transcript", wrapHandler(async (req, res) => {
    const { transcript } = loadScraper("trancript");
    const url = req.query.url as string;
    if (!url) return res.status(400).json({ status: false, error: "url parameter required" });
    const result = await transcript(url);
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  app.get("/tools/currency", wrapHandler(async (req, res) => {
    const { XeCurrency } = loadScraper("xecurrency");
    const amount = parseFloat(req.query.amount as string) || 1000;
    const from = (req.query.from as string) || "USD";
    const to = (req.query.to as string) || "IDR";
    const result = await XeCurrency(amount, from, to);
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  app.get("/tools/korean-name", wrapHandler(async (req, res) => {
    const { getKoreanName } = loadScraper("namekoreagenerator");
    const name = (req.query.name as string) || "";
    const result = await getKoreanName(name);
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  app.get("/tools/ascii", wrapHandler(async (req, res) => {
    const { scrapeRandomAscii } = loadScraper("randomascii");
    const length = req.query.length as string;
    const count = req.query.count as string;
    const charset = (req.query.charset as string) || "all";
    const result = await scrapeRandomAscii({ length, count, charset });
    res.json({ status: true, creator: "Toxic-APIs", data: result });
  }));

  // ---------- STATUS & ANALYTICS ----------
  app.get("/api/endpoints/status", async (req, res) => {
    try {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const selfUrl = `${protocol}://${host}`;
      const statuses = await checkAllEndpoints(selfUrl);
      res.json(statuses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/visitors/track", async (req, res) => {
    try {
      const { visitorId, page } = req.body;
      if (!visitorId) return res.status(400).json({ error: "visitorId is required" });
      await storage.trackVisit(visitorId, page || "/");
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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

  app.get("/api/proxy", async (req, res) => {
    try {
      const targetPath = req.query.path as string;
      if (!targetPath) return res.status(400).json({ error: "path parameter is required" });

      const queryParams = { ...req.query };
      delete queryParams.path;

      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const selfBase = `${protocol}://${host}`;

      const queryString = Object.entries(queryParams)
        .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
        .join("&");
      const url = `${selfBase}${targetPath}${queryString ? "?" + queryString : ""}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      const contentType = response.headers.get("content-type") || "";

      if (contentType.startsWith("image/") || contentType.includes("audio/")) {
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
      if (error.name === "AbortError") {
        return res.status(504).json({ error: "Request timed out." });
      }
      res.status(500).json({ error: error.message || "Proxy request failed" });
    }
  });

  return httpServer;
}
