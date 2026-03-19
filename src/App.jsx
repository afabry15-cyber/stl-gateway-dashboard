import { useState, useMemo, useEffect } from "react";
import { companies as baseCompanies } from "./data/companies";
import { calculateHealthScore } from "./utils/healthScore";
import Header from "./components/Header";
import KpiBar from "./components/KpiBar";
import TickerStrip from "./components/TickerStrip";
import CompanyTable from "./components/CompanyTable";
import QuadrantChart from "./components/QuadrantChart";
import CompanyCard from "./components/CompanyCard";
import CompanyModal from "./components/CompanyModal";
import TrendsView from "./components/TrendsView";
import RatiosView from "./components/RatiosView";
import EarningsCalendar from "./components/EarningsCalendar";
import ContentStudio from "./components/ContentStudio";

function enrichCompanies(raw) {
  return raw.map(c => {
    const { total, breakdown } = calculateHealthScore(c);
    return {
      ...c,
      healthScore: total,
      healthBreakdown: breakdown,
      revenuePerEmployee: c.employees ? Math.round((c.revenueTTM * 1000000) / c.employees) : 0,
    };
  });
}

function loadWithOverrides() {
  const base = [...baseCompanies];
  try {
    const overrides = JSON.parse(localStorage.getItem("stl-dashboard-overrides") || "{}");
    return base.map(c => overrides[c.ticker] ? { ...c, ...overrides[c.ticker] } : c);
  } catch { return base; }
}

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [rawCompanies, setRawCompanies] = useState(() => loadWithOverrides());
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("All");

  const companies = useMemo(() => enrichCompanies(rawCompanies), [rawCompanies]);
  const sectors = useMemo(() => ["All", ...new Set(companies.map(c => c.sector))], [companies]);

  const filtered = useMemo(() => {
    let list = companies;
    if (sectorFilter !== "All") list = list.filter(c => c.sector === sectorFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.ticker.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
    }
    return list;
  }, [companies, sectorFilter, search]);

  // Escape to close modal
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setSelectedCompany(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        companies={companies}
        setCompanies={setRawCompanies}
      />

      <main style={{ flex: 1, maxWidth: 1280, width: "100%", margin: "0 auto", padding: "var(--sp-3) var(--sp-4)" }}>
        {activeTab === "dashboard" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
            <KpiBar companies={companies} />
            <TickerStrip companies={companies} />
            <QuadrantChart companies={companies} />
            {/* Search + filter */}
            <div style={{ display: "flex", gap: "var(--sp-2)", alignItems: "center" }}>
              <input
                placeholder="Search ticker or name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)",
                  background: "var(--bg-elevated)", color: "var(--text-primary)",
                  fontSize: 13, width: 240, fontFamily: "var(--font-sans)",
                }}
              />
              <div style={{ display: "flex", gap: 4 }}>
                {sectors.map(s => (
                  <button key={s} onClick={() => setSectorFilter(s)} style={{
                    padding: "4px 12px", borderRadius: 20, border: "1px solid",
                    borderColor: sectorFilter === s ? "var(--border-accent)" : "var(--border)",
                    background: sectorFilter === s ? "var(--bg-elevated)" : "transparent",
                    color: sectorFilter === s ? "var(--text-primary)" : "var(--text-muted)",
                    cursor: "pointer", fontSize: 11, fontFamily: "var(--font-sans)",
                  }}>{s}</button>
                ))}
              </div>
            </div>
            <CompanyTable companies={filtered} onSelect={setSelectedCompany} />
          </div>
        )}

        {activeTab === "companies" && (
          <div>
            <h2 style={{ fontSize: 24, marginBottom: "var(--sp-2)" }}>Companies</h2>
            <div style={{ display: "flex", gap: "var(--sp-2)", marginBottom: "var(--sp-3)", alignItems: "center" }}>
              <input
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)",
                  background: "var(--bg-elevated)", color: "var(--text-primary)",
                  fontSize: 13, width: 200, fontFamily: "var(--font-sans)",
                }}
              />
              {sectors.map(s => (
                <button key={s} onClick={() => setSectorFilter(s)} style={{
                  padding: "4px 12px", borderRadius: 20, border: "1px solid",
                  borderColor: sectorFilter === s ? "var(--border-accent)" : "var(--border)",
                  background: sectorFilter === s ? "var(--bg-elevated)" : "transparent",
                  color: sectorFilter === s ? "var(--text-primary)" : "var(--text-muted)",
                  cursor: "pointer", fontSize: 11, fontFamily: "var(--font-sans)",
                }}>{s}</button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "var(--sp-2)" }}>
              {filtered.map(c => (
                <CompanyCard key={c.ticker} company={c} onClick={() => setSelectedCompany(c)} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "trends" && <TrendsView companies={companies} />}
        {activeTab === "ratios" && <RatiosView companies={companies} />}
        {activeTab === "earnings" && <EarningsCalendar companies={companies} />}
        {activeTab === "content" && <ContentStudio companies={companies} />}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: "center", padding: "var(--sp-3)",
        fontSize: 11, color: "var(--text-muted)",
        borderTop: "1px solid var(--border)",
      }}>
        Data is illustrative — refresh with actual earnings each quarter. Built for Gateway Companies Dashboard &middot; Alex Fabry &middot; KFA
      </footer>

      {/* Company modal */}
      {selectedCompany && (
        <CompanyModal company={selectedCompany} onClose={() => setSelectedCompany(null)} />
      )}
    </div>
  );
}
