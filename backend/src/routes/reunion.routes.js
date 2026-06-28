import { Router } from "express";
import { getReuniones, createReunion, updateReunionEstado } from "../controllers/reunion.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// Todas las rutas protegidas
router.use(authMiddleware);

router.get("/", getReuniones);
router.post("/", createReunion);
router.patch("/:id/estado", updateReunionEstado);

export default router;
