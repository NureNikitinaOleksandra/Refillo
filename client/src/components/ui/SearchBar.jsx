import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Пошук...",
  orderMode = "ONE_TIME",
}) {
  const focusClass =
    orderMode === "ONE_TIME"
      ? "focus:ring-brand-yellow"
      : "focus:ring-brand-orange";

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 transition-all ${focusClass}`}
      />
    </div>
  );
}
