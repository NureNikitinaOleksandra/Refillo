import express from "express";
import {
  createOrder,
  getMyOrders,
  payOrder,
} from "../controllers/orderController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Ці маршрути захищені - доступні лише авторизованим користувачам
router.use(protect);

router.post("/", createOrder);
router.get("/my-orders", getMyOrders);
router.patch("/:id/pay", payOrder);

export default router;
