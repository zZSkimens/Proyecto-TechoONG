import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";
import { validarPerfil } from "../middleware/perfil.validation.js";
import { obtenerMiPerfil, actualizarMiPerfil, obtenerTodosLosPerfiles, validarPerfilPostulante } from "../controllers/perfil.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/mi-perfil", obtenerMiPerfil);
router.post("/mi-perfil", validarPerfil, actualizarMiPerfil);

router.get("/", adminMiddleware, obtenerTodosLosPerfiles);
router.patch("/:id/validar", adminMiddleware, validarPerfilPostulante);

export default router;
