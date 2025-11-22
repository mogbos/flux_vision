import { useEffect, useRef, useState } from "react";

function Workspace() {
  const [buckets, setBuckets] = useState([]);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch("/api/buckets")
      .then(async (res) => {
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(payload.detail || res.statusText);
        }
        return payload;
      })
      .then((data) => {
        if (isMounted) {
          setBuckets(data || []);
          if (data?.length) {
            setSelected((prev) => prev || data[0].id);
          }
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || "Failed to load buckets");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (!dropdownRef.current || dropdownRef.current.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const currentBucket = buckets.find((b) => b.id === selected);

  return (
    <div className="panel" style={{ minHeight: 320 }}>
      <div className="panel-head">
        <div>
          <p className="eyebrow">Workspace</p>
          <h2>Select a bucket to start</h2>
          <p className="muted">Pick a bucket to explore data and run queries.</p>
        </div>
      </div>

      <div className="field" style={{ maxWidth: 360, marginTop: 12 }}>
        <span>Bucket</span>
        <div className="dropdown" ref={dropdownRef}>
          <button
            type="button"
            className="dropdown-button"
            onClick={() => setOpen((v) => !v)}
            disabled={loading || !buckets.length}
          >
            <div className="dropdown-label">
              {currentBucket ? currentBucket.name : loading ? "Loading…" : "No buckets found"}
            </div>
            <span className={`dropdown-caret ${open ? "open" : ""}`}>⌄</span>
          </button>
          {open && (
            <div className="dropdown-menu">
              {!buckets.length && (
                <div className="dropdown-item disabled">No buckets found</div>
              )}
              {buckets.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className={`dropdown-item ${selected === b.id ? "active" : ""}`}
                  onClick={() => {
                    setSelected(b.id);
                    setOpen(false);
                  }}
                >
                  <div className="dropdown-item-title">{b.name}</div>
                  {b.description && <div className="dropdown-item-sub">{b.description}</div>}
                </button>
              ))}
            </div>
          )}
        </div>
        {loading && <div className="muted small">Loading buckets…</div>}
        {error && <div className="notice error">Error: {error}</div>}
      </div>
    </div>
  );
}

export default Workspace;
