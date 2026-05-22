export default function CategoryButton({
  name,
  isSelected,
  onClick,
  icon: Icon,
  orderMode = "ONE_TIME",
}) {
  // Визначаємо кольори залежно від режиму
  const activeBorder =
    orderMode === "ONE_TIME" ? "border-brand-yellow" : "border-brand-orange";
  const activeBg =
    orderMode === "ONE_TIME" ? "bg-brand-yellow/5" : "bg-brand-orange/5";
  const activeIconBg =
    orderMode === "ONE_TIME" ? "bg-brand-yellow" : "bg-brand-orange";

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center min-w-[120px] p-4 rounded-2xl border-2 transition-all duration-300 ${
        isSelected
          ? `${activeBorder} ${activeBg} text-brand-dark`
          : "border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50"
      }`}
    >
      <div
        className={`p-3 rounded-full mb-2 ${isSelected ? `${activeIconBg} text-white shadow-md` : "bg-gray-100"}`}
      >
        {Icon && <Icon className="w-6 h-6" />}
      </div>
      <span
        className={`font-semibold text-sm ${isSelected ? "text-brand-dark" : "text-gray-500"}`}
      >
        {name}
      </span>
    </button>
  );
}
