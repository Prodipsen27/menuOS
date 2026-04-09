import { Order } from "../models/orderModel.js";
import { io } from "../index.js";
import { Settings } from "../models/settingsModel.js";

export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({}); // Create default if none
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch settings" });
  }
};

export const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to update settings" });
  }
};

export const getAllOrders = async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
};

export const adminUpdateOrderStatus = async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = status;
  await order.save();

  // 🔥 realtime update
  const orderJSON = order.toJSON();
  io.to(orderJSON.id).emit("orders:status_update", orderJSON);
  
  // also broadcast to admins for dashboard sync if multi-admin
  io.emit("orders:status_update", orderJSON);

  res.json(orderJSON);
};

export const deleteOrder = async (req, res) => {
  const { id } = req.params;
  await Order.findByIdAndDelete(id);
  res.json({ message: "Order deleted successfully", id });
};

export const getDashboardStats = async (req, res) => {
  try {
    const orders = await Order.find();
    
    // 1. Total Revenue
    const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);

    // 2. Active Tables
    const activeOrders = orders.filter(o => ["received", "preparing", "serving"].includes(o.status));
    const activeTables = [...new Set(activeOrders.map(o => o.table))].length;

    // 3. Orders Fulfilled
    const fulfilledOrders = orders.filter(o => ["serving", "archived"].includes(o.status)).length;

    // 4. Hourly Performance (last 24 hours)
    const last24Hours = Array.from({ length: 12 }, (_, i) => {
      const hour = new Date();
      hour.setHours(hour.getHours() - (11 - i), 0, 0, 0);
      return hour;
    });

    const hourlyData = last24Hours.map(hour => {
      const nextHour = new Date(hour);
      nextHour.setHours(hour.getHours() + 1);
      
      const hourRevenue = orders
        .filter(o => new Date(o.createdAt) >= hour && new Date(o.createdAt) < nextHour)
        .reduce((acc, o) => acc + o.total, 0);
        
      return {
        label: `${hour.getHours()}:00`,
        value: hourRevenue
      };
    });

    // 5. Recent Activity pulses
    const recentActivity = activeOrders.slice(0, 4).map(o => ({
      id: o.table,
      status: o.status === "received" ? "New Order" : (o.status === "preparing" ? "In Kitchen" : "Out for Service"),
      time: "Live",
      color: o.status === "received" ? "text-primary" : (o.status === "preparing" ? "text-secondary" : "text-emerald-500")
    }));

    res.json({
      totalRevenue,
      activeTables,
      fulfilledOrders,
      hourlyData,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

export const getAnalyticsData = async (req, res) => {
  try {
    const orders = await Order.find();
    
    // 1. Daily Revenue (Last 7 Days)
    const dailyRevenue = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    }).map(date => {
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      
      const dayTotal = orders
        .filter(o => new Date(o.createdAt) >= date && new Date(o.createdAt) < nextDay)
        .reduce((acc, o) => acc + o.total, 0);
        
      return {
        label: date.toLocaleDateString([], { weekday: 'short' }),
        value: dayTotal
      };
    });

    // 2. Popular Items
    const itemMap = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        itemMap[item.name] = (itemMap[item.name] || 0) + item.quantity;
      });
    });

    const topItems = Object.entries(itemMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 3. Category Distribution
    const categoryRev = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const cat = item.category || "Uncategorized";
        categoryRev[cat] = (categoryRev[cat] || 0) + (item.price * item.quantity);
      });
    });
    
    if (Object.keys(categoryRev).length === 0 && orders.length > 0) {
      categoryRev["General"] = orders.reduce((acc, o) => acc + o.total, 0);
    }

    const categoryDistribution = Object.entries(categoryRev).map(([name, value]) => ({ name, value }));

    res.json({
      dailyRevenue,
      topItems,
      categoryDistribution,
      totalOrders: orders.length,
      avgOrderValue: orders.length > 0 ? (orders.reduce((acc, o) => acc + o.total, 0) / orders.length) : 0
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};