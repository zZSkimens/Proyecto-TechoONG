import { Router } from "express";
import {
    createDespachoController,
    getDespachosController,
    getDespachosByCuadrillaController,
    devolverItemsController
} from "../controllers/despacho.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { isAdminBodega } from "../middleware/role.middleware.js";

const router = Router();

router.use(authMiddleware);
router.post("/", isAdminBodega, createDespachoController);
router.get("/", isAdminBodega, getDespachosController);
router.get("/cuadrilla/:cuadrillaId", getDespachosByCuadrillaController);
router.post("/:id/devolucion", isAdminBodega, devolverItemsController);

export default router;
