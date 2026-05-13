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
    const data = await r.json();
    setItems(data);
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
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 space-y-4">
        <h1 className="text-2xl font-semibold">Dispute an entry about you</h1>
        <p className="text-sm text-stone-600">
          This is a private information-sharing network used by Australian
          beauty businesses. It is <strong>not</strong> a credit report and does
          not affect your credit file. Use this form to view, dispute, or
          request correction of entries about you.
        </p>
        {err && <div className="text-red-600 text-sm">{err}</div>}

        {step === "lookup" && (
          <form onSubmit={lookup} className="space-y-3">
            <input className="w-full border rounded px-3 py-2" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
            <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <button className="bg-stone-900 text-white px-4 py-2 rounded">Look up</button>
          </form>
        )}

        {step === "results" && !selected && (
          <div className="space-y-3">
            {items.length === 0 && <div>No active entries found for the contact details provided.</div>}
            {items.map(i => (
              <button key={i.id} onClick={() => setSelected(i)}
                      className="block w-full text-left border border-stone-200 rounded p-3 hover:bg-stone-50">
                <div className="text-sm text-stone-500">{i.member_ref}</div>
                <div>{i.incident_type.replace(/_/g, " ")} on {new Date(i.incident_date).toLocaleDateString()}</div>
                <div className="text-xs text-stone-500">Status: {i.status}</div>
              </button>
            ))}
          </div>
        )}

        {selected && !done && (
          <div className="space-y-3">
            <div className="text-sm">
              Disputing: {selected.incident_type.replace(/_/g, " ")} ({selected.member_ref})
            </div>
            <textarea className="w-full border rounded px-3 py-2" rows={6} maxLength={2000}
                      placeholder="Explain why this entry is incorrect. Include any facts, dates, or evidence."
                      value={statement} onChange={e => setStatement(e.target.value)} />
            <button onClick={submitDispute} className="bg-stone-900 text-white px-4 py-2 rounded">
              Submit dispute
            </button>
          </div>
        )}

        {done && (
          <div className="bg-green-50 border border-green-200 p-4 rounded">
            Dispute submitted. The reporting salon has 14 days to respond,
            after which the entry will be automatically withdrawn.
          </div>
        )}
      </div>
    </div>
  );
}
