"use strict";
import { DataSource } from "typeorm";
import { DATABASE, DB_USERNAME, HOST, PASSWORD, DB_PORT } from "./configEnv.js";
import { Voluntario } from "../entities/voluntario.entity.js";
import { Sector } from "../entities/sector.entity.js";
import { Cuadrilla } from "../entities/cuadrilla.entity.js";
import { Chofer } from "../entities/chofer.entity.js";
import { Despliegue } from "../entities/despliegue.entity.js";
import { Usuario } from "../entities/usuario.entity.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: `${HOST}`,
  port: DB_PORT,
  username: `${DB_USERNAME}`,
  password: `${PASSWORD}`,
  database: `${DATABASE}`,
  entities: [Voluntario, Sector, Cuadrilla, Chofer, Despliegue, Usuario],
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