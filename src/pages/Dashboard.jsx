import useStore from "../store/useStore";
import CompanyCard from "../components/CompanyCard";
import CsvImport from "../components/CsvImport";

const SORT_OPTIONS = [
  { field: "healthScore", label: "Health Score" },
  { field: "marketCap", label: "Market Cap" },
  { field: "ytdPerformance", label: "YTD Performance" },
  { field: "revenueTTM", label: "Revenue" },
];

export default function Dashboard() {
  const sectorFilter = useStore((s) => s.sectorFilter);
  const setSectorFilter = useStore((s) => s.setSectorFilter);
  const sortField = useStore((s) => s.sortField);
  const setSort = useStore((s) => s.setSort);
  const sortDir = useStore((s) => s.sortDir);
  const getSectors = useStore((s) => s.getSectors);
  const getFilteredCompanies = useStore((s) => s.getFilteredCompanies);

  const companies = getFilteredCompanies();
  const sectors = getSectors();

  const totalMarketCap = companies.reduce((s, c) => s + c.marketCap, 0);
  const avgHealth = companies.length
    ? Math.round(companies.reduce((s, c) => s + c.healthScore, 0) / companies.length)
    : 0;
  const totalEmployees = companies.reduce((s, c) => s + c.employees, 0);

  return (
    <div className="space-y-6">
      {/* Summary banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Companies", value: companies.length },
          {
            label: "Total Market Cap",
            value: totalMarketCap >= 1000 ? `$${(totalMarketCap / 1000).toFixed(1)}B` : `$${totalMarketCap}M`,
          },
          { label: "Avg Health Score", value: avgHealth },
          { label: "Total Employees", value: totalEmployees.toLocaleString() },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-4 text-center"
          >
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sector:</span>
          <div className="flex flex-wrap gap-1.5">
            {sectors.map((s) => (
              <button
                key={s}
                onClick={() => setSectorFilter(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  sectorFilter === s
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-gray-600">Sort:</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.field}
              onClick={() => setSort(opt.field)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                sortField === opt.field
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"
              }`}
            >
              {opt.label}
              {sortField === opt.field && (sortDir === "desc" ? " \u2193" : " \u2191")}
            </button>
          ))}
        </div>
      </div>

      {/* CSV controls */}
      <CsvImport />

      {/* Company grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {companies.map((c) => (
          <CompanyCard key={c.ticker} company={c} />
        ))}
      </div>

      {companies.length === 0 && (
        <p className="text-center text-gray-400 py-12">No companies match the current filter.</p>
      )}
    </div>
  );
}
