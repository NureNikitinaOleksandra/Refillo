import express from "express";
import { getProfile, updateProfile } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { updateProfileSchema } from "../middlewares/validators.js";

const router = express.Router();

router.use(protect); // Усі роути нижче потребують токена

router.get("/profile", getProfile);
router.put("/profile", validate(updateProfileSchema), updateProfile);

export default router;
