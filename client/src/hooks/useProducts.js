import { useState, useEffect, useMemo } from "react";
import { api } from "../services/api";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("ALL");
  const [sortBy, setSortBy] = useState("ALL");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Помилка завантаження даних:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategoryId !== "ALL") {
      result = result.filter((p) => p.categoryId === selectedCategoryId);
    }
    if (searchQuery.trim() !== "") {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(lowerQuery));
    }
    if (sortBy === "CHEAP")
      result.sort((a, b) => a.currentPrice - b.currentPrice);
    else if (sortBy === "EXPENSIVE")
      result.sort((a, b) => b.currentPrice - a.currentPrice);

    return result;
  }, [products, selectedCategoryId, searchQuery, sortBy]);

  // Повертаємо все, що знадобиться компонентам, які викличуть цей хук
  return {
    categories,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedCategoryId,
    setSelectedCategoryId,
    sortBy,
    setSortBy,
    filteredProducts,
  };
}
