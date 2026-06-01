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
    password: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    disponible: {
      type: "boolean",
      default: true,
    },

  },
  relations: {
    cuadrillas: {
      target: "Cuadrilla",
      type: "many-to-many",
      joinTable: {
        name: "cuadrilla_voluntarios",
        joinColumn: {
          name: "voluntario_id",
          referencedColumnName: "id",
        },
        inverseJoinColumn: {
          name: "cuadrilla_id",
          referencedColumnName: "id",
        },
      },
    },
  },
});
