import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "../services/api.js";

// 1. Описуємо Zod-схему (таку саму, як на бекенді)
const loginSchema = z.object({
  email: z.string().email("Некоректний формат email"),
  password: z.string().min(1, "Пароль є обов'язковим"),
});

export default function Login() {
  const [serverError, setServerError] = useState("");

  // 2. Підключаємо react-hook-form із Zod
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // 3. Функція відправки даних на сервер
  const onSubmit = async (data) => {
    try {
      setServerError("");
      // Робимо POST запит на бекенд
      const response = await api.post("/auth/login", data);

      // Зберігаємо токен у пам'ять браузера
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      alert(`Вітаємо, ${response.data.user.name}! Вхід успішний.`);
      // Пізніше тут буде редирект на головну сторінку
    } catch (error) {
      // Ловимо помилку від бекенду (наприклад, 401 Невірний пароль)
      setServerError(
        error.response?.data?.error || "Помилка з'єднання з сервером",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Вхід у Refillo
        </h2>

        {/* Виведення помилки від сервера */}
        {serverError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Поле Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              {...register("email")}
              className={`w-full p-2 border rounded-md outline-none transition-colors ${
                errors.email
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500"
              }`}
              placeholder="anna@refillo.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Поле Пароль */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Пароль
            </label>
            <input
              type="password"
              {...register("password")}
              className={`w-full p-2 border rounded-md outline-none transition-colors ${
                errors.password
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500"
              }`}
              placeholder="••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Кнопка відправки */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white font-semibold p-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {isSubmitting ? "Зачекайте..." : "Увійти"}
          </button>
        </form>
      </div>
    </div>
  );
}
