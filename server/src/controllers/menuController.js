import { Menu } from "../models/menuModel.js";

export const getMenuItems = async (req, res) => {
  const items = await Menu.find().sort({ category: 1, name: 1 });
  res.json(items);
};

export const createMenuItem = async (req, res) => {
  const newItem = new Menu(req.body);
  await newItem.save();
  const io = req.app.get("io");
  io.emit("menu:update");
  res.status(201).json(newItem);
};

export const updateMenuItem = async (req, res) => {
  const updatedItem = await Menu.findByIdAndUpdate(
    req.params.id, 
    req.body, 
    { new: true }
  );
  const io = req.app.get("io");
  io.emit("menu:update");
  res.json(updatedItem);
};

export const deleteMenuItem = async (req, res) => {
  await Menu.findByIdAndDelete(req.params.id);
  const io = req.app.get("io");
  io.emit("menu:update");
  res.json({ message: "Item deleted" });
};

export const toggleAvailability = async (req, res) => {
  const item = await Menu.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  
  item.isAvailable = !item.isAvailable;
  await item.save();
  const io = req.app.get("io");
  io.emit("menu:update");
  res.json(item);
};

export const getMenuItem = async (req, res) => {
  try {
    const item = await Menu.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: "Invalid ID format or error fetching item" });
  }
};
