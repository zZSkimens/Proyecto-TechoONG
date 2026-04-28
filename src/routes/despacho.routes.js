import { Router } from "express";
import { 
    createDespachoController, 
    getDespachosController, 
    getDespachosByCuadrillaController, 
    devolverItemsController 
} from "../controllers/despacho.controller.js";

const router = Router();

router.post("/", createDespachoController);
router.get("/", getDespachosController);
router.get("/cuadrilla/:cuadrillaId", getDespachosByCuadrillaController);
router.post("/:id/devolucion", devolverItemsController);

export default router;
