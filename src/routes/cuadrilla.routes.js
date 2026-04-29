import { Router } from "express";
import { 
  createCuadrillaController, 
  getCuadrillasController, 
  updateCuadrillaController,
  joinCuadrillaController,
  deleteCuadrillaController
} from "../controllers/cuadrilla.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { isJefeCuadrilla, isVoluntario } from "../middleware/role.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getCuadrillasController);
router.post("/", isJefeCuadrilla, createCuadrillaController);
router.put("/:id", isJefeCuadrilla, updateCuadrillaController);
router.delete("/:id", isJefeCuadrilla, deleteCuadrillaController);
router.post("/:id/unirse", isVoluntario, joinCuadrillaController);

export default router;
