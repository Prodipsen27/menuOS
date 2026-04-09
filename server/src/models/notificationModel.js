import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["order", "payment", "system", "inventory"], 
    default: "order" 
  },
  isRead: { type: Boolean, default: false },
  metadata: {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    table: String
  }
}, { timestamps: true });

export const Notification = mongoose.model("Notification", notificationSchema);
