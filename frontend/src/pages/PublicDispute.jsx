import { useState } from "react";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function PublicDispute() {
  const [step, setStep] = useState("lookup");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [selected, setSelected] = useState(null);
  const [statement, setStatement] = useState("");
  const [done, setDone] = useState(false);

  async function lookup(e) {
    e.preventDefault();
    setErr("");
    const r = await fetch(`${BASE}/api/public/lookup`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, email }),
    });
    if (!r.ok) { setErr(await r.text()); return; }
    setItems(await r.json());
    setStep("results");
  }

  async function submitDispute() {
    setErr("");
    const r = await fetch(`${BASE}/api/public/dispute/${selected.id}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, email, statement, evidence_keys: [] }),
    });
    if (!r.ok) { setErr((await r.json()).detail); return; }
    setDone(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl card p-8">
        <div className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-2">Consumer portal</div>
        <h1 className="text-3xl mb-2">Review or dispute an entry</h1>
        <p className="text-sm text-stone-600 mb-6">
          This is a private information-sharing network used by Australian
          beauty businesses. It is <strong>not</strong> a credit report and
          does not affect your credit file. Use this page to view, dispute, or
          request correction of any entry about you.
        </p>

        {err && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">{err}</div>}

        {step === "lookup" && (
          <form onSubmit={lookup} className="space-y-4">
            <div>
              <label className="label">Phone</label>
              <input className="input" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <button className="btn-primary w-full">Look up</button>
          </form>
        )}

        {step === "results" && !selected && (
          <div className="space-y-3">
            {items.length === 0 && (
              <div className="bg-green-50 border border-green-200 rounded p-4 text-sm">
                No active entries found for the contact details provided.
              </div>
            )}
            {items.map(i => (
              <button key={i.id} onClick={() => setSelected(i)}
                      className="block w-full text-left border border-stone-200 rounded-lg p-4 hover:bg-stone-50 transition">
                <div className="text-xs uppercase tracking-wide text-stone-500">{i.member_ref}</div>
                <div className="mt-1">{i.incident_type.replace(/_/g, " ")}</div>
                <div className="text-xs text-stone-500 mt-1">
                  On {new Date(i.incident_date).toLocaleDateString()} · Status: {i.status}
                </div>
              </button>
            ))}
            {items.length > 0 && (
              <p className="text-xs text-stone-500 pt-2">
                Salon identities are never revealed to you. To resolve directly,
                contact the business you believe lodged the entry.
              </p>
            )}
          </div>
        )}

        {selected && !done && (
          <div className="space-y-4">
            <div className="bg-stone-50 border border-stone-200 rounded p-3 text-sm">
              <div className="text-xs uppercase tracking-wide text-stone-500">Disputing</div>
              <div>{selected.incident_type.replace(/_/g, " ")} ({selected.member_ref})</div>
            </div>
            <div>
              <label className="label">Your statement</label>
              <textarea className="input" rows={6} maxLength={2000}
                        placeholder="Explain why this entry is incorrect. Include dates, facts, and any evidence you can describe."
                        value={statement} onChange={e => setStatement(e.target.value)} />
            </div>
            <button onClick={submitDispute} className="btn-primary w-full">Submit dispute</button>
          </div>
        )}

        {done && (
          <div className="bg-green-50 border border-green-200 p-4 rounded text-sm">
            Your dispute has been submitted. The reporting salon has 14 days to
            respond. If they don't, the entry is automatically withdrawn.
          </div>
        )}
      </div>
    </div>
  );
}
