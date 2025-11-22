import { useMemo, useState } from "react";
import Connect from "./components/Connect.jsx";

const accents = [
  "linear-gradient(135deg, #7c3aed 0%, #2563eb 50%, #0ea5e9 100%)",
  "linear-gradient(135deg, #22c55e 0%, #16a34a 60%, #0ea5e9 100%)",
  "linear-gradient(135deg, #f59e0b 0%, #ef4444 60%, #ec4899 100%)",
];

const cards = [
  { title: "Data Explorer", copy: "Visualize your series, filter down to the signal that matters, and save snapshots for your team.", accent: accents[0], icon: "🔍" },
  { title: "Flux Studio", copy: "Craft Flux queries with smart templates, instant previews, and a built-in cheat sheet.", accent: accents[1], icon: "🧠" },
  { title: "Pipelines", copy: "Chain transforms, schedule runs, and track lineage with clear version history.", accent: accents[2], icon: "⛓️" },
];

const quickActions = [
  { label: "Create bucket", detail: "Start a fresh data space", color: "#22c55e" },
  { label: "Import CSV", detail: "Upload a dataset in seconds", color: "#06b6d4" },
  { label: "New dashboard", detail: "Build a focused view", color: "#f97316" },
  { label: "Invite teammate", detail: "Share access and roles", color: "#8b5cf6" },
];

function App() {
  const [view, setView] = useState("landing");
  const today = useMemo(() => new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", weekday: "short" }), []);

  const handleLaunch = () => setView("credentials");

  return (
    <div className="page">
      <div className="glow glow-a" />
      <div className="glow glow-b" />

      {view === "landing" && (
        <>
          <header className="hero">
            <div className="badge">Today · {today}</div>
            <h1>
              Flux Vision
              <span className="hero-sub">Observe, explore, and act on your data without friction.</span>
            </h1>
            <div className="cta-row">
              <button className="btn primary" onClick={handleLaunch}>Launch workspace</button>
              <button className="btn ghost">Take the tour</button>
            </div>
            <div className="hero-metrics">
              <div className="metric">
                <div className="metric-label">Live signals</div>
                <div className="metric-value">128</div>
                <div className="metric-foot">streams connected</div>
              </div>
              <div className="metric">
                <div className="metric-label">Freshness</div>
                <div className="metric-value">2.4s</div>
                <div className="metric-foot">avg ingest delay</div>
              </div>
              <div className="metric">
                <div className="metric-label">Team</div>
                <div className="metric-value">14</div>
                <div className="metric-foot">collaborators</div>
              </div>
            </div>
          </header>

          <section className="panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Work smarter</p>
                <h2>Pick a path to start</h2>
                <p className="muted">Jump into the flow that matches what you want to do right now.</p>
              </div>
              <button className="btn subtle">See all tools →</button>
            </div>
            <div className="card-grid">
              {cards.map((card) => (
                <article key={card.title} className="card" style={{ "--accent": card.accent }}>
                  <div className="card-icon">{card.icon}</div>
                  <h3>{card.title}</h3>
                  <p className="muted">{card.copy}</p>
                  <div className="card-footer">
                    <span>Open</span>
                    <span>→</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Quick actions</p>
                <h2>Do the obvious things fast</h2>
              </div>
              <button className="btn subtle">View recent activity</button>
            </div>
            <div className="action-grid">
              {quickActions.map((action) => (
                <button key={action.label} className="action" style={{ "--pill": action.color }}>
                  <div className="pill" />
                  <div>
                    <div className="action-label">{action.label}</div>
                    <div className="muted small">{action.detail}</div>
                  </div>
                  <span className="action-caret">↗</span>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {view === "credentials" && (
        <Connect onBack={() => setView("landing")} />
      )}
    </div>
  );
}

export default App;
