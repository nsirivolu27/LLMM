import { configuredExternalConnectors } from "./connectors/index.js";
import { createLnkzConnector } from "./connectors/lnkz.js";
import { SqliteConversationStore } from "./store/index.js";
import type { ConversationStore } from "./store/index.js";
import type { Connector } from "./types.js";

export interface Runtime {
  store: ConversationStore;
  core: Connector;
  connectors: Connector[];
}

export function createRuntime(store: ConversationStore = new SqliteConversationStore()): Runtime {
  const core = createLnkzConnector(store);
  return { store, core, connectors: [core, ...configuredExternalConnectors()] };
}
