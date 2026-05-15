import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Реєстрація нового клієнта
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Перевіряємо, чи не зайнятий email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Користувач з таким email вже існує" });
    }

    // Хешуємо пароль
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Отримуємо ID тестового магазину (він один)
    const store = await prisma.store.findFirst();

    // Створюємо користувача
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        defaultDeliveryAddress: address,
        storeId: store.id,
        role: "CUSTOMER",
      },
    });

    res.status(201).json({ message: "Реєстрація успішна", userId: newUser.id });
  } catch (error) {
    next(error); // Передаємо помилку в глобальний errorHandler
  }
};

// Вхід у систему
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Шукаємо користувача
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Невірний email або пароль" });
    }

    // Перевіряємо пароль
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Невірний email або пароль" });
    }

    // Геруємо JWT токен
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};
