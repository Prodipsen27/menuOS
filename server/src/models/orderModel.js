import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, default: "" },
    items: [
      {
        id: String,
        name: String,
        quantity: Number,
        price: Number,
      },
    ],
    total: { type: Number, required: true },
    table: { type: String, default: "T1" },
    status: {
      type: String,
      enum: ["received", "preparing", "serving", "archived"],
      default: "received",
    },
  },
  { timestamps: true }
);

orderSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

orderSchema.set('toObject', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

export const Order = mongoose.model("Order", orderSchema);