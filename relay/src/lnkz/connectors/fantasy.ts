import { mcpContextHeaders } from "../context.js";
import type { Connector, ContextItem } from "../types.js";
import { callMcpTool } from "./mcp-http.js";

export function createFantasyConnector(env: NodeJS.ProcessEnv = process.env): Connector | null {
  const url = env.FANTASY_MCP_URL?.trim();
  const apiKey = env.FANTASY_MCP_API_KEY?.trim();
  const contextSecret = env.LNKZ_MCP_CONTEXT_SECRET;
  if (!url) return null;

  return {
    id: "fantasy",
    label: "Fantasy Copilot",
    status: () => ({
      id: "fantasy",
      label: "Fantasy Copilot",
      configured: true,
      detail: `Remote MCP federation is configured for ${new URL(url).hostname}.`,
    }),
    search: async (query, limit) => {
      const headers = mcpContextHeaders(contextSecret);
      if (apiKey) headers.authorization = `Bearer ${apiKey}`;
      const result = await callMcpTool({ url, headers }, "search_league", { query, limit: Math.min(limit, 15) });
      if (result.isError) {
        throw new Error(textContent(result.content) || "Fantasy MCP tool failed.");
      }
      const text = textContent(result.content);
      return text
        ? [{
            source: "fantasy",
            id: `league-search:${query.toLowerCase()}`,
            title: "Fantasy league context",
            text,
            metadata: { tool: "search_league" },
          } satisfies ContextItem]
        : [];
    },
  };
}

function textContent(content: unknown): string {
  if (!Array.isArray(content)) return "";
  return content
    .filter((block): block is { type: "text"; text: string } =>
      Boolean(block && typeof block === "object" && (block as { type?: string }).type === "text"),
    )
    .map((block) => block.text)
    .join("\n");
}
