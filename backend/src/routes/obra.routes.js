import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { coordinadorMiddleware } from "../middleware/coordinador.middleware.js";
import { crearObra, listarObras, obtenerMatchParaObra } from "../controllers/obra.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", coordinadorMiddleware, crearObra);
router.get("/", listarObras);
router.get("/:id/match", coordinadorMiddleware, obtenerMatchParaObra);

export default router;
