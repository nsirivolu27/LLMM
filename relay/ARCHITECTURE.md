# LNKZ architecture

```text
REST caller / teammate handoff / LNKZ MCP adapter
                    |
          authentication + origin boundary
                    |
          REST handlers and surfaces
          /          |          \
     import     ConversationStore    federation
                  /       \
             SQLite       Postgres
                    |
        analysis, packets, graph, redaction
```

## Core boundary

`ConversationStore` is the storage contract. REST routes, handoffs, search, and context packet
generation call the same store and workflow functions. Storage can switch from SQLite to Postgres
without changing the conversation contract.

## Storage

SQLite is the default for a local, single-tenant deployment. It uses Node's built-in SQLite
support, versioned migrations, FTS5 search, and a legacy JSON import path. Postgres activates when
`DATABASE_URL` is present. Postgres stores workspace context on conversations, messages, handoffs,
events, and rate-limit buckets; transactions apply workspace context before queries and RLS fails
closed without it.

The migration role is separate from the runtime role. Runtime roles must not own tables or bypass
RLS. Run `pnpm build` followed by `pnpm db:migrate` for Postgres schema changes.

## Relay safety

Handoff tokens are random bearer secrets. Only their hashes are stored. Handoffs include expiry,
maximum uses, revocation, audience, optional redaction, and audit events. Share redemption is
rate-limited and returned with `no-store` and `noindex`; deploy behind TLS.

When the relay calls a trusted downstream MCP target, it can propagate request identity with a
short-lived HMAC envelope in `x-lnkz-context`. The envelope carries workspace, actor, scopes,
expiry, and trace data; it is not a replacement for end-user authentication. The relay's own REST
boundary accepts API-key or managed authentication, never plain workspace or forwarded-context
headers.

## Intelligence

Import detection, normalization, decisions, open questions, actions, topics, conflicts, duplicate
detection, graph construction, redaction, and context packets are deterministic and model-free.
This keeps the relay useful offline and makes the workflow predictable for downstream LLMs.

## Hosting

One Node process serves the REST API. MCP hosts launch the separate `lnkz-mcp` stdio adapter, which
calls this API with a scoped key. Within LLMM, this package owns the relay runtime while the product
root owns the console.
