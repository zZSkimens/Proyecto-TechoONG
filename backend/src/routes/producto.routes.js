import { Router } from "express";
import {getAllProductos,getProductoById,crearProducto,actualizarProducto,eliminarProducto,verificarStock,getMovimientos,} from "../controllers/producto.controller.js";

const router = Router();

router.get("/", getAllProductos);

router.get("/movimientos", getMovimientos);

router.get("/:id", getProductoById);

router.post("/", crearProducto);

router.post("/verificar-stock", verificarStock);

router.put("/:id", actualizarProducto);

router.delete("/:id", eliminarProducto);

export default router;
