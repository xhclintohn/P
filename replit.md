# Toxic-APIs Documentation Site

## Overview
A powerful, beautiful API documentation and monitoring site for Toxic-APIs - a RESTful API service with AI chat, media downloaders, anime & manga scrapers, gaming tools, search utilities, and image processing tools. All endpoints verified against the ScraperCode/Scraper repository.

## Architecture
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui components
- **Backend**: Express.js API routes
- **Database**: PostgreSQL (visitor tracking)
- **Routing**: wouter for client-side routing
- **State Management**: TanStack React Query

## Key Features
- 34 API endpoints across 6 categories (AI, Downloaders, Anime & Manga, Gaming, Search, Tools)
- Live endpoint status monitoring with glowing green/red indicators
- Visitor analytics (total visits, unique visitors, daily visits)
- Interactive API testing ("Try It Out" feature) via backend proxy (CORS-free)
- POST endpoints show programmatic usage notice instead of browser test
- Dark/light theme toggle (defaults to dark)
- Animated splash screen on first visit
- Loading skeletons on docs and status pages
- Responsive mobile-first design with horizontal scrollable categories
- Category-based endpoint browsing
- Code examples in JavaScript, Python, and cURL with copy buttons
- Copy buttons for: response data, endpoint URLs, and request code examples
- Rich CSS animations: fade-in-up, slide-in, scale-in, pulse-glow, float, shimmer, gradient-flow, particle-float, scroll-reveal
- Gradient animated text, floating particles, shimmer backgrounds
- No animation libraries - all CSS keyframes

## Pages
- `/` - Home page with animated hero, gradient text, floating particles, scroll-reveal sections, animated counters, features, categories, code examples, CTA
- `/docs` - API documentation with search, sidebar category filters, loading skeletons, expandable endpoint cards, "Try It Out" with code viewer and copy buttons
- `/status` - Real-time status monitoring with loading skeletons, staggered animations, visitor analytics

## API Categories & Endpoints (from ScraperCode/Scraper repo)
- **AI** (5): Claude AI, Gemini AI, NoteGPT, AI Image Generator, Vider AI Art
- **Downloaders** (9): Facebook, Instagram, Twitter/X, Douyin, YouTube, MediaFire, TeraBox, GoFile Upload, Uplider
- **Anime & Manga** (8): Doronime, OtakDesu, Donghua Film, KomikCast, KomikIndo, OppaDrama, DramaBox, Nanobana
- **Gaming** (3): Enka Network (Genshin), Free Fire Characters, Character Guide
- **Search** (4): Song Finder, F-Droid Apps, Meme Templates, Sound Effects
- **Tools** (5): Image Upscaler, YouTube Transcript, Currency Converter, Korean Name Generator, Random ASCII Art

## External API
The endpoints connect to: `https://toxic-api-site.vercel.app`
All "Try It Out" requests go through `/api/proxy` to avoid CORS issues.

## Database Schema
- `visitors` - Aggregate visitor statistics
- `visit_logs` - Individual visit records for tracking unique visitors

## API Routes
- `GET /api/endpoints/status` - Check status of all external API endpoints
- `GET /api/proxy?path=/endpoint` - Proxy requests to external API (handles JSON, image, audio)
- `POST /api/visitors/track` - Track page visits
- `GET /api/visitors/stats` - Get visitor statistics

## Vercel Deployment
- Serverless functions in `api/` directory mirror Express routes
- `vercel.json` has rewrites for API routes and SPA fallback
- `api/proxy.ts` - Vercel serverless proxy function
- `api/endpoints/status.ts` - Vercel serverless status checker

## GitHub
- Repository: `xhclintohn/P` (main branch)
- Pushed via Octokit GitHub integration

## Recent Changes
- Feb 7, 2026: Rebuilt endpoints from 58+ to 34 verified endpoints matching actual ScraperCode/Scraper repo modules. Added rich CSS animations (scroll-reveal, floating particles, gradient text, shimmer effects, pulse-glow). Rewrote home page with exciting animated UI. Fixed POST endpoint handling in docs. Removed all fake/non-existent endpoints.
- Feb 7, 2026: Added CORS proxy, splash screen, loading skeletons, complete UI with animations/gradients/particles
- Feb 7, 2026: Complete rebuild with React/shadcn/ui, removed all emojis replaced with lucide-react icons, added glowing status dots, visitor tracking, dark/light theme
