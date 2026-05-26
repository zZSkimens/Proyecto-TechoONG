import { EntitySchema } from "typeorm";

export const MovimientoInventario = new EntitySchema({
  name: "MovimientoInventario",
  tableName: "movimientos_inventario",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    producto_id: {
      type: "int",
      nullable: false,
    },
    tipo: {
      type: "varchar",
      length: 50,
      nullable: false,
      comment: "entrada, salida, ajuste",
    },
    cantidad: {
      type: "int",
      nullable: false,
    },
    stock_anterior: {
      type: "int",
      nullable: false,
    },
    stock_posterior: {
      type: "int",
      nullable: false,
    },
    referencia_tipo: {
      type: "varchar",
      length: 100,
      nullable: true,
      comment: "solicitud, despacho, ajuste_manual",
    },
    referencia_id: {
      type: "int",
      nullable: true,
      comment: "ID de la solicitud, orden de despacho, etc.",
    },
    descripcion: {
      type: "text",
      nullable: true,
    },
    realizado_por: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    created_at: {
      type: "timestamp",
      createDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
});
