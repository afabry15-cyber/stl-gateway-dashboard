import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CompanyDetail from "./pages/CompanyDetail";
import Charts from "./pages/Charts";
import ContentStudio from "./pages/ContentStudio";
import Departed from "./pages/Departed";

const NAV = [
  { to: "/", label: "Dashboard" },
  { to: "/departed", label: "Departed" },
  { to: "/charts", label: "Charts" },
  { to: "/content", label: "Content Studio" },
];

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <span className="text-lg font-bold text-gray-900 tracking-tight">
                STL<span className="text-blue-600">Dashboard</span>
              </span>
              <nav className="flex gap-1">
                {NAV.map((n) => (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    end={n.to === "/"}
                    className={({ isActive }) =>
                      `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`
                    }
                  >
                    {n.label}
                  </NavLink>
                ))}
              </nav>
            </div>
            <span className="text-xs text-gray-400 hidden sm:block">
              St. Louis Public Company Tracker
            </span>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/charts" element={<Charts />} />
            <Route path="/departed" element={<Departed />} />
            <Route path="/content" element={<ContentStudio />} />
            <Route path="/company/:ticker" element={<CompanyDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
