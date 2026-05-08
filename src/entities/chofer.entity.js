import { EntitySchema } from "typeorm";

export const Chofer = new EntitySchema({
  name: "Chofer",
  tableName: "choferes",
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
    telefono: {
      type: "varchar",
      length: 20,
      nullable: true,
    },
    licencia_conducir: {
      type: "varchar",
      length: 50,
      nullable: true,
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
});
