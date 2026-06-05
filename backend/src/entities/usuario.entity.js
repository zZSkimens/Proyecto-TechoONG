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
    correo: {
      type: "varchar",
      length: 255,
      unique: true,
      nullable: false,
    },
    password: {
      type: "varchar",
      length: 255,
      nullable: false,
    },

  },
});
