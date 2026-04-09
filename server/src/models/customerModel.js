import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    number: { type: String, required: true, unique: true },
    email: { type: String },
    orders: [
      {
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        total: { type: Number },
        items: [
          {
            name: { type: String },
            price: { type: Number },
            quantity: { type: Number }
          }
        ],
        orderedAt: { type: Date, default: Date.now }
      }
    ],
    lastOrderAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

customerSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

export const Customer = mongoose.model("Customer", customerSchema);
