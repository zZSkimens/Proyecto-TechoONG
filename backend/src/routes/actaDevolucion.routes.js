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

// Listar actas (admin_bodega y jefe_cuadrilla pueden ver)
router.get("/", authorize(["admin_bodega", "jefe_cuadrilla", "coordinador_viajes", "administrador"]), getActasDevolucionController);

// Crear acta al disolver cuadrilla (jefe_cuadrilla)
router.post("/", authorize(["jefe_cuadrilla", "coordinador_viajes", "administrador"]), crearActaDevolucionController);

// Procesar acta: revisar items y devolver al inventario (admin_bodega)
router.post("/:id/procesar", authorize(["admin_bodega", "administrador"]), procesarActaDevolucionController);

export default router;
