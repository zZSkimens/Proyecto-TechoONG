import { Router } from "express";
import { 
  getActasDevolucionController, 
  crearActaDevolucionController, 
  procesarActaDevolucionController 
} from "../controllers/actaDevolucion.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { isAdminBodega, authorize } from "../middleware/role.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", authorize(["admin_bodega", "jefe_cuadrilla", "coordinador_viajes", "administrador", "coordinador"]), getActasDevolucionController);

router.post("/", authorize(["jefe_cuadrilla", "coordinador_viajes", "administrador", "coordinador"]), crearActaDevolucionController);

router.post("/:id/procesar", authorize(["admin_bodega", "administrador", "coordinador"]), procesarActaDevolucionController);

export default router;
