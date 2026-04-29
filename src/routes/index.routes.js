import { Router } from "express";
import habilidadRoutes from "./habilidad.routes.js";
import voluntarioRoutes from "./voluntario.routes.js";
import obraRoutes from "./obra.routes.js";
import matchRoutes from "./match.routes.js";

export function routerApi(app) {
  const router = Router();
  app.use("/api", router);


  router.use("/habilidades", habilidadRoutes);
  router.use("/voluntarios", voluntarioRoutes);
  router.use("/obras", obraRoutes);
  router.use("/match", matchRoutes);
}
