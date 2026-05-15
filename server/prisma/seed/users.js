import { genSalt, hash } from "bcryptjs";

export async function getUsersData(storeId) {
  const salt = await genSalt(10);
  const passwordHash = await hash("123456", salt);

  return [
    {
      storeId,
      name: "Олег Працівник",
      email: "worker@refillo.com",
      passwordHash,
      role: "EMPLOYEE",
      phone: "+380501112233",
    },
    {
      storeId,
      name: "Іван Кур'єр",
      email: "courier@refillo.com",
      passwordHash,
      role: "COURIER",
      phone: "+380671112233",
    },
    {
      storeId,
      name: "Анна Клієнтка",
      email: "anna@refillo.com",
      passwordHash,
      role: "CUSTOMER",
      phone: "+380631112233",
      defaultDeliveryAddress: "м. Київ, вул. Хрещатик, 1",
    },
  ];
}

export default { getUsersData };
