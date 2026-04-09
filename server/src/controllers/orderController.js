import { createOrderService, getAllOrdersService, getOrderService, updateOrderStatusService } from "../services/orderService.js";
import { io } from "../index.js";
import { Notification } from "../models/notificationModel.js";

export const createOrder = async (req, res) => {
  const { name, items, total, table } = req.body;

  if (!name || !items || items.length === 0 || !total) {
    return res.status(400).json({ message: "Invalid order data" });
  }

  const order = await createOrderService({ name, items, total, table });

  // 🔥 Create Notification
  await Notification.create({
    title: "New Order Arrived",
    message: `Table ${table} just placed an order for ${items.length} items.`,
    type: "order",
    metadata: {
      orderId: order._id,
      table: table
    }
  });

  // 🔥 Notify Admins (Global)
  const orderJSON = order.toJSON();
  io.emit("orders:new", orderJSON);
  io.emit("notifications:new", { message: "Refresh notifications" }); // Hint to refresh

  res.status(201).json(orderJSON);
};

export const getOrders = async (req, res) => {
  const orders = await getAllOrdersService();
  res.json(orders);
};

export const getOrder = async (req, res) => {
  const order = await getOrderService(req.params.id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.json(order);
};

export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  const order = await updateOrderStatusService(
    req.params.id,
    status
  );

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  // ✅ Notify Guest (Specific Room)
  const orderJSON = order.toJSON();
  io.to(order._id ? order._id.toString() : order.id).emit("orders:status_update", orderJSON);
  
  // ✅ Notify Admins (Global broadcast for dashboard sync)
  io.emit("orders:status_update", orderJSON);

  res.json(orderJSON);
};