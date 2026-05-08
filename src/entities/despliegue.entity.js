import { EntitySchema } from "typeorm";

export const Despliegue = new EntitySchema({
  name: "Despliegue",
  tableName: "despliegues",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    ruta: {
      type: "text",
      nullable: true,
    },
    fecha_salida: {
      type: "timestamp",
      nullable: true,
    },
    estado: {
      type: "varchar",
      length: 50,
      default: "pendiente", // pendiente, en_camino, finalizado
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
    cuadrilla: {
      target: "Cuadrilla",
      type: "one-to-one",
      joinColumn: {
        name: "cuadrilla_id",
        referencedColumnName: "id",
      },
      onDelete: "CASCADE",
    },
    chofer: {
      target: "Chofer",
      type: "many-to-one",
      joinColumn: {
        name: "chofer_id",
        referencedColumnName: "id",
      },
      onDelete: "SET NULL",
    },
  },
});
