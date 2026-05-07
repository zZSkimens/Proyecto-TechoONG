import { Router } from "express";
import { createItemController, getItemsController } from "../controllers/item.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { isAdminBodega } from "../middleware/role.middleware.js";

const router = Router();

router.use(authMiddleware);
router.post("/", isAdminBodega, createItemController);
router.get("/", getItemsController);

export default router;
