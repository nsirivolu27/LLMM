# LNKZ MCP and API reference

## Connecting

LNKZ exposes stateless Streamable HTTP at `POST /mcp`. When `LNKZ_API_KEY` is set, clients must
send `Authorization: Bearer <LNKZ_API_KEY>`.

```json
{
  "mcpServers": {
    "lnkz": {
      "url": "https://lnkz.example.com/mcp",
      "headers": { "Authorization": "Bearer ${LNKZ_API_KEY}" }
    }
  }
}
```

For a local stdio client, build first and run `mcp-server/dist/stdio.js` with the repository as
the working directory. `.mcp.json` in this repository already does that.

## Tools

### Conversations

| Tool | Purpose |
| --- | --- |
| `save_conversation` | Store a normalized chat from any client or device |
| `import_conversation` | Normalize a ChatGPT, Claude, Gemini, LNKZ, Markdown, or plain-text payload. Auto-detects the format; `dryRun` previews without writing |
| `get_conversation` | Full conversation, lineage, extracted claims, and Markdown transcript |
| `list_conversations` | Newest first, filterable by provider, tag, or participant |
| `search_conversations` | Ranked full-text search with snippets |
| `append_messages` | Add turns to an existing thread |
| `delete_conversation` | Remove a conversation, its messages, and its handoffs |

### Handoffs

| Tool | Purpose |
| --- | --- |
| `create_handoff` | Mint an expiring, use-limited link, optionally redacted and audience-labeled |
| `redeem_handoff` | Load the packet behind a token |
| `continue_handoff` | Redeem, then store the continuation as a new conversation linked to the original |
| `revoke_handoff` | Invalidate a link that has already been shared |
| `list_handoffs` | Expiry, remaining uses, audience, and revocation state. Tokens are never returned |

### Context intelligence

| Tool | Purpose |
| --- | --- |
| `build_context_packet` | Token-budgeted brief: decisions, open questions, action items, excerpt, conflicts |
| `analyze_conversation` | Extract claims and topics from one conversation |
| `find_conflicts` | Decisions across conversations that appear to disagree |
| `find_duplicates` | Conversations whose transcripts overlap heavily |

### Federation and operations

| Tool | Purpose |
| --- | --- |
| `search_context` | LNKZ plus every configured connector in one call, with per-source errors |
| `list_connectors` | Which sources are configured, and why the others are not |
| `workspace_stats` | Conversation, message, provider, and handoff counts |
| `audit_log` | Recent saves, imports, redemptions, rejections, and revocations |

## Resources

| URI | Content |
| --- | --- |
| `lnkz://connectors` | Connector inventory (JSON) |
| `lnkz://stats` | Workspace statistics (JSON) |
| `lnkz://conversations` | The 25 most recently updated conversations (JSON) |
| `lnkz://conversation/{id}` | One conversation as a Markdown transcript with its decisions |

## Prompts

| Prompt | Use |
| --- | --- |
| `continue_shared_conversation` | Resume a handoff while preserving facts, decisions, and open questions |
| `research_brief` | Build a sourced brief from conversations and connected systems |
| `prepare_handoff` | Summarize a conversation, then mint a scoped link for a named recipient |
| `reconcile_conflicts` | Review flagged contradictions and propose which decision stands |

## Conversation format

Every conversation is stored as `lnkz.conversation.v1`. `source.provider` is an open string so a
client can identify ChatGPT, Claude, Gemini, a local model, or something that does not exist yet
without a protocol change.

```json
{
  "title": "Launch decision",
  "summary": "Compared two launch plans and selected the lower-risk path.",
  "source": {
    "provider": "any-llm",
    "app": "desktop",
    "deviceId": "work-laptop",
    "externalConversationId": "optional-provider-id"
  },
  "participants": ["Nihal", "Design assistant"],
  "tags": ["launch", "research"],
  "lineage": { "parentId": "uuid-of-the-earlier-thread" },
  "messages": [
    { "role": "user", "content": "Compare the plans." },
    { "role": "assistant", "content": "We decided to go with plan B: lower delivery risk." }
  ]
}
```

Supplying a saved UUID as `id` updates the conversation without changing its creation time.

## REST endpoints

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/health` | Unauthenticated liveness and connector summary |
| `POST` | `/api/conversations` | Save |
| `GET` | `/api/conversations` | List, with `limit`, `offset`, `provider`, `tag`, `participant` |
| `GET` | `/api/conversations/:id` | Conversation plus analysis |
| `DELETE` | `/api/conversations/:id` | Delete |
| `POST` | `/api/conversations/:id/messages` | Append turns |
| `POST` | `/api/conversations/search` | Ranked search |
| `POST` | `/api/conversations/import` | Import, with `dryRun` |
| `POST` | `/api/conversations/:id/handoffs` | Create a handoff |
| `GET` | `/api/handoffs` | List handoffs |
| `DELETE` | `/api/handoffs/:id` | Revoke |
| `GET` | `/share/:token` | Redeem. Unauthenticated, rate limited, `no-store`. `Accept: text/markdown` returns the transcript |
| `POST` | `/api/context/search` | Federated search |
| `POST` | `/api/context/packet` | Build a context packet |
| `GET` | `/api/context/conflicts` | Contradiction candidates |
| `GET` | `/api/context/duplicates` | Near-duplicate pairs |
| `GET` | `/api/connectors`, `/api/stats`, `/api/events` | Status and audit |
| `POST` | `/mcp` | MCP Streamable HTTP |

Examples:

```bash
# Import a Claude export, previewing first
curl -X POST http://localhost:3100/api/conversations/import \
  -H "Authorization: Bearer $LNKZ_API_KEY" -H "Content-Type: application/json" \
  -d "{\"payload\": $(jq -Rs . < conversations.json), \"dryRun\": true}"

# One-hour, three-use, redacted handoff
curl -X POST http://localhost:3100/api/conversations/<id>/handoffs \
  -H "Authorization: Bearer $LNKZ_API_KEY" -H "Content-Type: application/json" \
  -d '{"ttlMinutes":60,"maxUses":3,"redact":true,"audience":"design review"}'

# Redeem as Markdown
curl -H "Accept: text/markdown" http://localhost:3100/share/<token>
```

The `shareUrl` a handoff returns contains a bearer token. Anyone holding it can read that
conversation until it expires or is revoked, so treat it like a temporary password. The
plaintext token is never stored by LNKZ.

## Connector configuration

- Slack: `SLACK_USER_TOKEN`, or `SLACK_BOT_TOKEN` plus `SLACK_CHANNEL_IDS`
- Jira Cloud: `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`
- Figma: `FIGMA_PERSONAL_ACCESS_TOKEN` or `FIGMA_ACCESS_TOKEN`, plus `FIGMA_FILE_KEYS`
- Documents: comma-separated `DOCUMENT_FEED_URLS`, optionally `DOCUMENT_FEED_BEARER_TOKEN`
- Federated MCP server: `FANTASY_MCP_URL`, optionally `FANTASY_MCP_API_KEY`

All external connectors are read-only. Unconfigured sources stay visible as disabled, and a
failure in one is returned alongside the results from the others.
