'use client';

import { useEffect, useState } from 'react';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'initial' | 'shift' | 'done'>('initial');
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const shiftTimer = setTimeout(() => setPhase('shift'), 5000);
    const doneTimer = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 5900);

    return () => {
      clearTimeout(shiftTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setPhase('done');
    onComplete();
  };

  if (phase === 'done') return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: phase === 'shift' ? 'var(--blue-deep, #0f1ad1)' : 'var(--cream, #FAFAF7)',
      transition: 'background-color 0.7s cubic-bezier(0.65, 0, 0.35, 1)',
      overflow: 'hidden'
    }}>
      {/* Grid Background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(var(--grid-line, #E4E2F7) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line, #E4E2F7) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: phase === 'shift' ? 0 : 1,
        transition: 'opacity 0.6s ease'
      }} />

      {/* Beams - Using Orange */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {[8, -14, 24, -30].map((angle, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '220vmax',
              height: '2px',
              background: `linear-gradient(90deg, transparent, var(--orange, #FF6B00) 45%, white 50%, var(--orange, #FF6B00) 55%, transparent)`,
              opacity: phase === 'shift' ? 1 : 0,
              transform: `translate(-50%, -50%) rotate(${angle}deg) scaleX(${phase === 'shift' ? 1.4 : 0.3})`,
              transition: 'opacity 0.9s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1)',
              animation: phase === 'shift' ? 'beamSweep 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' : 'none',
              animationDelay: `${i * 0.06}s`
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
        padding: '0 24px'
      }}>
        <div style={{
          position: 'relative',
          width: 'min(70vw, 420px)',
          margin: '0 auto',
          opacity: 1,
          transform: 'translateY(0) scale(1)',
          animation: 'logoIn 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
          animationDelay: '0.15s'
        }}>
          {!logoError ? (
            <>
              <img
                src="/beams-logo-blue.png"
                alt="BEAMS — The Coffee House"
                style={{
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                  opacity: phase === 'shift' ? 0 : 1,
                  transition: 'opacity 0.6s ease'
                }}
                onError={() => setLogoError(true)}
              />
              <img
                src="/beams-logo-white.png"
                alt=""
                aria-hidden="true"
                style={{
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  opacity: phase === 'shift' ? 1 : 0,
                  transition: 'opacity 0.6s ease'
                }}
                onError={() => setLogoError(true)}
              />
            </>
          ) : (
            <div style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: '64px',
              letterSpacing: '6px',
              color: phase === 'shift' ? 'white' : 'var(--blue)',
              transition: 'color 0.6s ease'
            }}>
              BEAMS
            </div>
          )}
        </div>
        <p style={{
          fontFamily: 'Caveat, cursive',
          fontWeight: 700,
          fontSize: 'clamp(28px, 5vw, 46px)',
          color: phase === 'shift' ? 'var(--orange-light)' : 'var(--orange)',
          marginTop: 'clamp(20px, 4vw, 40px)',
          opacity: phase === 'shift' ? 0 : 1,
          transform: phase === 'shift' ? 'translateY(-8px) rotate(-2deg)' : 'translateY(0) rotate(-2deg)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
          lineHeight: 1.15,
          animation: 'tagIn 0.8s ease forwards',
          animationDelay: '2s'
        }}>
          One Cup.<br />Everyday Energy.
        </p>
      </div>

      <button
        onClick={handleSkip}
        style={{
          position: 'absolute',
          bottom: '28px',
          right: '28px',
          zIndex: 3,
          fontFamily: 'Space Mono, monospace',
          fontSize: '12px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: phase === 'shift' ? 'white' : 'var(--blue)',
          background: 'transparent',
          border: '1px solid currentColor',
          padding: '10px 16px',
          borderRadius: '999px',
          cursor: 'pointer',
          opacity: 0.55,
          transition: 'opacity 0.25s ease, color 0.6s ease'
        }}
      >
        Skip →
      </button>

      <style>{`
        @keyframes logoIn {
          from { opacity: 0; transform: translateY(18px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes tagIn {
          from { opacity: 0; transform: translateY(10px) rotate(-2deg); }
          to { opacity: 1; transform: translateY(0) rotate(-2deg); }
        }
        @keyframes beamSweep {
          0% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--r, 8deg)) scaleX(0.2); }
          35% { opacity: 0.9; }
          100% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--r, 8deg)) scaleX(1.4); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </div>
  );
}