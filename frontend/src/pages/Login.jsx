import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setToken } from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      const r = await api("/api/auth/login", { method: "POST", body: { email, password }, auth: false });
      setToken(r.access_token);
      nav("/");
    } catch (e) { setErr(e.message); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <form onSubmit={submit} className="bg-white p-8 rounded-lg shadow w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Member sign-in</h1>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <input className="w-full border rounded px-3 py-2" placeholder="Email"
               value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password"
               value={password} onChange={e => setPassword(e.target.value)} />
        <button className="w-full bg-stone-900 text-white py-2 rounded">Sign in</button>
        <div className="text-sm text-stone-600">
          New salon? <Link to="/signup" className="underline">Apply for membership</Link>
        </div>
      </form>
    </div>
  );
}
