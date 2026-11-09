# LNKZ MCP

MCP support lives in the separate [lnkz-mcp repository](https://github.com/nsirivolu27/lnkz-mcp).

That adapter preserves the existing MCP tool names, prompts, and `lnkz://` resource URIs while calling this relay through its authenticated REST API. Configure the adapter with `LNKZ_BASE_URL` and `LNKZ_API_KEY`; do not place credentials in source files or MCP arguments.

This relay does not mount `/mcp` and does not ship a stdio entrypoint.
