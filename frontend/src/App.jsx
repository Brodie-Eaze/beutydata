import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import Dashboard from "./pages/Dashboard";
import Disputes from "./pages/Disputes";
import IncidentNew from "./pages/IncidentNew";
import IncidentsList from "./pages/IncidentsList";
import Login from "./pages/Login";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PublicDispute from "./pages/PublicDispute";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import Signup from "./pages/Signup";
import Terms from "./pages/Terms";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dispute" element={<PublicDispute />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />

        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/search" element={<Search />} />
          <Route path="/incidents" element={<IncidentsList />} />
          <Route path="/incidents/new" element={<IncidentNew />} />
          <Route path="/disputes" element={<Disputes />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
