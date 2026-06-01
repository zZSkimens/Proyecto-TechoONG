import { Router } from "express";
import authRoutes from "./auth.routes.js";
import perfilRoutes from "./perfil.routes.js";
import obraRoutes from "./obra.routes.js";
import capacitacionRoutes from "./capacitacion.routes.js";

export function routerApi(app) {
  const router = Router();
  app.use("/api", router);

  router.use("/auth", authRoutes);
  router.use("/perfiles", perfilRoutes);
  router.use("/obras", obraRoutes);
  router.use("/capacitaciones", capacitacionRoutes);
}
