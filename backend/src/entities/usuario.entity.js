import { EntitySchema } from "typeorm";

export const Usuario = new EntitySchema({
  name: "Usuario",
  tableName: "usuarios",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
<<<<<<<< HEAD:backend/src/entities/user.entity.js
    name: {
========
    correo: {
>>>>>>>> angelo:backend/src/entities/usuario.entity.js
      type: "varchar",
      length: 255,
      nullable: false,
    },
    rut: {
      type: "varchar",
      length: 20,
      unique: true,
      nullable: false,
    },
    password: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
<<<<<<<< HEAD:backend/src/entities/user.entity.js
    role: {
<<<<<<< HEAD
      type: "enum",
      enum: ["jefe_cuadrilla", "enc_alimentacion", "bodega", "admin"],
      default: "jefe_cuadrilla",
      nullable: false,
=======
      type: "varchar",
      length: 50,
      default: "user",
>>>>>>> Bryan
    },
    created_at: {
      type: "timestamp",
      createDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
    updated_at: {
      type: "timestamp",
      updateDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
========

>>>>>>>> angelo:backend/src/entities/usuario.entity.js
  },
});
