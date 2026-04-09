import express from "express";
import cors from "cors";
import orderRoutes from "./routes/orderRoutes.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

app.use(errorHandler);
// routes
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);


// health check
app.get("/", (req, res) => {
  res.send("API running...");
});

export default app;