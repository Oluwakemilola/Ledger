# Ledger — SME Expense Tracker

## Stack
- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS 4**
- **MongoDB** via Mongoose
- Fonts self-hosted via `@fontsource` (no external font requests at build/runtime)

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then fill in MONGODB_URI and JWT_SECRET
npm run dev
```

Visit http://localhost:3000

## Project structure

```
src/
  app/
    layout.tsx        # root layout, metadata
    page.tsx           # landing page
    globals.css         # design tokens (colors, fonts) + Tailwind import
    api/                # API routes go here (next piece we build)
  components/
    LedgerHero.tsx      # animated hero ledger widget
  lib/
    mongodb.ts          # cached Mongoose connection helper
```

## Environment variables

See `.env.local.example`. You'll need:
- `MONGODB_URI` — a MongoDB Atlas connection string (free tier is fine to start)
- `JWT_SECRET` — any long random string, used to sign auth tokens

## Deploying

This is built to deploy on Vercel:
1. Push this repo to GitHub
2. Import it in Vercel
3. Add `MONGODB_URI` and `JWT_SECRET` as environment variables in Vercel's project settings
4. Deploy
