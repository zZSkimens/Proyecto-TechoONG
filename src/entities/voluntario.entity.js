import { EntitySchema } from "typeorm";

export const Voluntario = new EntitySchema({
  name: "Voluntario",
  tableName: "voluntarios",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    nombres: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    apellidos: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    rut: {
      type: "varchar",
      length: 20,
      unique: true,
      nullable: false,
    },
    correo: {
      type: "varchar",
      length: 255,
      unique: true,
      nullable: false,
    },
    disponible: {
      type: "boolean",
      default: true,
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
    habilidades: {
      target: "Habilidad",
      type: "many-to-many",
      joinTable: {
        name: "voluntario_habilidades",
        joinColumn: {
          name: "voluntario_id",
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
