import assert from "node:assert/strict";
import test from "node:test";
import { EXPORT_FORMATS, exportConversation, toOpenAi } from "../src/export/index.js";
import { detectFormat, importConversations } from "../src/import/index.js";
import type { Conversation } from "../src/types.js";

function conversation(): Conversation {
  return {
    id: "6f1b2c3d-0000-4000-8000-000000000000",
    version: 1,
    title: "Storage decision",
    summary: "Chose SQLite over Postgres for the first release.",
    source: { provider: "chatgpt", app: "desktop" },
    participants: ["Nihal"],
    tags: ["launch"],
    messages: [
      { id: "m1", role: "user", content: "Postgres or SQLite for the relay?", createdAt: "2026-03-01T10:00:00.000Z" },
      {
        id: "m2",
        role: "assistant",
        content: "We decided to use SQLite. It removes the deployment dependency.\n\nI will write the migration.",
        createdAt: "2026-03-01T10:00:05.000Z",
      },
      { id: "m3", role: "user", content: "Good. What is still open?", createdAt: "2026-03-01T10:01:00.000Z" },
    ],
    createdAt: "2026-03-01T10:00:00.000Z",
    updatedAt: "2026-03-01T10:01:00.000Z",
  };
}

function bodies(source: Conversation) {
  return Object.fromEntries(EXPORT_FORMATS.map((format) => [format, exportConversation(source, format).body]));
}

test("every export format produces content, a mime type, and a filename", () => {
  const source = conversation();
  for (const format of EXPORT_FORMATS) {
    const result = exportConversation(source, format);
    assert.ok(result.body.trim().length > 0, `${format} produced nothing`);
    assert.ok(result.mimeType.includes("/"), `${format} has no mime type`);
    assert.match(result.filename, /^storage-decision\./, `${format} filename is wrong: ${result.filename}`);
  }
});

test("a conversation survives a round trip through every re-importable format", () => {
  const source = conversation();
  const expected = source.messages.map((message) => message.content);

  for (const [format, body] of Object.entries(bodies(source))) {
    const back = importConversations(body);
    const roundTripped = back.conversations[0];
    assert.ok(roundTripped, `${format} did not re-import`);
    assert.deepEqual(
      roundTripped.messages.map((message) => message.content),
      expected,
      `${format} lost or altered message content`,
    );
  }
});

test("the structured formats are detected as themselves, not as a fallback", () => {
  const source = conversation();
  assert.equal(detectFormat(exportConversation(source, "chatgpt").body), "chatgpt");
  assert.equal(detectFormat(exportConversation(source, "claude").body), "claude");
  assert.equal(detectFormat(exportConversation(source, "openai").body), "openai");
  assert.equal(detectFormat(exportConversation(source, "lnkz").body), "lnkz");
  assert.equal(detectFormat(exportConversation(source, "markdown").body), "markdown");
});

test("roles survive the round trip where the target format can express them", () => {
  const source = conversation();
  for (const format of ["chatgpt", "claude", "openai", "lnkz"] as const) {
    const back = importConversations(exportConversation(source, format).body);
    assert.deepEqual(
      back.conversations[0].messages.map((message) => message.role),
      ["user", "assistant", "user"],
      `${format} lost the role sequence`,
    );
  }
});

test("the ChatGPT export is a real tree with current_node on the last message", () => {
  const source = conversation();
  const tree = JSON.parse(exportConversation(source, "chatgpt").body) as {
    current_node: string;
    mapping: Record<string, { parent: string | null; children: string[] }>;
  };

  assert.equal(tree.current_node, "m3");
  assert.equal(tree.mapping.root.parent, null);
  assert.deepEqual(tree.mapping.root.children, ["m1"]);
  assert.equal(tree.mapping.m2.parent, "m1");
  assert.deepEqual(tree.mapping.m3.children, [], "the leaf has no children");
});

test("the OpenAI export is pasteable into an API call", () => {
  const payload = toOpenAi(conversation());
  assert.deepEqual(payload.messages.map((message) => message.role), ["user", "assistant", "user"]);
  assert.equal(payload.messages[1].content.includes("SQLite"), true);
  assert.equal("name" in payload.messages[0], false, "no author means no name field");
});

test("author names are sanitized into the shape the API accepts", () => {
  const source = conversation();
  source.messages[0].author = "Nihal S. (laptop)";
  const payload = toOpenAi(source);
  assert.equal(payload.messages[0].name, "Nihal_S___laptop_");
});

test("an unknown format falls back to plain text rather than throwing", () => {
  const result = exportConversation(conversation(), "not-a-format" as never);
  assert.equal(result.format, "text");
  assert.ok(result.body.includes("Storage decision"));
});

test("the brief variant carries the decisions the plain transcript does not", () => {
  const source = conversation();
  const plain = exportConversation(source, "markdown").body;
  const brief = exportConversation(source, "markdown-brief").body;
  assert.equal(plain.includes("## Decisions"), false);
  assert.ok(brief.includes("## Decisions"));
  assert.ok(brief.includes("SQLite"));
});
