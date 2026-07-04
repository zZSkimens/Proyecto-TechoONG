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
    name: {
      type: "varchar",
      length: 255,
      nullable: false,
      unique: true,
    },
    encargado: {
      type: "varchar",
      length: 255,
      nullable: true,
      default: "",
    },
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
    fecha: {
      type: "date",
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
    }
  },
  relations: {
    obra: {
      target: "Obra",
      type: "many-to-one",
      joinColumn: { name: "obra_id" },
      nullable: true,
      eager: true,
    },
  },
});
