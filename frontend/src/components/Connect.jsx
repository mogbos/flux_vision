import { useEffect, useState } from "react";

function Connect({ onBack, onConnected }) {
  const [credentials, setCredentials] = useState({
    url: "",
    org: "",
    token: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [checkState, setCheckState] = useState({
    status: "idle", // idle | checking | ok | error
    message: "",
  });

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
        if (isMounted) {
          setCheckState({ status: "error", message: err.message || "Failed to load saved credentials" });
        }
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
    setLoading(true);
    setCheckState({ status: "idle", message: "" });

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

      // After saving, check Influx connectivity.
      setCheckState({ status: "checking", message: "Pinging InfluxDB…" });
      const checkRes = await fetch("/api/influx/check");
      const checkPayload = await checkRes.json().catch(() => ({}));
      if (!checkRes.ok) {
        throw new Error(checkPayload.detail || checkRes.statusText);
      }
      setCheckState({ status: "ok", message: "Connected to InfluxDB." });
      if (typeof onConnected === "function") {
        onConnected();
      }
    } catch (err) {
      const message = err.message || "Failed to save credentials";
      setCheckState({ status: "error", message });
      setSubmitted(false);
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
        {submitted && checkState.status === "ok" && (
          <div className="notice">Credentials captured and InfluxDB is reachable.</div>
        )}
        {initializing && <div className="notice">Loading saved credentials…</div>}

        {checkState.status !== "idle" && (
          <div
            className={`status-card ${
              checkState.status === "ok"
                ? "status-ok"
                : checkState.status === "checking"
                  ? "status-checking"
                  : "status-error"
            }`}
          >
            <div className="status-dot" />
            <div>
              <div className="status-title">
                {checkState.status === "ok"
                  ? "InfluxDB reachable"
                  : checkState.status === "checking"
                    ? "Checking connectivity"
                    : "InfluxDB not reachable"}
              </div>
              <div className="muted small">
                {checkState.message || "No additional details."}
              </div>
            </div>
          </div>
        )}
      </form>
    </section>
  );
}

export default Connect;
