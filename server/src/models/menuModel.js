import mongoose from "mongoose";

const menuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ["cocktails", "mains", "desserts", "starters"]
  },
  image: { type: String },
  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
}, { 
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

export const Menu = mongoose.model("Menu", menuSchema);
