import { useState, useEffect } from 'react';
import { MenuData, MenuResponse } from '@/lib/types';
import { menuApi } from '@/lib/api';

export function useMenu() {
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMenu = async () => {
    setLoading(true);
    try {
      const response = await menuApi.getMenu();
      setMenu(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load menu');
      console.error('Error loading menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  return { menu, loading, error, refetch: loadMenu };
}