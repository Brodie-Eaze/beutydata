import { useEffect, useState } from "react";
import { api } from "../api";

export default function Disputes() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  function reload() {
    api("/api/disputes").then(setItems).catch(e => setErr(e.message));
  }
  useEffect(reload, []);

  async function resolve(id, decision) {
    const notes = prompt(`Notes for ${decision}:`) || "";
    try {
      await api(`/api/disputes/${id}/resolve`, { method: "POST", body: { decision, notes } });
      reload();
    } catch (e) { setErr(e.message); }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Disputes against your incidents</h1>
      <p className="text-sm text-stone-600">
        You have 14 days to respond. Unanswered disputes are auto-upheld and the
        incident withdrawn.
      </p>
      {err && <div className="text-red-600 text-sm">{err}</div>}
      {items.length === 0 && <div className="text-stone-500">No disputes.</div>}
      <ul className="space-y-3">
        {items.map(d => (
          <li key={d.id} className="bg-white border border-stone-200 rounded p-4">
            <div className="text-xs text-stone-500">
              Incident: {d.incident_id} · Filed {new Date(d.created_at).toLocaleDateString()} · Status: {d.status}
            </div>
            <div className="mt-2 whitespace-pre-wrap">{d.statement}</div>
            {d.status === "open" && (
              <div className="mt-3 flex gap-2">
                <button onClick={() => resolve(d.id, "upheld")} className="bg-red-600 text-white px-3 py-1 rounded text-sm">
                  Uphold (withdraw incident)
                </button>
                <button onClick={() => resolve(d.id, "rejected")} className="bg-stone-200 px-3 py-1 rounded text-sm">
                  Reject (keep incident)
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
