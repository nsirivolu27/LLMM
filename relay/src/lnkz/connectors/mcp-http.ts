const PROTOCOL_VERSION = "2025-11-25";

export interface McpHttpTarget {
  url: string;
  headers?: Record<string, string>;
}

export interface McpToolDescription {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

export interface McpToolResult {
  content?: unknown;
  isError?: boolean;
}

export async function listMcpTools(target: McpHttpTarget): Promise<McpToolDescription[]> {
  return withMcpSession(target, async (session) => {
    const result = await request(session, "tools/list", {});
    return Array.isArray(result.tools) ? result.tools as McpToolDescription[] : [];
  });
}

export async function callMcpTool(
  target: McpHttpTarget,
  name: string,
  args: Record<string, unknown>,
): Promise<McpToolResult> {
  return withMcpSession(target, async (session) =>
    request(session, "tools/call", { name, arguments: args }) as Promise<McpToolResult>);
}

interface McpSession {
  target: McpHttpTarget;
  id?: string;
  protocolVersion: string;
  requestId: number;
}

async function withMcpSession<T>(target: McpHttpTarget, action: (session: McpSession) => Promise<T>): Promise<T> {
  const session: McpSession = { target, protocolVersion: PROTOCOL_VERSION, requestId: 1 };
  const initialized = await post(session, {
    jsonrpc: "2.0",
    id: session.requestId++,
    method: "initialize",
    params: {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: "lnkz-relay", version: "0.2.0" },
    },
  });
  if (initialized.result && typeof initialized.result.protocolVersion === "string") {
    session.protocolVersion = initialized.result.protocolVersion;
  }
  session.id = initialized.sessionId;
  await post(session, { jsonrpc: "2.0", method: "notifications/initialized" });
  try {
    return await action(session);
  } finally {
    if (session.id) {
      await fetch(target.url, { method: "DELETE", headers: headersFor(session) }).catch(() => undefined);
    }
  }
}

async function request(
  session: McpSession,
  method: string,
  params: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const response = await post(session, { jsonrpc: "2.0", id: session.requestId++, method, params });
  if (response.error) {
    throw new Error(typeof response.error.message === "string" ? response.error.message : "Remote MCP request failed.");
  }
  return response.result ?? {};
}

async function post(
  session: McpSession,
  body: Record<string, unknown>,
): Promise<{
  result?: Record<string, unknown>;
  error?: { message?: string };
  sessionId?: string;
}> {
  const response = await fetch(session.target.url, {
    method: "POST",
    headers: headersFor(session),
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Remote MCP request failed with status ${response.status}.`);
  if (response.status === 202 || response.status === 204) return {};
  const text = await response.text();
  const message = parseResponse(text, response.headers.get("content-type"));
  return { ...message, sessionId: response.headers.get("mcp-session-id") ?? undefined };
}

function headersFor(session: McpSession): Headers {
  const headers = new Headers(session.target.headers);
  headers.set("accept", "application/json, text/event-stream");
  headers.set("content-type", "application/json");
  headers.set("mcp-protocol-version", session.protocolVersion);
  if (session.id) headers.set("mcp-session-id", session.id);
  return headers;
}

function parseResponse(text: string, contentType: string | null): {
  result?: Record<string, unknown>;
  error?: { message?: string };
} {
  if (!text.trim()) return {};
  const payload = contentType?.includes("text/event-stream")
    ? text.split(/\r?\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trim()).at(-1)
    : text;
  if (!payload) return {};
  try {
    return JSON.parse(payload) as { result?: Record<string, unknown>; error?: { message?: string } };
  } catch {
    throw new Error("Remote MCP server returned an invalid response.");
  }
}
