import { useEffect, useState } from "react";
import { api } from "../api";

const CONSENT_CLAUSE = `We participate in a private information-sharing network used by Australian beauty businesses. Booking, attendance and payment behaviour (e.g. unpaid invoices, repeated no-shows, chargebacks) may be shared with other member businesses. This is not a credit report and does not affect your credit file. You have a right to access and correct any information held about you — see [DISPUTE_PORTAL_URL] for details.`;

export default function Settings() {
  const [salon, setSalon] = useState(null);
  const [err, setErr] = useState("");

  function reload() { api("/api/salons/me").then(setSalon).catch(e => setErr(e.message)); }
  useEffect(reload, []);

  async function accept() {
    await api("/api/salons/me/accept-agreement", { method: "POST" });
    reload();
  }
  async function startCheckout() {
    const r = await api("/api/billing/checkout", { method: "POST" });
    if (r.dev_mode) { alert("Dev mode: subscription activated immediately."); reload(); }
    else window.location.href = r.url;
  }

  if (err) return <div className="text-red-600">{err}</div>;
  if (!salon) return <div>Loading…</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <section className="bg-white border border-stone-200 rounded p-4">
        <h2 className="font-semibold">Member agreement</h2>
        <p className="text-sm text-stone-600 mt-2">
          You must accept the Member Agreement before logging incidents. You
          warrant that all entries are factually true and supported by evidence,
          and that you have included the consent clause below in your booking T&Cs.
        </p>
        <div className="mt-3 text-sm">
          Status: {salon.member_agreement_accepted_at ? "Accepted ✓" : "Not accepted"}
        </div>
        {!salon.member_agreement_accepted_at && (
          <button onClick={accept} className="mt-3 bg-stone-900 text-white px-4 py-2 rounded">
            I have read and accept the Member Agreement
          </button>
        )}
      </section>

      <section className="bg-white border border-stone-200 rounded p-4">
        <h2 className="font-semibold">Subscription</h2>
        <div className="text-sm mt-2">Status: <strong>{salon.subscription_status}</strong></div>
        {salon.subscription_status !== "active" && (
          <button onClick={startCheckout} className="mt-3 bg-stone-900 text-white px-4 py-2 rounded">
            Start subscription
          </button>
        )}
      </section>

      <section className="bg-white border border-stone-200 rounded p-4">
        <h2 className="font-semibold">Consent clause for your booking T&Cs</h2>
        <p className="text-sm text-stone-600 mt-2">
          Copy this clause into your booking terms. The platform cannot lawfully
          accept entries about clients who have not been notified of information-sharing at the point of collection.
        </p>
        <pre className="mt-3 bg-stone-100 p-3 text-xs whitespace-pre-wrap rounded">{CONSENT_CLAUSE}</pre>
      </section>
    </div>
  );
}
