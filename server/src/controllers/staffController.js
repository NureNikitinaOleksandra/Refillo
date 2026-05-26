import { prisma } from "../prisma.js";

// Отримання активної черги замовлень
export const getWorkQueue = async (req, res, next) => {
  try {
    const role = req.user.role; // Отримуємо роль з токена

    let allowedStatuses = [];
    if (role === "EMPLOYEE") {
      allowedStatuses = ["CREATED", "IN_PROCESS"]; // Те, що треба зібрати
    } else if (role === "COURIER") {
      allowedStatuses = ["COLLECTED", "ACCEPTED_BY_COURIER", "EN_ROUTE"]; // Те, що треба доставити
    } else {
      return res.status(403).json({ error: "Доступ заборонено" });
    }

    const orders = await prisma.order.findMany({
      where: { orderStatus: { in: allowedStatuses } },
      include: {
        orderItems: {
          include: { product: { select: { name: true, imageUrl: true } } },
        },
        user: { select: { name: true, phone: true } }, // Дані клієнта
      },
      orderBy: { deliveryTime: "asc" }, // Сортуємо від найближчого часу
    });

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// Отримання історії виконаних замовлень
export const getStaffHistory = async (req, res, next) => {
  try {
    const role = req.user.role;

    // Для історії беремо замовлення, які вже пройшли етап цього працівника
    let historyStatuses = [];
    if (role === "EMPLOYEE") {
      historyStatuses = [
        "COLLECTED",
        "ACCEPTED_BY_COURIER",
        "EN_ROUTE",
        "DELIVERED",
      ];
    } else if (role === "COURIER") {
      historyStatuses = ["DELIVERED"];
    }

    const orders = await prisma.order.findMany({
      where: { orderStatus: { in: historyStatuses } },
      include: {
        orderItems: {
          include: { product: { select: { name: true, imageUrl: true } } },
        },
      },
      orderBy: { createdAt: "desc" }, // Сортуємо за часом останньої зміни
    });

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// Зміна статусу замовлення (і відправка сповіщення клієнту!)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Готуємо дані для оновлення
    const updateData = { orderStatus: status };

    // Якщо статус змінюється на "Доставлено", автоматично ставимо статус оплати "PAID"
    if (status === "DELIVERED") {
      updateData.paymentStatus = "PAID";
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    // Словник статусів для гарних повідомлень
    const statusMap = {
      IN_PROCESS: "В обробці",
      COLLECTED: "Зібрано",
      ACCEPTED_BY_COURIER: "Прийнято кур'єром",
      EN_ROUTE: "В дорозі",
      DELIVERED: "Доставлено",
    };

    // Сповіщення для КЛІЄНТА
    await prisma.notification.create({
      data: {
        userId: updatedOrder.userId,
        type: "STATUS_CHANGE",
        messageText: `Статус вашого замовлення №${updatedOrder.orderNumber} змінено на: ${statusMap[status]}.`,
      },
    });

    // Сповіщення для КУР'ЄРА, якщо замовлення зібрано
    if (status === "COLLECTED") {
      const couriers = await prisma.user.findMany({
        where: { role: "COURIER" },
      });

      const courierNotifications = couriers.map((courier) => ({
        userId: courier.id,
        type: "NEW_TASK",
        messageText: `Замовлення №${updatedOrder.orderNumber} зібрано і готове до доставки!`,
      }));

      if (courierNotifications.length > 0) {
        await prisma.notification.createMany({
          data: courierNotifications,
        });
      }
    }

    res.json({ message: "Статус оновлено", order: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// Отримання сповіщень про нові завдання
export const getStaffNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user.userId,
        type: "NEW_TASK", // Фільтруємо лише робочі сповіщення
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};
