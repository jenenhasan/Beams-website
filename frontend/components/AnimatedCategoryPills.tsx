'use client';

import { motion } from 'framer-motion';
import { Category } from '@/lib/types';

interface AnimatedCategoryPillsProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function AnimatedCategoryPills({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}: AnimatedCategoryPillsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        paddingBottom: '6px',
        marginBottom: '32px',
        scrollbarWidth: 'none',
        padding: '4px 0'
      }}
    >
      {categories.map((category, index) => (
        <motion.button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.3,
            delay: index * 0.05,
            ease: [0.22, 1, 0.36, 1]
          }}
          whileHover={{ 
            scale: 1.05,
            y: -2,
            boxShadow: activeCategory === category.id 
              ? '0 4px 15px rgba(31, 30, 251, 0.2)' 
              : '0 4px 15px rgba(0, 0, 0, 0.05)'
          }}
          whileTap={{ scale: 0.95 }}
          style={{
            flex: '0 0 auto',
            fontFamily: 'Space Mono, monospace',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: activeCategory === category.id ? 'var(--white)' : 'var(--ink)',
            background: activeCategory === category.id ? 'var(--blue)' : 'var(--white)',
            border: activeCategory === category.id ? '1.5px solid var(--blue)' : '1.5px solid var(--grid-line)',
            padding: '11px 20px',
            borderRadius: '999px',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
            position: 'relative'
          }}
        >
          {category.title}
          {activeCategory === category.id && (
            <motion.div
              layoutId="activePill"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '999px',
                background: 'var(--blue)',
                zIndex: -1
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
        </motion.button>
      ))}
    </motion.div>
  );
}