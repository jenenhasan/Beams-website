'use client';

import { motion } from 'framer-motion';

export function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'Space Mono, monospace',
      color: 'var(--blue)',
      background: 'var(--cream)',
      backgroundImage: 'linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)',
      backgroundSize: '40px 40px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '48px',
            height: '48px',
            margin: '0 auto 20px',
            border: '4px solid var(--grid-line)',
            borderTopColor: 'var(--blue)',
            borderRadius: '50%'
          }}
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            fontSize: '14px',
            color: 'var(--ink)'
          }}
        >
          Loading menu...
        </motion.p>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            height: '2px',
            background: 'linear-gradient(90deg, var(--blue), var(--orange))',
            marginTop: '12px',
            borderRadius: '2px'
          }}
        />
      </div>
    </div>
  );
}