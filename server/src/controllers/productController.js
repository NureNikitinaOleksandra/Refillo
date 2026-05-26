import { prisma } from "../prisma.js";

export const getAllProducts = async (req, res, next) => {
  try {
    const { categoryId, search } = req.query;

    const products = await prisma.product.findMany({
      where: {
        // Якщо передано categoryId, фільтруємо за ним
        ...(categoryId && { categoryId }),
        // Якщо передано search, шукаємо в назві (незалежно від регістру)
        ...(search && {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }),
      },
      include: {
        category: true, // Додаємо дані про категорію в кожен товар
      },
      orderBy: { name: "asc" },
    });

    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      return res.status(404).json({ error: "Товар не знайдено" });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};
