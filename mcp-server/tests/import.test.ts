import assert from "node:assert/strict";
import test from "node:test";
import { detectFormat, importConversations } from "../src/import/index.js";

const chatGptExport = [{
  title: "Rollout plan",
  create_time: 1_735_689_600,
  current_node: "c2",
  mapping: {
    root: { id: "root", parent: null, message: null, children: ["u1"] },
    u1: {
      id: "u1",
      parent: "root",
      message: {
        id: "u1",
        author: { role: "user" },
        create_time: 1_735_689_601,
        content: { content_type: "text", parts: ["Which rollout should we use?"] },
      },
    },
    // An abandoned edit branch. It must not appear in the import.
    a1: {
      id: "a1",
      parent: "u1",
      message: {
        id: "a1",
        author: { role: "assistant" },
        content: { content_type: "text", parts: ["Discarded draft answer."] },
      },
    },
    c2: {
      id: "c2",
      parent: "u1",
      message: {
        id: "c2",
        author: { role: "assistant" },
        create_time: 1_735_689_602,
        content: { content_type: "text", parts: ["We decided to use the staged rollout."] },
        metadata: { model_slug: "gpt-4o" },
      },
    },
  },
}];

const claudeExport = [{
  uuid: "3f0d5a2e-0000-4000-8000-000000000000",
  name: "Schema review",
  created_at: "2026-02-01T10:00:00Z",
  chat_messages: [
    { uuid: "m1", sender: "human", text: "Is the index on updated_at enough?", created_at: "2026-02-01T10:00:01Z" },
    { uuid: "m2", sender: "assistant", content: [{ type: "text", text: "Add a composite index for the provider filter." }] },
  ],
}];

test("format detection separates the vendor export shapes", () => {
  assert.equal(detectFormat(JSON.stringify(chatGptExport)), "chatgpt");
  assert.equal(detectFormat(JSON.stringify(claudeExport)), "claude");
  assert.equal(detectFormat(JSON.stringify({ contents: [{ role: "user", parts: [{ text: "hi there" }] }] })), "gemini");
  assert.equal(detectFormat("# Title\n\n### User\n\nhello there"), "markdown");
  assert.equal(detectFormat("User: hello\nAssistant: hi"), "text");
});

test("a ChatGPT export follows current_node and drops abandoned branches", () => {
  const result = importConversations(JSON.stringify(chatGptExport));
  assert.equal(result.format, "chatgpt");
  assert.equal(result.conversations.length, 1);

  const conversation = result.conversations[0];
  assert.equal(conversation.title, "Rollout plan");
  assert.equal(conversation.source.provider, "chatgpt");
  assert.deepEqual(conversation.messages.map((message) => message.role), ["user", "assistant"]);
  assert.equal(conversation.messages.some((message) => message.content.includes("Discarded draft")), false);
  assert.equal(conversation.messages[1].createdAt, new Date(1_735_689_602 * 1000).toISOString());
});

test("a Claude export reads both the text field and the typed content blocks", () => {
  const result = importConversations(JSON.stringify(claudeExport));
  assert.equal(result.format, "claude");
  const conversation = result.conversations[0];
  assert.equal(conversation.title, "Schema review");
  assert.equal(conversation.messages[0].role, "user");
  assert.equal(conversation.messages[1].content, "Add a composite index for the provider filter.");
});

test("a Gemini request body imports as a conversation", () => {
  const result = importConversations(JSON.stringify({
    contents: [
      { role: "user", parts: [{ text: "Summarize the launch thread." }] },
      { role: "model", parts: [{ text: "The team chose the staged rollout." }] },
    ],
  }));
  assert.equal(result.format, "gemini");
  assert.deepEqual(result.conversations[0].messages.map((message) => message.role), ["user", "assistant"]);
});

test("a Markdown transcript splits on speaker headings and keeps fenced code intact", () => {
  const payload = [
    "# Index review",
    "",
    "## Transcript",
    "",
    "### User",
    "",
    "Here is the query plan:",
    "",
    "```sql",
    "### not a heading inside a fence",
    "SELECT 1;",
    "```",
    "",
    "### Assistant",
    "",
    "We decided to add the composite index.",
  ].join("\n");

  const result = importConversations(payload);
  assert.equal(result.format, "markdown");
  const conversation = result.conversations[0];
  assert.equal(conversation.title, "Index review");
  assert.equal(conversation.messages.length, 2);
  assert.ok(conversation.messages[0].content.includes("### not a heading inside a fence"));
  assert.equal(conversation.messages[1].role, "assistant");
});

test("a labeled paste splits on speaker labels", () => {
  const result = importConversations("User: what changed?\nAssistant: the storage layer moved to SQLite.");
  assert.equal(result.format, "text");
  assert.deepEqual(result.conversations[0].messages.map((message) => message.role), ["user", "assistant"]);
});

test("an unlabeled paste is kept whole rather than guessed at", () => {
  const result = importConversations("Just a block of notes with no speakers at all in it.");
  assert.equal(result.conversations[0].messages.length, 1);
  assert.ok(result.warnings.length > 0);
});

test("a LNKZ packet can be re-imported so a handoff becomes a conversation elsewhere", () => {
  const packet = {
    format: "lnkz.conversation.v1",
    conversation: {
      id: "8b6f2a1c-0000-4000-8000-000000000000",
      version: 1,
      title: "Relayed thread",
      source: { provider: "claude", app: "desktop" },
      participants: ["Nihal"],
      tags: ["launch"],
      messages: [{ id: "m1", role: "user", content: "Carry this forward.", createdAt: "2026-03-01T00:00:00Z" }],
      createdAt: "2026-03-01T00:00:00Z",
      updatedAt: "2026-03-01T00:00:00Z",
    },
  };
  const result = importConversations(JSON.stringify(packet));
  assert.equal(result.format, "lnkz");
  assert.equal(result.conversations[0].source.provider, "claude");
  assert.ok(result.conversations[0].tags?.includes("imported"));
});

test("bad input fails loudly instead of storing an empty conversation", () => {
  assert.throws(() => importConversations("", "auto"), /Nothing to import/);
  assert.throws(() => importConversations("{not json", "chatgpt"), /not valid JSON/);
  assert.throws(() => importConversations(JSON.stringify([{ mapping: {}, current_node: "" }]), "chatgpt"), /No conversations found/);
});
