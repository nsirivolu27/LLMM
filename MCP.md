# MCP boundary

LLMM owns the LNKZ relay and its authenticated REST API. MCP transport code is intentionally
kept in the separate, configurable [`lnkz-mcp`](https://github.com/nsirivolu27/lnkz-mcp)
repository so this product repository contains no duplicate MCP server or console scaffolding.

Configure the adapter with:

```bash
LNKZ_BASE_URL=http://127.0.0.1:3100
LNKZ_API_KEY=your-relay-key
```

The adapter preserves the established MCP tool names and `lnkz://` resource URIs while calling
the relay over REST. It supports local stdio and stateless MCP HTTP, and it does not store
conversation data itself.

For relay deployment, storage, authentication, and multi-node signed context forwarding, see
[`relay/MCP.md`](relay/MCP.md), [`relay/DEPLOY.md`](relay/DEPLOY.md), and
[`relay/ARCHITECTURE.md`](relay/ARCHITECTURE.md).
