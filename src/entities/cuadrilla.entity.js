import { EntitySchema } from "typeorm";

export const Cuadrilla = new EntitySchema({
  name: "Cuadrilla",
  tableName: "cuadrillas",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    name: {
      type: "varchar",
      length: 255,
      nullable: false,
      unique: true,
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
});
