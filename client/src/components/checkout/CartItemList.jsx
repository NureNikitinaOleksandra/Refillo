import { useCart } from "../../contexts/CartContext";
import {
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";

export default function CartItemList() {
  const { items, updateQuantity, removeFromCart, orderMode } = useCart();
  const themeColor =
    orderMode === "ONE_TIME" ? "text-brand-yellow" : "text-brand-orange";

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <ShoppingCartIcon className="w-12 h-12 mb-2 opacity-20" />
        <p>Кошик порожній</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pr-2">
      {items.map((item) => (
        <div
          key={item.productId}
          className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 relative group"
        >
          <img
            src={item.product.imageUrl || ""}
            alt={item.product.name}
            className="w-12 h-12 object-contain bg-white rounded-lg p-1"
          />

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-gray-800 truncate">
              {item.product.name}
            </h4>
            <div className="font-bold text-brand-dark">
              {item.product.currentPrice} ₴
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <MinusIcon className="w-3 h-3 text-gray-600" />
            </button>
            <span className="text-sm font-semibold w-4 text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <PlusIcon className="w-3 h-3 text-gray-600" />
            </button>
          </div>

          <button
            onClick={() => removeFromCart(item.productId)}
            className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
