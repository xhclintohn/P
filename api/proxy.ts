import type { VercelRequest, VercelResponse } from "@vercel/node";

const BASE_API_URL = "https://toxic-api-site.vercel.app";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const targetPath = req.query.path as string;
    if (!targetPath) {
      return res.status(400).json({ error: "path parameter is required" });
    }

    const queryParams = { ...req.query };
    delete queryParams.path;
    const entries = Object.entries(queryParams).filter(([_, v]) => v !== undefined);
    const queryString = entries
      .map(([k, v]) => `${k}=${encodeURIComponent(Array.isArray(v) ? v[0] : v as string)}`)
      .join("&");

    const url = `${BASE_API_URL}${targetPath}${queryString ? "?" + queryString : ""}`;

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
      return res.status(200).json(json);
    } catch {
      return res.status(200).json({ rawResponse: text });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Proxy request failed" });
  }
}
