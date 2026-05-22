import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  ShoppingCartIcon,
  ArrowPathRoundedSquareIcon,
  ViewColumnsIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "../contexts/CartContext";

export default function HomePage() {
  const { user } = useAuth();
  const { setOrderMode } = useCart();

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

        {/* Заглушка для карток (Поки ми не підключили API) */}
        {/* <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-gray-400">
          <QueueListIcon className="w-16 h-16 mb-4 opacity-50 text-gray-300" />
          <p>Тут будуть відображатися ваші останні активності.</p>
          <p className="text-sm">Зробіть своє перше замовлення!</p>
        </div> */}
      </div>
    </div>
  );
}
