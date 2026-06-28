"use strict";
import { DataSource } from "typeorm";
import { DATABASE, DB_USERNAME, HOST, PASSWORD, DB_PORT } from "./configEnv.js";
import { Voluntario } from "../entities/voluntario.entity.js";
import { User } from "../entities/user.entity.js";
import { SolicitudAlimento, SolicitudAlimentoItem } from "../entities/solicitud_alimento.entity.js";
import { Sector } from "../entities/sector.entity.js";
import { RecepcionEntrega, RecepcionEntregaItem } from "../entities/recepcion_entrega.entity.js";
import { Producto } from "../entities/producto.entity.js";
import { PerfilCapacitacion } from "../entities/perfilCapacitacion.entity.js";
import { Perfil } from "../entities/perfil.entity.js";
import { OrdenDespacho, OrdenDespachoItem } from "../entities/orden_despacho.entity.js";
import { Obra } from "../entities/obra.entity.js";
import { MovimientoInventario } from "../entities/movimiento_inventario.entity.js";
import { Item } from "../entities/item.entity.js";
import { HistorialEstado } from "../entities/historialEstado.entity.js";
import { Despliegue } from "../entities/despliegue.entity.js";
import { DespachoItem } from "../entities/despachoItem.entity.js";
import { Despacho } from "../entities/despacho.entity.js";
import { Cuadrilla } from "../entities/cuadrilla.entity.js";
import { Chofer } from "../entities/chofer.entity.js";
import { Capacitacion } from "../entities/capacitacion.entity.js";
import { ActaDevolucionItem } from "../entities/actaDevolucionItem.entity.js";
import { ActaDevolucion } from "../entities/actaDevolucion.entity.js";
import { Reunion } from "../entities/reunion.entity.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: `${HOST}`,
  port: DB_PORT,
  username: `${DB_USERNAME}`,
  password: `${PASSWORD}`,
  database: `${DATABASE}`,
  entities: [
    Voluntario, User, SolicitudAlimento, SolicitudAlimentoItem, Sector, RecepcionEntrega, RecepcionEntregaItem,
    Producto, PerfilCapacitacion, Perfil, OrdenDespacho, OrdenDespachoItem, Obra, MovimientoInventario,
    Item, HistorialEstado, Despliegue, DespachoItem, Despacho, Cuadrilla, Chofer, Capacitacion,
    ActaDevolucionItem, ActaDevolucion, Reunion
  ],
  synchronize: true, 
  logging: false,
});

export async function connectDB() {
  try {
    await AppDataSource.initialize();
    console.log("=> Conexión exitosa a la base de datos PostgreSQL!");
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
    process.exit(1);
  }
}
