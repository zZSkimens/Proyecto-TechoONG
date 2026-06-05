import { EntitySchema } from "typeorm";

export const Cuadrilla = new EntitySchema({
  name: "Cuadrilla",
  tableName: "cuadrillas",
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

  },
  relations: {
    sector: {
      target: "Sector",
      type: "many-to-one",
      joinColumn: {
        name: "sector_id",
        referencedColumnName: "id",
      },
      onDelete: "SET NULL",
    },
    voluntarios: {
      target: "Voluntario",
      type: "many-to-many",
      joinTable: {
        name: "cuadrilla_voluntarios",
        joinColumn: {
          name: "cuadrilla_id",
          referencedColumnName: "id",
        },
        inverseJoinColumn: {
          name: "voluntario_id",
          referencedColumnName: "id",
        },
      },
      cascade: true,
    },
  },
});
