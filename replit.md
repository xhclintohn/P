# Toxic-APIs Documentation Site

## Overview
A powerful, beautiful API documentation and monitoring site for Toxic-APIs - a RESTful API service with AI integration, media downloaders, random content generators, and image processing tools.

## Architecture
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui components
- **Backend**: Express.js API routes
- **Database**: PostgreSQL (visitor tracking)
- **Routing**: wouter for client-side routing
- **State Management**: TanStack React Query

## Key Features
- 58+ API endpoints across 8 categories
- Live endpoint status monitoring with glowing green/red indicators
- Visitor analytics (total visits, unique visitors, daily visits)
- Interactive API testing ("Try It Out" feature) via backend proxy (CORS-free)
- Dark/light theme toggle (defaults to dark)
- Animated splash screen on first visit
- Loading skeletons on docs and status pages
- Responsive mobile-first design with horizontal scrollable categories
- Category-based endpoint browsing
- Code examples in JavaScript, Python, and cURL
- Staggered CSS animations throughout (no animation libraries)
- Gradient backgrounds with floating particles
- Glassmorphism UI effects

## Pages
- `/` - Home page with animated hero, gradient text, floating particles, stats, features, categories, code examples, CTA
- `/docs` - API documentation with search, horizontal scrollable category filters on mobile, loading skeletons, enhanced "Try It Out" with dark code viewer
- `/status` - Real-time status monitoring with loading skeletons, staggered animations, visitor analytics

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
- Feb 7, 2026: Added CORS proxy, 15 new endpoints (58+ total), splash screen, loading skeletons, complete UI rewrite with animations/gradients/particles, pushed to GitHub
- Feb 7, 2026: Complete rebuild with React/shadcn/ui, removed all emojis replaced with lucide-react icons, added glowing status dots, visitor tracking, dark/light theme
