import { createContext, useContext, useState, type ReactNode } from 'react';

export type Item = { id: string; title: string; done: boolean };

type ItemsContextValue = {
  items: Item[];
  addItem: (title: string) => void;
  toggleItem: (id: string) => void;
  removeItem: (id: string) => void;
};

const ItemsContext = createContext<ItemsContextValue | null>(null);

export function ItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);

  const addItem = (title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setItems((prev) => [
      { id: Date.now().toString(), title: trimmed, done: false },
      ...prev,
    ]);
  };

  const toggleItem = (id: string) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i))
    );

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  return (
    <ItemsContext.Provider value={{ items, addItem, toggleItem, removeItem }}>
      {children}
    </ItemsContext.Provider>
  );
}

export function useItems() {
  const ctx = useContext(ItemsContext);
  if (!ctx) throw new Error('useItems must be used inside ItemsProvider');
  return ctx;
}