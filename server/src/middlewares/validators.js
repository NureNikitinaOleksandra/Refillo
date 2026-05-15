import { z } from "zod";

// Схема для реєстрації клієнта
export const registerSchema = z.object({
  name: z.string().min(2, "Ім'я надто коротке"),
  email: z.string().email("Некоректний email"),
  password: z.string().min(6, "Пароль має бути не менше 6 символів"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// Схема для входу
export const loginSchema = z.object({
  email: z.string().email("Некоректний email"),
  password: z.string().min(1, "Пароль обов'язковий"),
});

// Схема для оновлення профілю
export const updateProfileSchema = z.object({
  name: z.string().min(2, "Ім'я надто коротке").optional(),
  phone: z.string().min(10, "Некоректний формат телефону").optional(),
  address: z.string().min(5, "Адреса надто коротка").optional(),
});

// Схема для створення підписки
export const createSubscriptionSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "Оберіть хоча б один товар"),
  frequencyDays: z
    .number()
    .int()
    .min(1, "Періодичність має бути хоча б 1 день"),
  deliveryAddress: z.string().min(5, "Вкажіть адресу доставки"),
  paymentMethod: z.enum(["CARD_ONLINE", "CASH_ON_DELIVERY"]),
  deliveryTimePreference: z.string().optional(),
});

// Схема для зміни статусу підписки
export const updateSubscriptionStatusSchema = z.object({
  status: z.enum(["ACTIVE", "PAUSED", "CANCELLED"]),
});

// Схема для постійної зміни складу підписки
export const updateSubscriptionItemsSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "Підписка не може бути порожньою"),
});
