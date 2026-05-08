import { Router } from "express";
import {
  createChofer,
  getChoferes,
  getChoferById,
  updateChofer,
  deleteChofer,
} from "../controllers/chofer.controller.js";

const router = Router();

router.post("/", createChofer);
router.get("/", getChoferes);
router.get("/:id", getChoferById);
router.put("/:id", updateChofer);
router.delete("/:id", deleteChofer);

export default router;
