import { Router } from "express";
import authRoutes from "./auth.routes.js";
import profileRoutes from "./profile.routes.js";
import itemRoutes from "./item.routes.js";
import cuadrillaRoutes from "./cuadrilla.routes.js";
import despachoRoutes from "./despacho.routes.js";

export function routerApi(app) {
  const router = Router();
  app.use("/api", router);

  router.use("/auth", authRoutes);
  router.use("/profile", profileRoutes);
  router.use("/items", itemRoutes);
  router.use("/cuadrillas", cuadrillaRoutes);
  router.use("/despachos", despachoRoutes);
}
