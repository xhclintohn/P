# Toxic-APIs - RESTful API Service

## Overview
A comprehensive API service with 36 working scrapers running on Replit (backend) and a standalone static HTML documentation site (`apis.html`) for Netlify deployment. All scrapers sourced from the ScraperCode/Scraper repository.

## Architecture
- **Backend**: Express.js with 36 scraper endpoints running on Replit
- **Frontend (React)**: React + TypeScript + Tailwind CSS + shadcn/ui (Replit-hosted)
- **Frontend (Static)**: `apis.html` - standalone HTML file for Netlify deployment
- **Database**: PostgreSQL (visitor tracking)
- **Scrapers**: 36 CommonJS scraper modules in `scrapers/` directory, loaded via `createRequire` for ESM compatibility
- **Routing**: wouter for client-side routing
- **State Management**: TanStack React Query

## Key Features
- 36 API endpoints across 6 categories (AI, Downloaders, Anime & Manga, Gaming, Search, Tools)
- All scrapers run locally on the Replit backend (no external API proxy)
- Standalone `apis.html` with try-it-out, status checking, code examples
- Interactive API testing with real responses
- POST endpoints show programmatic usage notice
- Code examples in JavaScript, Python, and cURL with copy buttons
- Rich CSS animations in apis.html: particles, gradient text, scroll-reveal, shimmer
- CORS enabled on all routes

## Scraper Loading Pattern
```typescript
import { createRequire } from "module";
const loadScraper = (name: string) => {
  const mod = createRequire(__filename)(path.join(__dirname, '..', 'scrapers', name));
  return mod;
};
```

## API Categories & Endpoints
- **AI** (5): Claude AI, Gemini AI, NoteGPT, AI Image Generator, Vider AI Art
- **Downloaders** (9): Facebook, Instagram, Twitter/X, Douyin, YouTube, YouTube v2, MediaFire, TeraBox, Downr Universal
- **Anime & Manga** (8): Doronime, OtakDesu, Donghua Film, Nanobana AI (POST), KomikCast, KomikIndo, OppaDrama, DramaBox
- **Gaming** (3): Enka Network (Genshin), Free Fire Characters, Character Guide
- **Search** (4): Song Finder, F-Droid Apps, Meme Templates, Sound Effects
- **Tools** (5): Image Upscaler, YouTube Transcript, Currency Converter, Korean Name Generator, Random ASCII Art

## API Route Patterns
All routes are in `server/routes.ts`:
- `/ai/*` - AI endpoints (claude, gemini, notegpt, imagine, vider)
- `/download/*` - Media downloader endpoints
- `/anime/*`, `/manga/*`, `/drama/*` - Anime & manga endpoints
- `/game/*` - Gaming endpoints
- `/search/*` - Search endpoints
- `/tools/*` - Utility tool endpoints

Response format: `{ status: true, creator: "Toxic-APIs", data: {...} }`

## Database Schema
- `visitors` - Aggregate visitor statistics
- `visit_logs` - Individual visit records for tracking unique visitors

## Static Frontend (apis.html)
- Standalone HTML file at project root, also served at `/apis.html` by Express
- For Netlify deployment at `https://xhclinton.com/apis`
- Backend URL: `https://toxic-apis.replit.app` (BACKEND constant)
- Code examples use `https://xhclinton.com/apis` as the site URL (SITE_URL constant)
- Features: loading screen animation, notification system, hero section, docs with try-it-out, status monitoring, code examples, search/filter, scroll reveal, particles, mobile responsive
- Premium UI: gradient text, shimmer effects, glass morphism nav, floating particles, glow orbs, animated counters, back-to-top button, hamburger menu for mobile

## GitHub
- Repository: `xhclintohn/P` (main branch)
- Pushed via Octokit GitHub integration (`scripts/push-to-github.ts`)

## Recent Changes
- Feb 7, 2026: Complete apis.html premium UI overhaul - loading screen, notification system, lots of animations, mobile-responsive, sends requests to Replit backend, code examples use xhclinton.com/apis domain, pushed to GitHub
- Feb 7, 2026: Rewrote React frontend (docs, status, home pages) to hide all backend URLs from users
- Feb 7, 2026: Integrated 36 scrapers from ScraperCode/Scraper repo, created Express API routes with createRequire pattern, built standalone apis.html for Netlify, fixed ESM/CJS compatibility
- Feb 7, 2026: Fixed endpoint method/param alignment across React frontend, apis.html, and server routes
