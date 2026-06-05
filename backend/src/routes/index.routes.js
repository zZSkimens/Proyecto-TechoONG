import { Router } from "express";
import sectorRoutes from "./sector.routes.js";
import cuadrillaRoutes from "./cuadrilla.routes.js";
import choferRoutes from "./chofer.routes.js";
import despliegueRoutes from "./despliegue.routes.js";
import voluntarioRoutes from "./voluntario.routes.js";
import authRoutes from "./auth.routes.js";

export function routerApi(app) {
  const router = Router();
  app.use("/api", router);

  router.use("/auth", authRoutes);
  router.use("/voluntarios", voluntarioRoutes);
  router.use("/sectores", sectorRoutes);
  router.use("/cuadrillas", cuadrillaRoutes);
  router.use("/choferes", choferRoutes);
  router.use("/despliegues", despliegueRoutes);
}
