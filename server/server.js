// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import { createServer } from 'http';
// import { Server } from 'socket.io';

// dotenv.config();

// const app = express();
// const httpServer = createServer(app);
// const io = new Server(httpServer, {
//   cors: {
//     origin: "*", // Adjust for production
//     methods: ["GET", "POST"]
//   }
// });

// const PORT = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());

// // Basic health check
// app.get('/health', (req, res) => {
//   res.json({ status: 'Aura Server is online', timestamp: new Date() });
// });

// // Live Order Event Handling
// io.on('connection', (socket) => {
//   console.log('Client connected:', socket.id);

//   socket.on('new-order', (order) => {
//     console.log('New Order Received:', order);
//     // Broadcast to admins
//     io.emit('order-notification', {
//       title: `New Order • Table ${order.table}`,
//       msg: order.itemsSummary || 'View details in dashboard'
//     });
//   });

//   socket.on('disconnect', () => {
//     console.log('Client disconnected');
//   });
// });

// httpServer.listen(PORT, () => {
//   console.log(`
//   ✨ Aura Digital Menu Server
//   🚀 Listening on http://localhost:${PORT}
//   📡 WebSocket initialized
//   `);
// });
