import { EntitySchema } from "typeorm";

export const RecepcionEntrega = new EntitySchema({
  name: "RecepcionEntrega",
  tableName: "recepciones_entregas",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    orden_despacho_id: {
      type: "int",
      nullable: false,
      comment: "Referencia a la orden de despacho",
    },
    solicitud_id: {
      type: "int",
      nullable: false,
      comment: "Referencia a la solicitud original",
    },
    recibido_por: {
      type: "varchar",
      length: 255,
      nullable: false,
      comment: "Jefe de Cuadrilla o responsable que confirma",
    },
    fecha_recepcion: {
      type: "timestamp",
      nullable: false,
    },
    estado_general: {
      type: "varchar",
      length: 50,
      default: "conforme",
      comment: "conforme, con_observaciones, rechazada",
    },
    observaciones_generales: {
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

export const RecepcionEntregaItem = new EntitySchema({
  name: "RecepcionEntregaItem",
  tableName: "recepcion_entrega_items",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    recepcion_id: {
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
    cantidad_esperada: {
      type: "int",
      nullable: false,
    },
    cantidad_recibida: {
      type: "int",
      nullable: false,
    },
    estado_producto: {
      type: "varchar",
      length: 50,
      default: "bueno",
      comment: "bueno, dañado, faltante",
    },
    observaciones: {
      type: "text",
      nullable: true,
      comment: "Detalle de faltantes, daños o inconsistencias",
    },
  },
});
