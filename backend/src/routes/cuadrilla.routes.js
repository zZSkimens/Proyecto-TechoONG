import { Router } from "express";
import { 
  createCuadrillaController, 
  getCuadrillasController, 
  updateCuadrillaController,
  dissolverCuadrillaController
} from "../controllers/cuadrilla.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { isJefeCuadrilla } from "../middleware/role.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getCuadrillasController);
router.post("/", isJefeCuadrilla, createCuadrillaController);
router.put("/:id", isJefeCuadrilla, updateCuadrillaController);
router.post("/:id/disolver", isJefeCuadrilla, dissolverCuadrillaController);

export default router;

