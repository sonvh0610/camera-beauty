import { DataTypes } from "sequelize";
import { sequelize } from "@/libs/sequelize";

export const CameraImage = sequelize.define(
  "CameraImage",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    cameraId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imagePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    faceIds: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "images",
    timestamps: true,
  },
);
