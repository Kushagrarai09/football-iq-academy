# ⚽ Football IQ Academy

### Understand the beautiful game. One decision at a time.

An interactive football learning platform built with **Next.js, React, TypeScript, and Tailwind CSS**.

## Features
- Interactive pitch, positions, formations, rules, tactics and quizzes.
- Arcade football game at `/play`.
- **Worldwide live scores at `/live`**, using API-Football fixtures with team names, crests, competition, score and status.
- Loading, empty, setup, and provider-error states.

## Run locally

Requirements: Node.js 20.9+ and npm.

```bash
git clone https://github.com/Kushagrarai09/football-iq-academy.git
cd football-iq-academy
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configure live scores

1. Create an account at [API-Football](https://www.api-football.com/) and review current competition coverage, rate limits, plan terms and update frequency.
2. Add your key to `.env.local`:

   ```env
   API_FOOTBALL_KEY=your_actual_api_key
   ```

3. Restart the local dev server and visit [http://localhost:3000/live](http://localhost:3000/live).
4. For Vercel, add `API_FOOTBALL_KEY` to Project Settings → Environment Variables and redeploy.

**Security:** this key is only read by `src/app/api/football/live/route.ts` on the server. Do not use `NEXT_PUBLIC_`, expose it in client components, or commit a real key. The `.env.example` value is a placeholder.

`GET /api/football/live` calls the provider's `/fixtures?live=all` endpoint and sends the key in the `x-apisports-key` header. It returns `{ matches, updatedAt }` on success; missing keys and upstream failures return controlled error responses. The page refreshes every 60 seconds. This MVP does not yet implement a shared cache, so add caching and quota protection before heavy traffic. Match coverage and details depend on the provider and subscription. This is match data, not live video.

## Build and test

```bash
npm test
npm run build
```

## Main routes

`/` home · `/basics` fundamentals · `/pitch` interactive pitch · `/rules` laws · `/positions` roles · `/formations` formations · `/tactics` tactics · `/skills` skills · `/play` arcade game · `/live` live scores · `/scenarios` scenarios · `/referee` referee learning · `/glossary` glossary · `/quiz` quiz · `/about` about.

## Resources
- [IFAB — Laws of the Game](https://www.theifab.com/laws/)
- [API-Football documentation](https://www.api-football.com/documentation-v3)
- [Next.js documentation](https://nextjs.org/docs)
- [Vercel documentation](https://vercel.com/docs)

## Disclaimer
Football IQ Academy is an independent educational project and is not affiliated with FIFA or IFAB. Match data may be delayed or incomplete. Verify data and asset licensing terms before commercial use.

No open-source license has been specified. Until one is added, assume standard copyright applies.
