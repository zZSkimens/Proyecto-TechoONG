import { EntitySchema } from "typeorm";

export const ActaDevolucion = new EntitySchema({
  name: "ActaDevolucion",
  tableName: "acta_devolucion",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    estado: {
      type: "enum",
      enum: ["Pendiente", "Procesada"],
      default: "Pendiente",
    },
    dias_trabajados: {
      type: "int",
      nullable: true,
    },
    cuadrilla_nombre: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    encargado: {
      type: "varchar",
      length: 255,
      nullable: true,
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
  },
  relations: {
    despacho: {
      target: "Despacho",
      type: "many-to-one",
      joinColumn: { name: "despacho_id" },
      nullable: true,
    },
  },
});
