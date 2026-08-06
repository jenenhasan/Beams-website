'use client';

import { motion, Variants } from 'framer-motion';
import { MenuItem as MenuItemType } from '@/lib/types';
import { useState } from 'react';

interface AnimatedItemProps {
  item: MenuItemType;
  quantity: number;
  onAdd: (item: MenuItemType) => void;
  onRemove: (itemId: string) => void;
  index: number;
}

export function AnimatedItem({ item, quantity, onAdd, onRemove, index }: AnimatedItemProps) {
  const [imageError, setImageError] = useState(false);
  
  const itemVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const stepperVariants: Variants = {
    idle: { scale: 1 },
    tap: { scale: 0.9 }
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ 
        backgroundColor: 'rgba(31, 41, 251, 0.05)',
        transition: { duration: 0.2 }
      }}
      style={{
        display: 'flex',
        gap: '16px',
        padding: '22px 16px',
        borderRadius: '12px',
        borderBottom: '1px solid var(--grid-line)',
        transition: 'background-color 0.2s ease'
      }}
    >
      {/* Image Thumbnail - FIXED to show images */}
      <motion.div
        whileHover={{ scale: 1.05, rotate: -5 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        style={{
          width: '68px',
          height: '68px',
          borderRadius: '16px',
          background: 'var(--lav)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        {item.image && !imageError ? (
          <img
            src={item.image}
            alt={item.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
            onError={() => setImageError(true)}
          />
        ) : (
          // Fallback SVG if no image URL or image fails to load
          <svg viewBox="0 0 24 24" style={{ width: '32px', height: '32px', stroke: 'var(--blue)', fill: 'none', strokeWidth: 1.6 }}>
            <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/>
            <line x1="6" y1="2" x2="6" y2="4"/>
            <line x1="10" y1="2" x2="10" y2="4"/>
            <line x1="14" y1="2" x2="14" y2="4"/>
          </svg>
        )}
      </motion.div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <motion.span
              whileHover={{ color: 'var(--blue)' }}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: '15px',
                color: 'var(--ink)',
                transition: 'color 0.2s ease'
              }}
            >
              {item.name}
            </motion.span>
            {item.favorite && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                style={{ color: 'var(--orange)', fontSize: '13px' }}
              >
                ★
              </motion.span>
            )}
          </div>
          <motion.span
            whileHover={{ scale: 1.05 }}
            style={{
              fontFamily: 'Space Mono, monospace',
              fontWeight: 700,
              fontSize: '15px',
              color: 'var(--blue)',
              whiteSpace: 'nowrap'
            }}
          >
            ${item.price}
          </motion.span>
        </div>

        <motion.div
          initial={{ opacity: 0.7 }}
          whileHover={{ opacity: 1 }}
          style={{
            fontSize: '12.5px',
            color: '#726f8a',
            lineHeight: 1.5,
            marginTop: '4px',
            maxWidth: '420px',
            transition: 'opacity 0.2s ease'
          }}
        >
          {item.desc}
        </motion.div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          marginTop: '12px'
        }}>
          <motion.button
            variants={stepperVariants}
            initial="idle"
            whileTap="tap"
            onClick={() => onRemove(item.id)}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              border: '1.5px solid var(--grid-line)',
              background: 'var(--white)',
              color: 'var(--ink)',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              transition: 'all 0.15s ease'
            }}
            whileHover={{ 
              borderColor: 'var(--blue)',
              color: 'var(--blue)',
              scale: 1.1
            }}
          >
            –
          </motion.button>

          <motion.span
            key={quantity}
            initial={{ scale: 1.2, color: 'var(--blue)' }}
            animate={{ scale: 1, color: 'var(--ink)' }}
            transition={{ duration: 0.2 }}
            style={{
              fontFamily: 'Space Mono, monospace',
              fontWeight: 700,
              fontSize: '13px',
              minWidth: '14px',
              textAlign: 'center'
            }}
          >
            {quantity}
          </motion.span>

          <motion.button
            variants={stepperVariants}
            initial="idle"
            whileTap="tap"
            onClick={() => onAdd(item)}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              border: '1.5px solid var(--grid-line)',
              background: 'var(--white)',
              color: 'var(--ink)',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              transition: 'all 0.15s ease'
            }}
            whileHover={{ 
              borderColor: 'var(--orange)',
              color: 'var(--orange)',
              scale: 1.1,
              backgroundColor: 'rgba(255, 107, 0, 0.1)'
            }}
          >
            +
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}