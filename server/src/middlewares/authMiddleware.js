import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith("Bearer")) {
    try {
      token = token.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Додаємо дані користувача в об'єкт запиту для подальшого використання
      req.user = decoded;
      next();
    } catch (error) {
      return res
        .status(401)
        .json({ error: "Неавторизовано, токен невалідний" });
    }
  } else {
    return res.status(401).json({ error: "Неавторизовано, токен відсутній" });
  }
};
