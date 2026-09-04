# LNKZ

LNKZ is a self-hostable MCP server that carries conversation context between people,
devices, and LLM clients.

A useful chat currently dies inside whichever client it happened in. LNKZ takes that chat
out: import it from a ChatGPT, Claude, or Gemini export, from a Markdown transcript, or from
a raw paste; store it in one provider-neutral format; search it; reduce it to a
token-budgeted packet the next model can act on; and hand it to a person, a device, or a
different client through an expiring, revocable link.

The same server also federates the systems around the chat, so a question can be answered
from the conversation and from Slack, Jira, Figma, documentation feeds, or any other MCP
server in one call.

```
ChatGPT / Claude / Gemini / local model
                  |
        import or save_conversation
                  |
        +---------+---------+
        |    LNKZ server    |  MCP (HTTP + stdio) · REST · web console
        +---------+---------+
                  |
   +--------------+----------------+
   |              |                |
context packet  handoff link   federated search
(next model)   (person/device)  (Slack, Jira, Figma, docs, other MCP servers)
```

## What works now

**Portability**

- `lnkz.conversation.v1`: one provider-neutral schema, plus a readable Markdown transcript
- Importers for ChatGPT tree exports, Claude account exports, Gemini payloads, LNKZ packets,
  Markdown transcripts, and unlabeled pasted text, with format auto-detection and a dry run
- Conversation lineage, so a thread continued in a second client still points back at the first

**Context intelligence, with no model call**

- Deterministic extraction of decisions, open questions, action items, cited facts, and topics,
  each attributed to the message it came from
- Token-budgeted context packets that carry the gist instead of the transcript
- Near-duplicate detection and cross-conversation contradiction detection

**Relay safety**

- Expiring, use-limited handoff links; only SHA-256 digests of tokens are stored
- Revocation, an append-only audit log, `no-store` responses, and a rate limit on the public
  share endpoint
- Optional secret redaction on export: API keys, tokens, private keys, connection strings,
  and, when asked, emails and card numbers

**Interfaces**

- 20 MCP tools, 4 resources, and 4 prompts over stateless Streamable HTTP and local stdio
- A REST API covering the same surface, for clients that are not MCP-aware
- A web console for import, search, packet building, and handoff management
- SQLite with FTS5 ranked search, behind a storage interface that Postgres can implement later

## Repository layout

```text
src/                     product site and web console (TypeScript, no framework)
mcp-server/src/store/    conversation storage and handoffs
mcp-server/src/import/   per-provider export normalizers
mcp-server/src/intel/    analysis, packets, similarity, conflicts, redaction
mcp-server/src/connectors/  Slack, Jira, Figma, document feeds, federated MCP
mcp-server/tests/        44 tests, no network and no credentials required
scripts/smoke.mjs        end-to-end check against a real running server
legacy/geo-social/       archived first-generation prototype, outside the active build
```

## Quick start

Requires Node.js 22.5 or newer. Storage uses the built-in `node:sqlite` module, so there is
no native module to compile.

```bash
npm install
npm ci --prefix mcp-server
cp mcp-server/.env.example mcp-server/.env   # copy on Windows
npm run mcp:dev
```

In a second terminal:

```bash
npm run dev
```

The site runs at `http://localhost:5173`, the console at `/console.html`, and Vite proxies the
API to `http://127.0.0.1:3100`. The hosted MCP endpoint is `POST /mcp`.

For a local stdio client:

```bash
npm run build
npm run mcp:stdio
```

## Try the relay in one minute

```bash
export LNKZ=http://localhost:3100
export KEY=$(grep LNKZ_API_KEY mcp-server/.env | cut -d= -f2)

# 1. bring a chat in from anywhere
curl -s -X POST $LNKZ/api/conversations/import -H "Authorization: Bearer $KEY" \
  -H 'Content-Type: application/json' \
  -d '{"payload":"User: postgres or sqlite?\nAssistant: We decided to use SQLite. I will write the migration."}'

# 2. reduce it for the next model
curl -s -X POST $LNKZ/api/context/packet -H "Authorization: Bearer $KEY" \
  -H 'Content-Type: application/json' -d '{"query":"sqlite","budgetTokens":1500}'

# 3. hand it to someone
curl -s -X POST $LNKZ/api/conversations/<id>/handoffs -H "Authorization: Bearer $KEY" \
  -H 'Content-Type: application/json' -d '{"ttlMinutes":60,"maxUses":3,"redact":true}'
```

See [MCP.md](MCP.md) for the full tool and endpoint reference.

## Deploy

```bash
docker compose up --build
```

Set a strong `LNKZ_API_KEY` and an externally reachable `LNKZ_PUBLIC_BASE_URL` before hosting,
and terminate TLS in front of the container: a handoff token is a bearer secret in a URL.
The Compose volume persists the SQLite database at `/app/data/lnkz.db`.

`fly.toml` and `render.yaml` are checked in. Both mount a persistent disk at `/app/data`,
which is required: a redeploy without one loses the store. [DEPLOY.md](DEPLOY.md) is the
step-by-step runbook, including the two settings that cause almost every first-deploy failure.

## Verification

```bash
npm test          # 44 unit and integration tests
npm run typecheck # web and server, strict mode
npm run build     # site + server
node scripts/smoke.mjs   # boots the built server and drives it over REST and MCP
```

The smoke test is the one that catches wiring mistakes the unit tests cannot see: middleware
order, auth, transport framing, and static serving.

## Development notes

[GRAPHIFY.md](GRAPHIFY.md) covers the codebase knowledge graph used while working on this
repository, and how to register it alongside LNKZ as a second MCP server.

## Direction

The current storage is a single-instance SQLite file. The next production boundary is
encrypted Postgres with accounts, scoped workspaces, retention controls, and audited OAuth
connector installs. See [ROADMAP.md](ROADMAP.md).
