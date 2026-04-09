import "dotenv/config";
import app from "./app.js";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";

const PORT = 5000;

connectDB();


const server = http.createServer(app);

// 🔥 SOCKET SERVER
export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // 🔥 JOIN ROOM (order-specific)
  socket.on("join_order", (orderId) => {
    socket.join(orderId);
    console.log(`Socket ${socket.id} joined order ${orderId}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});