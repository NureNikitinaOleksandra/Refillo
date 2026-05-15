export function getNotificationsData(userId) {
  // Генеруємо поточну дату у форматі YYYYMMDD
  const today = new Date();
  const dateString = today.toISOString().split("T")[0].replace(/-/g, "");

  return [
    {
      userId,
      type: "SYSTEM_ERROR",
      messageText: "Вітаємо в Refillo! Ваш обліковий запис успішно створено.",
      isRead: true,
    },
    {
      userId,
      type: "ORDER_UPDATE",
      messageText: `Ваше замовлення №${dateString}-001 прийнято в обробку.`,
      isRead: true,
    },
    {
      userId,
      type: "ORDER_UPDATE",
      messageText: `Замовлення №${dateString}-002 успішно доставлено. Дякуємо, що обрали нас!`,
      isRead: true,
    },
    {
      userId,
      type: "SUBSCRIPTION_GENERATED",
      messageText: `Автоматичне замовлення №${dateString}-003 за вашою підпискою успішно створено.`,
      isRead: false,
    },
    {
      userId,
      type: "PAYMENT_ALERT",
      messageText: "Очікується оплата за нове автоматичне замовлення.",
      isRead: false,
    },
  ];
}

export default { getNotificationsData };
