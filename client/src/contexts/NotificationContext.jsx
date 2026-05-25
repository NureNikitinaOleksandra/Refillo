import { createContext, useState, useContext, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const response = await api.get("/notifications"); // Отримуємо всі
      const unread = response.data.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Помилка завантаження кількості сповіщень", error);
    }
  };

  // Завантажуємо при старті, якщо є юзер
  useEffect(() => {
    fetchUnreadCount();
  }, [user]);

  return (
    <NotificationContext.Provider value={{ unreadCount, fetchUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
