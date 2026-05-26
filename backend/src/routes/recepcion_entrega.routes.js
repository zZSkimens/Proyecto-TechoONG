import { Router } from "express";
import {
  getAllRecepciones,
  getRecepcionById,
  confirmar,
  trazabilidad,
} from "../controllers/recepcion_entrega.controller.js";

const router = Router();

router.get("/", getAllRecepciones);

router.get("/trazabilidad/:solicitudId", trazabilidad);

router.get("/:id", getRecepcionById);

router.post("/confirmar", confirmar);

export default router;
