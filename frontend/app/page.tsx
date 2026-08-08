'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { SplashScreen } from '@/components/SplashScreen';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useMenu } from '@/hooks/useMenu';
import { useCart } from '@/hooks/useCart';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface MenuItemType {
  id: string;
  name: string;
  price: string;
  desc: string;
  image?: string;
  favorite?: boolean;
}

interface ToastState {
  id: number;
  message: string;
}

interface CategoryType {
  id: string;
  numeral: string;
  title: string;
  subtitle: string;
  items: MenuItemType[];
}

/* -------------------------------------------------------------------------- */
/*  Design tokens                                                             */
/* -------------------------------------------------------------------------- */
const TEXT_MUTED = '#6b6b6b';
const TEXT_FAINT = '#5c5c5c';

/* -------------------------------------------------------------------------- */
/*  Performance & Responsive Hooks                                            */
/* -------------------------------------------------------------------------- */

// Detect device quality for adaptive animations
function useDeviceQuality() {
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high');

  useEffect(() => {
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 4;
    const ua = navigator.userAgent;

    const isA13 = /SM-A135|SM-A136/i.test(ua);
    const isOldSamsung = /SM-A[0-9]{2}/i.test(ua);
    const isOldAndroid = /Android [0-9]/.test(ua) &&
                         parseInt(ua.match(/Android ([0-9]+)/)?.[1] || '0') < 11;
    const isMobile = /Android|iPhone|iPad/i.test(ua);

    let score = 0;
    if (cores >= 8) score += 3;
    else if (cores >= 6) score += 2;
    else score += 1;

    if (memory >= 6) score += 2;
    else if (memory >= 4) score += 1;

    if (isA13 || (isOldSamsung && isMobile)) score = 1;
    if (isOldAndroid) score = Math.min(score, 1);

    if (score >= 5) setQuality('high');
    else if (score >= 3) setQuality('medium');
    else setQuality('low');
  }, []);

  return quality;
}

function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delayMs: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const debounced = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callbackRef.current(...args), delayMs);
    },
    [delayMs]
  ) as T;

  return debounced;
}

function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollY;
}

