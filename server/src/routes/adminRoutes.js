import express from "express";
import {
  getAllOrders,
  adminUpdateOrderStatus,
  deleteOrder,
  getDashboardStats,
  getAnalyticsData,
  getSettings,
  updateSettings,
  getNotifications,
  markNotificationAsRead,
} from "../controllers/adminController.js";
import { protectAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/orders", protectAdmin, getAllOrders);
router.patch("/orders/:id/status", protectAdmin, adminUpdateOrderStatus);
router.delete("/orders/:id", protectAdmin, deleteOrder);
router.get("/stats", protectAdmin, getDashboardStats);
router.get("/analytics", protectAdmin, getAnalyticsData);
router.get("/settings", getSettings);
router.patch("/settings", protectAdmin, updateSettings);
router.get("/notifications", protectAdmin, getNotifications);
router.patch("/notifications/:id/read", protectAdmin, markNotificationAsRead);

export default router;