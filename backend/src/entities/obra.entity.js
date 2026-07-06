import { EntitySchema } from "typeorm";

export const Obra = new EntitySchema({
  name: "Obra",
  tableName: "obras",
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
    zona: {
      type: "varchar",
      length: 255,
      nullable: true,
      default: "Sin asignar",
    },
    competencias_requeridas: {
      type: "json",
      nullable: true,
    },
    certificaciones_requeridas: {
      type: "json",
      nullable: true,
    },
    estado: {
      type: "varchar",
      length: 50,
      nullable: false,
      default: "planificada",
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
});
