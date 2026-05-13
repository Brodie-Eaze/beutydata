import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Dashboard() {
  const [salon, setSalon] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api("/api/salons/me").then(setSalon).catch(e => setErr(e.message));
  }, []);

  if (err) return <div className="text-red-700">{err}</div>;
  if (!salon) return <div className="text-stone-500">Loading…</div>;

  const needsAgreement = !salon.member_agreement_accepted_at;
  const needsSub = salon.subscription_status !== "active" && salon.subscription_status !== "trialing";

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-stone-500">Welcome back</div>
        <h1 className="text-4xl mt-1">{salon.business_name}</h1>
      </div>

      {(needsAgreement || needsSub) && (
        <div className="card p-5 border-amber-200 bg-amber-50">
          <div className="font-medium mb-1">Finish setting up your account</div>
          <ul className="text-sm text-stone-700 list-disc list-inside space-y-1">
            {needsAgreement && <li>Accept the Member Agreement</li>}
            {needsSub && <li>Activate your subscription</li>}
          </ul>
          <Link to="/settings" className="btn-accent mt-4">Go to settings</Link>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Subscription" value={salon.subscription_status} />
        <Stat label="ABN" value={salon.abn} mono />
        <Stat label="Verified entity" value={salon.abn_entity_name || "Pending"} />
      </div>

      <div className="card p-6">
        <h2 className="text-lg mb-3">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/search" className="btn-primary">⌕  Search a client</Link>
          <Link to="/incidents/new" className="btn-secondary">＋ Log an incident</Link>
          <Link to="/disputes" className="btn-secondary">⚑ Review disputes</Link>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg mb-2">Network etiquette</h2>
        <ul className="text-sm text-stone-700 space-y-1 list-disc list-inside">
          <li>Only log clients who consented under your booking T&Cs</li>
          <li>Stick to the structured incident types — no opinion or characterisation</li>
          <li>Attach evidence (invoice, booking record, comms) to every entry</li>
          <li>Respond to disputes within 14 days</li>
        </ul>
      </div>
    </div>
  );
}

function Stat({ label, value, mono }) {
  return (
    <div className="card p-4">
      <div className="text-[10px] uppercase tracking-[0.18em] text-stone-500">{label}</div>
      <div className={`text-lg mt-1 ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}
