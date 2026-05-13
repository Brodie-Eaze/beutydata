import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { setToken } from "../api";

const navItem = ({ isActive }) =>
  `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
    isActive ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-200/60"
  }`;

const links = [
  { to: "/", label: "Dashboard", icon: "◆" },
  { to: "/search", label: "Search", icon: "⌕" },
  { to: "/incidents", label: "My Incidents", icon: "❑" },
  { to: "/incidents/new", label: "Log Incident", icon: "＋" },
  { to: "/disputes", label: "Disputes", icon: "⚑" },
  { to: "/settings", label: "Settings", icon: "⚙" },
];

export default function Layout() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen flex">
      <aside className="w-60 border-r border-stone-200 p-5 flex flex-col gap-1 bg-white/60 backdrop-blur">
        <Link to="/" className="block mb-6">
          <div className="text-xs uppercase tracking-[0.2em] text-stone-500">Private network</div>
          <div className="text-xl mt-0.5" style={{ fontFamily: "Fraunces, serif" }}>Beauty Network</div>
        </Link>
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.to === "/"} className={navItem}>
            <span className="w-4 text-center opacity-70">{l.icon}</span>
            <span>{l.label}</span>
          </NavLink>
        ))}
        <div className="mt-auto pt-4 border-t border-stone-200">
          <button
            onClick={() => { setToken(null); nav("/login"); }}
            className="text-sm text-stone-600 hover:text-stone-900"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-10">
        <div className="max-w-5xl mx-auto"><Outlet /></div>
      </main>
    </div>
  );
}
