import { Router } from "express";
import { createHabilidadController, getHabilidadesController, getHabilidadByIdController } from "../controllers/habilidad.controller.js";

const router = Router();

router.post("/", createHabilidadController);
router.get("/", getHabilidadesController);
router.get("/:id", getHabilidadByIdController);

export default router;
