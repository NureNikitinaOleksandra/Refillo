import { CreditCardIcon, BanknotesIcon } from "@heroicons/react/24/outline";

export default function PaymentMethodSelector({
  method,
  setMethod,
  orderMode,
}) {
  const activeClass =
    orderMode === "ONE_TIME"
      ? "border-brand-yellow bg-brand-yellow/10 text-brand-yellow"
      : "border-brand-orange bg-brand-orange/10 text-brand-orange";

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={() => setMethod("CARD_ONLINE")}
        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-semibold ${
          method === "CARD_ONLINE"
            ? activeClass
            : "border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100"
        }`}
      >
        <CreditCardIcon className="w-5 h-5" /> Карткою
      </button>

      <button
        onClick={() => setMethod("CASH_ON_DELIVERY")}
        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-semibold ${
          method === "CASH_ON_DELIVERY"
            ? activeClass
            : "border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100"
        }`}
      >
        <BanknotesIcon className="w-5 h-5" /> Готівкою
      </button>
    </div>
  );
}
