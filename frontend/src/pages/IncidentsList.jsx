import { useEffect, useState } from "react";
import { api } from "../api";

export default function IncidentsList() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    api("/api/incidents").then(setItems).catch(e => setErr(e.message));
  }, []);

  async function withdraw(id) {
    if (!confirm("Withdraw this incident?")) return;
    try {
      const u = await api(`/api/incidents/${id}/withdraw`, { method: "POST" });
      setItems(items.map(i => i.id === id ? u : i));
    } catch (e) { setErr(e.message); }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">My incidents</h1>
      {err && <div className="text-red-600 text-sm">{err}</div>}
      {items.length === 0 && <div className="text-stone-500">None logged yet.</div>}
      <table className="w-full text-sm">
        <thead><tr className="text-left text-stone-500">
          <th className="py-2">Date</th><th>Type</th><th>Client</th><th>Amount</th><th>Status</th><th></th>
        </tr></thead>
        <tbody>
          {items.map(i => (
            <tr key={i.id} className="border-t border-stone-200">
              <td className="py-2">{new Date(i.incident_date).toLocaleDateString()}</td>
              <td>{i.incident_type.replace(/_/g, " ")}</td>
              <td>{i.consumer_first_name || i.consumer_phone || i.consumer_email}</td>
              <td>{i.amount_aud ? `$${i.amount_aud}` : "—"}</td>
              <td>{i.status}</td>
              <td>
                {i.status === "active" && (
                  <button onClick={() => withdraw(i.id)} className="text-red-600 underline">
                    Withdraw
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
