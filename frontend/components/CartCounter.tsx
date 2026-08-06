'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/hooks/useCart';

export function CartCounter() {
  const { totalItems } = useCart();

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ 
            type: 'spring',
            stiffness: 500,
            damping: 20
          }}
          style={{
            background: 'var(--orange)',
            color: 'var(--white)',
            fontWeight: 700,
            fontSize: '10px',
            minWidth: '18px',
            height: '18px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 5px',
            marginLeft: '2px'
          }}
        >
          <motion.span
            key={totalItems}
            initial={{ scale: 1.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            {totalItems}
          </motion.span>
        </motion.span>
      )}
    </AnimatePresence>
  );
}