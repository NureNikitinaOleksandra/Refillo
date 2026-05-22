import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useProducts } from "../hooks/useProducts";
import { api } from "../services/api";

// Компоненти лівої колонки
import ProductCard from "../components/product/ProductCard";
import CategoryButton from "../components/ui/CategoryButton";
import SearchBar from "../components/ui/SearchBar";
import SortDropdown from "../components/ui/SortDropdown";

// Компоненти правої колонки
import OrderDetailsForm from "../components/checkout/OrderDetailsForm";
import CartItemList from "../components/checkout/CartItemList";
import PaymentMethodSelector from "../components/checkout/PaymentMethodSelector";
import PaymentModal from "../components/checkout/PaymentModal";
import ThemeButton from "../components/ui/ThemeButton";

import {
  SparklesIcon,
  TagIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Дані кошика
  const { items, orderMode, totalPrice, addToCart, removeFromCart, clearCart } =
    useCart();

  // Дані вітрини
  const {
    filteredProducts,
    categories,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedCategoryId,
    setSelectedCategoryId,
    sortBy,
    setSortBy,
  } = useProducts();

  // Локальні стани для форми оформлення
  const [address, setAddress] = useState(user?.defaultDeliveryAddress || "");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [frequencyDays, setFrequencyDays] = useState(7);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [serverError, setServerError] = useState("");

  // Підтягуємо адресу користувача, як тільки він завантажився
  useEffect(() => {
    if (!address && user?.defaultDeliveryAddress) {
      setAddress(user.defaultDeliveryAddress);
    }
  }, [user?.defaultDeliveryAddress]);

  // Відфільтровуємо лише ті товари, що є в наявності!
  const availableProducts = filteredProducts.filter((p) => p.stockQuantity > 0);

  // Клік по товару
  const toggleProduct = (product) => {
    const exists = items.some((i) => i.productId === product.id);
    if (exists) {
      removeFromCart(product.id);
    } else {
      addToCart(product);
    }
  };

  // Функція скасування
  const handleCancel = () => {
    if (
      window.confirm(
        "Ви впевнені, що хочете скасувати створення? Усі дані будуть втрачені.",
      )
    ) {
      clearCart();
      navigate("/");
    }
  };

  // Головна функція створення замовлення/підписки
  const handleOrderSubmit = async (cardNumber = null) => {
    setServerError("");

    // БЛОК ВАЛІДАЦІЇ:
    if (items.length === 0) {
      return setServerError("Кошик порожній! Додайте хоча б один товар.");
    }
    if (!address.trim()) {
      return setServerError("Будь ласка, вкажіть адресу доставки.");
    }
    if (!deliveryTime) {
      return setServerError("Будь ласка, вкажіть бажану дату та час доставки.");
    }
    if (!paymentMethod) {
      return setServerError("Будь ласка, оберіть спосіб оплати.");
    }
    if (orderMode === "SUBSCRIPTION" && (!frequencyDays || frequencyDays < 1)) {
      return setServerError("Вкажіть коректну періодичність доставки.");
    }

    // Якщо все добре — формуємо payload і відправляємо на сервер
    try {
      setServerError("");
      const payload = {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        deliveryAddress: address,
        deliveryTime: deliveryTime
          ? new Date(deliveryTime).toISOString()
          : null,
        paymentMethod,
        cardNumber, // передається тільки якщо обрано оплату карткою
      };

      if (orderMode === "SUBSCRIPTION") {
        payload.frequencyDays = frequencyDays;
        await api.post("/subscriptions", payload);
        alert("Підписку успішно оформлено!");
      } else {
        const response = await api.post("/orders", payload);
        // Якщо симуляція картки повернула помилку, ми виводимо повідомлення з бекенду
        alert(response.data.message || "Замовлення успішно створено!");
      }

      clearCart();
      navigate("/orders"); // Переходимо в історію замовлень
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Помилка при створенні";
      setServerError(errorMsg);
      // Якщо це помилка картки, закриваємо модалку, щоб показати помилку зверху
      if (isPaymentModalOpen) setIsPaymentModalOpen(false);
    }
  };

  // Логіка кліку на кнопку "Оформити"
  const handleCheckoutClick = () => {
    if (
      items.length === 0 ||
      !address.trim() ||
      !deliveryTime ||
      !paymentMethod
    ) {
      return handleOrderSubmit();
    }

    if (paymentMethod === "CARD_ONLINE") {
      setIsPaymentModalOpen(true); // Відкриваємо модалку картки
    } else {
      handleOrderSubmit(); // Готівка — відправляємо одразу
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center mt-20 font-semibold text-brand-dark">
        Завантаження робочої зоні...
      </div>
    );

  return (
    <div className="flex flex-col xl:flex-row h-[calc(100vh-80px)] gap-8 animate-fade-in">
      {/* ================= ЛІВА ЧАСТИНА (Вітрина) ================= */}
      <div className="xl:w-2/3 flex flex-col h-full overflow-hidden">
        {/* Шапка з режимом */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <ShoppingBagIcon
              className={`w-8 h-8 ${orderMode === "ONE_TIME" ? "text-brand-yellow" : "text-brand-orange"}`}
            />
            {orderMode === "ONE_TIME"
              ? "Формування замовлення"
              : "Створення підписки"}
          </h1>
        </div>

        {/* Фільтри (Скрол по горизонталі) */}
        <div className="mb-4 overflow-x-auto pb-2 hide-scrollbar shrink-0">
          <div className="flex gap-4 min-w-max">
            <CategoryButton
              name="Усі"
              isSelected={selectedCategoryId === "ALL"}
              orderMode={orderMode}
              onClick={() => setSelectedCategoryId("ALL")}
              icon={SparklesIcon}
            />
            {categories.map((cat) => (
              <CategoryButton
                key={cat.id}
                name={cat.name}
                isSelected={selectedCategoryId === cat.id}
                orderMode={orderMode}
                onClick={() => setSelectedCategoryId(cat.id)}
                icon={TagIcon}
              />
            ))}
          </div>
        </div>

        {/* Пошук та сортування */}
        <div className="flex gap-4 mb-6 shrink-0">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              orderMode={orderMode}
            />
          </div>
          <div className="w-1/3">
            <SortDropdown
              value={sortBy}
              onChange={setSortBy}
              orderMode={orderMode}
            />
          </div>
        </div>

        {/* Сітка товарів (Скролиться окремо від сторінки!) */}
        <div className="flex-1 overflow-y-auto pr-2 hide-scrollbar pb-10">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {availableProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                orderMode={orderMode}
                isSelected={items.some((i) => i.productId === product.id)} // МАГІЯ ПІДСВІТКИ!
                onClick={() => toggleProduct(product)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ================= ПРАВА ЧАСТИНА (Кошик та Оформлення) ================= */}
      <div className="xl:w-1/3 h-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col h-full overflow-hidden">
          <div className="p-6 bg-gray-50 border-b border-gray-100 shrink-0">
            <h2 className="text-xl font-bold text-gray-800">Деталі</h2>
          </div>

          {/* Форма, Кошик та Оплата (Зі скролом усередині, якщо треба) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {serverError && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
                <p className="font-bold">Помилка</p>
                <p className="text-sm">{serverError}</p>
              </div>
            )}

            <OrderDetailsForm
              orderMode={orderMode}
              address={address}
              setAddress={setAddress}
              deliveryTime={deliveryTime}
              setDeliveryTime={setDeliveryTime}
              frequencyDays={frequencyDays}
              setFrequencyDays={setFrequencyDays}
            />

            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-bold text-brand-dark mb-4">Обрані товари</h3>
              <div className="max-h-64 overflow-y-auto hide-scrollbar">
                <CartItemList />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-bold text-brand-dark mb-4">Спосіб оплати</h3>
              <PaymentMethodSelector
                method={paymentMethod}
                setMethod={setPaymentMethod}
                orderMode={orderMode}
              />
            </div>
          </div>

          {/* Футер правої колонки (Прибитий до низу) */}
          <div className="p-6 bg-gray-50 border-t border-gray-100 shrink-0">
            <div className="flex justify-between items-end mb-4">
              <span className="text-gray-500">До сплати:</span>
              <span className="text-3xl font-black text-brand-dark">
                {totalPrice} ₴
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {/* Нова тематична кнопка */}
              <ThemeButton
                onClick={handleCheckoutClick}
                orderMode={orderMode}
                disabled={items.length === 0}
                className="w-full text-lg hover:scale-[1.02]"
              >
                {orderMode === "ONE_TIME"
                  ? "Оформити замовлення"
                  : "Активувати підписку"}
              </ThemeButton>

              {/* Кнопка скасування */}
              <button
                onClick={handleCancel}
                className="w-full py-3 rounded-xl font-semibold text-gray-500 bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                Скасувати та вийти
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Модальне вікно оплати */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={totalPrice}
        onSubmit={(cardNumber) => handleOrderSubmit(cardNumber)}
      />
    </div>
  );
}
