# Our little room

A shared pixel room for two. Open Settings to name the characters, choose either character, and tap the open floor to move. Hug, kiss, cuddle, dance, sleep, lights, ambience, tea, plant watering, and notes persist in Cloudflare D1. Clients refresh every 2.5 seconds. Concurrent updates use revision checks to avoid overwriting each other.

Room invitation keys are random 256-bit capabilities in the URL fragment, sent to the API in a header. Whoever has a room link and site access can edit that room. Browser storage remembers only the room key and selected character. The saved room itself is server-backed. Keep the complete invitation link to return from another device.

## Development

- `npm run dev`
- Generate schema migrations with `npm run db:generate`.
- Apply generated migrations to the local D1 database before API testing.
- `node tests/room-api.mjs` verifies persistence, simultaneous writes, input validation and room isolation against localhost:3000.
- `npx tsc --noEmit` and `npm run build`.

Generated art was prepared as an apartment background and eight transparent character poses. The sound toggle enables a locally synthesized music-box melody when Music box is on.

Validation: API integration tests and TypeScript passed. Broad browser testing was not requested. The optional WebMCP action is feature-detected; no supported WebMCP validation context was available, so its browser registration has not been verified.

## AI chat

Click Huzaifa or the chat bar to talk to clearly labeled AI Huzaifa. Gemini 3.5 Flash-Lite uses minimal thinking, a 192-output-token cap, and only the last six messages (500 characters each). The server stores the last 60 messages per room, rejects duplicate sends, and limits the site to 100 attempts per UTC day. The Google API key is held in a hosting secret, never in client code. `.env` and `.dev.vars` are ignored local secret files. Provider free quotas and billing are controlled by the Google account; the app does not enable a paid plan.

`node --experimental-strip-types tests/chat-api.mjs` checks an actual Gemini reply, persistence, duplicate suppression, room isolation, and context limits. This test passed. Broad browser UI testing was not requested.

## Deploy from GitHub to Cloudflare Workers

This repository builds as a standard Cloudflare Worker. Keep the repository private because it is a personal project, though no API key is committed.

1. Create a D1 database named `our-little-room-db` in Cloudflare.
2. In Cloudflare Workers Builds, connect this repository and set the production branch to `main`.
3. Set the build variable `CLOUDFLARE_D1_DATABASE_ID` to the D1 database ID.
4. Use `npm run build` as the build command and `npm run deploy` as the deploy command.
5. After the first deployment, add the Worker secret `GEMINI_API_KEY` in Settings > Variables and Secrets.
6. Apply `drizzle/0000_workable_invisible_woman.sql` and `drizzle/0001_chunky_klaw.sql` to the D1 database in order.

The generated deployment config is `dist/server/wrangler.json`. The Worker name must stay `our-little-room`, matching the Cloudflare project name.
