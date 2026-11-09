import { z } from "zod";
import type { Express, RequestHandler } from "express";
import { EXPORT_FORMATS, exportConversation, type ExportFormat } from "./index.js";
import type { ConversationStore } from "../store/index.js";

/**
 * Export belongs to the relay REST contract. The separate MCP adapter calls
 * this route instead of importing export implementation details.
 */

export const exportFormatSchema = z.enum(EXPORT_FORMATS as [ExportFormat, ...ExportFormat[]]);

const exportSchema = {
  conversationId: z.string().uuid(),
  format: exportFormatSchema.default("markdown"),
};

export function mountExportRoutes(app: Express, store: ConversationStore, requireApiKey: RequestHandler): void {
  app.get("/api/conversations/:id/export", requireApiKey, async (request, response) => {
    const parsed = exportFormatSchema.safeParse(request.query.format ?? "markdown");
    if (!parsed.success) {
      response.status(400).json({ error: `Unknown format. Supported: ${EXPORT_FORMATS.join(", ")}.` });
      return;
    }

    const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
    const conversation = await store.get(id);
    if (!conversation) {
      response.status(404).json({ error: "Conversation not found." });
      return;
    }

    const result = exportConversation(conversation, parsed.data);
    response.setHeader("content-disposition", `attachment; filename="${result.filename}"`);
    response.type(result.mimeType).send(result.body);
  });
}
