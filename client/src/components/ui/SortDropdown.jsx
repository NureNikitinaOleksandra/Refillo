export default function SortDropdown({
  value,
  onChange,
  orderMode = "ONE_TIME",
}) {
  const focusClass =
    orderMode === "ONE_TIME"
      ? "focus:ring-brand-yellow"
      : "focus:ring-brand-orange";

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full py-3 px-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 cursor-pointer appearance-none text-gray-700 transition-all ${focusClass}`}
    >
      <option value="ALL">Сортування: За замовчуванням</option>
      <option value="CHEAP">Спочатку дешевші</option>
      <option value="EXPENSIVE">Спочатку дорожчі</option>
    </select>
  );
}
