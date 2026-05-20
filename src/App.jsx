import {
  ArrowRight,
  Camera,
  Github,
  Lock,
  MapPin,
  MessageCircle,
  Navigation,
  Radar,
  Send,
  Sparkles,
  UserCircle,
  Zap,
} from "lucide-react";
import "./styles.css";

const githubUrl = "https://github.com/nsirivolu27/LNKZ";

const features = [
  {
    icon: Camera,
    title: "Location-based photo posts",
    text: "Share photos with the place they came from, so context stays attached to the moment.",
  },
  {
    icon: Radar,
    title: "Nearby discovery",
    text: "Browse posts around a neighborhood, campus, event, or city block instead of only scrolling a global feed.",
  },
  {
    icon: UserCircle,
    title: "User profiles",
    text: "Keep each post tied to a real account with a lightweight profile and activity history.",
  },
  {
    icon: MapPin,
    title: "Location tags",
    text: "Attach coordinates and place metadata so posts can be searched and grouped geographically.",
  },
  {
    icon: Zap,
    title: "Real-time activity",
    text: "Designed with async processing and activity updates in mind for uploads and local feeds.",
  },
  {
    icon: Lock,
    title: "Secure accounts",
    text: "JWT-backed authentication keeps the API structure realistic for a full-stack project.",
  },
];

const steps = [
  ["Upload a photo", "Post a real moment from your phone or camera roll."],
  ["Attach a location", "Use a place tag so the post belongs somewhere specific."],
  ["Discover nearby posts", "Explore what people are sharing around a selected area."],
  ["Interact locally", "Comment, react, and follow local activity as it changes."],
];

const stack = [
  "React frontend",
  "Django REST backend",
  "FastAPI async processing",
  "Celery background jobs",
  "GeoDjango + PostGIS queries",
  "JWT authentication",
];

function App() {
  return (
    <main>
      <Hero />
      <section id="features" className="section">
        <div className="section-heading">
          <p className="eyebrow">Product</p>
          <h2>Built around places, not just posts.</h2>
          <p>
            LNKZ is a student-built take on social discovery where photos are easier
            to explore because they are connected to real locations.
          </p>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <feature.icon aria-hidden="true" />
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section split-section">
        <div>
          <p className="eyebrow">Flow</p>
          <h2>How it works</h2>
          <p>
            The core loop is intentionally simple: share something, tie it to a
            place, then let people discover it through geography.
          </p>
        </div>
        <div className="steps">
          {steps.map(([title, text], index) => (
            <article className="step" key={title}>
              <span>{index + 1}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section preview-section">
        <div className="section-heading">
          <p className="eyebrow">App preview</p>
          <h2>A local feed with map context.</h2>
          <p>
            This mock preview shows the kind of interface LNKZ is designed for:
            a feed, nearby activity, and location-aware posts in one view.
          </p>
        </div>
        <MockApp />
      </section>

      <section className="section split-section story">
        <div>
          <p className="eyebrow">Project story</p>
          <h2>Why I built it</h2>
        </div>
        <p>
          I built LNKZ to explore how social apps can feel more connected to real
          places instead of only algorithmic feeds. The project gave me a reason to
          work through geospatial queries, async processing, account security, and a
          cleaner product surface in one full-stack build.
        </p>
      </section>

      <section className="section tech-section">
        <div className="section-heading">
          <p className="eyebrow">Technical overview</p>
          <h2>The stack is practical on purpose.</h2>
          <p>
            The services are split by responsibility, but the project stays small
            enough to understand without a long architecture tour.
          </p>
        </div>
        <div className="stack-list">
          {stack.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section className="section contact">
        <div>
          <p className="eyebrow">Source code</p>
          <h2>See the project on GitHub.</h2>
          <p>
            The repo includes the website, Django API, FastAPI pipeline, and
            geospatial service code.
          </p>
        </div>
        <a className="primary-button" href={githubUrl} target="_blank" rel="noreferrer">
          <Github aria-hidden="true" />
          View GitHub
        </a>
      </section>
    </main>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <nav className="nav">
        <a className="brand" href="#top" aria-label="LNKZ home">
          <span>L</span>
          LNKZ
        </a>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href={githubUrl} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </nav>
      <div className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Geo-social photo sharing</p>
          <h1>Share moments tied to places.</h1>
          <p>
            LNKZ helps people discover photos and stories around real-world
            locations, from campus hangouts to neighborhood events.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href={githubUrl} target="_blank" rel="noreferrer">
              <Github aria-hidden="true" />
              View GitHub
            </a>
            <a className="secondary-button" href="#features">
              Explore Features
              <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>
        <HeroMap />
      </div>
    </section>
  );
}

function HeroMap() {
  return (
    <div className="hero-visual" aria-label="Mock location feed preview">
      <div className="map-panel">
        <span className="map-line line-one" />
        <span className="map-line line-two" />
        <span className="map-line line-three" />
        <span className="pin pin-a" />
        <span className="pin pin-b" />
        <span className="pin pin-c" />
        <article className="floating-post post-one">
          <div className="photo-thumb sunset" />
          <div>
            <strong>Riverside Walk</strong>
            <span>12 min ago</span>
          </div>
        </article>
        <article className="floating-post post-two">
          <div className="photo-thumb market" />
          <div>
            <strong>Pop-up market</strong>
            <span>0.4 mi away</span>
          </div>
        </article>
      </div>
    </div>
  );
}

function MockApp() {
  return (
    <div className="mock-shell">
      <aside className="mock-sidebar">
        <div className="mock-logo">L</div>
        <Navigation aria-hidden="true" />
        <Camera aria-hidden="true" />
        <MessageCircle aria-hidden="true" />
      </aside>
      <div className="mock-main">
        <div className="mock-topbar">
          <div>
            <span>Nearby</span>
            <strong>Downtown feed</strong>
          </div>
          <button type="button">
            <Send aria-hidden="true" />
            Post
          </button>
        </div>
        <div className="mock-content">
          <article className="feed-card">
            <div className="feed-image campus" />
            <h3>Late light near the library</h3>
            <p>Tagged at North Campus</p>
          </article>
          <article className="feed-card">
            <div className="feed-image food" />
            <h3>Food trucks showed up early</h3>
            <p>0.2 miles away</p>
          </article>
          <div className="mini-map">
            <span className="map-dot one" />
            <span className="map-dot two" />
            <span className="map-dot three" />
            <Sparkles aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
