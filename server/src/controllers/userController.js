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

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
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
      },
    });

    res.json({
      message: "Профіль успішно оновлено",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
