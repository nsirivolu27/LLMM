import { buildConversation, normalizeRole, titleFromMessages } from "./shared.js";
import type { ConversationInput, MessageInput } from "../types.js";

const HEADING = /^(#{1,6})\s+(.+?)\s*$/;
const BOLD_SPEAKER = /^\*\*([^*]{1,60}?)\*\*\s*[:：]?\s*(.*)$/;
const PLAIN_SPEAKER = /^([A-Za-z][\w .'-]{0,40})\s*[:：]\s+(.*)$/;

const KNOWN_SPEAKERS = new Set([
  "user", "human", "me", "you", "assistant", "ai", "bot", "chatgpt", "claude",
  "gemini", "copilot", "grok", "system", "tool",
]);

/**
 * The most common way a chat actually moves between people today is a pasted
 * Markdown transcript, so LNKZ treats that as a first-class import rather than
 * dumping it into one undifferentiated blob.
 */
export function importMarkdown(payload: string): { conversations: ConversationInput[]; warnings: string[] } {
  const lines = payload.replace(/\r\n/g, "\n").split("\n");
  const warnings: string[] = [];
  let title = "";
  let inFence = false;

  const messages: MessageInput[] = [];
  let current: { role: string; author?: string; buffer: string[] } | null = null;

  const flush = () => {
    if (!current) return;
    const content = current.buffer.join("\n").trim();
    if (content) {
      messages.push({
        role: normalizeRole(current.role),
        content,
        author: current.author && !KNOWN_SPEAKERS.has(current.author.toLowerCase()) ? current.author : undefined,
      });
    }
    current = null;
  };

  for (const line of lines) {
    if (line.trim().startsWith("```")) inFence = !inFence;

    if (!inFence) {
      const heading = HEADING.exec(line);
      if (heading) {
        const text = heading[2].trim();
        if (heading[1].length === 1 && !title) {
          title = text;
          continue;
        }
        if (isSpeaker(text)) {
          flush();
          current = { role: text, author: text, buffer: [] };
          continue;
        }
        if (heading[1].length <= 2) {
          // A structural heading such as "Transcript" or "Summary".
          flush();
          continue;
        }
      }

      const bold = BOLD_SPEAKER.exec(line);
      if (bold && isSpeaker(bold[1])) {
        flush();
        current = { role: bold[1], author: bold[1], buffer: bold[2] ? [bold[2]] : [] };
        continue;
      }

      const plain = PLAIN_SPEAKER.exec(line);
      if (plain && isSpeaker(plain[1])) {
        flush();
        current = { role: plain[1], author: plain[1], buffer: plain[2] ? [plain[2]] : [] };
        continue;
      }
    }

    if (current) current.buffer.push(line);
    else if (line.trim()) current = { role: "other", buffer: [line] };
  }
  flush();

  if (!messages.length) {
    warnings.push("No speaker headings were found, so the document was kept as a single note.");
    return {
      conversations: asSingleNote(payload, title),
      warnings,
    };
  }

  const conversation = buildConversation({
    title: title || titleFromMessages(messages, "Pasted transcript"),
    provider: "markdown",
    app: "transcript",
    messages,
    tags: ["imported", "markdown"],
  });
  return { conversations: conversation ? [conversation] : [], warnings };
}

function isSpeaker(value: string): boolean {
  const normalized = value.trim().toLowerCase().replace(/[:：]$/, "");
  if (KNOWN_SPEAKERS.has(normalized)) return true;
  return normalized.length <= 24 && /^[a-z][a-z .'-]*$/.test(normalized) && normalized.split(" ").length <= 3;
}

function asSingleNote(payload: string, title: string): ConversationInput[] {
  const conversation = buildConversation({
    title: title || "Pasted note",
    provider: "markdown",
    app: "note",
    messages: [{ role: "user", content: payload.trim() }],
    tags: ["imported", "markdown", "note"],
  });
  return conversation ? [conversation] : [];
}
