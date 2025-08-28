import { DataTypes } from "sequelize";
import { sequelize } from "@/libs/sequelize";

export const TicketImage = sequelize.define(
  "TicketImage",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    ticketId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    imageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "ticket_images",
    timestamps: false,
  },
);
