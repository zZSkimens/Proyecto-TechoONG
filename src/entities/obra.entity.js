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
    ubicacion: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    estado: {
      type: "varchar",
      length: 50,
      default: "pendiente", // pendiente, en_curso, finalizada
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
  relations: {
    habilidadesRequeridas: {
      target: "Habilidad",
      type: "many-to-many",
      joinTable: {
        name: "obra_habilidades",
        joinColumn: {
          name: "obra_id",
          referencedColumnName: "id",
        },
        inverseJoinColumn: {
          name: "habilidad_id",
          referencedColumnName: "id",
        },
      },
      cascade: true,
    },
  },
});
