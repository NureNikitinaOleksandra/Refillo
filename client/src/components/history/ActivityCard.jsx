import {
  ArrowPathRoundedSquareIcon,
  ShoppingBagIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

// Словник перекладів статусів
export const translateOrderStatus = (status) => {
  const statuses = {
    CREATED: "Створено",
    IN_PROCESS: "В обробці",
    COLLECTED: "Зібрано",
    ACCEPTED_BY_COURIER: "Прийнято кур’єром",
    EN_ROUTE: "В дорозі",
    DELIVERED: "Доставлено",
  };
  return statuses[status] || status;
};

export default function ActivityCard({ item, type, isSelected, onClick }) {
  const isOrder = type === "ORDER";
  const isAutoOrder = isOrder && item.isSubscriptionGenerated;

  // Кольорове кодування
  let borderColor = "border-brand-orange";
  let stripeClass = "bg-brand-orange";
  let iconColor = "text-brand-orange";
  let Icon = ArrowPathRoundedSquareIcon;

  if (isOrder && !isAutoOrder) {
    borderColor = "border-brand-yellow";
    stripeClass = "bg-brand-yellow";
    iconColor = "text-brand-yellow";
    Icon = ShoppingBagIcon;
  } else if (isAutoOrder) {
    borderColor = "border-brand-yellow/50";
    stripeClass = "bg-gradient-to-b from-brand-yellow to-brand-orange";
    iconColor = "text-brand-orange";
    Icon = SparklesIcon;
  }

  // Форматування дати
  const dateFormatted = new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(item.createdAt));

  // Визначення заголовка
  const title = isOrder
    ? `№ ${item.orderNumber}`
    : `SUB-${item.id.slice(0, 6).toUpperCase()}`;

  // Рахуємо суму для підписки (бо вона не зберігається в БД як єдине поле)
  const totalPrice = isOrder
    ? item.totalPrice
    : item.subscriptionItems?.reduce(
        (sum, i) => sum + i.product.currentPrice * i.quantity,
        0,
      );

  // Статуси
  const getStatusBadge = () => {
    if (isOrder) {
      return (
        <div className="flex flex-col items-end gap-1">
          {/* Статус оплати */}
          {item.paymentStatus === "PAID" ? (
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
              Оплачено
            </span>
          ) : (
            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
              Неоплачено
            </span>
          )}

          {/* Статус доставки */}
          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
            {translateOrderStatus(item.orderStatus)}
          </span>
        </div>
      );
    } else {
      // Для підписки залишаємо один статус
      if (item.status === "ACTIVE")
        return (
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider">
            Активна
          </span>
        );
      if (item.status === "PAUSED")
        return (
          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider">
            Зупинена
          </span>
        );
      return (
        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider">
          Скасована
        </span>
      );
    }
  };

  // Витягуємо товари для міні-аватарок
  const itemsList = isOrder ? item.orderItems : item.subscriptionItems;

  return (
    <div
      onClick={onClick}
      className={`bg-white p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 overflow-hidden relative ${
        isSelected
          ? `${borderColor} shadow-md ring-4 ring-opacity-10 transform scale-[1.02]`
          : "border-gray-100 hover:shadow-sm"
      }`}
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${stripeClass}`}
      ></div>

      <div className="flex justify-between items-start mb-3 pl-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${iconColor}`} />
          <span className="text-sm font-bold text-gray-700">{title}</span>
        </div>
        {getStatusBadge()}
      </div>

      <div className="mb-4 pl-2">
        <p className="text-sm text-gray-500">{dateFormatted}</p>
        <p className="text-xl font-extrabold text-gray-800 mt-1">
          {totalPrice} ₴
        </p>
      </div>

      <div className="flex -space-x-2 overflow-hidden pl-2">
        {itemsList?.slice(0, 3).map((i, idx) => (
          <img
            key={idx}
            src={i.product.imageUrl}
            className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-50 object-contain p-1"
          />
        ))}
        {itemsList?.length > 3 && (
          <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 text-xs font-bold text-gray-500">
            +{itemsList.length - 3}
          </div>
        )}
      </div>
    </div>
  );
}
