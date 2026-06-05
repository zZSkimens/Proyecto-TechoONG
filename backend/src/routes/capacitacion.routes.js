import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { coordinadorMiddleware } from "../middleware/coordinador.middleware.js";
import { crearNuevaCapacitacion, listarCapacitaciones, actualizarProgreso } from "../controllers/capacitacion.controller.js";

const router = Router();

router.use(authMiddleware);
router.use(coordinadorMiddleware);

router.post("/", crearNuevaCapacitacion);
router.get("/", listarCapacitaciones);
router.post("/registrar-progreso", actualizarProgreso);

export default router;
