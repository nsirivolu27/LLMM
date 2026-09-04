# LNKZ contributor guide

## What this is

LNKZ's product is portable, user-controlled conversation context across people, devices, and
LLM clients. Every change should make a conversation easier to move, easier to act on, or
safer to share. Features that only make the web app nicer are not the point.

## Boundaries to respect

- `ConversationStore` in `mcp-server/src/store/index.ts` is the only storage contract. Handlers
  call it; they never reach past it into SQLite.
- Expose capabilities through both MCP and REST. The web console is one client, not the client.
- Import normalizers live in `mcp-server/src/import/` behind `looksLike` predicates. Detection
  is a property of the format, never a guess at the call site.
- The `intel/` layer stays model-free and deterministic. If a feature needs an LLM, it belongs
  in a prompt the client runs, not in the server.
- Connector failures must be isolated: one unavailable service cannot hide another's results.
- Federated MCP adapters stay optional. LNKZ core never depends on one.

## Handling secrets

- Handoff tokens are bearer secrets. Never log them, never persist plaintext, never cache a
  redemption response.
- Redaction patterns must not match on bare words. A false positive silently destroys context.
- New endpoints that grant access without an API key need a rate limit and a test.

## Testing

Tests run with no network and no credentials. Connector tests assert configuration behavior,
not live calls.

Before handing off changes, from the repository root:

```bash
npm test
npm run typecheck
npm run build
node scripts/smoke.mjs
```

The smoke test boots the built server and drives it over REST and MCP. Add a check there for
anything that could break in wiring rather than in logic.

## Archived code

`legacy/geo-social/` is the first-generation prototype. It is outside the active build and
should not be extended.
