import { useRef } from "react";
import Papa from "papaparse";
import useStore from "../store/useStore";

export default function CsvImport() {
  const importCompanies = useStore((s) => s.importCompanies);
  const companies = useStore((s) => s.companies);
  const fileRef = useRef();

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cleaned = results.data.map((row) => ({
          ...row,
          hqConfirmed: row.hqConfirmed === true || row.hqConfirmed === "true",
          epsHistory: row.epsHistory
            ? typeof row.epsHistory === "string"
              ? JSON.parse(row.epsHistory)
              : row.epsHistory
            : [false, false, false, false],
        }));
        importCompanies(cleaned);
      },
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleExport = () => {
    const csv = Papa.unparse(
      companies.map(({ healthScore, healthBreakdown, ...rest }) => ({
        ...rest,
        epsHistory: JSON.stringify(rest.epsHistory),
      }))
    );
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stl_companies_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-3">
      <label className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer transition-colors">
        Import CSV
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleImport}
          className="hidden"
        />
      </label>
      <button
        onClick={handleExport}
        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        Export CSV
      </button>
    </div>
  );
}
