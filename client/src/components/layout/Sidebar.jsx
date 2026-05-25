import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useNotifications } from "../../contexts/NotificationContext";
import {
  HomeIcon,
  ShoppingBagIcon,
  QueueListIcon,
  BellIcon,
  UserCircleIcon,
  ArrowLeftStartOnRectangleIcon,
  PlusCircleIcon,
  ShoppingCartIcon,
  ArrowPathRoundedSquareIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import GradientButton from "../ui/GradientButton";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { setOrderMode } = useCart();
  const { unreadCount } = useNotifications();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const menuItems = [
    { name: "Головна", path: "/", icon: HomeIcon },
    { name: "Каталог", path: "/catalog", icon: ShoppingBagIcon },
    {
      name: "Мої замовлення та підписки",
      path: "/orders",
      icon: QueueListIcon,
    },
    { name: "Мої сповіщення", path: "/notifications", icon: BellIcon },
    { name: "Особистий профіль", path: "/profile", icon: UserCircleIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const handleStartOrder = (mode) => {
    setOrderMode(mode);
    setIsModalOpen(false);
    navigate("/checkout");
  };

  return (
    <>
      <div className="w-72 h-screen bg-brand-dark text-brand-light flex flex-col fixed left-0 top-0 shadow-2xl z-40">
        <div className="p-8 pb-4">
          <h1 className="text-3xl font-extrabold tracking-wider text-white">
            Refillo<span className="text-brand-orange">.</span>
          </h1>
          <p className="text-sm mt-2 opacity-70">Привіт, {user?.name}!</p>
        </div>

        {/* Кнопка швидкого старту (Оформлення) */}
        <div className="px-4 mt-4 mb-2">
          <GradientButton
            onClick={() => setIsModalOpen(true)}
            className="w-full"
          >
            <PlusCircleIcon className="w-6 h-6" />
            Створити...
          </GradientButton>
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-white/10 text-white font-semibold shadow-inner"
                    : "hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${isActive ? "text-brand-yellow" : "opacity-70"}`}
                />
                <span>{item.name}</span>

                {/* ГРАДІЄНТНЕ КОЛО ДЛЯ СПОВІЩЕНЬ */}
                {item.name === "Мої сповіщення" && unreadCount > 0 && (
                  <span className="bg-gradient-to-r from-brand-yellow to-brand-orange text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-md animate-fade-in">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 w-full text-left rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <ArrowLeftStartOnRectangleIcon className="w-6 h-6 opacity-70" />
            <span>Вийти з акаунту</span>
          </button>
        </div>
      </div>

      {/* Модальне вікно */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-brand-dark/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Оберіть тип замовлення
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => handleStartOrder("ONE_TIME")}
                className="group border-2 border-gray-100 hover:border-brand-yellow rounded-xl p-6 flex flex-col items-center gap-3 transition-all duration-300 bg-gray-50 hover:bg-white"
              >
                <div className="bg-brand-yellow/20 p-3 rounded-full group-hover:scale-110 transition-transform">
                  <ShoppingCartIcon className="w-8 h-8 text-brand-yellow" />
                </div>
                <span className="font-bold text-gray-800">Одноразове</span>
                <span className="text-xs text-gray-500 text-center">
                  Швидка покупка товарів прямо зараз
                </span>
              </button>

              <button
                onClick={() => handleStartOrder("SUBSCRIPTION")}
                className="group border-2 border-gray-100 hover:border-brand-orange rounded-xl p-6 flex flex-col items-center gap-3 transition-all duration-300 bg-gray-50 hover:bg-white"
              >
                <div className="bg-brand-orange/20 p-3 rounded-full group-hover:scale-110 transition-transform">
                  <ArrowPathRoundedSquareIcon className="w-8 h-8 text-brand-orange" />
                </div>
                <span className="font-bold text-gray-800">Підписка</span>
                <span className="text-xs text-gray-500 text-center">
                  Регулярна доставка ваших улюблених товарів
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
