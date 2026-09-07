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
