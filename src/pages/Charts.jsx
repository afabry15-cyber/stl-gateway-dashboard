import ChartPanel from "../components/ChartPanel";

export default function Charts() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Charts & Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">
          Visual analysis of all STL public companies.
        </p>
      </div>
      <ChartPanel />
    </div>
  );
}
