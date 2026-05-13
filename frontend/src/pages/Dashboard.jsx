import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Dashboard() {
  const [salon, setSalon] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api("/api/salons/me").then(setSalon).catch(e => setErr(e.message));
  }, []);

  if (err) return <div className="text-red-600">{err}</div>;
  if (!salon) return <div>Loading…</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Welcome, {salon.business_name}</h1>
      <div className="grid grid-cols-2 gap-4">
        <Card title="Subscription" value={salon.subscription_status} />
        <Card title="ABN" value={salon.abn} />
      </div>
      {!salon.member_agreement_accepted_at && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded">
          You must accept the Member Agreement before logging incidents.
          <Link to="/settings" className="ml-2 underline">Go to settings</Link>
        </div>
      )}
      <div className="flex gap-3">
        <Link to="/search" className="bg-stone-900 text-white px-4 py-2 rounded">Search a client</Link>
        <Link to="/incidents/new" className="bg-stone-200 px-4 py-2 rounded">Log an incident</Link>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white border border-stone-200 rounded p-4">
      <div className="text-xs uppercase tracking-wide text-stone-500">{title}</div>
      <div className="text-lg">{value}</div>
    </div>
  );
}
