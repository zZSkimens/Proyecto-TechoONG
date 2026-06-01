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
<<<<<<< HEAD:backend/src/entities/cuadrilla.entity.js
    name: {
      type: "varchar",
      length: 255,
      nullable: false,
      unique: true,
    },
    encargado: {
=======
    nombre: {
>>>>>>> angelo:src/entities/cuadrilla.entity.js
      type: "varchar",
      length: 255,
      nullable: false,
    },
<<<<<<< HEAD:backend/src/entities/cuadrilla.entity.js
    zona_afectada: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    voluntarios: {
      type: "simple-array",
      nullable: true,
    },
    modo_emergencia: {
      type: "boolean",
      default: false,
    },
    max_voluntarios: {
      type: "int",
      default: 6,
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
=======

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
>>>>>>> angelo:src/entities/cuadrilla.entity.js
    },
  },
});
