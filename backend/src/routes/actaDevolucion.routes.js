import { Router } from "express";
import { getActasDevolucionController } from "../controllers/actaDevolucion.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { isAdminBodega } from "../middleware/role.middleware.js";

const router = Router();

router.use(authMiddleware);
router.get("/", isAdminBodega, getActasDevolucionController);

export default router;
