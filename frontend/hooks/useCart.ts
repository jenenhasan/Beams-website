import { useState, useEffect } from 'react';
import { MenuItem, CartItem } from '@/lib/types';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setItems(parsed);
        updateTotal(parsed);
      } catch (e) {
        console.error('Failed to parse cart:', e);
      }
    }
  }, []);

  const updateTotal = (cartItems: CartItem[]) => {
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    setTotalItems(count);
  };

  const addItem = (menuItem: MenuItem) => {
    setItems(prev => {
      const existing = prev.find(item => item.menuItem.id === menuItem.id);
      let newItems;
      if (existing) {
        newItems = prev.map(item =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...prev, { menuItem, quantity: 1 }];
      }
      localStorage.setItem('cart', JSON.stringify(newItems));
      updateTotal(newItems);
      return newItems;
    });
  };

  const removeItem = (menuItemId: string) => {
    setItems(prev => {
      const newItems = prev
        .map(item =>
          item.menuItem.id === menuItemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0);
      localStorage.setItem('cart', JSON.stringify(newItems));
      updateTotal(newItems);
      return newItems;
    });
  };

  const clearCart = () => {
    setItems([]);
    setTotalItems(0);
    localStorage.removeItem('cart');
  };

  return { items, totalItems, addItem, removeItem, clearCart };
}