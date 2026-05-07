import { EntitySchema } from "typeorm";

//Creacion de nueva entidad para manejar los items devueltos
export const ActaDevolucion = new EntitySchema({
  name: "ActaDevolucion",
  tableName: "acta_devolucion",
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
  },
  relations: {
    despacho: {
      target: "Despacho",
      type: "many-to-one",
      joinColumn: { name: "despacho_id" },
      nullable: false,
    },
  },
});
