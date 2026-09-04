import React from "react";
import ReactDOM from "react-dom/client";
import {
  ArrowRight,
  Bot,
  Braces,
  Check,
  Cloud,
  Database,
  FileText,
  Figma,
  Github,
  KeyRound,
  Link2,
  MessageSquare,
  Network,
  Search,
  ShieldCheck,
  Slack,
  Sparkles,
  TicketCheck,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import "./styles.css";

const connectors = [
  { icon: Slack, label: "Slack", detail: "Messages and decisions" },
  { icon: TicketCheck, label: "Jira", detail: "Issues and delivery context" },
  { icon: Figma, label: "Figma", detail: "Design text and components" },
  { icon: FileText, label: "Docs", detail: "Research and references" },
  { icon: Zap, label: "Fantasy Copilot", detail: "League decisions" },
];

const capabilities = [
  {
    icon: MessageSquare,
    title: "Save the full thread",
    text: "Normalize messages, roles, people, source links, tags, and summaries into one provider-neutral conversation packet.",
  },
  {
    icon: Link2,
    title: "Hand it off safely",
    text: "Create an expiring bearer link for another person, device, or MCP-compatible AI client—without sharing your permanent key.",
  },
  {
    icon: Search,
    title: "Search across the work",
    text: "Query saved chats alongside Slack, Jira, Figma, documentation feeds, and specialized MCP servers.",
  },
  {
    icon: Braces,
    title: "Keep context portable",
    text: "Every handoff includes structured JSON and a readable Markdown transcript so no single LLM owns the history.",
  },
];

const toolNames = [
  "save_conversation",
  "get_conversation",
  "search_conversations",
  "create_handoff",
  "redeem_handoff",
  "search_context",
  "list_connectors",
];

function App() {
  return (
    <main>
      <section className="hero" id="top">
        <nav className="nav" aria-label="Primary navigation">
          <a className="brand" href="#top" aria-label="LNKZ home">
            <span className="brand-mark"><Link2 size={19} /></span>
            <span>LNKZ</span>
          </a>
          <div className="nav-links">
            <a href="#product">Product</a>
            <a href="#integrations">Integrations</a>
            <a href="#developers">Developers</a>
          </div>
          <a className="nav-cta" href="https://github.com/nsirivolu27/LNKZ" target="_blank" rel="noreferrer">
            <Github size={17} /> GitHub
          </a>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow"><Sparkles size={15} /> Context that moves with you</p>
            <h1>Carry the conversation forward.</h1>
            <p className="hero-text">
              LNKZ is a portable context layer for people and AI. Move a useful chat from one model,
              device, or teammate to the next—then connect it to the tools where the work continues.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#developers">Explore the MCP <ArrowRight size={18} /></a>
              <a className="button secondary" href="https://github.com/nsirivolu27/LNKZ" target="_blank" rel="noreferrer">
                View source
              </a>
            </div>
            <div className="trust-row">
              <span><ShieldCheck size={16} /> Expiring handoffs</span>
              <span><Database size={16} /> Self-hosted data</span>
              <span><Network size={16} /> Provider-neutral</span>
            </div>
          </div>
          <ConversationRelay />
        </div>
      </section>

      <section className="ticker" aria-label="LNKZ workflow">
        <span>Any LLM</span><ArrowRight size={16} /><span>LNKZ context</span><ArrowRight size={16} />
        <span>Any person or device</span><ArrowRight size={16} /><span>The tools that matter</span>
      </section>

      <section className="section" id="product">
        <div className="section-heading">
          <p className="eyebrow"><Workflow size={15} /> One context layer</p>
          <h2>Your chats stop being dead ends.</h2>
          <p>
            A conversation can become a handoff, a research source, a project brief, or the missing context
            behind a decision. LNKZ keeps the thread intact while changing where it can be used.
          </p>
        </div>
        <div className="capability-grid">
          {capabilities.map(({ icon: Icon, title, text }, index) => (
            <article className="capability-card" key={title}>
              <div className="card-top"><span>0{index + 1}</span><Icon size={21} /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section integration-section" id="integrations">
        <div className="integration-copy">
          <p className="eyebrow"><Cloud size={15} /> Bring the surrounding context</p>
          <h2>Chats connect to the rest of the work.</h2>
          <p>
            Adapters are optional and failure-isolated. LNKZ remains useful as a private conversation relay,
            then gets richer as each workspace source is connected.
          </p>
          <ul className="check-list">
            <li><Check size={16} /> Search only configured sources</li>
            <li><Check size={16} /> Preserve source URLs and metadata</li>
            <li><Check size={16} /> Report unavailable connectors instead of inventing context</li>
          </ul>
        </div>
        <div className="connector-grid">
          {connectors.map(({ icon: Icon, label, detail }) => (
            <article className="connector-card" key={label}>
              <span className="connector-icon"><Icon size={21} /></span>
              <div><strong>{label}</strong><small>{detail}</small></div>
              <span className="status-dot" aria-label="Optional connector" />
            </article>
          ))}
        </div>
      </section>

      <section className="section developer-section" id="developers">
        <div className="developer-copy">
          <p className="eyebrow"><Braces size={15} /> MCP-native, HTTP-ready</p>
          <h2>One server. Multiple ways in.</h2>
          <p>
            Run LNKZ over Streamable HTTP for hosted clients, stdio for local tools, or the REST surface for
            ordinary applications. The same conversation store powers every transport.
          </p>
          <div className="endpoint-list">
            <span><strong>POST</strong> /mcp</span>
            <span><strong>POST</strong> /api/conversations</span>
            <span><strong>GET</strong> /share/:token</span>
          </div>
        </div>
        <div className="terminal-card">
          <div className="terminal-top"><span /><span /><span /><small>lnkz tools/list</small></div>
          <pre>{toolNames.map((tool) => <code key={tool}><span>↳</span> {tool}</code>)}</pre>
          <div className="terminal-footer"><KeyRound size={15} /> Bearer auth · origin validation · hashed handoff tokens</div>
        </div>
      </section>

      <section className="cta-section">
        <div>
          <p className="eyebrow"><Users size={15} /> Keep the important part</p>
          <h2>The model can change. The context stays yours.</h2>
        </div>
        <a className="button light" href="https://github.com/nsirivolu27/LNKZ" target="_blank" rel="noreferrer">
          Open the repository <ArrowRight size={18} />
        </a>
      </section>

      <footer className="footer">
        <a className="brand" href="#top"><span className="brand-mark"><Link2 size={19} /></span><span>LNKZ</span></a>
        <p>Portable conversation context for people, devices, and AI.</p>
        <span>Open-source MVP · 2026</span>
      </footer>
    </main>
  );
}

function ConversationRelay() {
  return (
    <div className="relay-card" aria-label="Conversation handoff preview">
      <div className="relay-top">
        <span><span className="live-dot" /> Context packet ready</span>
        <small>lnkz.conversation.v1</small>
      </div>
      <div className="chat-stack">
        <div className="message user-message"><span>You</span><p>Compare the launch options and keep the evidence attached.</p></div>
        <div className="message ai-message"><span><Bot size={14} /> AI assistant</span><p>Option B is lower risk. Two Jira items remain open, and the Figma flow needs one review.</p></div>
      </div>
      <div className="handoff-line"><span /><Link2 size={18} /><span /></div>
      <div className="handoff-card">
        <div><KeyRound size={18} /><span><strong>Secure handoff</strong><small>Expires in 60 minutes</small></span></div>
        <span className="packet-id">LNKZ · 8C4F</span>
      </div>
      <div className="destination-row">
        <span><Bot size={15} /> Different LLM</span>
        <span><Users size={15} /> Teammate</span>
        <span><Cloud size={15} /> Other device</span>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><App /></React.StrictMode>,
);
