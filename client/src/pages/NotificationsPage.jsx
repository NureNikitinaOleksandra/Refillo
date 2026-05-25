import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNotifications } from "../contexts/NotificationContext";
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  CreditCardIcon,
  ShoppingBagIcon,
  WrenchScrewdriverIcon,
  CheckIcon,
  UserIcon,
  ArrowPathRoundedSquareIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Беремо функцію оновлення цифри для сайдбару
  const { fetchUnreadCount } = useNotifications();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      // Оновлюємо локальний список
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      fetchUnreadCount(); // Оновлюємо сайдбар
    } catch (error) {
      console.error("Помилка", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      fetchUnreadCount();
    } catch (error) {
      console.error("Помилка", error);
    }
  };

  // Вибір іконки та кольору за типом
  const getNotificationStyle = (type) => {
    switch (type) {
      case "ORDER_UPDATE":
        return {
          icon: ShoppingBagIcon,
          color: "text-brand-yellow",
          bg: "bg-brand-yellow/10",
        };
      case "SUBSCRIPTION_UPDATE":
        return {
          icon: ArrowPathRoundedSquareIcon,
          color: "text-brand-orange",
          bg: "bg-brand-orange/10",
        };
      case "STATUS_CHANGE":
        return { icon: TruckIcon, color: "text-green-500", bg: "bg-green-50" };
      case "PAYMENT_ALERT":
        return {
          icon: CreditCardIcon,
          color: "text-red-500",
          bg: "bg-red-50",
        };
      case "PRODUCT_ISSUE":
        return {
          icon: ExclamationCircleIcon,
          color: "text-red-500",
          bg: "bg-red-50",
        };
      case "ACCOUNT_UPDATE":
        return { icon: UserIcon, color: "text-blue-500", bg: "bg-blue-50" };
      case "NEW_TASK":
        return {
          icon: WrenchScrewdriverIcon,
          color: "text-blue-500",
          bg: "bg-blue-50",
        };
      default:
        return { icon: BellIcon, color: "text-gray-500", bg: "bg-gray-100" };
    }
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  if (isLoading)
    return (
      <div className="flex justify-center mt-20 font-semibold text-brand-dark">
        Завантаження сповіщень...
      </div>
    );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <BellIcon className="w-8 h-8 text-brand-yellow" />
            Мої сповіщення
          </h1>
          <p className="text-gray-500 mt-2">
            Будьте в курсі всіх подій вашого акаунту
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            <CheckCircleIcon className="w-5 h-5" />
            Прочитати всі
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-400">
          <BellIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>У вас поки немає нових сповіщень.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const {
              icon: Icon,
              color,
              bg,
            } = getNotificationStyle(notification.type);

            return (
              <div
                key={notification.id}
                className={`p-6 rounded-2xl flex gap-4 transition-all duration-300 border ${
                  notification.isRead
                    ? "bg-white border-gray-100 opacity-70"
                    : "bg-white border-brand-yellow/30 shadow-md transform hover:-translate-y-1"
                }`}
              >
                <div className={`p-3 rounded-xl h-fit ${bg}`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <p
                      className={`text-sm font-bold tracking-wide uppercase ${color}`}
                    >
                      {notification.type.replace("_", " ")}
                    </p>
                    <span className="text-xs text-gray-400 font-semibold">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>

                  <p
                    className={`text-lg ${notification.isRead ? "text-gray-600" : "text-gray-800 font-medium"}`}
                  >
                    {notification.messageText}
                  </p>
                </div>

                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    title="Відмітити як прочитане"
                    className="h-fit p-2 text-brand-orange bg-brand-orange/10 hover:bg-brand-orange hover:text-white rounded-full transition-colors"
                  >
                    <CheckIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
