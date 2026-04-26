import { EntitySchema } from "typeorm";

export const Despacho = new EntitySchema({
  name: "Despacho",
  tableName: "despachos",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
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
    cuadrilla: {
      target: "Cuadrilla",
      type: "many-to-one",
      joinColumn: { name: "cuadrilla_id" },
      nullable: false,
    },
  },
});
