import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import AuthPage from "./pages/AuthPage";
import SidebarLayout from "./components/layout/SidebarLayout";
import HomePage from "./pages/HomePage";
import CatalogPage from "./pages/CatalogPage";
import CheckoutPage from "./pages/CheckoutPage";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import OrdersSubscriptionsPage from "./pages/OrdersSubscriptionsPage";

// Компонент для захисту сторінок (якщо не залогінений - викидає на авторизацію)
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Завантаження...</div>;
  if (!user) return <Navigate to="/auth" replace />;

  return children;
};

// Тимчасові заглушки для майбутніх сторінок
const PlaceholderPage = ({ title }) => (
  <div className="text-2xl font-bold">{title}</div>
);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />

      {/* Захищена зона з Сайдбаром */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <SidebarLayout />
          </ProtectedRoute>
        }
      >
        {/* Сторінки, які будуть рендеритися замість <Outlet /> */}
        <Route index element={<HomePage />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="orders" element={<OrdersSubscriptionsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
