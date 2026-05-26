import { Router } from "express";
import authRoutes from "./auth.routes.js";
import profileRoutes from "./profile.routes.js";
import productoRoutes from "./producto.routes.js";
import solicitudAlimentoRoutes from "./solicitud_alimento.routes.js";
import ordenDespachoRoutes from "./orden_despacho.routes.js";
import recepcionEntregaRoutes from "./recepcion_entrega.routes.js";

export function routerApi(app) {
  const router = Router();
  app.use("/api", router);

  router.use("/auth", authRoutes);
  router.use("/profile", profileRoutes);

  router.use("/productos", productoRoutes);
  router.use("/solicitudes-alimentos", solicitudAlimentoRoutes);
  router.use("/ordenes-despacho", ordenDespachoRoutes);
  router.use("/recepciones", recepcionEntregaRoutes);
}
