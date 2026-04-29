import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";
import { validarPerfil } from "../middleware/perfil.validation.js";
import { obtenerMiPerfil, actualizarMiPerfil, obtenerTodosLosPerfiles, validarPerfilPostulante } from "../controllers/perfil.controller.js";

const router = Router();

// Todas las rutas de perfil requieren autenticación
router.use(authMiddleware);

// Rutas para usuarios normales (ver/editar su propio perfil)
router.get("/mi-perfil", obtenerMiPerfil);
router.post("/mi-perfil", validarPerfil, actualizarMiPerfil);

// Rutas para administradores
router.get("/", adminMiddleware, obtenerTodosLosPerfiles);
router.patch("/:id/validar", adminMiddleware, validarPerfilPostulante);

export default router;
