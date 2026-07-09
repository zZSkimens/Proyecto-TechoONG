import { EntitySchema } from "typeorm";

export const PerfilCapacitacion = new EntitySchema({
  name: "PerfilCapacitacion",
  tableName: "perfil_capacitaciones",
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
    capacitacion_id: {
      type: "int",
      nullable: false,
    },
    estado: {
      type: "varchar",
      length: 50,
      nullable: false,
      default: "cursando", 
    },
    fecha_completacion: {
      type: "timestamp",
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
    perfil: {
      target: "Perfil",
      type: "many-to-one",
      joinColumn: { name: "perfil_id" },
      onDelete: "CASCADE",
    },
    capacitacion: {
      target: "Capacitacion",
      type: "many-to-one",
      joinColumn: { name: "capacitacion_id" },
      onDelete: "CASCADE",
    },
  },
});
