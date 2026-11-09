#!/usr/bin/env node
/** End-to-end smoke test for the LLMM web console and embedded LNKZ REST relay. */
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";

const external = process.argv[2];
const apiKey = process.env.LNKZ_API_KEY ?? randomBytes(12).toString("hex");
const port = Number(process.env.SMOKE_PORT ?? 3199);
const baseUrl = external ?? `http://127.0.0.1:${port}`;
let child;
let dataDir;
let failures = 0;

function check(label, condition, detail = "") {
  if (condition) console.log(`  ok   ${label}`);
  else { failures += 1; console.error(`  FAIL ${label}${detail ? ` — ${detail}` : ""}`); }
}

async function request(path, init = {}) {
  const headers = { authorization: `Bearer ${apiKey}`, ...init.headers };
  if (init.body) headers["content-type"] = "application/json";
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
  const text = await response.text();
  let body;
  try { body = text ? JSON.parse(text) : undefined; } catch { body = text; }
  return { status: response.status, body, headers: response.headers };
}

async function boot() {
  dataDir = await mkdtemp(join(tmpdir(), "llmm-smoke-"));
  child = spawn(process.execPath, ["dist/index.mjs"], {
    cwd: fileURLToPath(new URL("../relay/", import.meta.url)),
    env: { ...process.env, NODE_ENV: "production", HOST: "127.0.0.1", PORT: String(port),
      LNKZ_API_KEY: apiKey, LNKZ_DB_FILE: join(dataDir, "lnkz.db"), LNKZ_PUBLIC_BASE_URL: baseUrl },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stderr.on("data", (chunk) => process.stderr.write(`  [relay] ${chunk}`));
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try { if ((await fetch(`${baseUrl}/health`)).ok) return; } catch { /* starting */ }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Relay did not become healthy in 20s.");
}

try {
  if (!external) { console.log("Booting the built relay..."); await boot(); }
  console.log(`Smoke testing ${baseUrl}\n`);
  const health = await request("/health");
  check("health reports the relay", health.status === 200 && health.body?.service === "lnkz");
  check("health reports context forwarding without exposing the secret", health.body?.contextForwarding && !JSON.stringify(health.body).includes(apiKey));
  const unauthorized = await fetch(`${baseUrl}/api/stats`);
  check("the API refuses an unauthenticated request", unauthorized.status === 401);
  const imported = await request("/api/conversations/import", { method: "POST", body: JSON.stringify({ payload: "User: which store?\nAssistant: SQLite for the relay.", tags: ["smoke"] }) });
  const conversation = imported.body?.conversations?.[0];
  check("a plain paste imports over REST", imported.status === 201 && Boolean(conversation));
  const search = await request("/api/conversations/search", { method: "POST", body: JSON.stringify({ query: "sqlite relay" }) });
  check("search finds the imported chat", search.body?.matches?.length === 1);
  const packet = await request("/api/context/packet", { method: "POST", body: JSON.stringify({ query: "sqlite", budgetTokens: 1000, includeExternal: false }) });
  check("a context packet stays within budget", packet.body?.packet?.usedTokens <= packet.body?.packet?.budgetTokens);
  const handoff = await request(`/api/conversations/${conversation.id}/handoffs`, { method: "POST", body: JSON.stringify({ ttlMinutes: 10, maxUses: 1, redact: true, audience: "smoke" }) });
  check("a handoff is minted", handoff.status === 201 && handoff.body?.shareUrl?.includes("/share/"));
  const redeemed = await fetch(`${baseUrl}/share/${handoff.body.token}`);
  check("the share link redeems without a key", redeemed.status === 200);
  const spent = await fetch(`${baseUrl}/share/${handoff.body.token}`);
  check("a spent handoff stops working", spent.status === 404);
  console.log(`\n${failures === 0 ? "All smoke checks passed." : `${failures} smoke check(s) failed.`}`);
  process.exitCode = failures === 0 ? 0 : 1;
} catch (error) {
  console.error(`\nSmoke test crashed: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
} finally {
  if (child) await new Promise((resolve) => { child.once("close", resolve); child.kill("SIGTERM"); });
  if (dataDir) await rm(dataDir, { recursive: true, force: true });
}
