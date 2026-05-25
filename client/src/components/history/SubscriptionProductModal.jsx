import { useProducts } from "../../hooks/useProducts";
import Modal from "../ui/Modal";
import CategoryButton from "../ui/CategoryButton";
import SearchBar from "../ui/SearchBar";
import { SparklesIcon, TagIcon } from "@heroicons/react/24/outline";
import ProductCard from "../product/ProductCard";

export default function SubscriptionProductModal({
  isOpen,
  onClose,
  onAddPermanent,
  onAddOneTime,
}) {
  // Використовуємо наш готовий хук!
  const {
    filteredProducts,
    categories,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedCategoryId,
    setSelectedCategoryId,
  } = useProducts();

  if (!isOpen) return null;

  const availableProducts = filteredProducts.filter((p) => p.stockQuantity > 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-[90vw] xl:max-w-7xl"
    >
      <div className="p-8 flex flex-col h-[85vh]">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Каталог товарів
            </h2>
            <p className="text-gray-500 mt-1">
              Оберіть товари для додавання у підписку
            </p>
          </div>
        </div>

        {/* Фільтри та пошук (Зафіксовані зверху) */}
        <div className="shrink-0 mb-6 space-y-4">
          <div className="overflow-x-auto pb-2 hide-scrollbar">
            <div className="flex gap-4 min-w-max">
              <CategoryButton
                name="Усі"
                isSelected={selectedCategoryId === "ALL"}
                orderMode="SUBSCRIPTION"
                onClick={() => setSelectedCategoryId("ALL")}
                icon={SparklesIcon}
              />
              {categories.map((cat) => (
                <CategoryButton
                  key={cat.id}
                  name={cat.name}
                  isSelected={selectedCategoryId === cat.id}
                  orderMode="SUBSCRIPTION"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  icon={TagIcon}
                />
              ))}
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              orderMode="SUBSCRIPTION"
            />
          </div>
        </div>

        {/* Сітка товарів (Скролиться) */}
        <div className="flex-1 overflow-y-auto pr-2 hide-scrollbar">
          {isLoading ? (
            <div className="text-center py-20 font-semibold text-brand-dark">
              Завантаження каталогу...
            </div>
          ) : availableProducts.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              Товарів не знайдено
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-10">
              {availableProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  orderMode="SUBSCRIPTION"
                  // onClick не передаємо, щоб картка не була клікабельною цілком
                  actions={
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onAddOneTime(product)}
                        className="flex flex-col items-center justify-center py-2 bg-brand-yellow/10 text-brand-yellow hover:bg-brand-yellow hover:text-white rounded-xl transition-colors"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          1 раз
                        </span>
                      </button>

                      <button
                        onClick={() => onAddPermanent(product)}
                        className="flex flex-col items-center justify-center py-2 bg-brand-orange/10 text-brand-orange hover:bg-brand-orange hover:text-white rounded-xl transition-colors"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Назавжди
                        </span>
                      </button>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
