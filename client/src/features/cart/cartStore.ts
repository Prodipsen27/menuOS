import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  increaseQty: (id: string) => void;
  decreaseQty: (id: string) => void;
  getTotal: () => number;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  openCart: () => void;
  setOpenCart: (fn: () => void) => void;
  tableNumber: string | null;
  setTableNumber: (table: string | null) => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      openCart: () => {},
      tableNumber: null,

      setTableNumber: (tableNumber) => set({ tableNumber }),

      clearCart: () => set({ items: [] }),
      setItems: (items) => set({ items }),

      addToCart: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }

          return {
            items: [...state.items, { ...item, quantity: 1 }],
          };
        }),

      removeFromCart: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      increaseQty: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        })),

      decreaseQty: (id) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.id === id
                ? { ...item, quantity: item.quantity - 1 }
                : item
            )
            .filter((item) => item.quantity > 0),
        })),

      getTotal: () => {
        const items = get().items;
        return items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      setOpenCart: (fn) =>
        set(() => ({
          openCart: fn,
        })),
    }),
    { 
      name: "cart-storage",
      // Important to skip openCart as it's a function reference that shouldn't persist
      partialize: (state) => ({
        items: state.items,
        tableNumber: state.tableNumber,
      }),
    }
  )
);