import { EntitySchema } from "typeorm";

export const Producto = new EntitySchema({
  name: "Producto",
  tableName: "productos",
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
    unidad_medida: {
      type: "varchar",
      length: 50,
      nullable: false,
      comment: "Ejemplo: kg, unidad, litro, caja",
    },
    stock_actual: {
      type: "int",
      default: 0,
      nullable: false,
    },
    stock_minimo: {
      type: "int",
      default: 0,
      nullable: false,
    },
    activo: {
      type: "boolean",
      default: true,
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
