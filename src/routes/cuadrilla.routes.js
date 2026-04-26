import { Router } from "express";
import { createCuadrillaController, getCuadrillasController } from "../controllers/cuadrilla.controller.js";

const router = Router();

router.post("/", createCuadrillaController);
router.get("/", getCuadrillasController);

export default router;
