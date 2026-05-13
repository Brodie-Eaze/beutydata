import { useState } from "react";
import { api } from "../api";

export default function Search() {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(""); setRes(null); setBusy(true);
    try {
      const r = await api("/api/search", { method: "POST", body: { phone, email } });
      setRes(r);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-stone-500">Pre-booking check</div>
        <h1 className="text-3xl mt-1">Search a prospective client</h1>
        <p className="text-sm text-stone-600 mt-2 max-w-2xl">
          Searches are logged for privacy-compliance audit. Only search clients
          who have given consent under your booking T&Cs.
        </p>
      </div>

      <form onSubmit={submit} className="card p-5 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="label">Phone</label>
          <input className="input" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="label">Email</label>
          <input className="input" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <button className="btn-primary" disabled={busy}>{busy ? "Searching…" : "Search"}</button>
      </form>

      {err && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{err}</div>}
      {res && <Results res={res} />}
    </div>
  );
}

function Results({ res }) {
  if (!res.matched) {
    return (
      <div className="card p-5 border-green-200 bg-green-50">
        <div className="font-medium text-green-900">No matches found</div>
        <div className="text-sm text-green-800 mt-1">
          This contact does not appear in the network.
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="card p-6" style={{ borderColor: "#e7c388", background: "#fffaf2" }}>
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-stone-600">Active flags</div>
            <div className="text-4xl mt-1" style={{ fontFamily: "Fraunces, serif" }}>{res.total_active_flags}</div>
          </div>
          {res.consumer_display && (
            <div className="text-sm text-stone-600">Match: <span className="font-mono">{res.consumer_display}</span></div>
          )}
        </div>
        <ul className="text-sm mt-4 grid grid-cols-2 gap-1">
          {res.breakdown.map(b => (
            <li key={b.incident_type} className="flex justify-between">
              <span>{b.incident_type.replace(/_/g, " ")}</span>
              <span className="font-medium">{b.count}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card p-5">
        <h2 className="text-lg mb-3">Your salon's history with this client</h2>
        {res.own_incidents.length === 0
          ? <div className="text-sm text-stone-500">No prior incidents from your salon.</div>
          : (
            <ul className="space-y-1 text-sm">
              {res.own_incidents.map(i => (
                <li key={i.id} className="flex justify-between border-b border-stone-100 py-1.5">
                  <span>{new Date(i.incident_date).toLocaleDateString()} — {i.incident_type.replace(/_/g, " ")}</span>
                  <span className="text-stone-500">{i.status}</span>
                </li>
              ))}
            </ul>
          )}
      </div>

      <div className="text-sm text-stone-600 bg-stone-100 rounded p-3">
        {res.other_salons_count} other member salon{res.other_salons_count === 1 ? "" : "s"} reported this contact.
        Identities of other salons are never shared.
      </div>
    </div>
  );
}
