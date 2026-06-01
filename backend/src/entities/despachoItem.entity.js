import { EntitySchema } from "typeorm";

export const DespachoItem = new EntitySchema({
  name: "DespachoItem",
  tableName: "despacho_items",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    cantidad: {
      type: "int",
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
  },
  relations: {
    despacho: {
      target: "Despacho",
      type: "many-to-one",
      joinColumn: { name: "despacho_id" },
      nullable: false,
    },
    item: {
      target: "Item",
      type: "many-to-one",
      joinColumn: { name: "item_id" },
      nullable: false,
    },
  },
});
