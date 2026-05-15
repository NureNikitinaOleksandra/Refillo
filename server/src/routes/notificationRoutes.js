import express from "express";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect); // Усі роути захищені токеном

router.get("/", getMyNotifications);
// Важливо: специфічний роут /read-all має йти ПЕРЕД динамічним /:id, щоб Express їх не сплутав
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);

export default router;
