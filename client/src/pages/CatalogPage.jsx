import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useProducts } from "../hooks/useProducts"; // Наш новий хук!

import ProductCard from "../components/product/ProductCard";
import Modal from "../components/ui/Modal";
import CategoryButton from "../components/ui/CategoryButton";
import SearchBar from "../components/ui/SearchBar";
import SortDropdown from "../components/ui/SortDropdown";

import {
  ShoppingCartIcon,
  ArrowPathRoundedSquareIcon,
  SparklesIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

export default function CatalogPage() {
  // Завантаження даних
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

  // Локальні стани UI
  const [selectedProduct, setSelectedProduct] = useState(null);

  const navigate = useNavigate();
  const { addToCart, setOrderMode } = useCart();

  const handleAddToOrder = (product, mode) => {
    setOrderMode(mode);
    addToCart(product);
    setSelectedProduct(null);
    navigate("/checkout");
  };

  const getSimilarProducts = (currentProduct) => {
    return filteredProducts
      .filter(
        (p) =>
          p.categoryId === currentProduct.categoryId &&
          p.id !== currentProduct.id,
      )
      .slice(0, 4);
  };

  if (isLoading)
    return (
      <div className="flex justify-center mt-20 font-semibold text-brand-dark">
        Завантаження вітрини...
      </div>
    );

  // Перевірка наявності для модалки
  const isOutOfStock = selectedProduct?.stockQuantity === 0;

  return (
    <div className="animate-fade-in pb-10">
      {/* Блок категорій */}
      <div className="mb-8 overflow-x-auto pb-4 hide-scrollbar">
        <div className="flex gap-4 min-w-max">
          <CategoryButton
            name="Усі товари"
            isSelected={selectedCategoryId === "ALL"}
            onClick={() => setSelectedCategoryId("ALL")}
            icon={SparklesIcon}
          />
          {categories.map((category) => (
            <CategoryButton
              key={category.id}
              name={category.name}
              isSelected={selectedCategoryId === category.id}
              onClick={() => setSelectedCategoryId(category.id)}
              icon={TagIcon}
            />
          ))}
        </div>
      </div>

      {/* Пошук та Сортування */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="w-full md:w-2/3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Шукати щось смачненьке..."
          />
        </div>
        <div className="w-full md:w-1/3">
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>
      </div>

      {/* Сітка товарів */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl font-semibold mb-2">Товарів не знайдено</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => setSelectedProduct(product)}
            />
          ))}
        </div>
      )}

      {/* Модальне вікно */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      >
        {selectedProduct && (
          <div className="flex flex-col md:flex-row gap-8 p-8">
            <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 rounded-2xl p-8">
              {selectedProduct.imageUrl ? (
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="object-contain max-h-80"
                />
              ) : (
                <span className="text-gray-300">Немає фото</span>
              )}
            </div>

            <div className="w-full md:w-1/2 flex flex-col">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {selectedProduct.category?.name || "Без категорії"}
              </span>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {selectedProduct.name}
              </h2>
              <p className="text-gray-600 mb-6 flex-1 leading-relaxed">
                {selectedProduct.description || "Детальний опис відсутній."}
              </p>

              <div className="flex items-end justify-between mb-8">
                <div className="text-3xl font-extrabold text-brand-dark">
                  {selectedProduct.currentPrice} ₴
                </div>
                {isOutOfStock ? (
                  <span className="text-red-500 font-bold bg-red-50 px-3 py-1 rounded-lg">
                    Немає в наявності
                  </span>
                ) : (
                  <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-lg">
                    В наявності
                  </span>
                )}
              </div>

              {/* Кнопки (заблоковані, якщо товару немає) */}
              <div className="flex flex-col gap-4">
                <button
                  disabled={isOutOfStock}
                  onClick={() => handleAddToOrder(selectedProduct, "ONE_TIME")}
                  className={`flex items-center justify-center gap-3 w-full py-4 rounded-xl font-bold shadow-md transition-all ${
                    isOutOfStock
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                      : "bg-brand-yellow hover:bg-brand-yellowHover text-white hover:shadow-lg"
                  }`}
                >
                  <ShoppingCartIcon className="w-6 h-6" />В одноразове
                  замовлення
                </button>
                <button
                  disabled={isOutOfStock}
                  onClick={() =>
                    handleAddToOrder(selectedProduct, "SUBSCRIPTION")
                  }
                  className={`flex items-center justify-center gap-3 w-full py-4 rounded-xl font-bold shadow-md transition-all ${
                    isOutOfStock
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                      : "bg-brand-orange hover:bg-brand-orangeHover text-white hover:shadow-lg"
                  }`}
                >
                  <ArrowPathRoundedSquareIcon className="w-6 h-6" />
                  Додати до підписки
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Схожі товари */}
        {selectedProduct && getSimilarProducts(selectedProduct).length > 0 && (
          <div className="bg-gray-50 px-8 py-8 border-t border-gray-100 rounded-b-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              Схожі товари
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {getSimilarProducts(selectedProduct).map((simProduct) => (
                <ProductCard
                  key={simProduct.id}
                  product={simProduct}
                  onClick={() => setSelectedProduct(simProduct)}
                />
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
