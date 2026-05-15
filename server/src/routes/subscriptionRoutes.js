import express from "express";
import {
  createSubscription,
  getMySubscriptions,
  updateStatus,
  updatePermanentItems,
  addOneTimeItems,
} from "../controllers/subscriptionController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  createSubscriptionSchema,
  updateSubscriptionStatusSchema,
  updateSubscriptionItemsSchema,
} from "../middlewares/validators.js";

const router = express.Router();

router.use(protect);

router.post("/", validate(createSubscriptionSchema), createSubscription);
router.get("/my-subscriptions", getMySubscriptions);
router.patch(
  "/:id/status",
  validate(updateSubscriptionStatusSchema),
  updateStatus,
);
router.put(
  "/:id/items/permanent",
  validate(updateSubscriptionItemsSchema),
  updatePermanentItems,
);
router.post("/:id/items/one-time", addOneTimeItems);

export default router;
