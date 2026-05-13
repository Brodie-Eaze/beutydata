import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { setToken } from "../api";

const navItem = ({ isActive }) =>
  `px-3 py-2 rounded text-sm ${isActive ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-200"}`;

export default function Layout() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-stone-100 border-r border-stone-200 p-4 flex flex-col gap-1">
        <Link to="/" className="text-lg font-semibold mb-4">Beauty Network</Link>
        <NavLink to="/" end className={navItem}>Dashboard</NavLink>
        <NavLink to="/search" className={navItem}>Search</NavLink>
        <NavLink to="/incidents" className={navItem}>My Incidents</NavLink>
        <NavLink to="/incidents/new" className={navItem}>Log Incident</NavLink>
        <NavLink to="/disputes" className={navItem}>Disputes</NavLink>
        <NavLink to="/settings" className={navItem}>Settings</NavLink>
        <div className="mt-auto pt-4">
          <button
            onClick={() => { setToken(null); nav("/login"); }}
            className="text-sm text-stone-600 hover:text-stone-900"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 max-w-5xl"><Outlet /></main>
    </div>
  );
}
