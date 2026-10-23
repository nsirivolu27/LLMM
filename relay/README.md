# LNKZ relay

LNKZ is the conversation-relay backend built into [LLMM](https://github.com/nsirivolu27/LLMM). This package owns the REST API, conversation import/export, context intelligence, handoffs, storage, connectors, graph construction, and deployment runtime used by the LLMM product.

MCP is maintained separately in [lnkz-mcp](https://github.com/nsirivolu27/lnkz-mcp). The adapter connects to this relay over the authenticated REST API; this package does not mount `/mcp` or provide a stdio entrypoint.

## Capabilities

- Imports ChatGPT, Claude, Gemini, OpenAI-compatible, Markdown, text, and LNKZ conversations.
- Builds bounded context packets containing decisions, open questions, actions, facts, and excerpts.
- Exports normalized conversations to portable formats.
- Creates expiring, use-limited, revocable handoff links with optional secret redaction.
- Preserves conversation lineage across clients.
- Searches local conversations and configured Slack, Jira, Figma, documentation, and downstream MCP sources.
- Uses SQLite by default and Postgres when `DATABASE_URL` is configured.
- Preserves authenticated actor/workspace context in Postgres and signs outbound context for trusted MCP targets.

## Development

Requirements: Node.js 22 and pnpm 10.26.1.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm start
```

The REST server listens at `http://127.0.0.1:3100` by default. Production startup fails closed unless `LNKZ_API_KEY` or `LNKZ_API_KEYS_JSON` is configured. Local development may explicitly set `LNKZ_ALLOW_UNAUTHENTICATED=true`.

SQLite stores data under `.data/lnkz.db`. When `DATABASE_URL` is present, build and run `pnpm db:migrate` before startup with a migration-capable role, then run the service with a separate non-owner application role.

## Boundaries

- The LLMM repository owns the product UI and this relay.
- The [lnkz-mcp](https://github.com/nsirivolu27/lnkz-mcp) repository owns MCP registration, stdio transport, and the REST adapter.
- The [RSNA knee abnormality project](https://github.com/nsirivolu27/rsna-knee-abnormality-detection) remains separate and is never vendored here.

See [ARCHITECTURE.md](ARCHITECTURE.md), [DEPLOY.md](DEPLOY.md), and [MCP.md](MCP.md).
