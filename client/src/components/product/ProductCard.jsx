export default function ProductCard({
  product,
  onClick,
  isSelected = false,
  orderMode = "ONE_TIME",
}) {
  // Визначаємо колір обводки залежно від режиму, якщо картка "обрана"
  const getBorderColor = () => {
    if (!isSelected) return "border-transparent hover:border-gray-200";
    return orderMode === "ONE_TIME"
      ? "border-brand-yellow ring-2 ring-brand-yellow/20"
      : "border-brand-orange ring-2 ring-brand-orange/20";
  };

  return (
    <div
      onClick={() => onClick(product)}
      className={`group bg-white rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 border-2 flex flex-col h-full ${getBorderColor()}`}
    >
      {/* Контейнер для картинки */}
      <div className="aspect-square w-full bg-gray-50 rounded-xl mb-4 overflow-hidden flex items-center justify-center p-4">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="text-gray-300 text-sm">Немає фото</span>
        )}
      </div>

      {/* Інформація про товар */}
      <div className="flex flex-col flex-1">
        {/* Категорію можна вивести дрібним шрифтом, якщо вона є */}
        {product.category && (
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            {product.category.name}
          </span>
        )}

        <h3 className="text-gray-800 font-semibold leading-tight mb-2 line-clamp-2">
          {product.name}
        </h3>

        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-brand-dark">
            {product.currentPrice} ₴
          </span>
          <span className="text-xs text-gray-400">
            {product.stockQuantity > 0 ? `В наявності` : "Немає"}
          </span>
        </div>
      </div>
    </div>
  );
}
