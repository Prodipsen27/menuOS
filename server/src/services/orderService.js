import mongoose from "mongoose";
import { Order } from "../models/orderModel.js";
import { Customer } from "../models/customerModel.js";
import { io } from "../index.js";

export const createOrderService = async ({ items, total, name, table, phone, email }) => {
  const order = await Order.create({
    name,
    phone,
    items,
    total,
    table,
  });

  // ✅ Populate Customer Details
  if (phone) {
    await Customer.findOneAndUpdate(
      { number: phone },
      { 
        $set: { name, email }, // Update name/email in case they changed
        $push: { 
          orders: {
            orderId: order._id,
            total: order.total,
            items: order.items.map(item => ({
              name: item.name,
              price: item.price,
              quantity: item.quantity
            }))
          } 
        },
        $setOnInsert: { createdAt: new Date() },
        lastOrderAt: new Date()
      },
      { upsert: true, new: true }
    );
  }

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

export const cancelOrderService = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const order = await Order.findById(id);
  if (!order) return null;

  if (order.status !== "received") {
    throw new Error("Order cannot be canceled once it's preparing or served.");
  }

  // Enforce 40 second window
  const ellapsedSeconds = (Date.now() - new Date(order.createdAt).getTime()) / 1000;
  if (ellapsedSeconds > 40) {
    throw new Error("Cancellation window (40s) has expired.");
  }

  order.status = "canceled";
  await order.save();
  return order;
};