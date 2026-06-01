import { Router } from "express";
import sectorRoutes from "./sector.routes.js";
import cuadrillaRoutes from "./cuadrilla.routes.js";
import choferRoutes from "./chofer.routes.js";
import despliegueRoutes from "./despliegue.routes.js";
import voluntarioRoutes from "./voluntario.routes.js";
import authRoutes from "./auth.routes.js";
<<<<<<< HEAD
import perfilRoutes from "./perfil.routes.js";
import obraRoutes from "./obra.routes.js";
import capacitacionRoutes from "./capacitacion.routes.js";
=======
>>>>>>> angelo

export function routerApi(app) {
  const router = Router();
  app.use("/api", router);

  router.use("/auth", authRoutes);
<<<<<<< HEAD
  router.use("/perfiles", perfilRoutes);
  router.use("/obras", obraRoutes);
  router.use("/capacitaciones", capacitacionRoutes);
=======
  router.use("/voluntarios", voluntarioRoutes);
  router.use("/sectores", sectorRoutes);
  router.use("/cuadrillas", cuadrillaRoutes);
  router.use("/choferes", choferRoutes);
  router.use("/despliegues", despliegueRoutes);
>>>>>>> angelo
}
