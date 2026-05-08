import { Router } from "express";
import {
  createCuadrilla,
  getCuadrillas,
  getCuadrillaById,
  updateCuadrilla,
  deleteCuadrilla,
} from "../controllers/cuadrilla.controller.js";

const router = Router();

router.post("/", createCuadrilla);
router.get("/", getCuadrillas);
router.get("/:id", getCuadrillaById);
router.put("/:id", updateCuadrilla);
router.delete("/:id", deleteCuadrilla);

export default router;
