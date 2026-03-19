import LinkedInGenerator from "../components/LinkedInGenerator";

export default function ContentStudio() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Content Studio</h1>
        <p className="text-sm text-gray-500 mt-1">
          Generate data-driven LinkedIn posts about St. Louis public companies.
        </p>
      </div>
      <LinkedInGenerator />
    </div>
  );
}
