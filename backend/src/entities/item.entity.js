import { EntitySchema } from "typeorm";

export const Item = new EntitySchema({
  name: "Item",
  tableName: "items",
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
    },
    category: {
      type: "enum",
      enum: ["Herramienta", "Material"],
      nullable: false,
    },
    stock: {
      type: "int",
      default: 0,
      nullable: false,
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
    rol: {
      type: "varchar",
      length: 50,
      nullable: false,
      default: "user",
    },
  },
  relations: {
    perfil: {
      target: "Perfil",
      type: "one-to-one",
      inverseSide: "user",
    },
  },
});
