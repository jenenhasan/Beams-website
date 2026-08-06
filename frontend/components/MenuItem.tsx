'use client';

import { MenuItem as MenuItemType } from '@/lib/types';
import { useState } from 'react';

interface MenuItemProps {
  item: MenuItemType;
  onAdd: (item: MenuItemType) => void;
  onRemove: (itemId: string) => void;
  quantity?: number;
}

export function MenuItem({ item, onAdd, onRemove, quantity = 0 }: MenuItemProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div style={{
      display: 'flex',
      gap: '16px',
      padding: '22px 0',
      borderBottom: '1px solid var(--grid-line)'
    }}>
      <div style={{
        width: '68px',
        height: '68px',
        borderRadius: '16px',
        background: 'var(--lav)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {item.image && !imageError ? (
          <img
            src={item.image}
            alt={item.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={() => setImageError(true)}
          />
        ) : (
          <svg viewBox="0 0 24 24" style={{ width: '32px', height: '32px', stroke: 'var(--blue)', fill: 'none', strokeWidth: 1.6 }}>
            <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/>
            <line x1="6" y1="2" x2="6" y2="4"/>
            <line x1="10" y1="2" x2="10" y2="4"/>
            <line x1="14" y1="2" x2="14" y2="4"/>
          </svg>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: '15px',
              color: 'var(--ink)'
            }}>{item.name}</span>
            {item.favorite && <span style={{ color: 'var(--orange)', fontSize: '13px' }}>★</span>}
          </div>
          <span style={{
            fontFamily: 'Space Mono, monospace',
            fontWeight: 700,
            fontSize: '15px',
            color: 'var(--blue)',
            whiteSpace: 'nowrap'
          }}>${item.price}</span>
        </div>
        <div style={{
          fontSize: '12.5px',
          color: '#726f8a',
          lineHeight: 1.5,
          marginTop: '4px',
          maxWidth: '420px'
        }}>{item.desc}</div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          marginTop: '12px'
        }}>
          <button
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
          >–</button>
          <span style={{
            fontFamily: 'Space Mono, monospace',
            fontWeight: 700,
            fontSize: '13px',
            minWidth: '14px',
            textAlign: 'center'
          }}>{quantity}</span>
          <button
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
          >+</button>
        </div>
      </div>
    </div>
  );
}