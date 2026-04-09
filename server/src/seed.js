import mongoose from "mongoose";
import dotenv from "dotenv";
import { Menu } from "./models/menuModel.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from one level up from src/
dotenv.config({ path: path.join(__dirname, "../.env") });

const menuData = [
  {
    name: "Truffle Salmon Bowl",
    description: "Miso glaze, black truffle oil",
    price: 34.00,
    image: "/images/salmon_bowl.png",
    category: "mains",
    isAvailable: true,
    isFeatured: true,
  },
  {
    name: "Burrata & Heirloom",
    description: "Basil emulsion, aged balsamic caviar",
    price: 22.00,
    image: "/images/burrata_heirloom.png",
    category: "starters",
    isAvailable: true,
    isFeatured: false
  },
  {
    name: "Aura Espresso Martini",
    description: "Small-batch vodka, cold brew",
    price: 18.00,
    image: "/images/espresso_martini.png",
    category: "cocktails",
    isAvailable: true,
    isFeatured: false
  },
  {
    name: "Wagyu Short Rib",
    description: "48-hour braise, parsnip purée",
    price: 42.00,
    image: "/images/wagyu_rib.png",
    category: "mains",
    isAvailable: true,
    isFeatured: false
  },
  {
    name: "Golden Saffron Risotto",
    description: "24k gold leaf, arborio pearls, carnaroli base",
    price: 38.00,
    image: "/images/saffron_risotto.png",
    category: "mains",
    isAvailable: true,
    isFeatured: true
  },
  {
    name: "Emerald Matcha Latte",
    description: "Ceremonial grade, oat foam, honey drizzle",
    price: 9.00,
    image: "/images/matcha_latte.png",
    category: "drinks",
    isAvailable: true,
    isFeatured: false
  },
  {
    name: "Obsidian Burger",
    description: "Activated charcoal bun, black garlic alioli",
    price: 26.00,
    image: "/images/obsidian_burger.png",
    category: "mains",
    isAvailable: true,
    isFeatured: false
  },
  {
    name: "Velvet Crimson Tart",
    description: "Hibiscus reduction, dark chocolate ganache",
    price: 15.00,
    image: "/images/crimson_tart.png",
    category: "desserts",
    isAvailable: true,
    isFeatured: false
  },
  {
    name: "Arctic Gin Fizz",
    description: "Elderflower, frozen botanicals, nitro-cloud",
    price: 21.00,
    image: "/images/gin_fizz.png",
    category: "cocktails",
    isAvailable: false,
    isFeatured: false
  },
  {
    name: "Midnight Lobster Tail",
    description: "Butter poached, squid ink hollandaise",
    price: 52.00,
    image: "/images/lobster_tail.png",
    category: "mains",
    isAvailable: true,
    isFeatured: true
  }
];

const seedDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env file");
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");
    
    for (const item of menuData) {
      await Menu.findOneAndUpdate(
        { name: item.name },
        item,
        { upsert: true, new: true }
      );
      console.log(`✅ Upserted: ${item.name}`);
    }
    
    console.log("🚀 Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding DB:", error.message);
    process.exit(1);
  }
};

seedDB();
