import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "../services/api";
import {
  ArrowRightEndOnRectangleIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

// Схеми валідації
const loginSchema = z.object({
  email: z.string().email("Некоректний формат email"),
  password: z.string().min(6, "Пароль має містити мінімум 6 символів"),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Ім'я має містити мінімум 2 символи"),
});

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
  });

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setServerError("");
    reset(); // Очищаємо форму при перемиканні
  };

  const onSubmit = async (data) => {
    try {
      setServerError("");
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const response = await api.post(endpoint, data);

      login(response.data.user, response.data.token);

      alert(
        `Вітаємо, ${response.data.user.name}! ${isLogin ? "Вхід" : "Реєстрація"} успішна.`,
      );

      navigate("/");
    } catch (error) {
      setServerError(
        error.response?.data?.error || "Помилка з'єднання з сервером",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        {/* Заголовок та іконка */}
        <div className="text-center mb-8">
          <div
            className={`mx-auto w-16 h-16 flex items-center justify-center rounded-full mb-4 transition-colors duration-300 ${isLogin ? "bg-brand-yellow/20 text-brand-yellow" : "bg-brand-orange/20 text-brand-orange"}`}
          >
            {isLogin ? (
              <ArrowRightEndOnRectangleIcon className="w-8 h-8" />
            ) : (
              <UserPlusIcon className="w-8 h-8" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-brand-dark">
            {isLogin ? "З поверненням!" : "Створити акаунт"}
          </h2>
          <p className="text-gray-500 mt-2">
            {isLogin
              ? "Увійдіть, щоб продовжити покупки"
              : "Приєднуйтесь до Refillo вже сьогодні"}
          </p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Поле Ім'я (тільки для реєстрації) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-1">
                Ім'я
              </label>
              <input
                {...register("name")}
                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-orange transition-all"
                placeholder="Олександра"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1">
              Email
            </label>
            <input
              {...register("email")}
              className={`w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 transition-all ${isLogin ? "focus:ring-brand-yellow" : "focus:ring-brand-orange"}`}
              placeholder="hello@refillo.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1">
              Пароль
            </label>
            <input
              type="password"
              {...register("password")}
              className={`w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 transition-all ${isLogin ? "focus:ring-brand-yellow" : "focus:ring-brand-orange"}`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-70 ${
              isLogin
                ? "bg-brand-yellow hover:bg-yellow-500"
                : "bg-brand-orange hover:bg-orange-600"
            }`}
          >
            {isSubmitting
              ? "Зачекайте..."
              : isLogin
                ? "Увійти"
                : "Зареєструватися"}
          </button>
        </form>

        {/* Перемикач */}
        <div className="mt-8 text-center text-sm text-gray-500">
          {isLogin ? "Ще не маєте акаунту?" : "Вже зареєстровані?"}
          <button
            onClick={toggleMode}
            className={`ml-2 font-semibold transition-colors ${isLogin ? "text-brand-orange hover:text-orange-600" : "text-brand-yellow hover:text-yellow-600"}`}
          >
            {isLogin ? "Створити акаунт" : "Увійти"}
          </button>
        </div>
      </div>
    </div>
  );
}
