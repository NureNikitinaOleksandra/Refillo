import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import AuthPage from "./pages/AuthPage";
import SidebarLayout from "./components/layout/SidebarLayout";
import HomePage from "./pages/HomePage";
import CatalogPage from "./pages/CatalogPage";
import CheckoutPage from "./pages/CheckoutPage";

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
        <Route
          path="orders"
          element={<PlaceholderPage title="Мої замовлення (в розробці)" />}
        />
        <Route
          path="notifications"
          element={<PlaceholderPage title="Сповіщення (в розробці)" />}
        />
        <Route
          path="profile"
          element={<PlaceholderPage title="Профіль (в розробці)" />}
        />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
