import { useState } from "react";
import ExportMenu from "./ExportMenu";
import EarningsRefreshPanel from "./EarningsRefreshPanel";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "companies", label: "Companies" },
  { id: "trends", label: "Trends" },
  { id: "ratios", label: "Ratios" },
  { id: "earnings", label: "Earnings" },
  { id: "content", label: "Content Studio" },
];

export default function Header({ activeTab, setActiveTab, companies, setCompanies }) {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <>
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "var(--bg-card)", borderBottom: "1px solid var(--border)",
        padding: "0 var(--sp-4)", display: "flex", alignItems: "center",
        height: 56, gap: "var(--sp-4)",
      }}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--text-primary)", whiteSpace: "nowrap" }}>
          STL<span style={{ color: "var(--teal)" }}>Gateway</span>
        </div>
        <nav style={{ display: "flex", gap: 2, flex: 1 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
              fontSize: 13, fontFamily: "var(--font-sans)", fontWeight: 500,
              background: activeTab === t.id ? "var(--bg-elevated)" : "transparent",
              color: activeTab === t.id ? "var(--text-primary)" : "var(--text-secondary)",
              transition: "all 0.15s",
            }}>
              {t.label}
            </button>
          ))}
        </nav>
        <div style={{ display: "flex", gap: "var(--sp-1)", alignItems: "center" }}>
          <ExportMenu companies={companies} />
          <button onClick={() => setPanelOpen(true)} title="Refresh Earnings" style={{
            background: "var(--bg-elevated)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "var(--text-secondary)",
            fontSize: 16,
          }}>
            &#x21BB;
          </button>
        </div>
      </header>
      {panelOpen && (
        <EarningsRefreshPanel
          companies={companies}
          setCompanies={setCompanies}
          onClose={() => setPanelOpen(false)}
        />
      )}
    </>
  );
}
