import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setToken } from "../api";

export default function Signup() {
  const [f, setF] = useState({
    business_name: "", abn: "", address: "", phone: "", email: "", password: "",
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const upd = k => e => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const r = await api("/api/auth/signup", { method: "POST", body: f, auth: false });
      setToken(r.access_token);
      nav("/settings");
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg card p-8">
        <div className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-2">Membership</div>
        <h1 className="text-3xl mb-2">Apply to join</h1>
        <p className="text-sm text-stone-600 mb-6">
          We verify all members via the Australian Business Register. By
          applying you agree to the Member Agreement and undertake to publish
          the consent clause in your booking T&Cs before logging incidents.
        </p>
        {err && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">{err}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Business name</label>
            <input className="input" value={f.business_name} onChange={upd("business_name")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">ABN</label>
              <input className="input" placeholder="11 digits" value={f.abn} onChange={upd("abn")} />
            </div>
            <div>
              <label className="label">Business phone</label>
              <input className="input" value={f.phone} onChange={upd("phone")} />
            </div>
          </div>
          <div>
            <label className="label">Business address</label>
            <input className="input" value={f.address} onChange={upd("address")} />
          </div>
          <div className="border-t border-stone-200 pt-4">
            <div>
              <label className="label">Owner email</label>
              <input className="input" value={f.email} onChange={upd("email")} />
            </div>
            <div className="mt-4">
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="Min 8 characters" value={f.password} onChange={upd("password")} />
            </div>
          </div>
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? "Verifying ABN…" : "Create account"}
          </button>
          <div className="text-sm text-stone-600 text-center">
            Already a member? <Link to="/login" className="underline">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
