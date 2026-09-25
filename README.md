# Valorant Esports
## What's here

- `client/` — React app (Vite). Landing page + the teams & fixtures page.
- `server/` — Express API. Stores teams, players and the bracket.

No database — the backend just reads/writes a JSON file
(`server/src/data/db.json`). Didn't see a reason to bring in Postgres or
Mongo for something this size.

## Stack

React + Vite, plain CSS (no Tailwind/component library — the retro look is
hand-written), React Router for the two pages. Backend is Node.js + Express.

## Running it locally

Needs Node 18+.

**Backend**

```
cd server
npm install
copy .env.example .env
npm run dev
```

Starts on `http://localhost:4000`.

**Frontend** (separate terminal)

```
cd client
npm install
copy .env.example .env
npm run dev
```

Starts on `http://localhost:5173` and calls whatever `VITE_API_URL` points
to in `.env`.

## How it works

- Register up to 5 teams, then add players to each — capped at 5 per team,
  enforced on both the form and the API so it can't be bypassed with a
  direct request.
- Nothing is pre-filled — the tournament starts empty. If you'd rather not
  type 25 players by hand, the Teams & Fixtures page has a "load demo data"
  link (only shown while there are zero teams) that fills in a sample
  5-team roster through the same endpoints a real entry would use.
- "Generate Bracket" only unlocks once all 5 teams are full. It builds a
  single-elimination bracket — 5 teams doesn't divide evenly, so it's an
  8-slot bracket with 3 first-round byes (those teams advance automatically,
  only one round-1 match is actually played), then semifinals, then a final.
- Click a team in a playable match to set them as the winner — they get
  pushed into whichever match they feed into next. Clicking the other team
  overrides the result, and anything further down the bracket that already
  depended on the old result gets cleared automatically.
- "Regenerate" wipes the bracket and reshuffles a new one. "Clear" just
  empties it without touching the teams.
- Removing a team also clears the bracket, since a partial one doesn't mean
  anything.
- The landing page has a small "Reflex Check" aim-trainer game (five
  targets, tracks reaction time and your best score) — a bit of an
  interactive touch that fits a shooter-esports site better than another
  static feature card would.

## Deployment

**Backend on Render**
- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Env var: `CLIENT_ORIGIN` set to the Vercel URL, exact match (no trailing
  slash) — the API only accepts requests from origins listed here.

**Frontend on Vercel**
- Root directory: `client`
- Env var: `VITE_API_URL` set to the Render API URL.
- `vercel.json` in this folder handles the SPA rewrite so `/tournament`
  doesn't 404 on refresh.


Live links:
- Website: https://ambiora-website-nine.vercel.app
- API: https://esports-website-1.onrender.com


Built by Aditya
