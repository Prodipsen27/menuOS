import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  restaurantName: { type: String, default: "Aura Gastronomy" },
  cuisineStyle: { type: String, default: "Contemporary Fusion" },
  timezone: { type: String, default: "IST (Asia/Kolkata)" },
  currencySymbol: { type: String, default: "₹" },
  adminEmail: { type: String, default: "admin@aura.lux" },
}, { timestamps: true });

export const Settings = mongoose.model("Settings", settingsSchema);
