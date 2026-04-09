export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "Starters" | "Mains" | "Drinks" | "Desserts";
  isFeatured?: boolean;
}
