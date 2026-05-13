import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "../api";

export default function Signup() {
  const [f, setF] = useState({
    business_name: "", abn: "", address: "", phone: "", email: "", password: "",
  });
  const [err, setErr] = useState("");
  const nav = useNavigate();
  const upd = k => e => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      const r = await api("/api/auth/signup", { method: "POST", body: f, auth: false });
      setToken(r.access_token);
      nav("/settings");
    } catch (e) { setErr(e.message); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 py-12">
      <form onSubmit={submit} className="bg-white p-8 rounded-lg shadow w-full max-w-md space-y-4">
        <h1 className="text-xl font-semibold">Apply for membership</h1>
        <p className="text-sm text-stone-600">
          We verify all members via the Australian Business Register. By signing up,
          you agree to the Member Agreement and undertake to publish the consent clause
          in your booking terms before logging any incident.
        </p>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <input className="w-full border rounded px-3 py-2" placeholder="Business name" value={f.business_name} onChange={upd("business_name")} />
        <input className="w-full border rounded px-3 py-2" placeholder="ABN (11 digits)" value={f.abn} onChange={upd("abn")} />
        <input className="w-full border rounded px-3 py-2" placeholder="Business address" value={f.address} onChange={upd("address")} />
        <input className="w-full border rounded px-3 py-2" placeholder="Business phone" value={f.phone} onChange={upd("phone")} />
        <input className="w-full border rounded px-3 py-2" placeholder="Owner email" value={f.email} onChange={upd("email")} />
        <input className="w-full border rounded px-3 py-2" placeholder="Password (min 8 chars)" type="password" value={f.password} onChange={upd("password")} />
        <button className="w-full bg-stone-900 text-white py-2 rounded">Create account</button>
      </form>
    </div>
  );
}
