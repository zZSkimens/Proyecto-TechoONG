import { EntitySchema } from "typeorm";

export const SolicitudAlimento = new EntitySchema({
  name: "SolicitudAlimento",
  tableName: "solicitudes_alimentos",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    solicitante_id: {
      type: "int",
      nullable: false,
      comment: "ID del Jefe de Cuadrilla que solicita",
    },
    nombre_solicitante: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    fecha_entrega: {
      type: "date",
      nullable: false,
      comment: "Fecha esperada de entrega",
    },
    destino: {
      type: "varchar",
      length: 255,
      nullable: false,
      comment: "Lugar de destino (jornada o actividad)",
    },
    actividad: {
      type: "varchar",
      length: 255,
      nullable: false,
      comment: "Nombre de la jornada o actividad específica",
    },
    responsable_recepcion: {
      type: "varchar",
      length: 255,
      nullable: false,
      comment: "Persona encargada de recibir los alimentos",
    },
    estado: {
      type: "varchar",
      length: 50,
      default: "pendiente",
      comment: "pendiente, aprobada, rechazada, despachada, entregada",
    },
    observaciones: {
      type: "text",
      nullable: true,
    },
    motivo_rechazo: {
      type: "text",
      nullable: true,
    },
    aprobado_por: {
      type: "int",
      nullable: true,
      comment: "ID del Encargado de Alimentación que aprobó",
    },
    fecha_aprobacion: {
      type: "timestamp",
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

// Items individuales de cada solicitud
export const SolicitudAlimentoItem = new EntitySchema({
  name: "SolicitudAlimentoItem",
  tableName: "solicitud_alimento_items",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    solicitud_id: {
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
    cantidad_solicitada: {
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
