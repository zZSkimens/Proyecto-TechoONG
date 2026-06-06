import { Router } from "express";
import { createItemController, getItemsController, updateItemController, deleteItemController } from "../controllers/item.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { isAdminBodega } from "../middleware/role.middleware.js";

const router = Router();

router.use(authMiddleware);
router.post("/", isAdminBodega, createItemController);
router.get("/", getItemsController);
router.put("/:id", isAdminBodega, updateItemController);
router.delete("/:id", isAdminBodega, deleteItemController);

export default router;
