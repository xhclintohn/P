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
- 42+ API endpoints across 8 categories
- Live endpoint status monitoring with glowing green/red indicators
- Visitor analytics (total visits, unique visitors, daily visits)
- Interactive API testing ("Try It Out" feature)
- Dark/light theme toggle
- Responsive mobile-first design
- Category-based endpoint browsing
- Code examples in JavaScript, Python, and cURL

## Pages
- `/` - Home page with hero, features, stats, categories, quick start
- `/docs` - API documentation with search, category filtering, endpoint testing
- `/status` - Real-time status monitoring of all endpoints with visitor analytics

## External API
The endpoints connect to: `https://toxic-api-site.vercel.app`

## Database Schema
- `visitors` - Aggregate visitor statistics
- `visit_logs` - Individual visit records for tracking unique visitors

## API Routes
- `GET /api/endpoints/status` - Check status of all external API endpoints
- `POST /api/visitors/track` - Track page visits
- `GET /api/visitors/stats` - Get visitor statistics

## Recent Changes
- Feb 7, 2026: Complete rebuild with React/shadcn/ui, removed all emojis replaced with lucide-react icons, added glowing status dots, visitor tracking, 42+ endpoints across 8 categories, back navigation everywhere, dark/light theme
