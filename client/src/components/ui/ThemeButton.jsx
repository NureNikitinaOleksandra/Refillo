export default function ThemeButton({
  children,
  onClick,
  orderMode, // 'ONE_TIME' або 'SUBSCRIPTION'
  type = "button",
  className = "",
  disabled = false,
}) {
  const bgClass =
    orderMode === "ONE_TIME"
      ? "bg-brand-yellow hover:bg-brand-yellowHover"
      : "bg-brand-orange hover:bg-brand-orangeHover";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 ${bgClass} ${className}`}
    >
      {children}
    </button>
  );
}
