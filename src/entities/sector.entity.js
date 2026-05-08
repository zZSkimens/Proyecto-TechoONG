import { EntitySchema } from "typeorm";

export const Sector = new EntitySchema({
  name: "Sector",
  tableName: "sectores",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    nombre: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    ubicacion: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    descripcion: {
      type: "text",
      nullable: true,
    },

  },
});
