import React from "react";
import ReactDOM from "react-dom/client";
import {
  ArrowRight,
  Camera,
  Github,
  Heart,
  Layers3,
  LockKeyhole,
  Map,
  MapPin,
  MessageCircle,
  Navigation,
  Radio,
  ShieldCheck,
  Sparkles,
  UserRound,
  Zap,
} from "lucide-react";
import "./styles.css";

const features = [
  {
    icon: Camera,
    title: "Location-based photo posts",
    text: "Share a photo with the place that made it worth remembering.",
  },
  {
    icon: Navigation,
    title: "Nearby discovery",
    text: "Browse posts around your current area instead of scrolling a detached feed.",
  },
  {
    icon: UserRound,
    title: "User profiles",
    text: "Keep a simple profile of posts, places, and moments you have shared.",
  },
  {
    icon: MapPin,
    title: "Location tags",
    text: "Attach places to photos so every post has useful local context.",
  },
  {
    icon: Radio,
    title: "Real-time activity",
    text: "Surface fresh local posts and interactions as nearby moments unfold.",
  },
  {
    icon: LockKeyhole,
    title: "Secure accounts",
    text: "JWT authentication keeps sign-in and protected routes straightforward.",
  },
];

const steps = [
  "Upload a photo",
  "Attach a location",
  "Discover nearby posts",
  "Interact with local content",
];

const stack = [
  "React frontend",
  "Django REST backend",
  "FastAPI async processing",
  "Celery background jobs",
  "GeoDjango/PostGIS geospatial queries",
  "JWT authentication",
];

function App() {
  return (
    <main>
      <section className="hero" id="top">
        <nav className="nav" aria-label="Primary navigation">
          <a className="brand" href="#top" aria-label="LNKZ home">
            <span className="brand-mark">L</span>
            <span>LNKZ</span>
          </a>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#stack">Stack</a>
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <MapPin size={16} aria-hidden="true" />
              Geo-social photo sharing
            </p>
            <h1>Share moments tied to places.</h1>
            <p className="hero-text">
              LNKZ helps people discover photos and stories around real-world
              locations, from campus corners to neighborhood spots worth
              revisiting.
            </p>
            <div className="hero-actions">
              <a
                className="button primary"
                href="https://github.com/nsirivolu27/LNKZ"
                target="_blank"
                rel="noreferrer"
              >
                <Github size={18} aria-hidden="true" />
                View GitHub
              </a>
              <a className="button secondary" href="#features">
                Explore Features
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
          </div>

          <AppPreview />
        </div>
      </section>

      <section className="section" id="features">
        <div className="section-heading">
          <p className="eyebrow">
            <Sparkles size={16} aria-hidden="true" />
            Product shape
          </p>
          <h2>A social feed with a sense of place.</h2>
          <p>
            LNKZ is built around the idea that a post becomes more useful when
            it carries where it happened, not just when it was uploaded.
          </p>
        </div>
        <div className="feature-grid">
          {features.map(({ icon: Icon, title, text }) => (
            <article className="card feature-card" key={title}>
              <span className="icon-wrap">
                <Icon size={22} aria-hidden="true" />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section split" id="how">
        <div className="section-heading align-left">
          <p className="eyebrow">
            <Layers3 size={16} aria-hidden="true" />
            How it works
          </p>
          <h2>Simple posting, local discovery.</h2>
          <p>
            The main flow stays intentionally small: capture something, connect
            it to a place, and let nearby people find it in context.
          </p>
        </div>
        <div className="steps">
          {steps.map((step, index) => (
            <article className="step" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{step}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="preview-band" aria-label="Mock app preview">
        <div className="preview-copy">
          <p className="eyebrow">
            <Map size={16} aria-hidden="true" />
            Mock app preview
          </p>
          <h2>Designed for posts that belong somewhere.</h2>
          <p>
            The product direction pairs a nearby feed with place cards, quick
            reactions, and photo-first posts that make local browsing feel
            grounded.
          </p>
        </div>
        <div className="wide-preview">
          <div className="map-panel">
            <span className="pin pin-one" />
            <span className="pin pin-two" />
            <span className="pin pin-three" />
          </div>
          <div className="feed-panel">
            <div className="feed-card">
              <div className="photo-block warm" />
              <div>
                <strong>Library steps</strong>
                <span>4 posts nearby</span>
              </div>
            </div>
            <div className="feed-card">
              <div className="photo-block cool" />
              <div>
                <strong>North quad</strong>
                <span>Fresh activity</span>
              </div>
            </div>
            <div className="feed-card">
              <div className="photo-block green" />
              <div>
                <strong>Cafe corner</strong>
                <span>Tagged 12 min ago</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section split story-section">
        <div>
          <p className="eyebrow">
            <Heart size={16} aria-hidden="true" />
            Project story
          </p>
          <h2>Built as a focused student project.</h2>
        </div>
        <p className="story">
          I built LNKZ to explore how social apps can feel more connected to
          real places instead of only algorithmic feeds. The project combines a
          familiar photo-sharing idea with geospatial search, async processing,
          and secure account flows.
        </p>
      </section>

      <section className="section" id="stack">
        <div className="section-heading">
          <p className="eyebrow">
            <Zap size={16} aria-hidden="true" />
            Technical overview
          </p>
          <h2>A practical full-stack architecture.</h2>
          <p>
            The repo is structured around separate services for the web
            experience, API layer, background processing, and geospatial lookup.
          </p>
        </div>
        <div className="stack-grid">
          {stack.map((item) => (
            <div className="stack-pill" key={item}>
              <ShieldCheck size={18} aria-hidden="true" />
              {item}
            </div>
          ))}
        </div>
      </section>

      <footer className="footer" id="contact">
        <div>
          <strong>LNKZ</strong>
          <p>Location-aware photo sharing, built as a portfolio-ready project.</p>
        </div>
        <a
          className="button primary"
          href="https://github.com/nsirivolu27/LNKZ"
          target="_blank"
          rel="noreferrer"
        >
          <Github size={18} aria-hidden="true" />
          GitHub Repository
        </a>
      </footer>
    </main>
  );
}

function AppPreview() {
  return (
    <div className="phone-shell" aria-label="LNKZ mobile app preview">
      <div className="phone-top">
        <span>LNKZ</span>
        <span>Nearby</span>
      </div>
      <div className="photo-hero">
        <span className="photo-tag">
          <MapPin size={14} aria-hidden="true" />
          West Village
        </span>
      </div>
      <div className="phone-content">
        <div>
          <p className="small-label">Live nearby</p>
          <h3>Evening light on campus</h3>
        </div>
        <div className="action-row" aria-label="Post interactions">
          <span>
            <Heart size={16} aria-hidden="true" />
            28
          </span>
          <span>
            <MessageCircle size={16} aria-hidden="true" />
            6
          </span>
        </div>
        <div className="mini-list">
          <div>
            <span className="dot teal" />
            Quad lawn
          </div>
          <div>
            <span className="dot rose" />
            Coffee spot
          </div>
          <div>
            <span className="dot amber" />
            Study hall
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
