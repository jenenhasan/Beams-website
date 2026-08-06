'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useMenu } from '@/hooks/useMenu';
import { useCart } from '@/hooks/useCart';
import { CartCounter } from '@/components/CartCounter';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MenuItem as MenuItemType } from '@/lib/types';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface NavItemType {
  href: string;
  icon: string;
  label: string;
}

/* -------------------------------------------------------------------------- */
/*  Main Page                                                                  */
/* -------------------------------------------------------------------------- */

export default function FavouritesPage() {
  const { menu, loading } = useMenu();
  const { addItem, removeItem, items } = useCart();
  const [favourites, setFavourites] = useState<MenuItemType[]>([]);
  const [logoError, setLogoError] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (menu) {
      const allFavourites = menu.categories.flatMap(cat => 
        cat.items.filter(item => item.favorite === true)
      );
      setFavourites(allFavourites);
    }
  }, [menu]);

  const getItemQuantity = (itemId: string) => {
    const cartItem = items.find(item => item.menuItem.id === itemId);
    return cartItem?.quantity || 0;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (loading) {
    return <LoadingSpinner />;
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
        backgroundSize: '40px 40px'
      }}
    >
      {/* ===== TOP NAVIGATION BAR - MATCHING MAIN PAGE ===== */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'transparent',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          padding: '0 16px',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          width: '100%',
        }}
      >
        <div
          style={{
            maxWidth: '720px',
            margin: '0 auto',
            padding: '12px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '60px',
          }}
        >
          {/* Hamburger Menu Button */}
          <button
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu-panel"
            className="focusable"
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

          {/* Logo */}
          <Link href="/" aria-label="BEAMS home" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'Anton, sans-serif',
                fontSize: '18px',
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
                    width: '110px',
                    height: 'auto',
                    display: 'block',
                    maxHeight: '44px',
                    objectFit: 'contain',
                  }}
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span style={{ color: 'var(--orange)' }}>BEAMS</span>
              )}
            </motion.div>
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            aria-label="View cart"
            className="focusable"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              textDecoration: 'none',
              width: '36px',
              height: '40px',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--blue)"
              strokeWidth="2"
              aria-hidden="true"
              style={{ width: '18px', height: '18px' }}
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <CartCounter />
          </Link>
        </div>

        {/* ===== MOBILE MENU - MATCHING MAIN PAGE ===== */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop with blur */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={toggleMobileMenu}
                aria-hidden="true"
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  zIndex: 99,
                  top: '56px',
                }}
              />

              {/* Menu Panel - Slide from right */}
              <motion.div
                id="mobile-menu-panel"
                role="dialog"
                aria-modal="true"
                aria-label="Site menu"
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                transition={{
                  duration: 0.35,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  position: 'fixed',
                  top: '0',
                  right: '0',
                  bottom: '0',
                  width: 'clamp(300px, 75vw, 400px)',
                  background: 'white',
                  boxShadow: '-8px 0 40px rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Menu Header */}
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
                          fontSize: '20px',
                          boxShadow: '0 4px 16px rgba(255,107,0,0.3)',
                        }}
                      >
                        ☕
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
                            color: 'rgba(255,255,255,0.6)',
                            fontFamily: 'Inter, sans-serif',
                          }}
                        >
                          The Coffee House
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={toggleMobileMenu}
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

                {/* Menu Items */}
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
                  {[
                    { href: '/', label: 'Home' },
                    { href: '/',  label: 'Menu' },
                    { href: '/favourites', label: 'Favourites' },
                    { href: '/cart',label: 'Cart' },
                    { href: '/admin',  label: 'Admin' },
                  ].map((navItem, index) => (
                    <motion.div
                      key={navItem.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + index * 0.05 }}
                    >
                      <Link
                        href={navItem.href}
                        onClick={() => setIsMobileMenuOpen(false)}
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
                            navItem.label === 'Favourites'
                              ? 'rgba(31,41,251,0.06)'
                              : 'transparent',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '15px',
                          fontWeight:
                            navItem.label === 'Favourites' ? 600 : 500,
                          color:
                            navItem.label === 'Favourites'
                              ? 'var(--blue)'
                              : '#1a1a2e',
                          transition: 'all 0.2s ease',
                          position: 'relative',
                        }}
                        onMouseEnter={(e) => {
                          if (navItem.label !== 'Favourites') {
                            e.currentTarget.style.background =
                              'rgba(0,0,0,0.03)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (navItem.label !== 'Favourites') {
                            e.currentTarget.style.background =
                              'transparent';
                          }
                        }}
                      >
                        <span
                          style={{
                            fontSize: '20px',
                            width: '28px',
                            flexShrink: 0,
                          }}
                        >
                          
                        </span>
                        <span style={{ flex: 1, textAlign: 'left' }}>
                          {navItem.label}
                        </span>
                        {navItem.label === 'Favourites' && (
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
                    </motion.div>
                  ))}
                </nav>

                {/* Menu Footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
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
                        color: '#666',
                      }}
                    >
                      ☕ Good vibes only
                    </span>
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      v1.0
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ===== MAIN CONTENT ===== */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 20px 100px' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{
            fontFamily: 'Caveat, cursive',
            fontWeight: 700,
            fontSize: '44px',
            color: 'var(--blue)',
            marginBottom: '8px'
          }}>
            Favourites
          </div>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            color: '#6b6884',
            marginBottom: '32px'
          }}>
            Your favourite items from our menu
          </p>
        </motion.div>

        <AnimatePresence>
          {favourites.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: 'var(--white)',
                borderRadius: '16px',
                border: '1px solid var(--grid-line)'
              }}
            >
            
              <h2 style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '20px',
                color: 'var(--ink)',
                marginBottom: '8px'
              }}>
                No favourites yet
              </h2>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                color: '#6b6884'
              }}>
                Browse our menu and mark items as favourites by clicking the ⭐ icon
              </p>
              <Link href="/">
                <button
                  style={{
                    marginTop: '20px',
                    padding: '12px 32px',
                    background: 'var(--blue)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '999px',
                    cursor: 'pointer',
                    fontFamily: 'Space Mono, monospace',
                    fontSize: '14px',
                    fontWeight: 700
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Browse Menu
                </button>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {favourites.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ 
                    boxShadow: '0 4px 15px rgba(31, 30, 251, 0.1)',
                    y: -2
                  }}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '16px',
                    background: 'var(--white)',
                    borderRadius: '12px',
                    border: '1px solid var(--grid-line)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    background: 'var(--lav)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <svg viewBox="0 0 24 24" style={{ width: '28px', height: '28px', stroke: 'var(--blue)', fill: 'none', strokeWidth: 1.6 }}>
                      <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
                      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/>
                      <line x1="6" y1="2" x2="6" y2="4"/>
                      <line x1="10" y1="2" x2="10" y2="4"/>
                      <line x1="14" y1="2" x2="14" y2="4"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 700,
                          fontSize: '16px',
                          color: 'var(--ink)'
                        }}>
                          {item.name}
                          <span style={{ color: 'var(--orange)', marginLeft: '8px' }}>★</span>
                        </div>
                        <div style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '13px',
                          color: '#726f8a'
                        }}>
                          {item.desc}
                        </div>
                      </div>
                      <span style={{
                        fontFamily: 'Space Mono, monospace',
                        fontWeight: 700,
                        fontSize: '16px',
                        color: 'var(--blue)'
                      }}>
                        ${item.price}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      marginTop: '8px'
                    }}>
                      <button
                        onClick={() => removeItem(item.id)}
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
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--blue)';
                          e.currentTarget.style.color = 'var(--blue)';
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--grid-line)';
                          e.currentTarget.style.color = 'var(--ink)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >–</button>
                      <span style={{
                        fontFamily: 'Space Mono, monospace',
                        fontWeight: 700,
                        fontSize: '13px',
                        minWidth: '14px',
                        textAlign: 'center'
                      }}>{getItemQuantity(item.id)}</span>
                      <button
                        onClick={() => addItem(item)}
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
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--orange)';
                          e.currentTarget.style.color = 'var(--orange)';
                          e.currentTarget.style.transform = 'scale(1.1)';
                          e.currentTarget.style.background = 'rgba(255, 107, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--grid-line)';
                          e.currentTarget.style.color = 'var(--ink)';
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.background = 'var(--white)';
                        }}
                      >+</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <Link href="/" style={{
          display: 'inline-block',
          marginTop: '24px',
          fontFamily: 'Space Mono, monospace',
          fontSize: '12px',
          color: 'var(--blue)',
          textDecoration: 'none'
        }}>
          ← Back to Menu
        </Link>
      </div>

      <style>{`
        @media (max-width: 480px) {
          .topnav a span.label { display: none; }
          .topnav a.admin-link span.label { display: inline; }
        }
        .focusable:focus-visible {
          outline: 2px solid var(--orange);
          outline-offset: 2px;
          borderRadius: 8px;
        }
      `}</style>
    </motion.div>
  );
}