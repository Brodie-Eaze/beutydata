import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setToken } from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const r = await api("/api/auth/login", { method: "POST", body: { email, password }, auth: false });
      setToken(r.access_token);
      nav("/");
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex md:w-1/2 items-center justify-center p-12"
           style={{ background: "linear-gradient(135deg, #3f4a2c 0%, #2a3320 100%)" }}>
        <div className="text-white max-w-md">
          <div className="text-xs uppercase tracking-[0.2em] text-white/60 mb-3">Members only</div>
          <h1 className="text-4xl mb-4" style={{ fontFamily: "Fraunces, serif" }}>
            Protect your chair.
          </h1>
          <p className="text-white/80 leading-relaxed">
            A private network for verified Australian beauty businesses to
            share factual, evidenced client incidents — so your studio knows
            what's coming before they walk in.
          </p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <div>
            <h2 className="text-2xl">Sign in</h2>
            <p className="text-sm text-stone-600 mt-1">Welcome back.</p>
          </div>
          {err && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{err}</div>}
          <div>
            <label className="label">Email</label>
            <input className="input" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button className="btn-primary w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
          <div className="text-sm text-stone-600 text-center">
            New salon? <Link to="/signup" className="underline">Apply for membership</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
