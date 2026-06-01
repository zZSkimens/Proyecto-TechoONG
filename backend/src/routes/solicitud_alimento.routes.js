import { Router } from "express";
import {
  getAllSolicitudes,
  getSolicitudById,
  crearSolicitud,
  aprobar,
  rechazar,
} from "../controllers/solicitud_alimento.controller.js";

const router = Router();

router.get("/", getAllSolicitudes);

router.get("/:id", getSolicitudById);

router.post("/", crearSolicitud);

router.put("/:id/aprobar", aprobar);

router.put("/:id/rechazar", rechazar);

export default router;
