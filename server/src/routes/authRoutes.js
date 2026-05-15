import express from "express";
import { register, login } from "../controllers/authController.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { registerSchema, loginSchema } from "../middlewares/validators.js";

const router = express.Router();

// Маршрут реєстрації
router.post("/register", validate(registerSchema), register);

// Маршрут входу
router.post("/login", validate(loginSchema), login);

export default router;
