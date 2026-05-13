import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

const TYPES = [
  { v: "unpaid_invoice", l: "Unpaid invoice" },
  { v: "no_show", l: "No-show" },
  { v: "late_cancellation", l: "Late cancellation" },
  { v: "chargeback", l: "Chargeback" },
  { v: "repeat_no_show_pattern", l: "Repeat no-show pattern" },
];

export default function IncidentNew() {
  const [f, setF] = useState({
    consumer_phone: "", consumer_email: "", consumer_first_name: "",
    incident_type: "unpaid_invoice",
    incident_date: new Date().toISOString().slice(0, 10),
    amount_aud: "",
    description: "",
    evidence_keys: [],
    attestation: false,
  });
  const [err, setErr] = useState("");
  const nav = useNavigate();
  const upd = k => e => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { key, url } = await api("/api/uploads/presign", {
        method: "POST", body: { filename: file.name, content_type: file.type },
      });
      if (!url.startsWith("stub://") && !url.startsWith("https://stub.local")) {
        await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      }
      setF(s => ({ ...s, evidence_keys: [...s.evidence_keys, key] }));
    } catch (e) { setErr(e.message); }
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");
    if (!f.attestation) return setErr("You must attest the entry is factually true.");
    if (f.evidence_keys.length === 0) return setErr("At least one piece of evidence is required.");
    try {
      const body = {
        ...f,
        incident_date: new Date(f.incident_date).toISOString(),
        amount_aud: f.amount_aud ? parseFloat(f.amount_aud) : null,
      };
      await api("/api/incidents", { method: "POST", body });
      nav("/incidents");
    } catch (e) { setErr(e.message); }
  }

  return (
    <form onSubmit={submit} className="space-y-4 max-w-xl">
      <h1 className="text-2xl font-semibold">Log an incident</h1>
      <p className="text-sm text-stone-600">
        Only factual, evidenced entries. Anything resembling personal opinion,
        characterisation, or unverified claims must not be entered.
      </p>
      {err && <div className="text-red-600 text-sm">{err}</div>}

      <div className="grid grid-cols-2 gap-3">
        <input className="border rounded px-3 py-2" placeholder="Client phone" value={f.consumer_phone} onChange={upd("consumer_phone")} />
        <input className="border rounded px-3 py-2" placeholder="Client email" value={f.consumer_email} onChange={upd("consumer_email")} />
      </div>
      <input className="border rounded px-3 py-2 w-full" placeholder="Client first name (your records only)" value={f.consumer_first_name} onChange={upd("consumer_first_name")} />

      <select className="border rounded px-3 py-2 w-full" value={f.incident_type} onChange={upd("incident_type")}>
        {TYPES.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
      </select>

      <div className="grid grid-cols-2 gap-3">
        <input className="border rounded px-3 py-2" type="date" value={f.incident_date} onChange={upd("incident_date")} />
        <input className="border rounded px-3 py-2" type="number" step="0.01" placeholder="Amount AUD (if applicable)" value={f.amount_aud} onChange={upd("amount_aud")} />
      </div>

      <textarea className="border rounded px-3 py-2 w-full" rows={4} maxLength={500}
                placeholder="Factual description (max 500 chars). What happened, when, and what was the outstanding amount or impact."
                value={f.description} onChange={upd("description")} />

      <div>
        <label className="block text-sm font-medium mb-1">Evidence (required)</label>
        <input type="file" onChange={handleFile} />
        <ul className="text-xs text-stone-600 mt-2">
          {f.evidence_keys.map(k => <li key={k}>{k}</li>)}
        </ul>
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" checked={f.attestation} onChange={upd("attestation")} className="mt-1" />
        <span>
          I attest the above is factually true, I have evidence to support it, and
          the client consented to information-sharing under our published booking T&Cs.
        </span>
      </label>

      <button className="bg-stone-900 text-white px-4 py-2 rounded">Submit incident</button>
    </form>
  );
}
