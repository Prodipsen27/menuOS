import "dotenv/config";
import app from "./app.js";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

// Connect to DB (Vercel will call this on each cold start)
connectDB();

const server = http.createServer(app);

// 🔥 SOCKET SERVER (Note: This will not work effectively on Vercel)
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

// Conditionally listen (Only if NOT running on Vercel)
if (process.env.NODE_ENV !== "production") {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

app.get("/keep-alive", (req, res) => {
  res.send("Keep Alive");
});

setInterval(() => {
  fetch(process.env.BACK_URL)
  .then(() => console.log("Keep Alive"))
  .catch((err) => console.log(err));
}, 1000 * 60 * 14);


// Export the server for Vercel
export default server;
