import { EntitySchema } from "typeorm";

export const Capacitacion = new EntitySchema({
  name: "Capacitacion",
  tableName: "capacitaciones",
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
    descripcion: {
      type: "text",
      nullable: true,
    },
    horas: {
      type: "int",
      nullable: true,
      default: 0,
    },
    creado_en: {
      type: "timestamp",
      createDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    perfilCapacitaciones: {
      target: "PerfilCapacitacion",
      type: "one-to-many",
      inverseSide: "capacitacion",
    },
  },
});
