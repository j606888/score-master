# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A score-tracking app for Mahjong / poker games, driven through the **LINE messaging platform**. Users interact via a LINE bot (text triggers → Flex message replies) and **LIFF** (LINE Front-end Framework) web pages embedded in the LINE app. Built with Next.js 14 **Pages Router** in plain JavaScript (no TypeScript). UI text is Traditional Chinese.

## Commands

```bash
yarn dev      # next dev (local development)
yarn build    # prisma generate && next build
yarn start    # next start (production server)
yarn lint     # next lint (eslint-config-next)

npx prisma migrate deploy   # apply migrations to the DB (run once on a fresh local DB)
npx prisma generate         # regenerate the Prisma client after schema changes
npx prisma studio           # inspect data
```

Node version is pinned to **18.20.4** (`.nvmrc`). Package manager is **yarn** (`yarn.lock`). There is no test suite.

Import alias: `@/*` → `./src/*` (`jsconfig.json`).

## Environment variables

- `DATABASE_URL` — PostgreSQL connection (Prisma).
- `LINE_ACCESS_TOKEN` — LINE Messaging API channel access token (used to reply to webhooks).
- `NEXT_PUBLIC_LINE_LIFF_ID` — LIFF app id; used both client-side (`useLiff`) and to build `liff.line.me/...` deep links in Flex messages.
- `APP_ENV=local` — enables verbose Prisma query logging in `src/db.js`.

Deployment is on Vercel: `main` → production, `qa` → preview.

## Domain model (Prisma, `prisma/schema.prisma`)

The data model is the key thing to understand before touching anything. Tables use snake_case via `@@map`; the schema predates this app (note `ar_internal_metadata` / `schema_migrations` — it was migrated from a Rails project), so models carry nullable columns and loose relations.

- **LineSource** — one per LINE conversation origin (`source_type`: 0=user, 1=group, 2=room; see `SOURCE_MAP` in `parseMessage.js`). Its `room_id` column points at the **currently active Room** for that conversation.
- **Room** — a scoreboard. A single LineSource can own multiple Rooms (via **RoomMap**), and the user switches the "active" one. A Room has Players and Games.
- **RoomMap** — join table linking a LineSource to each Room it owns.
- **Player** — belongs to a Room. `gian_count` = number of games the player has appeared in. `role` (`PLAYER_ROLE` in `src/lib/playerRole.js`): 0 = normal, 1 = 場地費 (venue fee — only positive scores, excluded from rankings and `gian_count`, shown as an accumulated total). A room can have several fee players.
- **Game** — a single recorded session in a Room; has many **Record**s (one Player + score each).
- **DraftRecord** — staging rows for a game being entered. Players accumulate drafts (room-scoped), then "submit" converts them into a Game + Records.

Because Prisma `BigInt` ids don't serialize to JSON, `src/db.js` monkey-patches `BigInt.prototype.toJSON` to return `Number`. `src/db.js` also exports the standard Next.js global Prisma singleton — always `import prisma from "@/db"`.

## Architecture

### LINE bot flow (server-side)
`src/pages/api/line/webhook.js` is the Messaging API webhook:
1. `parseMessage` (`src/lib/line/parseMessage.js`) pulls `replyToken`, text, and `source` from the event.
2. `handleAction` (`src/lib/line/actionHandler.js`) does **find-or-create** of the LineSource and its active Room (auto-creating a default room "麻將小房間" on first contact), then dispatches on the text:
   - any of the chat's `LineSource.menu_keywords` (default `麻將`, `德州`; editable on the LIFF settings page) → menu Flex message (standings as diverging score bars)
   - `紀錄成功` → "save success" Flex message (last game + rank changes + top 5); sent by `games/new` after submit
   - anything else → no reply (and no LineSource/Room is created)
3. `buildMessage(type, room)` (`src/lib/line/buildMessage/index.js`) builds the Flex JSON (`menu.js`, `saveSuccess.js`). These query Prisma directly and embed `liff.line.me/${LIFF_ID}/...` URLs as buttons that open the LIFF pages.
4. `replyToMessage` (`src/lib/line/lineApi.js`) POSTs the reply to the LINE reply API.

When adding a new bot command, wire it through all four layers: a text branch in `actionHandler`, a `TYPES` entry + switch case in `buildMessage`, and a builder module returning Flex JSON.

### LIFF web app (client-side)
Pages under `src/pages/liff/rooms/[room_id]/` render inside the LINE in-app browser. `room_id` is always passed via `getServerSideProps` → page props. `src/hooks/useLiff.jsx` initializes the LIFF SDK and exposes `sendMessage` / `closeWindow`.

Key pages: `games/new` (the `NewGameContainer`, main score-entry screen), `calculator.js` (chip calculator that creates a DraftRecord then redirects to `games/new`), `players/new`, `select.jsx` (switch active room), `settings.jsx`.

### Score-entry / draft workflow
This is the central interaction:
1. On `games/new`, each player's score is a **DraftRecord** (`createDraft`). An empty score sends `null`, which the drafts API treats as a delete. `NewGameContainer` polls drafts every 5s via SWR `mutate` so multiple people editing on different phones stay in sync.
2. The calculator computes a win/lose amount and pushes it in as a draft, then redirects back to `games/new`.
3. Submitting posts to `POST /api/rooms/[room_id]/games`, which creates the Game + Records and increments each player's `gian_count`. The UI warns (but allows `forceSubmit`) when the draft total isn't zero. Drafts are cleared afterward (`deleteAllDraft`).

### REST API & data fetching
API routes live in `src/pages/api/rooms/[room_id]/`. Each handler branches on `req.method` inline (GET/POST/DELETE in one function) and uses `+room_id` / `Number(...)` / `BigInt(...)` coercions since route params are strings and ids are BigInt.

Client calls go through thin wrappers in `src/lib/api/*` over a shared `axiosClient` (`baseURL: '/api'`). Read-heavy pages use **SWR** with a global fetcher configured in `src/pages/_app.js` (note: SWR keys are raw `/api/...` URLs, fetched directly with `fetch`, bypassing axiosClient). Containers in `src/containers/` hold the stateful screens; `src/pages/...` mostly just supply `getServerSideProps` and render them.

## Styling

Mixed: **MUI** (`@mui/material`) components + **styled-components** (SSR enabled in `next.config.mjs`) + Emotion (MUI's engine). New components typically use MUI for inputs/buttons and `styled` for layout.
