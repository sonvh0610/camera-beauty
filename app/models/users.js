import { sequelize } from "@/app/libs/sequelize";
import { DataTypes } from "sequelize";

export const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    imagePath: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Đường dẫn tới file ảnh gốc của người dùng.",
    },
    faceIds: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Lưu trữ một danh sách các ID của khuôn mặt đã nhận dạng.",
    },
  },
  {
    tableName: "users",
    timestamps: true,
  },
);
