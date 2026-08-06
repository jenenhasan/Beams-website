'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MenuItem as MenuItemType } from '@/lib/types';

interface TodaysPicksProps {
  items: MenuItemType[];
  onViewAll: () => void;
  onAddToCart: (item: MenuItemType) => void;
}

export function TodaysPicks({ items, onViewAll, onAddToCart }: TodaysPicksProps) {
  // Show first 4 items as today's picks
  const picks = items.slice(0, 4);

  return (
    <section style={{
      marginBottom: '40px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{
          fontFamily: 'Caveat, cursive',
          fontSize: '32px',
          color: 'var(--blue)',
          fontWeight: 700
        }}>
          ☕ Today's Picks
        </h2>
        <button
          onClick={onViewAll}
          style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '12px',
            color: 'var(--blue)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: '4px 8px'
          }}
        >
          View all →
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px'
      }}>
        {picks.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            whileHover={{ 
              y: -4,
              boxShadow: '0 8px 30px rgba(31, 41, 251, 0.12)'
            }}
            style={{
              background: 'var(--white)',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'center',
              border: '1px solid var(--grid-line)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onClick={() => onAddToCart(item)}
          >
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '12px',
              background: 'var(--lav)',
              margin: '0 auto 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              fontSize: '32px'
            }}>
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.textContent = '☕';
                  }}
                />
              ) : (
                '☕'
              )}
            </div>
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              color: 'var(--ink)',
              marginBottom: '4px'
            }}>
              {item.name}
            </div>
            <div style={{
              fontFamily: 'Space Mono, monospace',
              fontWeight: 700,
              fontSize: '14px',
              color: 'var(--blue)'
            }}>
              ${item.price}
            </div>
            {item.favorite && (
              <div style={{
                color: 'var(--orange)',
                fontSize: '12px',
                marginTop: '4px'
              }}>
                ★ Popular
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}