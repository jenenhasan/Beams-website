'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import MenuEditor from '@/components/MenuEditor';
import { MenuData } from '@/lib/types';
import { menuApi } from '@/lib/api';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsAuthenticated(true);
      fetchMenu();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await menuApi.getMenu();
      setMenuData(response.data);
    } catch (error) {
      console.error('Failed to fetch menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMenu = async (data: MenuData) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        alert('Please login again');
        router.push('/login');
        return;
      }

      const result = await menuApi.updateMenu(data, token);
      setMenuData(result.data);
      alert('✅ Menu saved successfully!');
    } catch (error: any) {
      console.error('❌ Failed to save menu:', error);
      if (error.message?.includes('401')) {
        localStorage.removeItem('admin_token');
        alert('Session expired. Please login again.');
        router.push('/login');
      } else {
        alert(`❌ Failed to save menu: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    router.push('/');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--cream)',
        fontFamily: 'Space Mono, monospace',
        color: 'var(--blue)'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--cream)',
          backgroundImage: 'linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          gap: '20px',
          padding: '20px'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            maxWidth: '400px',
            width: '100%',
            background: 'var(--white)',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            textAlign: 'center'
          }}
        >
          <h1 style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: '32px',
            color: 'var(--blue)',
            marginBottom: '8px'
          }}>
            BEAMS
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            color: '#6b6884',
            marginBottom: '24px'
          }}>
            Admin Access Required
          </p>
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--blue)',
                color: 'white',
                border: 'none',
                borderRadius: '999px',
                cursor: 'pointer',
                fontFamily: 'Space Mono, monospace',
                fontSize: '14px',
                fontWeight: 700
              }}
            >
              Login
            </motion.button>
          </Link>
          <Link href="/" style={{
            display: 'block',
            marginTop: '16px',
            fontFamily: 'Space Mono, monospace',
            fontSize: '12px',
            color: 'var(--blue)',
            textDecoration: 'none'
          }}>
            ← Back to Menu
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        minHeight: '100vh',
        background: 'var(--cream)',
        backgroundImage: 'linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        padding: '40px 20px'
      }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px'
          }}
        >
          <div>
            <h1 style={{
              fontFamily: 'Anton, sans-serif',
              color: 'var(--blue)',
              fontSize: '36px',
              letterSpacing: '1px'
            }}>
              BEAMS Admin
            </h1>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              color: '#6b6884',
              fontSize: '14px'
            }}>
              Manage your menu and cafe settings
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '8px 20px',
                  background: 'transparent',
                  color: 'var(--blue)',
                  border: '1px solid var(--blue)',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  fontFamily: 'Space Mono, monospace',
                  fontSize: '12px'
                }}
              >
                View Menu
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              style={{
                padding: '8px 20px',
                background: 'var(--blue-deep)',
                color: 'white',
                border: 'none',
                borderRadius: '999px',
                cursor: 'pointer',
                fontFamily: 'Space Mono, monospace',
                fontSize: '12px'
              }}
            >
              Logout
            </motion.button>
          </div>
        </motion.div>

        {menuData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <MenuEditor 
              data={menuData} 
              onSave={handleSaveMenu}
              isSaving={isSaving}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}