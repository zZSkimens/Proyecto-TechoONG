import { EntitySchema } from "typeorm";

export const Reunion = new EntitySchema({
  name: "Reunion",
  tableName: "reuniones",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    voluntario_id: {
      type: "int",
      nullable: false,
    },
    nombre_postulante: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    tipo: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    fecha: {
      type: "timestamp",
      nullable: false,
    },
    modalidad: {
      type: "varchar",
      length: 50,
      nullable: false,
      default: "Online",
    },
    plataforma: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    lugar: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    estado: {
      type: "varchar",
      length: 50,
      nullable: false,
      default: "programada",
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
      joinColumn: { name: "voluntario_id" },
      onDelete: "CASCADE",
    }
  }
});