function trackEvent(name: string, payload?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[analytics] ${name}`, payload ?? {});
  }
}

/* -------------------------------------------------------------------------- */
/*  Icon system                                                               */
/* -------------------------------------------------------------------------- */

type IconName = 'home' | 'menu' | 'star' | 'cart';

const NavIcon = memo(function NavIcon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    style: { width: `${size}px`, height: `${size}px`, display: 'block' },
  };

  switch (name) {
    case 'home':
      return (
        <svg {...common}>
          <path d="M3.5 10.5 12 3.5l8.5 7" />
          <path d="M5.5 9.5V20h4.5v-6h4v6h4.5V9.5" />
        </svg>
      );
    case 'menu':
      return (
        <svg {...common}>
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12.5" x2="20" y2="12.5" />
          <line x1="4" y1="18" x2="14" y2="18" />
        </svg>
      );
    case 'star':
      return (
        <svg {...common}>
          <path d="M12 3.5l2.6 5.5 6 .7-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6-4.4-4.2 6-.7z" />
        </svg>
      );
    case 'cart':
      return (
        <svg {...common}>
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      );
    default:
      return null;
  }
});
NavIcon.displayName = 'NavIcon';

/* -------------------------------------------------------------------------- */
/*  Navigation model                                                          */
/* -------------------------------------------------------------------------- */

const PRIMARY_NAV: { href: string; label: string; icon: IconName }[] = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '#menu', label: 'Menu', icon: 'menu' },
  { href: '/favourites', label: 'Favourites', icon: 'star' },
];

const MOBILE_NAV: { href: string; label: string; icon: IconName }[] = [
  ...PRIMARY_NAV,
  { href: '/cart', label: 'Cart', icon: 'cart' },
];

/* -------------------------------------------------------------------------- */
/*  Optimized Components                                                      */
/* -------------------------------------------------------------------------- */

const CupIcon = memo(() => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    style={{ width: '32px', height: '32px', stroke: 'var(--blue)', fill: 'none', strokeWidth: 1.6 }}
  >
    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
    <line x1="6" y1="2" x2="6" y2="4" />
    <line x1="10" y1="2" x2="10" y2="4" />
    <line x1="14" y1="2" x2="14" y2="4" />
  </svg>
));

CupIcon.displayName = 'CupIcon';

// PickCard with full animations
const PickCard = memo(function PickCard({
  pickItem,
  onAdd,
  quality = 'high',
}: {
  pickItem: MenuItemType;
  onAdd: (item: MenuItemType) => void;
  quality?: 'high' | 'medium' | 'low';
}) {
  const isLow = quality === 'low';

  return (
    <motion.button
      type="button"
      aria-label={`Add ${pickItem.name} to cart, $${pickItem.price}`}
      whileTap={!isLow ? { scale: 0.94 } : { scale: 0.97 }}
      whileHover={!isLow ? {
        y: -4,
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
      } : { y: -2 }}
      onClick={() => onAdd(pickItem)}
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        border: '1px solid #f2f2f2',
        cursor: 'pointer',
        minHeight: '44px',
        font: 'inherit',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        width: '100%',
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px',
          overflow: 'hidden',
          borderRadius: '12px',
          background: 'transparent',
        }}
      >
        {pickItem.image ? (
          <img
            src={pickItem.image}
            alt=""
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <CupIcon />
        )}
      </div>
      <div
        style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#1a1a2e',
          textAlign: 'center',
          marginBottom: '4px',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {pickItem.name}
      </div>
      <div
        style={{
          fontSize: '13px',
          color: 'var(--blue)',
          fontWeight: 600,
          fontFamily: 'Space Mono, monospace',
        }}
      >
        ${pickItem.price}
      </div>
    </motion.button>
  );
});

// MenuRow with full animations
const MenuRow = memo(function MenuRow({
  menuItem,
  index,
  quantity,
  onAdd,
  onRemove,
  quality = 'high',
}: {
  menuItem: MenuItemType;
  index: number;
  quantity: number;
  onAdd: (item: MenuItemType) => void;
  onRemove: (id: string) => void;
  quality?: 'high' | 'medium' | 'low';
}) {
  const isLow = quality === 'low';
  const delay = isLow ? 0.02 : Math.min(index * 0.04, 0.4);

  return (
    <motion.div
      initial={!isLow ? { opacity: 0, y: 20 } : { opacity: 0.8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={!isLow ? { duration: 0.4, delay } : { duration: 0.3, delay: delay * 0.5 }}
      whileHover={!isLow ? { backgroundColor: 'rgba(0,0,0,0.02)' } : { backgroundColor: 'rgba(0,0,0,0.01)' }}
      style={{
        display: 'flex',
        gap: '20px',
        padding: '24px 16px',
        borderRadius: '12px',
        borderBottom: '1px solid #f2f2f2',
        transition: 'background-color 0.2s ease',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '14px',
          background: 'transparent',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {menuItem.image ? (
          <img
            src={menuItem.image}
            alt=""
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <CupIcon />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '16px', color: 'var(--ink)' }}>
              {menuItem.name}
            </span>
            {menuItem.favorite && (
              <span aria-label="Customer favorite" style={{ color: 'var(--orange)', fontSize: '13px' }}>
                <NavIcon name="star" size={13} />
              </span>
            )}
          </div>
          <span
            style={{
              fontFamily: 'Space Mono, monospace',
              fontWeight: 600,
              fontSize: '16px',
              color: 'var(--blue)',
              whiteSpace: 'nowrap',
            }}
          >
            ${menuItem.price}
          </span>
        </div>
        {menuItem.desc && (
          <div style={{ fontSize: '13px', color: TEXT_MUTED, lineHeight: 1.5, marginTop: '6px', maxWidth: '100%' }}>
            {menuItem.desc}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '14px' }}>
          <button
            type="button"
            aria-label={`Remove one ${menuItem.name} from cart`}
            onClick={() => onRemove(menuItem.id)}
            className="qty-btn"
            style={{
              width: '36px',
              height: '36px',
              minWidth: '44px',
              minHeight: '44px',
              borderRadius: '50%',
              border: '1px solid #e8e8e8',
              background: 'var(--white)',
              color: 'var(--ink)',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              transition: 'all 0.15s ease',
            }}
          >
            –
          </button>
          <span
            aria-live="polite"
            style={{ fontFamily: 'Space Mono, monospace', fontWeight: 600, fontSize: '14px', minWidth: '20px', textAlign: 'center' }}
          >
            {quantity}
          </span>
          <button
            type="button"
            aria-label={`Add one ${menuItem.name} to cart`}
            onClick={() => onAdd(menuItem)}
            className="qty-btn"
            style={{
              width: '36px',
              height: '36px',
              minWidth: '44px',
              minHeight: '44px',
              borderRadius: '50%',
              border: '1px solid #e8e8e8',
              background: 'var(--white)',
              color: 'var(--ink)',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              transition: 'all 0.15s ease',
            }}
          >
            +
          </button>
        </div>
      </div>
    </motion.div>
  );
});

function MenuItemSkeleton() {
  return (
    <div style={{ display: 'flex', gap: '20px', padding: '22px 16px' }} aria-hidden="true">
      <div className="skeleton" style={{ width: '72px', height: '72px', borderRadius: '14px', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ width: '60%', height: '16px', borderRadius: '6px', marginBottom: '10px' }} />
        <div className="skeleton" style={{ width: '90%', height: '13px', borderRadius: '6px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '40%', height: '13px', borderRadius: '6px' }} />
      </div>
    </div>
  );
}

function Toast({ toast, onDismiss, quality = 'high' }: {
  toast: ToastState | null;
  onDismiss: () => void;
  quality?: 'high' | 'medium' | 'low';
}) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 2200);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  const isLow = quality === 'low';

  return (
    <div
      aria-live="polite"
      role="status"
      style={{
        position: 'fixed',
        bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        right: '24px',
        zIndex: 200,
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={!isLow ? { opacity: 0, y: 30, scale: 0.9 } : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={!isLow ? { opacity: 0, y: 20, scale: 0.9 } : { opacity: 0, y: 10 }}
            transition={!isLow ? { type: 'spring', stiffness: 400, damping: 28 } : { duration: 0.3 }}
            style={{
              background: 'var(--blue-deep, #12183f)',
              color: 'white',
              padding: '14px 22px',
              borderRadius: '14px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              maxWidth: '320px',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'var(--orange)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                flexShrink: 0,
              }}
            >
              ✓
            </span>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mobile menu — rendered via portal so it's never trapped inside a          */
/*  transformed ancestor (e.g. the animated sticky header).                   */
/* -------------------------------------------------------------------------- */

function MobileMenuPortal({
  isOpen,
  onClose,
  isLow,
  onExploreMenu,
}: {
  isOpen: boolean;
  onClose: () => void;
  isLow: boolean;
  onExploreMenu: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={!isLow ? { duration: 0.3 } : { duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              zIndex: 199,
              top: '64px',
            }}
          />

          <motion.div
            id="mobile-menu-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={!isLow ? { opacity: 0, x: 300 } : { opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={!isLow ? { opacity: 0, x: 300 } : { opacity: 0, x: 100 }}
            transition={!isLow ? {
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            } : { duration: 0.3 }}
            style={{
              position: 'fixed',
              top: '0',
              right: '0',
              bottom: '0',
              width: 'clamp(300px, 75vw, 400px)',
              background: 'white',
              boxShadow: '-8px 0 40px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              zIndex: 200,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: '24px 24px 20px',
                background: 'linear-gradient(135deg, var(--blue-deep), var(--blue))',
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '-30%',
                  right: '-20%',
                  width: '80%',
                  height: '150%',
                  background: 'radial-gradient(circle, rgba(255,107,0,0.15) 0%, transparent 70%)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    aria-hidden="true"
                    style={{
                      width: '44px',
                      height: '44px',
                      background: 'var(--orange)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 16px rgba(255,107,0,0.3)',
                    }}
                  >
                    <CupIcon />
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: 'Anton, sans-serif',
                        fontSize: '20px',
                        color: 'white',
                        letterSpacing: '1px',
                      }}
                    >
                      BEAMS
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.7)',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      The Coffee House
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close menu"
                  className="focusable"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.08)',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            <nav
              aria-label="Main"
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '16px 20px 20px',
                gap: '4px',
                flex: 1,
                overflowY: 'auto',
              }}
            >
              {MOBILE_NAV.map((navItem, index) => (
                <motion.div
                  key={navItem.label}
                  initial={!isLow ? { opacity: 0, x: 20 } : { opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={!isLow ? { delay: 0.05 + index * 0.05 } : { delay: 0.03 + index * 0.03 }}
                >
                  {navItem.href === '#menu' ? (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onExploreMenu();
                      }}
                      className="focusable"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '14px 16px',
                        minHeight: '52px',
                        borderRadius: '12px',
                        width: '100%',
                        border: 'none',
                        background:
                          navItem.label === 'Menu'
                            ? 'rgba(31,41,251,0.06)'
                            : 'transparent',
                        cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '15px',
                        fontWeight:
                          navItem.label === 'Menu' ? 600 : 500,
                        color:
                          navItem.label === 'Menu'
                            ? 'var(--blue)'
                            : '#1a1a2e',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => {
                        if (navItem.label !== 'Menu') {
                          e.currentTarget.style.background = 'rgba(0,0,0,0.03)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (navItem.label !== 'Menu') {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <span
                        style={{
                          width: '28px',
                          flexShrink: 0,
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        <NavIcon name={navItem.icon} size={20} />
                      </span>
                      <span style={{ flex: 1, textAlign: 'left' }}>
                        {navItem.label}
                      </span>
                      {navItem.label === 'Menu' && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            color: 'var(--blue)',
                            background: 'rgba(31,41,251,0.08)',
                            padding: '2px 10px',
                            borderRadius: '999px',
                          }}
                        >
                          Active
                        </span>
                      )}
                      <span
                        aria-hidden="true"
                        style={{
                          fontSize: '14px',
                          color: '#ccc',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        →
                      </span>
                    </button>
                  ) : (
                    <Link
                      href={navItem.href}
                      onClick={onClose}
                      className="focusable"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '14px 16px',
                        minHeight: '52px',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        background:
                          navItem.label === 'Menu'
                            ? 'rgba(31,41,251,0.06)'
                            : 'transparent',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '15px',
                        fontWeight:
                          navItem.label === 'Menu' ? 600 : 500,
                        color:
                          navItem.label === 'Menu'
                            ? 'var(--blue)'
                            : '#1a1a2e',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => {
                        if (navItem.label !== 'Menu') {
                          e.currentTarget.style.background = 'rgba(0,0,0,0.03)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (navItem.label !== 'Menu') {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <span
                        style={{
                          width: '28px',
                          flexShrink: 0,
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        <NavIcon name={navItem.icon} size={20} />
                      </span>
                      <span style={{ flex: 1, textAlign: 'left' }}>
                        {navItem.label}
                      </span>
                      {navItem.label === 'Menu' && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            color: 'var(--blue)',
                            background: 'rgba(31,41,251,0.08)',
                            padding: '2px 10px',
                            borderRadius: '999px',
                          }}
                        >
                          Active
                        </span>
                      )}
                      <span
                        aria-hidden="true"
                        style={{
                          fontSize: '14px',
                          color: '#ccc',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        →
                      </span>
                    </Link>
                  )}
                </motion.div>
              ))}
            </nav>

            <motion.div
              initial={!isLow ? { opacity: 0 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={!isLow ? { delay: 0.3 } : { delay: 0.2 }}
              style={{
                padding: '16px 24px 24px',
                borderTop: '1px solid #f0f0f0',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'var(--cream)',
                  borderRadius: '12px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    color: TEXT_FAINT,
                  }}
                >
                  Freshly roasted, every morning
                </span>
                <span style={{ fontSize: '12px', color: TEXT_FAINT }}>
                  v1.0
                </span>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Page                                                                  */
/* -------------------------------------------------------------------------- */

export default function Home() {
  const [showApp, setShowApp] = useState(false);
  const [activeCategory, setActiveCategory] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [cartPulse, setCartPulse] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const { menu, loading, error } = useMenu();
  const { items, totalItems, addItem, removeItem } = useCart();
  const scrollY = useScrollPosition();
  const showBackToTop = scrollY > 500;
  const showHeaderCta = scrollY > 360;
  const quality = useDeviceQuality();
  const isLow = quality === 'low';

  useEffect(() => {
    if (menu && menu.categories.length > 0) {
      setActiveCategory(menu.categories[0].id);
    }
  }, [menu]);

  useEffect(() => {
    if (!activeCategory) return;
    const btn = categoryRefs.current[activeCategory];
    btn?.scrollIntoView({
      behavior: isLow ? 'auto' : 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [activeCategory, isLow]);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isMobileMenuOpen]);

  const getItemQuantity = (itemId: string) => {
    const cartItem = items.find((item) => item.menuItem.id === itemId);
    return cartItem?.quantity || 0;
  };

  const handleAddItem = useCallback(
    (item: MenuItemType) => {
      addItem(item);
      setToast({ id: Date.now(), message: `${item.name} added to cart` });
      setCartPulse(true);
      trackEvent('add_to_cart', { itemId: item.id, name: item.name });
      window.setTimeout(() => setCartPulse(false), 500);
    },
    [addItem]
  );

  const handleExploreMenu = (): void => {
    setShowMenu(true);
    setIsMobileMenuOpen(false);
    trackEvent('explore_menu_click');
    setTimeout(() => {
      const headerOffset = 76;
      const top = menuRef.current
        ? menuRef.current.getBoundingClientRect().top + window.scrollY - headerOffset
        : 0;
      window.scrollTo({ top, behavior: 'smooth' });
    }, 100);
  };

  const handleViewAllPicks = (): void => handleExploreMenu();

  const getAllItems = (): MenuItemType[] => {
    if (!menu) return [];
    return menu.categories.flatMap((cat: CategoryType) => cat.items);
  };

  const toggleMobileMenu = useDebouncedCallback(() => {
    setIsMobileMenuOpen((v) => !v);
  }, 80);

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  const handleCategoryClick = useDebouncedCallback((categoryId: string) => {
    setActiveCategory(categoryId);
    trackEvent('category_select', { categoryId });
  }, 60);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!showApp) {
    return <SplashScreen onComplete={() => setShowApp(true)} />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div
        role="alert"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: '16px',
          fontFamily: 'Inter, sans-serif',
          color: 'var(--ink)',
          background: 'var(--cream)',
          backgroundImage:
            'linear-gradient(var(--grid-line) 1px, transparent 1px),' +
            'linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      >
        <motion.p initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          Failed to load menu: {error}
        </motion.p>
        <motion.button
          whileHover={!isLow ? { scale: 1.05 } : { scale: 1.03 }}
          whileTap={!isLow ? { scale: 0.95 } : { scale: 0.97 }}
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 24px',
            minHeight: '44px',
            background: 'var(--blue)',
            color: 'white',
            border: 'none',
            borderRadius: '999px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Retry
        </motion.button>
      </div>
    );
  }

  if (!menu || menu.categories.length === 0) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>No menu available</div>;
  }

  const activeCategoryData = menu.categories.find((c: CategoryType) => c.id === activeCategory);
  const allItems = getAllItems();
  const todayPicks = allItems.slice(0, 3);

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'var(--cream)',
        backgroundImage:
          'linear-gradient(var(--grid-line) 1px, transparent 1px),' +
          'linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        position: 'relative',
        overflowX: 'hidden',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      {/* Skip link */}
      <a
        href="#main-content"
        className="skip-link"
        style={{
          position: 'absolute',
          top: '-48px',
          left: '12px',
          zIndex: 300,
          background: 'var(--blue-deep, #12183f)',
          color: 'white',
          padding: '10px 18px',
          borderRadius: '8px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          fontWeight: 600,
          textDecoration: 'none',
          transition: 'top 0.15s ease',
        }}
      >
        Skip to menu content
      </a>

      {/* TOP NAVIGATION BAR */}
      <motion.div
        initial={!isLow ? { y: -50, opacity: 0 } : { y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={!isLow ? { duration: 0.5 } : { duration: 0.4 }}
        style={{
          background: 'rgba(255, 250, 240, 0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          padding: '0 24px',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          width: '100%',
          borderBottom: '1px solid rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '12px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '64px',
          }}
        >
          {/* Left: Hamburger + Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu-panel"
              className="focusable mobile-hamburger"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                zIndex: 101,
                width: '36px',
                height: '40px',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  display: 'block',
                  width: '18px',
                  height: '1.5px',
                  background: 'var(--blue)',
                  borderRadius: '2px',
                  transition: 'all 0.3s ease',
                  transform: isMobileMenuOpen ? 'rotate(45deg) translate(3px, 3px)' : 'rotate(0)',
                }}
              />
              <span
                style={{
                  display: 'block',
                  width: '18px',
                  height: '1.5px',
                  background: 'var(--blue)',
                  borderRadius: '2px',
                  transition: 'all 0.3s ease',
                  opacity: isMobileMenuOpen ? 0 : 1,
                }}
              />
              <span
                style={{
                  display: 'block',
                  width: '18px',
                  height: '1.5px',
                  background: 'var(--blue)',
                  borderRadius: '2px',
                  transition: 'all 0.3s ease',
                  transform: isMobileMenuOpen ? 'rotate(-45deg) translate(3px, -3px)' : 'rotate(0)',
                }}
              />
            </button>

            <nav
              aria-label="Main navigation"
              className="desktop-nav"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {PRIMARY_NAV.map((item) => (
                item.href === '#menu' ? (
                  <button
                    key={item.label}
                    onClick={(e) => {
                      e.preventDefault();
                      handleExploreMenu();
                    }}
                    className="focusable"
                    style={{
                      padding: '8px 16px',
                      minHeight: '40px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'var(--ink)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <NavIcon name={item.icon} />
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="focusable"
                    style={{
                      padding: '8px 16px',
                      minHeight: '40px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'var(--ink)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <NavIcon name={item.icon} />
                    {item.label}
                  </Link>
                )
              ))}
            </nav>
          </div>

          {/* Logo */}
          <Link href="/" aria-label="BEAMS home" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
              whileHover={!isLow ? { scale: 1.02 } : { scale: 1.01 }}
              whileTap={!isLow ? { scale: 0.98 } : { scale: 0.99 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'Anton, sans-serif',
                fontSize: '20px',
                letterSpacing: '1px',
                color: 'var(--orange)',
                cursor: 'pointer',
              }}
            >
              {!logoError ? (
                <img
                  src="/beams-smalllogo.png"
                  alt="BEAMS"
                  style={{
                    width: '120px',
                    height: 'auto',
                    display: 'block',
                    maxHeight: '48px',
                    objectFit: 'contain',
                  }}
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span style={{ color: 'var(--orange)' }}>BEAMS</span>
              )}
            </motion.div>
          </Link>

          {/* Right: Cart + Desktop elements */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link
              href="/cart"
              aria-label={`View cart, ${totalItems} item${totalItems === 1 ? '' : 's'}`}
              className="focusable"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                textDecoration: 'none',
                width: '40px',
                height: '40px',
              }}
            >
              <motion.svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--blue)"
                strokeWidth="2"
                aria-hidden="true"
                animate={cartPulse ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                transition={!isLow ? { duration: 0.45, ease: 'easeOut' } : { duration: 0.4 }}
                style={{ width: '20px', height: '20px' }}
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </motion.svg>
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={!isLow ? { scale: 0.5, opacity: 0 } : { scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={!isLow ? { scale: 0.5, opacity: 0 } : { scale: 0.7, opacity: 0 }}
                    transition={!isLow ? { type: 'spring', stiffness: 500, damping: 20 } : { duration: 0.3 }}
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      background: 'var(--orange)',
                      color: 'white',
                      fontSize: '9px',
                      fontWeight: 700,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Desktop: persistent order CTA */}
            <AnimatePresence>
              {showHeaderCta && (
                <motion.button
                  onClick={handleExploreMenu}
                  className="focusable desktop-cta"
                  initial={!isLow ? { opacity: 0, y: -6 } : { opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={!isLow ? { opacity: 0, y: -6 } : { opacity: 0, y: -4 }}
                  transition={!isLow ? { duration: 0.2 } : { duration: 0.3 }}
                  style={{
                    padding: '10px 24px',
                    minHeight: '44px',
                    borderRadius: '999px',
                    border: 'none',
                    background: 'var(--orange)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(255,107,0,0.2)',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.03)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,107,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(255,107,0,0.2)';
                  }}
                >
                  Order Now
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* MOBILE MENU — rendered outside the transformed header via portal */}
      <MobileMenuPortal
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        isLow={isLow}
        onExploreMenu={handleExploreMenu}
      />

      <main id="main-content">
        {/* ===== HERO SECTION ===== */}
        <div
          style={{
            padding: '20px 24px 0',
            position: 'relative',
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%',
            minHeight: 'auto',
          }}
        >
          <div
            className="hero-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '40px',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {/* Left side - Hero Text */}
            <div>
              <motion.div
                initial={!isLow ? { opacity: 0, y: 30 } : { opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={!isLow ? { duration: 0.6, ease: [0.22, 1, 0.36, 1] } : { duration: 0.5 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <motion.h1
                  initial={!isLow ? { opacity: 0, x: -20 } : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={!isLow ? { duration: 0.6, delay: 0.1 } : { duration: 0.4, delay: 0.05 }}
                  style={{
                    fontFamily: 'Anton, sans-serif',
                    fontWeight: 590,
                    fontSize: 'clamp(40px, 6vw, 84px)',
                    color: '#1f29fb',
                    lineHeight: 0.86,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginBottom: '8px',
                    marginTop: 0,
                    textAlign: 'left',
                  }}
                >
                  <div style={{ marginBottom: '4px' }}>ONE CUP.</div>
                  <div style={{ marginBottom: '4px' }}>EVERYDAY</div>
                  <div>ENERGY.</div>
                </motion.h1>
                <motion.p
                  initial={!isLow ? { opacity: 0 } : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={!isLow ? { duration: 0.6, delay: 0.2 } : { duration: 0.4, delay: 0.1 }}
                  style={{
                    fontSize: 'clamp(13px, 1.2vw, 18px)',
                    color: TEXT_MUTED,
                    marginTop: '8px',
                    lineHeight: 1.6,
                    fontWeight: 400,
                    letterSpacing: '0.3px',
                    fontFamily: 'Inter, sans-serif',
                    textAlign: 'left',
                  }}
                >
                  BEAMS <span style={{ color: '#d0d0d0' }}>|</span> The Coffee
                  House
                </motion.p>

                {/* DESKTOP CTA */}
                <motion.div
                  className="desktop-hero-cta"
                  initial={!isLow ? { opacity: 0, y: 20 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={!isLow ? { duration: 0.6, delay: 0.3 } : { duration: 0.4, delay: 0.15 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    marginTop: '32px',
                    width: '100%',
                  }}
                >
                  <button
                    onClick={handleExploreMenu}
                    className="focusable"
                    style={{
                      background: '#FF6B00',
                      border: 'none',
                      borderRadius: '999px',
                      padding: '16px 40px',
                      minHeight: '56px',
                      fontSize: '16px',
                      fontWeight: 700,
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 16px rgba(255,107,0,0.25)',
                      transition: 'all 0.2s ease',
                      letterSpacing: '0.3px',
                      fontFamily: 'Inter, sans-serif',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.03)';
                      e.currentTarget.style.boxShadow = '0 6px 24px rgba(255,107,0,0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,107,0,0.25)';
                    }}
                  >
                    Explore our menu
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      style={{ width: '14px', height: '14px' }}
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </motion.div>
              </motion.div>
            </div>

            {/* Right side - Cup Image */}
            <div>
              <motion.div
                initial={!isLow ? { opacity: 0, scale: 0.8, y: 50 } : { opacity: 0, scale: 0.9, y: 25 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  transition: !isLow ? {
                    type: 'spring',
                    stiffness: 120,
                    damping: 15,
                    duration: 0.8,
                    delay: 0.2,
                  } : {
                    type: 'spring',
                    stiffness: 100,
                    damping: 12,
                    duration: 0.6,
                    delay: 0.1,
                  },
                }}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  padding: '20px 0',
                }}
              >
                <motion.div
                  initial={!isLow ? { opacity: 0, scale: 0.5 } : { opacity: 0, scale: 0.7 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    transition: !isLow ? {
                      duration: 0.6,
                      delay: 0.4,
                      ease: 'easeOut',
                    } : {
                      duration: 0.4,
                      delay: 0.2,
                    },
                  }}
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    bottom: '14px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '62%',
                    height: '32px',
                    background:
                      'radial-gradient(ellipse, rgba(18,24,63,0.22) 0%, rgba(18,24,63,0.10) 45%, transparent 72%)',
                    filter: 'blur(6px)',
                    zIndex: 1,
                    borderRadius: '50%',
                  }}
                />

                <motion.div
                  animate={!isLow ? {
                    y: [0, -6, 0, -3, 0],
                    rotate: [0, 0.3, 0, -0.3, 0],
                  } : {
                    y: [0, -3, 0, -1.5, 0],
                    rotate: [0, 0.15, 0, -0.15, 0],
                  }}
                  transition={!isLow ? {
                    y: {
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                    rotate: {
                      duration: 6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  } : {
                    y: {
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                    rotate: {
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }}
                  style={{
                    width: '100%',
                    maxWidth: '500px',
                    height: 'auto',
                    zIndex: 3,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'visible',
                    marginTop: '-20px',
                  }}
                >
                  <img
                    src="/cup.jpg"
                    alt="BEAMS matcha latte in a takeaway cup"
                    loading="eager"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      objectFit: 'contain',
                      maxHeight: '300px',
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={!isLow ? { opacity: 0, scale: 0.5 } : { opacity: 0, scale: 0.7 }}
                  animate={!isLow ? {
                    opacity: 1,
                    scale: 1,
                    y: [0, -4, 0, -2, 0],
                  } : {
                    opacity: 1,
                    scale: 1,
                    y: [0, -2, 0, -1, 0],
                  }}
                  transition={!isLow ? {
                    opacity: { duration: 0.5, delay: 0.4 },
                    scale: { duration: 0.5, delay: 0.4, type: 'spring', stiffness: 200 },
                    y: {
                      duration: 3.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 1,
                    },
                  } : {
                    opacity: { duration: 0.4, delay: 0.2 },
                    scale: { duration: 0.4, delay: 0.2, type: 'spring', stiffness: 150 },
                    y: {
                      duration: 2.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.5,
                    },
                  }}
                  style={{
                    position: 'absolute',
                    right: '-2%',
                    bottom: '22%',
                    zIndex: 4,
                  }}
                >
                  <div
                    style={{
                      width: 'clamp(70px, 10vw, 110px)',
                      height: 'clamp(70px, 10vw, 110px)',
                      background: '#FF6B00',
                      borderRadius: '50%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 'clamp(8px, 1vw, 12px)',
                      fontWeight: 700,
                      textAlign: 'center',
                      padding: '12px',
                      textTransform: 'uppercase',
                      lineHeight: 1.2,
                      boxShadow: '0 4px 20px rgba(255, 107, 0, 0.3)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    SMALL
                    <br />
                    BATCH
                    <br />
                    ROAST
                  </div>
                </motion.div>
              </motion.div>

              {/* MOBILE CTA */}
              <div className="mobile-cta" style={{
                display: 'none',
                marginTop: '12px'
              }}>
                <button
                  onClick={handleExploreMenu}
                  className="focusable"
                  style={{
                    width: '100%',
                    background: '#FF6B00',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '14px 24px',
                    minHeight: '48px',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(255,107,0,0.2)',
                    transition: 'all 0.2s ease',
                    letterSpacing: '0.3px',
                  }}
                >
                  Explore our menu
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ width: '12px', height: '12px' }}
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===== TODAY'S PICKS ===== */}
        <motion.div
          initial={!isLow ? { opacity: 0, y: 30 } : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={!isLow ? { duration: 0.6, delay: 0.4 } : { duration: 0.4, delay: 0.2 }}
          style={{
            padding: '40px 24px 32px',
            background: 'var(--cream)',
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
            }}
          >
            <h2
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 'clamp(12px, 1vw, 13px)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--blue)',
                margin: 0,
              }}
            >
              Today's Picks
            </h2>
            <button
              onClick={handleViewAllPicks}
              className="focusable"
              style={{
                fontSize: 'clamp(13px, 1vw, 15px)',
                fontWeight: 600,
                color: 'var(--blue)',
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                minHeight: '44px',
                padding: '0 12px',
                opacity: 0.8,
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
            >
              View all →
            </button>
          </div>

          <div
            className="picks-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '20px',
            }}
          >
            {todayPicks.map((pickItem: MenuItemType) => (
              <PickCard key={pickItem.id} pickItem={pickItem} onAdd={handleAddItem} quality={quality} />
            ))}
          </div>
        </motion.div>

        {/* ===== MENU SECTION ===== */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              ref={menuRef}
              id="menu"
              initial={!isLow ? { opacity: 0, y: 30 } : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={!isLow ? { opacity: 0, y: -30 } : { opacity: 0, y: -15 }}
              transition={!isLow ? { duration: 0.5 } : { duration: 0.4 }}
              style={{
                padding: '24px 24px 60px',
                background: 'var(--cream)',
                borderTop: '1px solid #f0f0f0',
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%',
              }}
            >
              {/* Category Pills */}
              <motion.div
                role="tablist"
                aria-label="Menu categories"
                className="category-pills"
                initial={!isLow ? { opacity: 0, y: 10 } : { opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={!isLow ? { duration: 0.4, delay: 0.1 } : { duration: 0.3, delay: 0.05 }}
                style={{
                  display: 'flex',
                  gap: '10px',
                  overflowX: 'auto',
                  padding: '14px 4px',
                  marginBottom: '20px',
                  scrollbarWidth: 'none',
                  WebkitOverflowScrolling: 'touch',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  position: 'sticky',
                  top: 'calc(64px + env(safe-area-inset-top, 0px))',
                  zIndex: 60,
                  background: 'rgba(255, 250, 240, 0.92)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                }}
              >
                {menu.categories.map((category: CategoryType) => {
                  const isActive = activeCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      ref={(el) => {
                        categoryRefs.current[category.id] = el;
                      }}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => handleCategoryClick(category.id)}
                      className="focusable ticket-pill"
                      style={{
                        flex: '0 0 auto',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        letterSpacing: '0.01em',
                        color: isActive ? 'var(--white)' : '#3d3d3d',
                        background: isActive ? 'var(--orange)' : 'var(--white)',
                        border: isActive ? '1.5px solid var(--orange)' : '1.5px solid #ececec',
                        padding: '10px 20px',
                        minHeight: '44px',
                        borderRadius: '999px',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease',
                        boxShadow: isActive ? '0 6px 16px rgba(255,107,0,0.28)' : 'none',
                        transform: isActive ? 'translateY(-1px)' : 'translateY(0)',
                      }}
                    >
                      {category.title}
                    </button>
                  );
                })}
              </motion.div>

              {/* Active Category Items */}
              <AnimatePresence mode="wait">
                {activeCategoryData && (
                  <motion.div
                    key={activeCategory}
                    initial={!isLow ? { opacity: 0, y: 20 } : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={!isLow ? { opacity: 0, y: -20 } : { opacity: 0, y: -10 }}
                    transition={!isLow ? { duration: 0.4 } : { duration: 0.3 }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginBottom: '8px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <motion.div
                        initial={!isLow ? { scale: 0 } : { scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={!isLow ? {
                          type: 'spring',
                          stiffness: 400,
                          damping: 10,
                          delay: 0.1,
                        } : {
                          type: 'spring',
                          stiffness: 300,
                          damping: 8,
                          delay: 0.05,
                        }}
                        aria-hidden="true"
                        style={{
                          fontFamily: 'Space Mono, monospace',
                          fontWeight: 700,
                          fontSize: 'clamp(12px, 1.2vw, 14px)',
                          color: 'var(--white)',
                          background: 'var(--orange)',
                          width: 'clamp(32px, 3vw, 40px)',
                          height: 'clamp(32px, 3vw, 40px)',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {activeCategoryData.numeral}
                      </motion.div>
                      <div>
                        <motion.h2
                          initial={!isLow ? { opacity: 0, x: -20 } : { opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={!isLow ? { duration: 0.4, delay: 0.15 } : { duration: 0.3, delay: 0.08 }}
                          style={{
                            fontFamily: 'Anton, sans-serif',
                            fontWeight: 500,
                            fontSize: 'clamp(26px, 3vw, 38px)',
                            color: 'var(--blue)',
                            lineHeight: 1,
                            margin: 0,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          {activeCategoryData.title}
                        </motion.h2>
                      </div>
                    </div>

                    <motion.p
                      initial={!isLow ? { opacity: 0 } : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={!isLow ? { duration: 0.4, delay: 0.2 } : { duration: 0.3, delay: 0.1 }}
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 'clamp(13px, 1vw, 15px)',
                        color: TEXT_MUTED,
                        margin: '4px 0 24px 48px',
                        fontStyle: 'italic',
                      }}
                    >
                      {activeCategoryData.subtitle}
                    </motion.p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {loading
                        ? Array.from({ length: 4 }).map((_: any, i: number) => (
                            <MenuItemSkeleton key={i} />
                          ))
                        : activeCategoryData.items.map(
                            (menuItem: MenuItemType, index: number) => (
                              <MenuRow
                                key={menuItem.id}
                                menuItem={menuItem}
                                index={index}
                                quantity={getItemQuantity(menuItem.id)}
                                onAdd={handleAddItem}
                                onRemove={removeItem}
                                quality={quality}
                              />
                            )
                          )}
                    </div>

                    <motion.p
                      initial={!isLow ? { opacity: 0 } : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={!isLow ? { duration: 0.4, delay: 0.3 } : { duration: 0.3, delay: 0.15 }}
                      style={{
                        marginTop: '24px',
                        paddingTop: '20px',
                        borderTop: '1px solid #f0f0f0',
                        fontSize: 'clamp(12px, 0.9vw, 14px)',
                        color: TEXT_FAINT,
                        fontStyle: 'italic',
                        fontFamily: 'Inter, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span aria-hidden="true" style={{ color: 'var(--orange)', display: 'inline-flex' }}>
                        <NavIcon name="star" size={12} />
                      </span>
                      indicates a customer favorite. Ask your barista about
                      seasonal swaps and milk alternatives.
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Back to top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            type="button"
            aria-label="Back to top"
            onClick={scrollToTop}
            initial={!isLow ? { opacity: 0, scale: 0.7, y: 20 } : { opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={!isLow ? { opacity: 0, scale: 0.7, y: 20 } : { opacity: 0, scale: 0.85, y: 10 }}
            whileHover={!isLow ? { scale: 1.08 } : { scale: 1.04 }}
            whileTap={!isLow ? { scale: 0.92 } : { scale: 0.96 }}
            className="focusable"
            style={{
              position: 'fixed',
              bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
              left: '24px',
              zIndex: 90,
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: 'none',
              background: 'var(--blue)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(31,41,251,0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{ width: '18px', height: '18px' }}
            >
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      <Toast toast={toast} onDismiss={() => setToast(null)} quality={quality} />

      <style>{`
        :root {
          --toast-scrollbar-thumb: var(--blue, #1f29fb);
        }

        .skip-link:focus {
          top: 12px !important;
        }

        .ticket-pill:hover {
          transform: translateY(-2px) !important;
        }

        /* ===== RESPONSIVE STYLES ===== */

        /* Mobile styles (max-width: 768px) */
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .desktop-cta {
            display: none !important;
          }
          .mobile-hamburger {
            display: flex !important;
          }
          .mobile-cta {
            display: block !important;
          }
          .desktop-hero-cta {
            display: none !important;
          }

          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }

          .picks-grid {
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important;
            gap: 14px !important;
          }

          .category-pills {
            flex-wrap: nowrap !important;
            justify-content: flex-start !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
            mask-image: linear-gradient(to right, black 92%, transparent 100%);
            -webkit-mask-image: linear-gradient(to right, black 92%, transparent 100%);
          }
        }

        .category-pills::-webkit-scrollbar {
          display: none;
        }

        /* Desktop styles (min-width: 769px) */
        @media (min-width: 769px) {
          .mobile-hamburger {
            display: none !important;
          }
          .mobile-cta {
            display: none !important;
          }
          .desktop-cta {
            display: flex !important;
          }
          .desktop-nav {
            display: flex !important;
          }
          .desktop-hero-cta {
            display: flex !important;
          }

          .picks-grid {
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) !important;
            gap: 20px !important;
          }
        }

        /* Extra small devices (max-width: 480px) */
        @media (max-width: 480px) {
          .picks-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        div::-webkit-scrollbar {
          height: 6px;
          width: 8px;
        }
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        div::-webkit-scrollbar-thumb {
          background: var(--toast-scrollbar-thumb);
          borderRadius: 999px;
          opacity: 0.3;
        }

        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          padding: 0;
        }

        html {
          scroll-behavior: smooth;
        }

        .focusable:focus-visible,
        .qty-btn:focus-visible,
        .nav-row:focus-visible,
        button:focus-visible,
        a:focus-visible {
          outline: 2px solid var(--orange);
          outline-offset: 2px;
        }

        .skeleton {
          background: linear-gradient(
            90deg,
            var(--grid-line) 25%,
            #eceaf7 37%,
            var(--grid-line) 63%
          );
          background-size: 400% 100%;
          animation: shimmer 1.4s ease infinite;
        }
        @keyframes shimmer {
          0% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0 50%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  );
}