import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Отримання профілю поточного користувача
export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        defaultDeliveryAddress: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Користувача не знайдено" });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Оновлення персональних даних
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const userId = req.user.userId;

    // 1. Дістаємо старі дані
    const oldUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!oldUser)
      return res.status(404).json({ error: "Користувача не знайдено" });

    // 2. Порівнюємо і збираємо текст змін
    let changes = [];
    if (oldUser.name !== name)
      changes.push(`ім'я (з "${oldUser.name}" на "${name}")`);
    if (oldUser.phone !== phone)
      changes.push(`номер телефону (з "${oldUser.phone}" на "${phone}")`);
    if (oldUser.defaultDeliveryAddress !== address)
      changes.push(
        `адресу доставки (з "${oldUser.defaultDeliveryAddress}" на "${address}")`,
      );

    // 3. Оновлюємо користувача
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name,
        phone: phone,
        defaultDeliveryAddress: address,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        defaultDeliveryAddress: true,
        role: true,
        createdAt: true,
      },
    });

    // 4. Якщо були зміни, створюємо сповіщення
    if (changes.length > 0) {
      const changesText = changes.join(", ");
      await prisma.notification.create({
        data: {
          userId: userId,
          type: "ACCOUNT_UPDATE",
          messageText: `Ваш профіль було відредаговано. Змінено: ${changesText}.`,
        },
      });
    }

    res.json({
      message: "Профіль успішно оновлено",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
