export const validate = (schema) => (req, res, next) => {
  try {
    // Парсимо тіло запиту згідно зі схемою
    schema.parse(req.body);
    next();
  } catch (error) {
    // Якщо валідація не пройшла, повертаємо список помилок
    return res.status(400).json({
      error: "Помилка валідації даних",
      details: error.errors.map((e) => ({
        path: e.path[0],
        message: e.message,
      })),
    });
  }
};
