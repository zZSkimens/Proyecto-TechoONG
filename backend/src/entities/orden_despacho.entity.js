import { EntitySchema } from "typeorm";

export const OrdenDespacho = new EntitySchema({
  name: "OrdenDespacho",
  tableName: "ordenes_despacho",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    solicitud_id: {
      type: "int",
      nullable: false,
      comment: "Referencia a la solicitud aprobada",
    },
    despachado_por: {
      type: "varchar",
      length: 255,
      nullable: true,
      comment: "Nombre del personal de bodega que despacha",
    },
    estado: {
      type: "varchar",
      length: 50,
      default: "pendiente",
      comment: "pendiente, preparando, despachada",
    },
    fecha_despacho: {
      type: "timestamp",
      nullable: true,
    },
    observaciones: {
      type: "text",
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
});

// Items despachados
export const OrdenDespachoItem = new EntitySchema({
  name: "OrdenDespachoItem",
  tableName: "orden_despacho_items",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    orden_id: {
      type: "int",
      nullable: false,
    },
    producto_id: {
      type: "int",
      nullable: false,
    },
    nombre_producto: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    cantidad_despachada: {
      type: "int",
      nullable: false,
    },
    unidad_medida: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
  },
});
