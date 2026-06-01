import { EntitySchema } from "typeorm";

export const HistorialEstado = new EntitySchema({
  name: "HistorialEstado",
  tableName: "historial_estados",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    perfil_id: {
      type: "int",
      nullable: false,
    },
    estado_anterior: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
    estado_nuevo: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    cambiado_por_id: {
      type: "int",
      nullable: false,
    },
    comentario: {
      type: "text",
      nullable: true,
    },
    creado_en: {
      type: "timestamp",
      createDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    perfil: {
      target: "Perfil",
      type: "many-to-one",
      joinColumn: { name: "perfil_id" },
      onDelete: "CASCADE",
    },
    cambiadoPor: {
      target: "User",
      type: "many-to-one",
      joinColumn: { name: "cambiado_por_id" },
      onDelete: "CASCADE",
    },
  },
});
