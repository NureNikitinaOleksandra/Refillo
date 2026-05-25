import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import {
  ShoppingCartIcon,
  ArrowPathRoundedSquareIcon,
  ViewColumnsIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "../contexts/CartContext";
import ActivityCard from "../components/history/ActivityCard";

export default function HomePage() {
  const { user } = useAuth();
  const { setOrderMode } = useCart();
  const navigate = useNavigate();

  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Завантажуємо останні замовлення та підписки
  useEffect(() => {
    const fetchRecentData = async () => {
      try {
        const [ordersRes, subsRes] = await Promise.all([
          api.get("/orders/my-orders"),
          api.get("/subscriptions/my-subscriptions"),
        ]);

        const orders = ordersRes.data.map((o) => ({ ...o, _type: "ORDER" }));
        const subs = subsRes.data.map((s) => ({ ...s, _type: "SUBSCRIPTION" }));

        // Зливаємо, сортуємо за датою і беремо лише перші 3 найновіші елементи
        const merged = [...orders, ...subs]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);

        setRecentActivities(merged);
      } catch (error) {
        console.error("Помилка завантаження дашборду:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Вітальний блок */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-800">
          Вітаємо, {user?.name}!
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Refillo — це ваш розумний помічник. Замовляйте улюблені товари прямо
          зараз або налаштуйте автоматичну підписку, щоб ніколи не турбуватися
          про порожній холодильник.
        </p>
      </div>

      {/* Великі кнопки дій (Головний фокус користувача) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Жовта кнопка - Одноразове */}
        <Link
          to="/checkout"
          onClick={() => setOrderMode("ONE_TIME")}
          className="group relative bg-brand-yellow hover:bg-yellow-500 text-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col items-start"
        >
          <div className="bg-white/20 p-4 rounded-xl mb-6">
            <ShoppingCartIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Одноразове замовлення</h2>
          <p className="text-white/90">
            Сформуйте кошик для швидкої покупки. Ідеально для спонтанних потреб.
          </p>
          <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <ShoppingCartIcon className="w-48 h-48" />
          </div>
        </Link>

        {/* Помаранчева кнопка - Підписка */}
        <Link
          to="/checkout"
          onClick={() => setOrderMode("SUBSCRIPTION")}
          className="group relative bg-brand-orange hover:bg-orange-600 text-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col items-start"
        >
          <div className="bg-white/20 p-4 rounded-xl mb-6">
            <ArrowPathRoundedSquareIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Оформити підписку</h2>
          <p className="text-white/90">
            Налаштуйте регулярну доставку базових товарів. Ми все зробимо за
            вас.
          </p>
          <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <ArrowPathRoundedSquareIcon className="w-48 h-48" />
          </div>
        </Link>
      </div>

      {/* Посилання на каталог */}
      <div className="flex justify-center mt-4">
        <Link
          to="/catalog"
          className="flex items-center gap-3 px-8 py-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ViewColumnsIcon className="w-6 h-6 text-brand-orange" />
          Просто перейти до каталогу товарів
        </Link>
      </div>

      {/* Віджет останніх активностей */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            Останні замовлення та підписки
          </h3>
          <Link
            to="/orders"
            className="text-sm font-semibold text-brand-orange hover:underline"
          >
            Переглянути всі
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-6 text-gray-400 font-medium">
            Завантаження дашборду...
          </div>
        ) : recentActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="font-semibold">
              У вас ще немає створених замовлень або підписок.
            </p>
            <p className="text-sm mt-1">
              Зробіть свій перший вибір за допомогою кнопок вище!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentActivities.map((item) => (
              <ActivityCard
                key={item.id}
                item={item}
                type={item._type}
                isSelected={false}
                onClick={() => navigate("/orders")} // Перенаправляємо в історію, де відкриються деталі
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
