import { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  // Режими: 'ONE_TIME' (Жовтий) або 'SUBSCRIPTION' (Помаранчевий)
  const [orderMode, setOrderMode] = useState("ONE_TIME");

  // Зберігаємо кошик у пам'яті браузера, щоб при оновленні сторінки він не зникав
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) setItems(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (product) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.productId === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { productId: product.id, product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return removeFromCart(productId);
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const clearCart = () => setItems([]);

  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.currentPrice * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalPrice,
        orderMode,
        setOrderMode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
