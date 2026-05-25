import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Створення нової підписки
export const createSubscription = async (req, res, next) => {
  try {
    const {
      items,
      frequencyDays,
      deliveryAddress,
      paymentMethod,
      deliveryTimePreference,
    } = req.body;
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Розраховуємо дату першого виконання (сьогодні + періодичність)
    const nextExecutionDate = new Date();

    // Правильний варіант
    // nextExecutionDate.setDate(nextExecutionDate.getDate() + frequencyDays);

    // Для тестування автогенерації
    nextExecutionDate.setSeconds(nextExecutionDate.getSeconds() + 10);

    const subscription = await prisma.subscription.create({
      data: {
        storeId: user.storeId,
        userId: userId,
        frequencyDays,
        nextExecutionDate,
        paymentMethod,
        deliveryAddress,
        deliveryTimePreference,
        status: "ACTIVE",
        subscriptionItems: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: { subscriptionItems: true },
    });

    await prisma.notification.create({
      data: {
        userId,
        type: "SUBSCRIPTION_GENERATED",
        messageText: `Ви успішно створили підписку на регулярну доставку товарів.`,
      },
    });

    res.status(201).json(subscription);
  } catch (error) {
    next(error);
  }
};

// Отримання всіх підписок клієнта
export const getMySubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: req.user.userId },
      include: {
        subscriptionItems: {
          include: {
            product: {
              select: { name: true, currentPrice: true, imageUrl: true },
            },
          },
        },
        addOns: {
          include: {
            product: {
              select: { name: true, currentPrice: true, imageUrl: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(subscriptions);
  } catch (error) {
    next(error);
  }
};

// Зміна статусу підписки (пауза/скасування)
export const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.subscription.update({
      where: { id, userId: req.user.userId },
      data: { status },
    });

    // Словник для красивих сповіщень
    const statusMap = {
      ACTIVE: "Активна",
      PAUSED: "Зупинена",
      CANCELLED: "Скасована",
    };
    const translatedStatus = statusMap[status] || status;

    const subNumber = `SUB-${id.slice(0, 6).toUpperCase()}`;

    await prisma.notification.create({
      data: {
        userId: req.user.userId,
        type: "SUBSCRIPTION_UPDATE",
        messageText: `Статус вашої підписки ${subNumber} змінено на: ${translatedStatus}.`,
      },
    });

    res.json({
      message: `Статус підписки змінено на ${status}`,
      subscription: updated,
    });
  } catch (error) {
    next(error);
  }
};

// ПОСТІЙНА ЗМІНА: Повністю перезаписує склад підписки
export const updatePermanentItems = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { items } = req.body; // Масив нових товарів

    const updated = await prisma.$transaction(async (tx) => {
      // Видаляємо старий склад
      await tx.subscriptionItem.deleteMany({ where: { subscriptionId: id } });

      // Записуємо новий
      await tx.subscriptionItem.createMany({
        data: items.map((item) => ({
          subscriptionId: id,
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      return await tx.subscription.findUnique({
        where: { id },
        include: { subscriptionItems: true },
      });
    });

    const subNumber = `SUB-${id.slice(0, 6).toUpperCase()}`;

    await prisma.notification.create({
      data: {
        userId: req.user.userId,
        type: "SUBSCRIPTION_UPDATE",
        messageText: `Постійний склад вашої підписки ${subNumber} успішно оновлено.`,
      },
    });

    res.json({
      message: "Склад підписки змінено назавжди",
      subscription: updated,
    });
  } catch (error) {
    next(error);
  }
};

// ОДНОРАЗОВА ЗМІНА: Додає товари лише на наступну доставку
export const addOneTimeItems = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { items } = req.body; // Масив додаткових товарів

    await prisma.subscriptionAddOn.createMany({
      data: items.map((item) => ({
        subscriptionId: id,
        productId: item.productId,
        quantity: item.quantity,
      })),
    });

    const subNumber = `SUB-${id.slice(0, 6).toUpperCase()}`;

    await prisma.notification.create({
      data: {
        userId: req.user.userId,
        type: "SUBSCRIPTION_UPDATE",
        messageText: `Одноразові доповнення успішно додані до вашої наступної доставки за підпискою ${subNumber}.`,
      },
    });

    res.json({ message: "Товари успішно додані до наступної доставки" });
  } catch (error) {
    next(error);
  }
};
