import { EntitySchema } from "typeorm";

//Creacion de nueva entidad para manejar su estado
export const ActaDevolucionItem = new EntitySchema({
  name: "ActaDevolucionItem",
  tableName: "acta_devolucion_items",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    estado: {
      type: "enum",
      enum: ["Disponible", "Dañada", "Extraviada"],
      nullable: false,
    },
    cantidad: {
      type: "int",
      nullable: false,
    },
  },
  relations: {
    acta_devolucion: {
      target: "ActaDevolucion",
      type: "many-to-one",
      joinColumn: { name: "acta_devolucion_id" },
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
