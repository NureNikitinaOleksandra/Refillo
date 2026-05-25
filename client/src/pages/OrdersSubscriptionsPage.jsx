import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useCart } from "../contexts/CartContext";
import ActivityCard from "../components/history/ActivityCard";
import OrderDrawer from "../components/history/OrderDrawer";
import SubscriptionDrawer from "../components/history/SubscriptionDrawer";
import PaymentModal from "../components/checkout/PaymentModal";
import { QueueListIcon } from "@heroicons/react/24/outline";

export default function OrdersSubscriptionsPage() {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTab, setFilterTab] = useState("ALL"); // 'ALL', 'ORDER', 'SUBSCRIPTION'

  const [selectedItem, setSelectedItem] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const navigate = useNavigate();
  const { clearCart, addToCart, setOrderMode } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Вантажимо обидва списки одночасно
      const [ordersRes, subsRes] = await Promise.all([
        api.get("/orders/my-orders"),
        api.get("/subscriptions/my-subscriptions"),
      ]);

      // Маркуємо типи
      const orders = ordersRes.data.map((o) => ({ ...o, _type: "ORDER" }));
      const subs = subsRes.data.map((s) => ({ ...s, _type: "SUBSCRIPTION" }));

      // Зливаємо і сортуємо за датою (від нових до старих)
      const merged = [...orders, ...subs].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setActivities(merged);

      setSelectedItem((prev) =>
        prev ? merged.find((item) => item.id === prev.id) : null,
      );
    } catch (error) {
      console.error("Помилка завантаження історії:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredActivities = useMemo(() => {
    if (filterTab === "ALL") return activities;
    // Одноразові (не згенеровані)
    if (filterTab === "MANUAL_ORDER")
      return activities.filter(
        (a) => a._type === "ORDER" && !a.isSubscriptionGenerated,
      );
    // Автозамовлення
    if (filterTab === "AUTO_ORDER")
      return activities.filter(
        (a) => a._type === "ORDER" && a.isSubscriptionGenerated,
      );
    // Підписки
    if (filterTab === "SUBSCRIPTION")
      return activities.filter((a) => a._type === "SUBSCRIPTION");
    return activities;
  }, [activities, filterTab]);

  const handleRepeatOrder = () => {
    if (!selectedItem || selectedItem._type !== "ORDER") return;
    clearCart();
    selectedItem.orderItems.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) addToCart(item.product);
    });
    setOrderMode("ONE_TIME");
    navigate("/checkout");
  };

  const handlePayOrder = async (cardNumber) => {
    try {
      await api.patch(`/orders/${selectedItem.id}/pay`, { cardNumber });
      setIsPaymentModalOpen(false);
      alert("Оплата пройшла успішно!");
      fetchData(); // Оновлюємо списки
      setSelectedItem((prev) => ({ ...prev, paymentStatus: "PAID" }));
    } catch (error) {
      alert(error.response?.data?.error || "Помилка оплати");
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center mt-20 font-semibold text-brand-dark">
        Завантаження історії...
      </div>
    );

  return (
    <div className="relative h-[calc(100vh-80px)] flex overflow-hidden animate-fade-in">
      {/* ЛІВА ЧАСТИНА: Список карток */}
      <div
        className={`flex-1 transition-all duration-300 pr-6 overflow-y-auto hide-scrollbar pb-10 ${selectedItem ? "mr-[400px] xl:mr-[400px]" : ""}`}
      >
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 pt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <QueueListIcon className="w-8 h-8 text-brand-yellow" />
              Історія активності
            </h1>
            <p className="text-gray-500 mt-1">
              Керуйте своїми замовленнями та підписками
            </p>
          </div>

          {/* Вкладки (Фільтри) */}
          <div className="flex bg-gray-100 p-1 rounded-xl w-fit overflow-x-auto hide-scrollbar">
            <button
              onClick={() => {
                setFilterTab("ALL");
                setSelectedItem(null);
              }}
              className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${filterTab === "ALL" ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"}`}
            >
              Всі
            </button>
            <button
              onClick={() => {
                setFilterTab("MANUAL_ORDER");
                setSelectedItem(null);
              }}
              className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${filterTab === "MANUAL_ORDER" ? "bg-white shadow-sm text-brand-yellow" : "text-gray-500 hover:text-gray-700"}`}
            >
              Одноразові
            </button>
            <button
              onClick={() => {
                setFilterTab("AUTO_ORDER");
                setSelectedItem(null);
              }}
              className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${filterTab === "AUTO_ORDER" ? "bg-white shadow-sm text-brand-orange" : "text-gray-500 hover:text-gray-700"}`}
            >
              Автозамовлення
            </button>
            <button
              onClick={() => {
                setFilterTab("SUBSCRIPTION");
                setSelectedItem(null);
              }}
              className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${filterTab === "SUBSCRIPTION" ? "bg-white shadow-sm text-brand-orange" : "text-gray-500 hover:text-gray-700"}`}
            >
              Підписки
            </button>
          </div>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            Немає записів у цій категорії.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredActivities.map((item) => (
              <ActivityCard
                key={item.id}
                item={item}
                type={item._type}
                isSelected={selectedItem?.id === item.id}
                onClick={() =>
                  setSelectedItem(selectedItem?.id === item.id ? null : item)
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* ПРАВА ЧАСТИНА: Бокова панель (Drawer) */}
      <div
        className={`fixed top-0 right-0 h-full w-[400px] xl:w-[440px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-30 border-l border-gray-100 ${selectedItem ? "translate-x-0" : "translate-x-full"}`}
      >
        {selectedItem?._type === "ORDER" && (
          <OrderDrawer
            order={selectedItem}
            onClose={() => setSelectedItem(null)}
            onRepeat={handleRepeatOrder}
            onPay={() => setIsPaymentModalOpen(true)}
          />
        )}
        {selectedItem?._type === "SUBSCRIPTION" && (
          <SubscriptionDrawer
            subscription={selectedItem}
            onClose={() => setSelectedItem(null)}
            onRefresh={fetchData}
          />
        )}
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={selectedItem?.totalPrice}
        onSubmit={handlePayOrder}
      />
    </div>
  );
}
