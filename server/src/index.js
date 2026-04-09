import "dotenv/config";
import app from "./app.js";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("join_order", (orderId) => {
    socket.join(orderId);
  });
});

// FIX: Always listen if on Render, or use a specific Vercel check
if (!process.env.VERCEL) { 
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Keep-alive route
app.get("/keep-alive", (req, res) => {
  res.send("Keep Alive");
});

// Self-ping every 14 minutes
setInterval(() => {
  const url = process.env.BACK_URL;
  if (url) {
    fetch(url)
      .then(() => console.log("Self-ping successful: Keep Alive"))
      .catch((err) => console.log("Self-ping failed:", err.message));
  }
}, 1000 * 60 * 14);

export default server;
