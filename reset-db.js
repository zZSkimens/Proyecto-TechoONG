import { AppDataSource } from "./src/config/configDb.js";

async function resetDatabase() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    console.log("🔄 Reiniciando base de datos...");

    // Limpiar las tablas en el orden correcto (respetando claves foráneas)
    await AppDataSource.query(`TRUNCATE TABLE "obra_habilidades" RESTART IDENTITY CASCADE;`);
    await AppDataSource.query(`TRUNCATE TABLE "voluntario_habilidades" RESTART IDENTITY CASCADE;`);
    await AppDataSource.query(`TRUNCATE TABLE "habilidades" RESTART IDENTITY CASCADE;`);
    await AppDataSource.query(`TRUNCATE TABLE "voluntarios" RESTART IDENTITY CASCADE;`);
    await AppDataSource.query(`TRUNCATE TABLE "obras" RESTART IDENTITY CASCADE;`);

    console.log("Base de datos reiniciada correctamente. Los IDs ahora comienzan en 1.");
    process.exit(0);
  } catch (error) {
    console.error("Error al reiniciar la base de datos:", error);
    process.exit(1);
  }
}

resetDatabase();
