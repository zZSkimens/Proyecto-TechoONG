import { EntitySchema } from "typeorm";

//Entidad para manejar los items individuales de un acta de devolucion
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
      enum: ["Pendiente", "Disponible", "Dañada", "Extraviada"],
      default: "Pendiente",
      nullable: false,
    },
    cantidad: {
      type: "int",
      nullable: false,
    },
    categoria: {
      type: "varchar",
      length: 50,
      nullable: true,
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
