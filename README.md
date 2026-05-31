# Proyecto-TechoONG
Este repositorio contiene el proyecto semestral del ramo Ingeniería de Software. El proyecto consiste en un sistema centralizado diseñado para optimizar la planificación, despacho y seguimiento logístico en la construcción de viviendas de emergencia. Este proyecto busca conectar la necesidad operativa en sectores afectados con los recursos humanos y materiales disponibles, garantizando eficiencia, trazabilidad y seguridad en cada despliegue.

# Clonar el repositorio
git clone https://github.com/tu-usuario/Proyecto-TechoONG.git

# Entrar al directorio del backend e instalar dependencias
cd backend
npm install

# Entrar al directorio del frontend e instalar dependencias
cd ../frontend
npm install

# Para el backend se utiliza

Node.js
Express
PostgreSQL
Git

# Para el frontend se utiliza:

React
Tailwind

# Configuración .env
Para ejecutar el backend, se requiere el siguiente formato en el archivo .env

HOST = (localhost | IP)
PORT = (3000 | 80)

DB_PORT = 5432
DB_USERNAME = postgres
DB_PASSWORD = (contraseña base de datos)
DATABASE = (base de datos)

JWT_SECRET = (128 caracteres)
COOKIE_KEY = (128 caracteres)
