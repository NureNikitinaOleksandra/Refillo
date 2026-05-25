import { PrismaClient } from "@prisma/client";
import { executeOrderCreation } from "../services/orderService.js";

const prisma = new PrismaClient();

export const createOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress, deliveryTime, paymentMethod, cardNumber } =
      req.body;
    const userId = req.user.userId;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Кошик порожній" });
    }

    // --- СИМУЛЯЦІЯ ОПЛАТИ ---
    let currentPaymentStatus = "UNPAID";
    let paymentMessage = "Замовлення оформлено.";

    if (paymentMethod === "CARD_ONLINE") {
      if (cardNumber && cardNumber.endsWith("0000")) {
        // Симуляція помилки: статус залишається UNPAID
        paymentMessage =
          "Помилка оплати: Недостатньо коштів. Замовлення збережено, очікує оплати.";
      } else {
        // Симуляція успіху
        currentPaymentStatus = "PAID";
        paymentMessage = "Оплата успішна. Замовлення прийнято в обробку.";
      }
    }
    // ------------------------

    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Уся складна логіка інкапсульована в сервісі
    const result = await prisma.$transaction(async (tx) => {
      return await executeOrderCreation(tx, {
        userId,
        storeId: user.storeId,
        items,
        paymentMethod,
        paymentStatus: currentPaymentStatus,
        deliveryAddress,
        deliveryTime: deliveryTime ? new Date(deliveryTime) : null,
        isSubscriptionGenerated: false, // Це ручне замовлення
      });
    });

    res.status(201).json({ message: paymentMessage, order: result });
  } catch (error) {
    // Якщо сервіс викинув помилку (наприклад, недостатньо товару), ми її ловимо тут
    if (
      error.message.includes("Недостатньо") ||
      error.message.includes("не знайдено")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

// Ендпоінт для отримання історії замовлень клієнта
export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const orders = await prisma.order.findMany({
      where: { userId: userId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                currentPrice: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// Оплата існуючого замовлення (для уникнення дублікатів)
export const payOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cardNumber } = req.body;
    const userId = req.user.userId;

    // 1. Знаходимо замовлення
    const order = await prisma.order.findUnique({
      where: { id, userId },
    });

    if (!order) {
      return res.status(404).json({ error: "Замовлення не знайдено" });
    }

    if (order.paymentStatus === "PAID") {
      return res.status(400).json({ error: "Замовлення вже оплачене" });
    }

    // 2. Симуляція оплати (секретний код 0000)
    if (cardNumber && cardNumber.endsWith("0000")) {
      // Створюємо сповіщення про помилку
      await prisma.notification.create({
        data: {
          userId,
          type: "PAYMENT_ALERT",
          messageText:
            "Помилка оплати: Недостатньо коштів на картці. Ваше замовлення збережено зі статусом 'Неоплачено'. Спробуйте оплатити його пізніше в історії замовлень.",
        },
      });

      return res
        .status(400)
        .json({ error: "Помилка оплати: Недостатньо коштів на картці" });
    }

    // 3. Оновлюємо статус замовлення
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { paymentStatus: "PAID" },
    });

    await prisma.notification.create({
      data: {
        userId,
        type: "PAYMENT_ALERT",
        messageText: `Оплату замовлення успішно отримано. Дякуємо!`,
      },
    });

    res.json({
      message: "Оплата пройшла успішно!",
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};
