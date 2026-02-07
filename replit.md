# Toxic-APIs - RESTful API Service

## Overview
A comprehensive API service with 49 working scrapers running on Replit (backend) and a standalone static HTML documentation site (`apis.html`) for Netlify deployment. All scrapers sourced from the ScraperCode/Scraper repository and user-provided sources.

## Architecture
- **Backend**: Express.js with 49 scraper endpoints running on Replit
- **Frontend (React)**: React + TypeScript + Tailwind CSS + shadcn/ui (Replit-hosted)
- **Frontend (Static)**: `apis.html` - standalone HTML file for Netlify deployment
- **Database**: PostgreSQL (visitor tracking) + JSON file persistence (data/visitor-stats.json)
- **Scrapers**: 49 CommonJS scraper modules in `scrapers/` directory, loaded via `createRequire` for ESM compatibility
- **Rate Limiting**: express-rate-limit, 60 req/min per IP, skips health/status endpoints
- **Routing**: wouter for client-side routing
- **State Management**: TanStack React Query

## Key Features
- 49 API endpoints across 7 categories (AI, Downloaders, Anime & Manga, Gaming, Search, Tools, Sports)
- Duplicate platform scrapers versioned with dlv1/dlv2/dlv3/dlv4 labels (Twitter, YouTube)
- All scrapers run locally on the Replit backend (no external API proxy)
- Standalone `apis.html` with try-it-out, status checking, code examples, copy buttons
- Interactive API testing with real responses
- POST endpoints show programmatic usage notice
- Code examples in JavaScript, Python, and cURL with copy buttons
- Rich CSS animations in apis.html: particles, gradient text, scroll-reveal, shimmer
- Rate limiting (60 req/min per IP) with helpful error messages
- Visitor tracking with JSON file persistence (survives DB resets)
- Automatic cleanup of visit logs older than 30 days
- 404 handler for unknown API routes
- CORS enabled on all routes
- Creator field: "xh_clinton" on all API responses

## Scraper Loading Pattern
```typescript
import { createRequire } from "module";
const loadScraper = (name: string) => {
  const mod = createRequire(__filename)(path.join(__dirname, '..', 'scrapers', name + '.cjs'));
  return mod;
};
```

## API Categories & Endpoints
- **AI** (7): Claude AI, Gemini AI, NoteGPT, AI Image Generator, Vider AI Art, WormGPT, AI Image Editor
- **Downloaders** (15): Facebook, Instagram, Twitter/X dlv1, Twitter/X dlv2, Douyin, YouTube dlv1, YouTube dlv2, YouTube dlv3, YouTube dlv4, YouTube MP3, YouTube MP3 v2, MediaFire, TeraBox, Downr Universal
- **Anime & Manga** (8): Doronime, OtakDesu, Donghua Film, Nanobana AI (POST), KomikCast, KomikIndo, OppaDrama, DramaBox
- **Gaming** (3): Enka Network (Genshin), Free Fire Characters, Character Guide
- **Search** (5): Song Finder, F-Droid Apps, Meme Templates, Sound Effects, Spotify Search
- **Tools** (6): Image Upscaler, YouTube Transcript, Currency Converter, Korean Name Generator, Random ASCII Art, Temp Mail
- **Sports** (5): Football Live Scores, Football Standings, NBA Scores, Cricket Scores

## Duplicate Scraper Versioning
When multiple scrapers serve the same platform, they are versioned:
- **Twitter/X**: `/download/x` (dlv1 - x2twitter), `/download/xv2` (dlv2 - expertsphp)
- **YouTube**: `/download/youtube` (dlv1 - ytdown), `/download/youtube2` (dlv2 - ytdown2), `/download/youtubev3` (dlv3 - ytdown.to), `/download/youtubev4` (dlv4 - SaveTube)

## API Route Patterns
All routes are in `server/routes.ts`:
- `/ai/*` - AI endpoints (claude, gemini, notegpt, imagine, vider, wormgpt, editimg)
- `/download/*` - Media downloader endpoints (including xv2, youtubev3, youtubev4, ytmp3, ytmp3v2)
- `/anime/*`, `/manga/*`, `/drama/*` - Anime & manga endpoints
- `/game/*` - Gaming endpoints
- `/search/*` - Search endpoints (including spotify)
- `/tools/*` - Utility tool endpoints (including tempmail)
- `/sports/*` - Sports endpoints (football, football-standings, nba, cricket)

Response format: `{ status: true, creator: "xh_clinton", data: {...} }`

## Database Schema
- `visitors` - Aggregate visitor statistics
- `visit_logs` - Individual visit records for tracking unique visitors
- `data/visitor-stats.json` - JSON file persistence for visitor stats (atomic writes, survives DB resets)

## Static Frontend (apis.html)
- Standalone HTML file at project root, also served at `/apis.html` by Express
- For Netlify deployment at `https://xhclinton.com/apis`
- Backend URL: `https://toxic-apis.replit.app` (BACKEND constant)
- Code examples use `https://xhclinton.com/apis` as the site URL (SITE_URL constant)
- Features: loading screen animation, notification system, hero section, docs with try-it-out, status monitoring, code examples, search/filter, scroll reveal, particles, mobile responsive
- Premium UI: gradient text, shimmer effects, glass morphism nav, floating particles, glow orbs, animated counters, back-to-top button, hamburger menu for mobile, visitor counter, copy buttons for responses/URLs/code

## GitHub
- Repository: `xhclintohn/P` (main branch)
- Pushed via Octokit GitHub integration (`scripts/push-to-github.ts`)

## Recent Changes
- Feb 7, 2026: Expanded to 49 endpoints - added 6 new scrapers: AI Image Editor, Twitter/X dlv2, YouTube dlv3/dlv4, Spotify Search, Temp Mail Generator
- Feb 7, 2026: Implemented duplicate scraper versioning (dlv1, dlv2, dlv3, dlv4) for Twitter and YouTube platforms
- Feb 7, 2026: Redesigned apis.html top bar - streamlined to show only: logo, visitors, 49 endpoints, battery %, clock, Visit Docs button. Removed GitHub from top bar (moved to footer)
- Feb 7, 2026: Added floating sticky category navigation bar - appears when scrolling to docs, accessible throughout documentation section
- Feb 7, 2026: Fixed OtakDesu scraper to use correct method names (searchAnime, getLatestAnime)
- Feb 7, 2026: Fixed Base URL display to show backend URL (toxic-apis.replit.app) instead of docs site URL
- Feb 7, 2026: Enhanced status checking validates JSON response status field for accurate health monitoring
- Feb 7, 2026: Changed creator field from "Toxic-APIs" to "xh_clinton" across all responses
- Feb 7, 2026: Added rate limiting (60 req/min per IP), visitor JSON persistence, auto-cleanup of old visit logs, 404 handler
- Feb 7, 2026: Complete apis.html premium UI overhaul - loading screen, notification system, lots of animations, mobile-responsive, copy buttons, visitor counter
- Feb 7, 2026: Pushed 167 files to GitHub (xhclintohn/P)
