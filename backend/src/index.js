import "dotenv/config";
import express from "express";
import morgan from "morgan";
import { AppDataSource, connectDB } from "./config/configDb.js";
import { routerApi } from "./routes/index.routes.js";
import { createInitialUsers } from "./config/initialSetup.js";

const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.get("/", (req, res) => {
  res.send("¡Bienvenido a mi API REST con TypeORM!");
});

connectDB()
<<<<<<< HEAD
  .then(() => {
    routerApi(app);

=======
  .then(async () => {
    // Siembra los usuarios por defecto (Configuración Inicial)
    await createInitialUsers();
    routerApi(app);
>>>>>>> Bryan
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor iniciado en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error al conectar con la base de datos:", error);
    process.exit(1);
  });
