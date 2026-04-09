import express from "express";
import { createOrder, getOrder, getOrders, updateOrderStatus, cancelOrder } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:id", getOrder);

router.patch("/:id/status", updateOrderStatus);
router.post("/:id/cancel", cancelOrder);

export default router;