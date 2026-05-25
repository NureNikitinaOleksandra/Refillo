import { useState } from "react";
import { api } from "../../services/api";
import {
  XMarkIcon,
  PlusCircleIcon,
  TrashIcon,
  PauseIcon,
  PlayIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import ThemeButton from "../ui/ThemeButton";
import SubscriptionProductModal from "./SubscriptionProductModal";
import { useNotifications } from "../../contexts/NotificationContext";

export default function SubscriptionDrawer({
  subscription,
  onClose,
  onRefresh,
}) {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { fetchUnreadCount } = useNotifications();

  if (!subscription) return null;

  const formatDate = (date) =>
    new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long" }).format(
      new Date(date),
    );

  // Рахуємо суму постійного складу
  const baseTotal = subscription.subscriptionItems.reduce(
    (sum, i) => sum + i.product.currentPrice * i.quantity,
    0,
  );
  // Рахуємо суму доповнень
  const addOnsTotal =
    subscription.addOns?.reduce(
      (sum, i) => sum + i.product.currentPrice * i.quantity,
      0,
    ) || 0;

  // --- API ДІЇ ---

  const handleStatusChange = async (newStatus) => {
    try {
      setIsLoading(true);
      await api.patch(`/subscriptions/${subscription.id}/status`, {
        status: newStatus,
      });
      onRefresh(); // Оновлюємо списки на головній сторінці
      fetchUnreadCount();
    } catch (error) {
      alert("Помилка зміни статусу");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePermanentItem = async (productId) => {
    if (!window.confirm("Видалити цей товар з постійної підписки?")) return;

    // Формуємо новий масив без цього товару
    const newItems = subscription.subscriptionItems
      .filter((i) => i.productId !== productId)
      .map((i) => ({ productId: i.productId, quantity: i.quantity }));

    if (newItems.length === 0) {
      return alert(
        "Підписка не може бути порожньою. Скасуйте її або додайте інший товар.",
      );
    }

    try {
      setIsLoading(true);
      await api.put(`/subscriptions/${subscription.id}/items/permanent`, {
        items: newItems,
      });
      onRefresh();
      fetchUnreadCount();
    } catch (error) {
      alert("Помилка оновлення складу");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPermanent = async (product) => {
    // Перевіряємо, чи є вже такий товар. Якщо є - збільшуємо кількість, якщо ні - додаємо
    const existingItem = subscription.subscriptionItems.find(
      (i) => i.productId === product.id,
    );
    let newItems;

    if (existingItem) {
      newItems = subscription.subscriptionItems.map((i) =>
        i.productId === product.id
          ? { productId: i.productId, quantity: i.quantity + 1 }
          : { productId: i.productId, quantity: i.quantity },
      );
    } else {
      newItems = [
        ...subscription.subscriptionItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        { productId: product.id, quantity: 1 },
      ];
    }

    try {
      setIsLoading(true);
      await api.put(`/subscriptions/${subscription.id}/items/permanent`, {
        items: newItems,
      });
      setIsProductModalOpen(false);
      onRefresh();
      fetchUnreadCount();
    } catch (error) {
      alert("Помилка додавання товару");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOneTime = async (product) => {
    try {
      setIsLoading(true);
      // Додаємо 1 штуку вибраного товару як доповнення
      await api.post(`/subscriptions/${subscription.id}/items/one-time`, {
        items: [{ productId: product.id, quantity: 1 }],
      });
      setIsProductModalOpen(false);
      onRefresh();
      fetchUnreadCount();
    } catch (error) {
      alert("Помилка додавання доповнення");
    } finally {
      setIsLoading(false);
    }
  };

  // Візуалізація статусів
  const getStatusDisplay = () => {
    if (subscription.status === "ACTIVE")
      return (
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-bold">
          Активна
        </span>
      );
    if (subscription.status === "PAUSED")
      return (
        <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm font-bold">
          Зупинена
        </span>
      );
    return (
      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm font-bold">
        Скасована
      </span>
    );
  };

  return (
    <>
      <div
        className={`flex flex-col h-full animate-fade-in ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
      >
        {/* ШАПКА */}
        <div className="p-6 border-b border-brand-orange/20 bg-brand-orange/5 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              SUB-{subscription.id.slice(0, 6).toUpperCase()}
            </h2>
            <p className="text-sm text-brand-orange font-semibold">
              Доставка кожні {subscription.frequencyDays} днів
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-white rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* ОСНОВНИЙ КОНТЕНТ */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                Статус підписки
              </p>
              {getStatusDisplay()}
            </div>
            <div className="flex gap-2">
              {subscription.status === "ACTIVE" && (
                <button
                  onClick={() => handleStatusChange("PAUSED")}
                  className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"
                  title="Зупинити"
                >
                  <PauseIcon className="w-5 h-5" />
                </button>
              )}
              {subscription.status === "PAUSED" && (
                <button
                  onClick={() => handleStatusChange("ACTIVE")}
                  className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                  title="Відновити"
                >
                  <PlayIcon className="w-5 h-5" />
                </button>
              )}
              {subscription.status !== "CANCELLED" && (
                <button
                  onClick={() => handleStatusChange("CANCELLED")}
                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                  title="Скасувати назавжди"
                >
                  <NoSymbolIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* ПОСТІЙНИЙ СКЛАД */}
          <div>
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h3 className="font-bold text-gray-800">Постійний склад</h3>
              <span className="text-sm font-bold text-brand-orange">
                {baseTotal} ₴
              </span>
            </div>
            <div className="space-y-3">
              {subscription.subscriptionItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 group">
                  <img
                    src={item.product.imageUrl}
                    className="w-10 h-10 rounded-lg bg-gray-50 object-contain p-1 border border-gray-100"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.product.currentPrice} ₴ × {item.quantity}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemovePermanentItem(item.productId)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ОДНОРАЗОВІ ДОПОВНЕННЯ */}
          {subscription.addOns && subscription.addOns.length > 0 && (
            <div className="bg-brand-yellow/5 p-4 rounded-xl border border-brand-yellow/20">
              <div className="flex justify-between items-center mb-3 border-b border-brand-yellow/20 pb-2">
                <div>
                  <h3 className="font-bold text-gray-800">
                    На наступну доставку
                  </h3>
                  <p className="text-[10px] text-brand-yellow font-bold uppercase">
                    Одноразові доповнення
                  </p>
                </div>
                <span className="text-sm font-bold text-brand-yellow">
                  +{addOnsTotal} ₴
                </span>
              </div>
              <div className="space-y-3">
                {subscription.addOns.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.product.imageUrl}
                      className="w-8 h-8 rounded-lg bg-white object-contain p-1 border border-brand-yellow/30"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-800">
                        {item.product.name}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {item.product.currentPrice} ₴ × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ФУТЕР */}
        <div className="p-6 bg-white border-t border-gray-100 shrink-0 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium">
                Разом наступна доставка:
              </span>
            </div>
            <span className="text-3xl font-black text-brand-dark">
              {baseTotal + addOnsTotal} ₴
            </span>
          </div>

          {subscription.status !== "CANCELLED" && (
            <ThemeButton
              onClick={() => setIsProductModalOpen(true)}
              orderMode="SUBSCRIPTION"
              className="w-full"
            >
              <PlusCircleIcon className="w-5 h-5" /> Додати товари
            </ThemeButton>
          )}
        </div>
      </div>

      <SubscriptionProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onAddPermanent={handleAddPermanent}
        onAddOneTime={handleAddOneTime}
      />
    </>
  );
}
