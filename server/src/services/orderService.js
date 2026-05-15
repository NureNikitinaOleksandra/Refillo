export const executeOrderCreation = async (
  tx,
  {
    userId,
    storeId,
    items,
    paymentMethod,
    paymentStatus,
    deliveryAddress,
    deliveryTime = null,
    isSubscriptionGenerated = false,
  },
) => {
  // 1. Отримуємо актуальні дані про товари з бази
  const productIds = items.map((item) => item.productId);
  const dbProducts = await tx.product.findMany({
    where: { id: { in: productIds } },
  });

  let totalPrice = 0;
  const orderItemsData = [];

  // 2. Перевірка залишків та розрахунок вартості
  for (const item of items) {
    const dbProduct = dbProducts.find((p) => p.id === item.productId);

    if (!dbProduct) {
      throw new Error(`Товар з ID ${item.productId} не знайдено`);
    }
    if (dbProduct.stockQuantity < item.quantity) {
      throw new Error(
        `Недостатньо товару "${dbProduct.name}". В наявності: ${dbProduct.stockQuantity}`,
      );
    }

    totalPrice += dbProduct.currentPrice * item.quantity;

    orderItemsData.push({
      productId: dbProduct.id,
      quantity: item.quantity,
      priceAtPurchase: dbProduct.currentPrice,
    });
  }

  // 3. Генерація номера замовлення
  const now = new Date();
  const dateString = now.toISOString().split("T")[0].replace(/-/g, "");
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const todaysOrdersCount = await tx.order.count({
    where: { createdAt: { gte: startOfDay, lte: endOfDay } },
  });
  const orderNumber = `${dateString}-${(todaysOrdersCount + 1).toString().padStart(3, "0")}`;

  // 4. Створюємо замовлення
  const order = await tx.order.create({
    data: {
      orderNumber,
      storeId,
      userId,
      paymentMethod,
      paymentStatus,
      deliveryAddress,
      deliveryTime,
      totalPrice,
      isSubscriptionGenerated,
      orderItems: { create: orderItemsData },
    },
    include: { orderItems: true },
  });

  // 5. Віднімаємо товари зі складу
  for (const item of items) {
    await tx.product.update({
      where: { id: item.productId },
      data: { stockQuantity: { decrement: item.quantity } },
    });
  }

  // 6. Створюємо системне сповіщення
  const messagePrefix = isSubscriptionGenerated
    ? "Автоматичне замовлення"
    : "Ваше замовлення";
  await tx.notification.create({
    data: {
      userId,
      type: isSubscriptionGenerated ? "SUBSCRIPTION_GENERATED" : "ORDER_UPDATE",
      messageText: `${messagePrefix} №${orderNumber} на суму ${totalPrice} грн успішно створено.`,
    },
  });

  return order;
};
