import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import { initCronJobs } from "./services/cronService.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";

// Ініціалізація змінних середовища
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ================= MIDDLEWARES =================
// Дозволяємо запити з React-фронтенду
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// Парсинг JSON у тілі запитів
app.use(express.json());

// Роздача статичних файлів (картинки товарів)
app.use("/images", express.static("public/images"));

// ================= ROUTES =================
// Простий Health-check для перевірки працездатності
app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "Бекенд Refillo працює чудово!",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/staff", staffRoutes);

// Запускаємо фонові задачі
initCronJobs();

// ================= ОБРОБКА ПОМИЛОК =================
// Глобальний обробник помилок
app.use((err, req, res, next) => {
  console.error("🔥 Помилка сервера:", err.message);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || "Внутрішня помилка сервера",
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер Refillo успішно запущено на http://localhost:${PORT}`);
});
