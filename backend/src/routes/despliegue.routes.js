import { Router } from "express";
import {
  createDespliegue,
  getDespliegues,
  getDespliegueById,
  updateDespliegue,
  deleteDespliegue,
} from "../controllers/despliegue.controller.js";

const router = Router();

router.post("/", createDespliegue);
router.get("/", getDespliegues);
router.get("/:id", getDespliegueById);
// Allow updating a despliegue via POST as PUT is not used by the client
router.post("/:id", updateDespliegue);
router.delete("/:id", deleteDespliegue);

export default router;
