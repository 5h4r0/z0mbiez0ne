import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BasketItem {
  sessionId: number;
  activityTitle: string;
  date: string;
  unitPrice: number;
  quantity: number;
}

interface BasketStore {
  items: BasketItem[];
  addItem: (item: Omit<BasketItem, 'quantity'>) => void;
  removeItem: (sessionId: number) => void;
  updateQuantity: (sessionId: number, quantity: number) => void;
  clearBasket: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useBasketStore = create<BasketStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (incoming) =>
        set((state) => {
          const existing = state.items.find((i) => i.sessionId === incoming.sessionId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.sessionId === incoming.sessionId ? { ...i, quantity: i.quantity + 1 } : i,
              ),
            };
          }
          return { items: [...state.items, { ...incoming, quantity: 1 }] };
        }),

      removeItem: (sessionId) =>
        set((state) => ({ items: state.items.filter((i) => i.sessionId !== sessionId) })),

      updateQuantity: (sessionId, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (i.sessionId === sessionId ? { ...i, quantity } : i)),
        })),

      clearBasket: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    }),
    { name: 'zz-basket' },
  ),
);
