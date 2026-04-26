import { Router } from "express";
import { getMatchForProjectController } from "../controllers/match.controller.js";

const router = Router();

// Endpoint para calcular el match de una obra específica
router.get("/project/:obraId", getMatchForProjectController);

export default router;
