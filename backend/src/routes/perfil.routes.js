import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { coordinadorMiddleware } from "../middleware/coordinador.middleware.js";
import { validarPerfil } from "../middleware/perfil.validation.js";
import { obtenerMiPerfil, actualizarMiPerfil, obtenerTodosLosPerfiles, validarPerfilPostulante, obtenerHistorialPerfil } from "../controllers/perfil.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/mi-perfil", obtenerMiPerfil);
router.post("/mi-perfil", validarPerfil, actualizarMiPerfil);

router.get("/", coordinadorMiddleware, obtenerTodosLosPerfiles);
router.get("/:id/historial", coordinadorMiddleware, obtenerHistorialPerfil);
router.patch("/:id/validar", coordinadorMiddleware, validarPerfilPostulante);

export default router;
