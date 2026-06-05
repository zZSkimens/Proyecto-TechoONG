import { Router } from "express";
import { createVoluntarioController, getVoluntariosController, getVoluntarioByIdController } from "../controllers/voluntario.controller.js";

const router = Router();

router.post("/", createVoluntarioController);
router.get("/", getVoluntariosController);
router.get("/:id", getVoluntarioByIdController);

export default router;
