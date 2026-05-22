export default function GradientButton({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center gap-2 
        bg-gradient-to-r from-brand-yellow to-brand-orange 
        text-white font-bold py-3 px-6 rounded-xl 
        shadow-lg hover:shadow-xl hover:scale-[1.02] 
        transition-all duration-300 disabled:opacity-70 disabled:hover:scale-100
        ${className}
      `}
    >
      {children}
    </button>
  );
}
