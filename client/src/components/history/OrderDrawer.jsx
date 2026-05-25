import {
  XMarkIcon,
  ArrowPathIcon,
  CreditCardIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import ThemeButton from "../ui/ThemeButton";
import { translateOrderStatus } from "./ActivityCard";

export default function OrderDrawer({ order, onClose, onRepeat, onPay }) {
  if (!order) return null;

  const formatDate = (date) =>
    new Intl.DateTimeFormat("uk-UA", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div
        className={`p-6 border-b flex justify-between items-center shrink-0 ${order.isSubscriptionGenerated ? "border-brand-orange/20 bg-gradient-to-r from-brand-yellow/10 to-brand-orange/10" : "border-brand-yellow/20 bg-brand-yellow/5"}`}
      >
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Замовлення №{order.orderNumber}
          </h2>
          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:bg-white rounded-full transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Банер для автозамовлень */}
        {order.isSubscriptionGenerated && (
          <div className="bg-brand-orange/5 p-4 rounded-xl border border-brand-orange/20 flex gap-3">
            <InformationCircleIcon className="w-6 h-6 text-brand-orange shrink-0" />
            <div>
              <p className="text-sm text-brand-orange font-bold">
                Автоматичне замовлення
              </p>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Сформовано автоматично за вашою підпискою. Для зміни складу
                наступних доставок керуйте налаштуваннями самої підписки.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase mb-1">
              Оплата
            </p>
            {order.paymentStatus === "PAID" ? (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase">
                Оплачено
              </span>
            ) : (
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold uppercase">
                Неоплачено
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-bold uppercase mb-1">
              Статус доставки
            </p>
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">
              {translateOrderStatus(order.orderStatus)}
            </span>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">Адреса доставки:</p>
          <p className="font-medium text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100">
            {order.deliveryAddress}
          </p>
        </div>

        <div>
          <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">
            Склад замовлення
          </h3>
          <div className="space-y-3">
            {order.orderItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <img
                  src={item.product.imageUrl}
                  className="w-12 h-12 rounded-lg bg-gray-50 object-contain p-1 border border-gray-100"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.priceAtPurchase} ₴ × {item.quantity}
                  </p>
                </div>
                <div className="font-bold text-gray-800">
                  {item.priceAtPurchase * item.quantity} ₴
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 bg-white border-t border-gray-100 shrink-0 space-y-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-500 font-medium">Загальна сума:</span>
          <span className="text-2xl font-black text-brand-dark">
            {order.totalPrice} ₴
          </span>
        </div>

        {order.paymentStatus === "UNPAID" && (
          <button
            onClick={onPay}
            className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition-colors border border-red-200"
          >
            <CreditCardIcon className="w-5 h-5" /> Сплатити зараз
          </button>
        )}

        {/* Кнопка "Повторити" НЕ показується для автозамовлень */}
        {!order.isSubscriptionGenerated && (
          <ThemeButton
            onClick={onRepeat}
            orderMode="ONE_TIME"
            className="w-full"
          >
            <ArrowPathIcon className="w-5 h-5" /> Повторити замовлення
          </ThemeButton>
        )}
      </div>
    </div>
  );
}
