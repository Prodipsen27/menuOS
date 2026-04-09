import mongoose from "mongoose";
import { Order } from "../models/orderModel.js";
import { io } from "../index.js";

export const createOrderService = async ({ items, total, name, table }) => {
  const order = await Order.create({
    name,
    items,
    total,
    table,
  });

  return order;
};

export const getOrderService = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return await Order.findById(id);
};

export const updateOrderStatusService = async (id, status) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const order = await Order.findById(id);

  if (!order) return null;

  order.status = status;
  await order.save();

  io.to(order._id.toString()).emit("orders:status_update", order);

  return order;
};

export const getAllOrdersService = async () => {
  return await Order.find();
};