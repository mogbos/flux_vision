import { useEffect, useState } from "react";

function Connect({ onBack }) {
  const [credentials, setCredentials] = useState({
    url: "",
    org: "",
    token: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setInitializing(true);
    fetch("/api/credentials")
      .then(async (res) => {
        if (res.status === 404) return null; // no saved creds; keep empty
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.detail || res.statusText);
        }
        return data;
      })
      .then((data) => {
        if (data && isMounted) {
          setCredentials({
            url: data.url || "",
            org: data.org || "",
            token: data.token || "",
          });
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || "Failed to load saved credentials");
      })
      .finally(() => {
        if (isMounted) setInitializing(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(false);
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: credentials.url.trim(),
          org: credentials.org.trim(),
          token: credentials.token,
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.detail || res.statusText);
      }
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to save credentials");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setCredentials({ url: "", org: "", token: "" });
    setSubmitted(false);
  };

  return (
    <section className="panel form-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Secure connect</p>
          <h2>Enter your InfluxDB credentials</h2>
          <p className="muted">We only use these to establish your session.</p>
        </div>
        <button className="btn ghost" onClick={onBack}>← Back</button>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span>INFLUX_URL</span>
          <input
            type="url"
            required
            placeholder="https://us-east-1-1.aws.cloud2.influxdata.com"
            value={credentials.url}
            onChange={(e) => setCredentials({ ...credentials, url: e.target.value })}
          />
        </label>
        <label className="field">
          <span>INFLUX_ORG</span>
          <input
            type="text"
            required
            placeholder="my-observability-team"
            value={credentials.org}
            onChange={(e) => setCredentials({ ...credentials, org: e.target.value })}
          />
        </label>
        <label className="field">
          <span>INFLUX_TOKEN</span>
          <input
            type="password"
            required
            placeholder="Paste your read/write token"
            value={credentials.token}
            onChange={(e) => setCredentials({ ...credentials, token: e.target.value })}
          />
        </label>

        <div className="form-actions">
          <button type="button" className="btn ghost" onClick={clear}>
            Clear
          </button>
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? "Saving..." : "Connect"}
          </button>
        </div>
        {submitted && (
          <div className="notice">Credentials captured. Hook this up to your backend connect flow.</div>
        )}
        {error && <div className="notice error">Error: {error}</div>}
        {initializing && <div className="notice">Loading saved credentials…</div>}
      </form>
    </section>
  );
}

export default Connect;
