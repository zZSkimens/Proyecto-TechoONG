import { Router } from "express";
import {
  createSector,
  getSectores,
  getSectorById,
  updateSector,
  deleteSector,
} from "../controllers/sector.controller.js";

const router = Router();

router.post("/", createSector);
router.get("/", getSectores);
router.get("/:id", getSectorById);
router.put("/:id", updateSector);
router.delete("/:id", deleteSector);

export default router;
