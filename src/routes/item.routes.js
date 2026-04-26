import { Router } from "express";
import { createItemController, getItemsController } from "../controllers/item.controller.js";

const router = Router();

router.post("/", createItemController);
router.get("/", getItemsController);

export default router;
