import { prisma } from "../prisma.js";

// Отримання всіх повідомлень клієнта (від найновіших до найстаріших)
export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

// Відмітити конкретне повідомлення як прочитане
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updatedNotification = await prisma.notification.update({
      where: {
        id: id,
        userId: req.user.userId, // Перевіряємо, що клієнт читає саме своє повідомлення
      },
      data: { isRead: true },
    });

    res.json(updatedNotification);
  } catch (error) {
    next(error);
  }
};

// Відмітити всі повідомлення як прочитані
export const markAllAsRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user.userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({ message: "Всі повідомлення відмічено як прочитані" });
  } catch (error) {
    next(error);
  }
};
