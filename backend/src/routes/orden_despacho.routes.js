import { Router } from "express";
import {
  getAllOrdenes,
  getOrdenById,
  despachar,
  obtenerComprobante,
} from "../controllers/orden_despacho.controller.js";

const router = Router();

router.get("/", getAllOrdenes);

router.get("/:id", getOrdenById);

router.get("/:id/comprobante", obtenerComprobante);

// Allow dispatch processing via POST to match client usage (no PUT)
router.post("/:id/despachar", despachar);

export default router;
