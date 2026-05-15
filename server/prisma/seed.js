import { PrismaClient } from "@prisma/client";
import { getUsersData } from "./seed/users.js";
import { categories, products } from "./seed/products.js";
import { getNotificationsData } from "./seed/notifications.js";

const prisma = new PrismaClient();

async function main() {
  console.log("Запуск модульного Seed-скрипта Refillo...");

  // Очищення бази на початку
  await prisma.notification.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.subscriptionItem.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.store.deleteMany();

  // 1. Створення магазину
  const store = await prisma.store.create({
    data: { name: "Refillo Main Store" },
  });

  // 2. Створення користувачів
  const usersData = await getUsersData(store.id);
  await prisma.user.createMany({ data: usersData });

  const customer = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });

  // 3. Створення категорій
  const categoryMap = {};
  for (const name of categories) {
    const category = await prisma.category.create({
      data: { storeId: store.id, name },
    });
    categoryMap[name] = category.id;
  }

  // 4. Створення товарів
  const productData = products.map((p) => ({
    storeId: store.id,
    categoryId: categoryMap[p.category],
    name: p.name,
    description: p.desc,
    currentPrice: p.price,
    stockQuantity: p.stock,
    imageUrl: `http://localhost:3000/images/${p.img}`,
  }));
  await prisma.product.createMany({ data: productData });

  // 5. Отримання товарів для створення тестових замовлень
  const milk = await prisma.product.findFirst({
    where: { name: { contains: "Молоко" } },
  });
  const tp = await prisma.product.findFirst({
    where: { name: { contains: "Zewa" } },
  });
  const catLitter = await prisma.product.findFirst({
    where: { name: { contains: "Наповнювач" } },
  });

  // 6. Створення тестових підписок
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  await prisma.subscription.create({
    data: {
      storeId: store.id,
      userId: customer.id,
      status: "ACTIVE",
      frequencyDays: 7,
      nextExecutionDate: tomorrow,
      paymentMethod: "CARD_ONLINE",
      deliveryAddress: customer.defaultDeliveryAddress,
      deliveryTimePreference: "12:00",
      subscriptionItems: {
        create: [
          { productId: milk.id, quantity: 2 },
          { productId: tp.id, quantity: 1 },
        ],
      },
    },
  });

  await prisma.subscription.create({
    data: {
      storeId: store.id,
      userId: customer.id,
      status: "PAUSED",
      frequencyDays: 14,
      nextExecutionDate: tomorrow,
      paymentMethod: "CASH_ON_DELIVERY",
      deliveryAddress: customer.defaultDeliveryAddress,
      deliveryTimePreference: "10:00",
      subscriptionItems: {
        create: [
          { productId: catLitter.id, quantity: 1 },
          { productId: tp.id, quantity: 3 },
        ],
      },
    },
  });

  await prisma.subscription.create({
    data: {
      storeId: store.id,
      userId: customer.id,
      status: "CANCELLED",
      frequencyDays: 7,
      nextExecutionDate: tomorrow,
      paymentMethod: "CARD_ONLINE",
      deliveryAddress: customer.defaultDeliveryAddress,
      deliveryTimePreference: "9:00",
      subscriptionItems: {
        create: [
          { productId: milk.id, quantity: 1 },
          { productId: tp.id, quantity: 1 },
          { productId: catLitter.id, quantity: 1 },
        ],
      },
    },
  });

  // 7. Створення різноманітних замовлень (CREATED, COLLECTED, EN_ROUTE, DELIVERED)
  await prisma.order.create({
    data: {
      orderNumber: "20260515-001",
      storeId: store.id,
      userId: customer.id,
      orderStatus: "CREATED",
      paymentStatus: "PAID",
      paymentMethod: "CARD_ONLINE",
      deliveryAddress: customer.defaultDeliveryAddress,
      totalPrice: tp.currentPrice,
      orderItems: {
        create: [
          { productId: tp.id, quantity: 1, priceAtPurchase: tp.currentPrice },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: "20260515-002",
      storeId: store.id,
      userId: customer.id,
      orderStatus: "COLLECTED",
      paymentStatus: "UNPAID",
      paymentMethod: "CASH_ON_DELIVERY",
      deliveryAddress: "м. Київ, вул. Хрещатик, 15",
      totalPrice: milk.currentPrice * 2,
      orderItems: {
        create: [
          {
            productId: milk.id,
            quantity: 2,
            priceAtPurchase: milk.currentPrice,
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: "20260515-003",
      storeId: store.id,
      userId: customer.id,
      orderStatus: "EN_ROUTE",
      paymentStatus: "PAID",
      paymentMethod: "CARD_ONLINE",
      deliveryAddress: customer.defaultDeliveryAddress,
      totalPrice: catLitter.currentPrice,
      orderItems: {
        create: [
          {
            productId: catLitter.id,
            quantity: 1,
            priceAtPurchase: catLitter.currentPrice,
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: "20260510-001",
      storeId: store.id,
      userId: customer.id,
      orderStatus: "DELIVERED",
      paymentStatus: "PAID",
      paymentMethod: "CARD_ONLINE",
      deliveryAddress: customer.defaultDeliveryAddress,
      totalPrice: milk.currentPrice,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 днів тому
      orderItems: {
        create: [
          {
            productId: milk.id,
            quantity: 1,
            priceAtPurchase: milk.currentPrice,
          },
        ],
      },
    },
  });

  // 8. Заповнення сповіщень
  const notificationsData = getNotificationsData(customer.id);
  await prisma.notification.createMany({ data: notificationsData });

  console.log("Модульне заповнення бази даних Refillo завершено успішно!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
