import { Router } from "express";
import {
    createDespachoController,
    getDespachosController,
    getDespachosByCuadrillaController,
    devolverItemsController
} from "../controllers/despacho.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { isAdminBodega, authorize } from "../middleware/role.middleware.js";

const router = Router();

router.use(authMiddleware);
router.post("/", isAdminBodega, createDespachoController);
router.get("/", isAdminBodega, getDespachosController);
router.get("/cuadrilla/:cuadrillaId", getDespachosByCuadrillaController);
router.post("/:id/devolucion", authorize(["admin_bodega", "jefe_cuadrilla", "coordinador_viajes"]), devolverItemsController);

export default router;
