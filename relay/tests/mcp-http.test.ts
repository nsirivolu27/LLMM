import assert from "node:assert/strict";
import test from "node:test";
import { listMcpTools } from "../src/lnkz/connectors/mcp-http.js";

test("outbound MCP discovery keeps caller headers across the stateless handshake", async (t) => {
  const originalFetch = globalThis.fetch;
  const requests: { method: string; authorization: string | null; context: string | null; body: string }[] = [];
  globalThis.fetch = async (_input, init) => {
    const headers = new Headers(init?.headers);
    const body = String(init?.body ?? "");
    requests.push({
      method: init?.method ?? "GET",
      authorization: headers.get("authorization"),
      context: headers.get("x-lnkz-context"),
      body,
    });
    const request = body ? JSON.parse(body) as { method?: string } : {};
    if (request.method === "initialize") {
      return Response.json({ jsonrpc: "2.0", id: 1, result: { protocolVersion: "2025-11-25", capabilities: {}, serverInfo: { name: "test", version: "1" } } });
    }
    if (request.method === "notifications/initialized") return new Response(null, { status: 202 });
    return Response.json({
      jsonrpc: "2.0",
      id: 2,
      result: { tools: [{ name: "search", description: "Search", inputSchema: { type: "object" } }] },
    });
  };
  t.after(() => { globalThis.fetch = originalFetch; });

  const tools = await listMcpTools({
    url: "https://mcp.example.test/mcp",
    headers: { authorization: "Bearer target-key", "x-lnkz-context": "signed-envelope" },
  });

  assert.deepEqual(tools.map((tool) => tool.name), ["search"]);
  assert.equal(requests.length, 3);
  assert.ok(requests.every((request) => request.authorization === "Bearer target-key"));
  assert.ok(requests.every((request) => request.context === "signed-envelope"));
});
