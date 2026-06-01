import { EntitySchema } from "typeorm";

export const Perfil = new EntitySchema({
  name: "Perfil",
  tableName: "perfiles",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    user_id: {
      type: "int",
      unique: true,
      nullable: false,
    },
    nombre_completo: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    telefono: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
    rol: {
      type: "varchar",
      length: 50,
      nullable: false,
      default: "postulante",
    },
    informacion_profesional: {
      type: "text",
      nullable: true,
    },
    informacion_academica: {
      type: "text",
      nullable: true,
    },
    competencias: {
      type: "json",
      nullable: true,
    },
    certificaciones: {
      type: "json",
      nullable: true,
    },
    estado: {
      type: "varchar",
      length: 50,
      nullable: false,
      default: "registrado",
    },
    zona_asignada: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    creado_en: {
      type: "timestamp",
      createDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
    actualizado_en: {
      type: "timestamp",
      updateDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    user: {
      target: "User",
      type: "one-to-one",
      joinColumn: { name: "user_id" },
      onDelete: "CASCADE",
    },
    perfilCapacitaciones: {
      target: "PerfilCapacitacion",
      type: "one-to-many",
      inverseSide: "perfil",
    },
  },
});
