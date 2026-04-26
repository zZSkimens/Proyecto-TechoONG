import { Router } from "express";
import { createDespachoController, getDespachosController } from "../controllers/despacho.controller.js";

const router = Router();

router.post("/", createDespachoController);
router.get("/", getDespachosController);

export default router;
