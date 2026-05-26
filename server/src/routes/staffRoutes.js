import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getWorkQueue,
  getStaffHistory,
  updateOrderStatus,
  getStaffNotifications,
} from "../controllers/staffController.js";

const router = express.Router();

router.use(protect); // Тільки авторизовані

router.get("/queue", getWorkQueue);
router.get("/history", getStaffHistory);
router.patch("/orders/:id/status", updateOrderStatus);
router.get("/notifications", getStaffNotifications);

export default router;
