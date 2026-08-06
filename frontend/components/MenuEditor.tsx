'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, RotateCcw, ChevronDown, ChevronUp, X } from 'lucide-react';
import { MenuData, Category } from '@/lib/types';

const uid = () => Math.random().toString(36).slice(2, 9);

const DEFAULT_MENU: MenuData = {
  categories: [
    {
      id: uid(),
      numeral: '01',
      title: 'Hot Coffee',
      subtitle: 'Pulled to order, no exceptions',
      items: [
        { 
          id: uid(), 
          name: 'Signature Espresso', 
          desc: 'Double shot, single origin, roasted in-house weekly', 
          price: '3.50', 
          favorite: true,
          image: '' 
        }
      ]
    }
  ]
};

interface MenuEditorProps {
  data: MenuData | null;
  onSave: (data: MenuData) => void;
  isSaving?: boolean;
}

export default function MenuEditor({ data, onSave, isSaving = false }: MenuEditorProps) {
  const safeData = data || DEFAULT_MENU;

  const [draft, setDraft] = useState<MenuData>(safeData);
  const [openCat, setOpenCat] = useState<string | null>(safeData.categories[0]?.id || null);
  const [saving, setSaving] = useState(isSaving);

  const updateCategoryField = (catId: string, field: string, value: string) => {
    setDraft(d => ({
      ...d,
      categories: d.categories.map(c => c.id === catId ? { ...c, [field]: value } : c)
    }));
  };

  const updateItem = (catId: string, itemId: string, field: string, value: any) => {
    setDraft(d => ({
      ...d,
      categories: d.categories.map(c =>
        c.id === catId ? { 
          ...c, 
          items: c.items.map(it => it.id === itemId ? { ...it, [field]: value } : it) 
        } : c
      )
    }));
  };

  const addItem = (catId: string) => {
    setDraft(d => ({
      ...d,
      categories: d.categories.map(c =>
        c.id === catId ? { 
          ...c, 
          items: [...c.items, { 
            id: uid(), 
            name: 'New Dish', 
            desc: 'Description', 
            price: '0', 
            favorite: false,
            image: '' 
          }] 
        } : c
      )
    }));
  };

  const removeItem = (catId: string, itemId: string) => {
    setDraft(d => ({
      ...d,
      categories: d.categories.map(c =>
        c.id === catId ? { ...c, items: c.items.filter(it => it.id !== itemId) } : c
      )
    }));
  };

  const addCategory = () => {
    const newCat: Category = {
      id: uid(),
      numeral: String(draft.categories.length + 1).padStart(2, '0'),
      title: 'New Category',
      subtitle: 'Category description',
      items: []
    };
    setDraft(d => ({ ...d, categories: [...d.categories, newCat] }));
    setOpenCat(newCat.id);
  };

  const removeCategory = (catId: string) => {
    if (draft.categories.length <= 1) {
      alert('You need at least one category');
      return;
    }
    setDraft(d => ({ ...d, categories: d.categories.filter(c => c.id !== catId) }));
  };

  const handleSave = () => {
    setSaving(true);
    onSave(draft);
    setTimeout(() => setSaving(false), 500);
  };

  const resetDraft = () => {
    if (confirm('Discard all changes?')) {
      setDraft(safeData);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Actions Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          background: 'var(--white)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
      >
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave} 
          disabled={saving}
          style={{
            background: 'var(--blue)',
            color: 'white',
            padding: '10px 24px',
            borderRadius: '999px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Space Mono, monospace',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            opacity: saving ? 0.7 : 1
          }}
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </motion.button>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={resetDraft}
          style={{
            background: 'transparent',
            color: 'var(--ink)',
            padding: '10px 24px',
            borderRadius: '999px',
            border: '1px solid var(--grid-line)',
            cursor: 'pointer',
            fontFamily: 'Space Mono, monospace',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <RotateCcw size={16} />
          Discard Changes
        </motion.button>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addCategory}
          style={{
            background: 'var(--orange)',
            color: 'var(--white)',
            padding: '10px 24px',
            borderRadius: '999px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Space Mono, monospace',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <Plus size={16} />
          Add Category
        </motion.button>
      </motion.div>

      {/* Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <AnimatePresence>
          {draft.categories.map((cat, index) => (
            <motion.div 
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              style={{
                background: 'var(--white)',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                border: '1px solid var(--grid-line)',
                overflow: 'hidden'
              }}
            >
              {/* Category Header */}
              <motion.div 
                onClick={() => setOpenCat(openCat === cat.id ? null : cat.id)}
                whileHover={{ backgroundColor: 'var(--lav)' }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{
                    fontFamily: 'Space Mono, monospace',
                    fontSize: '14px',
                    color: 'var(--white)',
                    fontWeight: 700,
                    background: 'var(--orange)',
                    padding: '2px 10px',
                    borderRadius: '6px'
                  }}>
                    {cat.numeral}
                  </span>
                  <span style={{
                    fontFamily: 'Caveat, cursive',
                    fontSize: '28px',
                    fontWeight: 700,
                    color: 'var(--blue)'
                  }}>
                    {cat.title}
                  </span>
                  <span style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    color: '#6b6884'
                  }}>
                    {cat.items.length} items
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      removeCategory(cat.id); 
                    }} 
                    style={{
                      padding: '4px',
                      color: '#6b6884',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Trash2 size={16} />
                  </motion.button>
                  {openCat === cat.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </motion.div>

              {/* Category Content */}
              <AnimatePresence>
                {openCat === cat.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ 
                      padding: '20px', 
                      borderTop: '1px solid var(--grid-line)',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Category Fields */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '12px',
                      marginBottom: '16px'
                    }}>
                      <input 
                        style={{
                          padding: '10px 14px',
                          border: '1px solid var(--grid-line)',
                          borderRadius: '8px',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'border-color 0.2s ease'
                        }}
                        value={cat.title} 
                        onChange={e => updateCategoryField(cat.id, 'title', e.target.value)} 
                        placeholder="Category Title"
                        onFocus={(e) => e.target.style.borderColor = 'var(--blue)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--grid-line)'}
                      />
                      <input 
                        style={{
                          padding: '10px 14px',
                          border: '1px solid var(--grid-line)',
                          borderRadius: '8px',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'border-color 0.2s ease'
                        }}
                        value={cat.subtitle} 
                        onChange={e => updateCategoryField(cat.id, 'subtitle', e.target.value)} 
                        placeholder="Category Subtitle"
                        onFocus={(e) => e.target.style.borderColor = 'var(--blue)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--grid-line)'}
                      />
                    </div>

                    {/* Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {cat.items.map((item, itemIndex) => (
                        <motion.div 
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: itemIndex * 0.03 }}
                          style={{
                            border: '1px solid var(--grid-line)',
                            borderRadius: '8px',
                            padding: '12px'
                          }}
                        >
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 3fr 1fr 1fr auto',
                            gap: '12px',
                            alignItems: 'center'
                          }}>
                            <input 
                              style={{
                                padding: '8px 12px',
                                border: '1px solid var(--grid-line)',
                                borderRadius: '6px',
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '13px',
                                outline: 'none'
                              }}
                              value={item.name} 
                              onChange={e => updateItem(cat.id, item.id, 'name', e.target.value)} 
                              placeholder="Dish name"
                              onFocus={(e) => e.target.style.borderColor = 'var(--blue)'}
                              onBlur={(e) => e.target.style.borderColor = 'var(--grid-line)'}
                            />
                            <input 
                              style={{
                                padding: '8px 12px',
                                border: '1px solid var(--grid-line)',
                                borderRadius: '6px',
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '13px',
                                outline: 'none'
                              }}
                              value={item.desc} 
                              onChange={e => updateItem(cat.id, item.id, 'desc', e.target.value)} 
                              placeholder="Description"
                              onFocus={(e) => e.target.style.borderColor = 'var(--blue)'}
                              onBlur={(e) => e.target.style.borderColor = 'var(--grid-line)'}
                            />
                            <input 
                              style={{
                                padding: '8px 12px',
                                border: '1px solid var(--grid-line)',
                                borderRadius: '6px',
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '13px',
                                outline: 'none'
                              }}
                              value={item.price} 
                              onChange={e => updateItem(cat.id, item.id, 'price', e.target.value)} 
                              placeholder="Price"
                              onFocus={(e) => e.target.style.borderColor = 'var(--blue)'}
                              onBlur={(e) => e.target.style.borderColor = 'var(--grid-line)'}
                            />
                            <input 
                              style={{
                                padding: '8px 12px',
                                border: '1px solid var(--grid-line)',
                                borderRadius: '6px',
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '13px',
                                outline: 'none'
                              }}
                              value={item.image || ''} 
                              onChange={e => updateItem(cat.id, item.id, 'image', e.target.value)} 
                              placeholder="Image URL"
                              onFocus={(e) => e.target.style.borderColor = 'var(--blue)'}
                              onBlur={(e) => e.target.style.borderColor = 'var(--grid-line)'}
                            />
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeItem(cat.id, item.id)} 
                              style={{
                                padding: '4px',
                                color: '#6b6884',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <X size={16} />
                            </motion.button>
                          </div>
                          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <label style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '13px',
                              color: 'var(--ink)'
                            }}>
                              <input 
                                type="checkbox" 
                                checked={item.favorite || false} 
                                onChange={e => updateItem(cat.id, item.id, 'favorite', e.target.checked)} 
                              />
                              ★ Favorite
                            </label>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Add Item Button */}
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => addItem(cat.id)} 
                      style={{
                        marginTop: '12px',
                        padding: '8px 16px',
                        background: 'transparent',
                        color: 'var(--blue)',
                        border: '1px dashed var(--blue)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Plus size={16} />
                      Add Dish
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        fontFamily: 'Inter, sans-serif',
        fontSize: '12px',
        color: '#6b6884',
        padding: '16px',
        borderTop: '1px solid var(--grid-line)'
      }}>
        BEAMS Admin • Made with ☕
      </div>
    </div>
  );
}