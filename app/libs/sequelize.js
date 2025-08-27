import { Sequelize } from "sequelize";

const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbDialect = "mysql";

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: dbDialect,
  dialectModule: require("mysql2"),
});

// Hàm để kiểm tra kết nối
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Kết nối database thành công.");
  } catch (error) {
    console.error("Không thể kết nối tới database:", error);
  }
}

testConnection();
