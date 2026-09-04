import { createHash, randomBytes, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { matchesQuery } from "./http.js";
import type {
  Conversation,
  ConversationInput,
  ConversationMessage,
  HandoffPacket,
  HandoffRecord,
} from "./types.js";

interface Snapshot {
  version: 1;
  conversations: Conversation[];
  handoffs: HandoffRecord[];
}

const EMPTY_SNAPSHOT: Snapshot = { version: 1, conversations: [], handoffs: [] };

export interface ConversationStore {
  save(input: ConversationInput): Promise<Conversation>;
  get(id: string): Promise<Conversation | null>;
  search(query: string, limit: number): Promise<Conversation[]>;
  createHandoff(conversationId: string, ttlMinutes: number): Promise<{ token: string; expiresAt: string }>;
  redeemHandoff(token: string): Promise<HandoffPacket | null>;
}

export class JsonConversationStore implements ConversationStore {
  private queue: Promise<unknown> = Promise.resolve();
  readonly filePath: string;

  constructor(filePath = process.env.LNKZ_DATA_FILE || ".data/lnkz.json") {
    this.filePath = resolve(filePath);
  }

  async save(input: ConversationInput): Promise<Conversation> {
    return this.mutate((snapshot) => {
      const now = new Date().toISOString();
      const existingIndex = input.id
        ? snapshot.conversations.findIndex((conversation) => conversation.id === input.id)
        : -1;
      const existing = existingIndex >= 0 ? snapshot.conversations[existingIndex] : undefined;
      const conversation: Conversation = {
        id: input.id || randomUUID(),
        version: 1,
        title: input.title.trim(),
        summary: input.summary?.trim() || undefined,
        source: { ...input.source, provider: input.source.provider.trim() },
        participants: uniqueStrings(input.participants ?? []),
        tags: uniqueStrings(input.tags ?? []),
        messages: input.messages.map((message): ConversationMessage => ({
          id: message.id || randomUUID(),
          role: message.role,
          content: message.content.trim(),
          author: message.author?.trim() || undefined,
          createdAt: validDate(message.createdAt) || now,
          metadata: message.metadata,
        })),
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        metadata: input.metadata,
      };
      if (existingIndex >= 0) snapshot.conversations[existingIndex] = conversation;
      else snapshot.conversations.push(conversation);
      return conversation;
    });
  }

  async get(id: string): Promise<Conversation | null> {
    const snapshot = await this.read();
    return snapshot.conversations.find((conversation) => conversation.id === id) ?? null;
  }

  async search(query: string, limit: number): Promise<Conversation[]> {
    const snapshot = await this.read();
    const boundedLimit = Math.max(1, Math.min(limit, 50));
    return snapshot.conversations
      .filter((conversation) => matchesQuery(
        query,
        conversation.title,
        conversation.summary,
        conversation.tags.join(" "),
        conversation.participants.join(" "),
        conversation.messages.map((message) => message.content).join(" "),
      ))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, boundedLimit);
  }

  async createHandoff(conversationId: string, ttlMinutes: number): Promise<{ token: string; expiresAt: string }> {
    return this.mutate((snapshot) => {
      if (!snapshot.conversations.some((conversation) => conversation.id === conversationId)) {
        throw new Error("Conversation not found.");
      }
      const token = randomBytes(24).toString("base64url");
      const now = new Date();
      const expiresAt = new Date(now.getTime() + Math.max(5, Math.min(ttlMinutes, 10_080)) * 60_000).toISOString();
      snapshot.handoffs = snapshot.handoffs.filter((handoff) => handoff.expiresAt > now.toISOString());
      snapshot.handoffs.push({
        id: randomUUID(),
        conversationId,
        tokenHash: hashToken(token),
        createdAt: now.toISOString(),
        expiresAt,
      });
      return { token, expiresAt };
    });
  }

  async redeemHandoff(token: string): Promise<HandoffPacket | null> {
    const snapshot = await this.read();
    const now = new Date().toISOString();
    const handoff = snapshot.handoffs.find((candidate) =>
      candidate.expiresAt > now && candidate.tokenHash === hashToken(token),
    );
    if (!handoff) return null;
    const conversation = snapshot.conversations.find((candidate) => candidate.id === handoff.conversationId);
    if (!conversation) return null;
    return {
      format: "lnkz.conversation.v1",
      conversation,
      transcriptMarkdown: conversationToMarkdown(conversation),
      exportedAt: new Date().toISOString(),
    };
  }

  private async read(): Promise<Snapshot> {
    try {
      return JSON.parse(await readFile(this.filePath, "utf8")) as Snapshot;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return structuredClone(EMPTY_SNAPSHOT);
      throw error;
    }
  }

  private async mutate<T>(operation: (snapshot: Snapshot) => T): Promise<T> {
    const run = this.queue.then(async () => {
      const snapshot = await this.read();
      const result = operation(snapshot);
      await mkdir(dirname(this.filePath), { recursive: true });
      const tempPath = `${this.filePath}.${randomUUID()}.tmp`;
      await writeFile(tempPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
      await rename(tempPath, this.filePath);
      return result;
    });
    this.queue = run.catch(() => undefined);
    return run;
  }
}

export function conversationToMarkdown(conversation: Conversation): string {
  const lines = [
    `# ${conversation.title}`,
    "",
    `Source: ${conversation.source.provider}${conversation.source.app ? ` / ${conversation.source.app}` : ""}`,
    `Updated: ${conversation.updatedAt}`,
  ];
  if (conversation.summary) lines.push("", "## Summary", "", conversation.summary);
  lines.push("", "## Transcript", "");
  for (const message of conversation.messages) {
    lines.push(`### ${message.author || message.role}`, "", message.content, "");
  }
  return lines.join("\n").trim();
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function validDate(value?: string): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}
