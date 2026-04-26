import { Router } from "express";
import { createObraController, getObrasController, getObraByIdController } from "../controllers/obra.controller.js";

const router = Router();

router.post("/", createObraController);
router.get("/", getObrasController);
router.get("/:id", getObraByIdController);

export default router;
