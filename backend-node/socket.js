const { Server } = require("socket.io");
const cors = require("cors");
let io;
module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: { origin: "*", methods: ["GET", "POST", "DELETE"] },
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket io is not intialized");
    }
    return io;
  },
};
