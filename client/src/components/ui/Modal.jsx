import { XMarkIcon } from "@heroicons/react/24/outline";

export default function Modal({
  isOpen,
  onClose,
  children,
  maxWidth = "max-w-4xl",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-brand-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto relative`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full p-2 hover:bg-gray-200 transition-colors z-10"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        {children}
      </div>
    </div>
  );
}
