import { useState } from "react";
import Modal from "../ui/Modal";
import GradientButton from "../ui/GradientButton";
import { CreditCardIcon } from "@heroicons/react/24/outline";

export default function PaymentModal({ isOpen, onClose, onSubmit, amount }) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(cardNumber); // Відправляємо номер картки на бекенд для симуляції
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="p-8">
        <div className="text-center mb-6">
          <div className="inline-block p-4 bg-gray-50 rounded-full mb-3">
            <CreditCardIcon className="w-10 h-10 text-brand-dark" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Оплата карткою</h2>
          <p className="text-gray-500 mt-1">
            До сплати:{" "}
            <span className="font-bold text-brand-dark">{amount} ₴</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Номер картки
            </label>
            <input
              type="text"
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-dark font-mono tracking-widest"
            />
            <p className="text-xs text-gray-400 mt-1">
              Підказка: для симуляції помилки введіть номер, що закінчується на
              0000.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Термін дії
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-dark"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <input
                type="password"
                placeholder="•••"
                required
                maxLength="3"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-dark"
              />
            </div>
          </div>

          <GradientButton type="submit" className="w-full mt-6">
            Оплатити замовлення
          </GradientButton>
        </form>
      </div>
    </Modal>
  );
}
