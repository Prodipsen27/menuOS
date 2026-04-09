import express from "express";
import { 
  getMenuItems, 
  createMenuItem, 
  updateMenuItem, 
  deleteMenuItem,
  toggleAvailability,
  getMenuItem
} from "../controllers/menuController.js";
import { protectAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public: Get menu for guests
router.get("/", getMenuItems);
router.get("/:id", getMenuItem);

// Admin: Management
router.post("/", protectAdmin, createMenuItem);
router.patch("/:id", protectAdmin, updateMenuItem);
router.delete("/:id", protectAdmin, deleteMenuItem);
router.patch("/:id/toggle", protectAdmin, toggleAvailability);

export default router;
