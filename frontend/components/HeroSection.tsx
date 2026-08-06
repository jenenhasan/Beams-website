'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface HeroSectionProps {
  onExploreMenu: () => void;
}

export function HeroSection({ onExploreMenu }: HeroSectionProps) {
  return (
    <section style={{
      position: 'relative',
      padding: '60px 20px 40px',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, var(--blue-deep) 0%, var(--blue) 50%, var(--blue-light) 100%)',
      borderRadius: '0 0 40px 40px',
      marginBottom: '40px'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-20%',
        width: '60%',
        height: '120%',
        background: 'radial-gradient(circle, rgba(255,107,0,0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '-30%',
        left: '-30%',
        width: '50%',
        height: '80%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      <div style={{
        maxWidth: '720px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        {/* Cup Image */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{
            marginBottom: '24px',
            position: 'relative'
          }}
        >
          <div style={{
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,255,255,0.1)'
          }}>
            <img
              src="/cup.png"
              alt="BEAMS Coffee Cup"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.2))'
              }}
              onError={(e) => {
                // Fallback if cup.png doesn't exist
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = `
                  <svg viewBox="0 0 24 24" style="width: 80px; height: 80px; stroke: white; fill: none; stroke-width: 1.5;">
                    <path d="M17 8h1a4 4 0 1 1 0 8h-1" stroke="white"/>
                    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" stroke="white"/>
                    <line x1="6" y1="2" x2="6" y2="4" stroke="white"/>
                    <line x1="10" y1="2" x2="10" y2="4" stroke="white"/>
                    <line x1="14" y1="2" x2="14" y2="4" stroke="white"/>
                    <text x="12" y="17" font-size="8" text-anchor="middle" fill="white" font-weight="bold">☕</text>
                  </svg>
                `;
              }}
            />
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontFamily: 'Caveat, cursive',
            fontSize: 'clamp(36px, 8vw, 56px)',
            color: 'var(--white)',
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: '8px'
          }}
        >
          ONE CUP.
          <br />
          <span style={{ color: 'var(--orange)' }}>EVERYDAY ENERGY.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(14px, 2vw, 18px)',
            color: 'rgba(255,255,255,0.8)',
            marginBottom: '32px'
          }}
        >
          GOOD VIBES ONLY
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onExploreMenu}
            style={{
              padding: '14px 40px',
              background: 'var(--orange)',
              color: 'var(--white)',
              border: 'none',
              borderRadius: '999px',
              cursor: 'pointer',
              fontFamily: 'Space Mono, monospace',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              boxShadow: '0 4px 20px rgba(255,107,0,0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            Explore our menu
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}