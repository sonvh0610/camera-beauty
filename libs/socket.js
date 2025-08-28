const { Server } = require("socket.io");

let io = global.io;

const initSocketIO = (httpServer) => {
  if (!io) {
    console.log("✨ Initializing Socket.IO server...");
    io = new Server(httpServer, {
      // Cấu hình CORS nếu cần
      // cors: {
      //   origin: "*",
      // },
    });
    global.io = io;

    io.on("connection", (socket) => {
      console.log(`✅ Client connected: ${socket.id}`);
      socket.on("disconnect", () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
      });
    });
  }
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initSocketIO, getIO };
