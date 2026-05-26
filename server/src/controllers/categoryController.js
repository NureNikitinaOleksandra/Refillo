import { prisma } from "../prisma.js";

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};
