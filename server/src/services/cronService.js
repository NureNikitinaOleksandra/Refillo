import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { executeOrderCreation } from "./orderService.js"; // Імпортуємо наш сервіс

const prisma = new PrismaClient();

const processSubscriptions = async () => {
  console.log(
    `[CRON] ${new Date().toISOString()} - Запуск перевірки підписок...`,
  );

  try {
    const now = new Date();

    // Шукаємо підписки (включаємо і основні товари, і додатки)
    const dueSubscriptions = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        nextExecutionDate: { lte: now },
      },
      include: { subscriptionItems: true, addOns: true },
    });

    if (dueSubscriptions.length === 0) return;

    console.log(
      `[CRON] Знайдено підписок для обробки: ${dueSubscriptions.length}`,
    );

    for (const sub of dueSubscriptions) {
      try {
        await prisma.$transaction(async (tx) => {
          // 2. Об'єднуємо масиви товарів
          const combinedItems = [...sub.subscriptionItems, ...sub.addOns];

          // 1. Створюємо замовлення через єдиний сервіс
          await executeOrderCreation(tx, {
            userId: sub.userId,
            storeId: sub.storeId,
            items: combinedItems,
            paymentMethod: sub.paymentMethod,
            paymentStatus:
              sub.paymentMethod === "CARD_ONLINE" ? "PAID" : "UNPAID",
            deliveryAddress: sub.deliveryAddress,
            deliveryTime: null,
            isSubscriptionGenerated: true, // ВАЖЛИВО! Це автоматичне замовлення
          });

          // 2. Оновлюємо дату наступної підписки (це робить тільки CRON)
          const nextDate = new Date(now);
          nextDate.setDate(nextDate.getDate() + sub.frequencyDays);

          await tx.subscription.update({
            where: { id: sub.id },
            data: { nextExecutionDate: nextDate },
          });
        });

        console.log(`[CRON] Підписка ${sub.id} успішно оброблена.`);
      } catch (subError) {
        console.error(
          `[CRON-ERROR] Помилка обробки підписки ${sub.id}:`,
          subError.message,
        );

        await prisma.notification.create({
          data: {
            userId: sub.userId,
            type: "PRODUCT_ISSUE",
            messageText: `Помилка створення автоматичного замовлення: ${subError.message}`,
          },
        });
      }
    }
  } catch (error) {
    console.error(`[CRON-FATAL] Критична помилка планувальника:`, error);
  }
};

export const initCronJobs = () => {
  // Формат: 'хвилина година день_місяця місяць день_тижня'
  // '0 0 * * *' - щоночі о 00:00
  // '*/1 * * * *' - ЩОХВИЛИНИ (використовуємо зараз для тестування)
  cron.schedule("0 0 * * *", processSubscriptions);
  console.log("⏳ CRON Планувальник підписок ініціалізовано");
};
