import { useState } from "react";
import { api } from "../api";

export default function Search() {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr(""); setRes(null);
    try {
      const r = await api("/api/search", { method: "POST", body: { phone, email } });
      setRes(r);
    } catch (e) { setErr(e.message); }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Search a prospective client</h1>
      <p className="text-sm text-stone-600">
        Enter the client's phone and/or email. All searches are logged for
        privacy-compliance audit. You may only search clients who have given
        consent under your booking T&Cs.
      </p>
      <form onSubmit={submit} className="flex gap-3">
        <input className="border rounded px-3 py-2 flex-1" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
        <input className="border rounded px-3 py-2 flex-1" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <button className="bg-stone-900 text-white px-4 py-2 rounded">Search</button>
      </form>
      {err && <div className="text-red-600 text-sm">{err}</div>}
      {res && <Results res={res} />}
    </div>
  );
}

function Results({ res }) {
  if (!res.matched) return <div className="p-4 bg-green-50 border border-green-200 rounded">No matches found.</div>;
  return (
    <div className="space-y-4">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded">
        <div className="text-lg font-semibold">{res.total_active_flags} active flag(s)</div>
        {res.consumer_display && <div className="text-sm text-stone-600">Match: {res.consumer_display}</div>}
        <ul className="text-sm mt-2">
          {res.breakdown.map(b => (
            <li key={b.incident_type}>• {b.count} × {b.incident_type.replace(/_/g, " ")}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="font-semibold mb-2">Your salon's history with this client</h2>
        {res.own_incidents.length === 0 && <div className="text-sm text-stone-500">None.</div>}
        <ul className="space-y-1">
          {res.own_incidents.map(i => (
            <li key={i.id} className="text-sm">
              {new Date(i.incident_date).toLocaleDateString()} — {i.incident_type.replace(/_/g, " ")} ({i.status})
            </li>
          ))}
        </ul>
      </div>
      <div className="text-sm text-stone-600">
        {res.other_salons_count} other member salon(s) have reported this contact.
        (Identities of other salons are never shared.)
      </div>
    </div>
  );
}
