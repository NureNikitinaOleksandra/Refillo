export default function CancelButton({ onClick, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full py-3 rounded-xl font-semibold text-gray-500 bg-gray-200 hover:bg-gray-300 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}
