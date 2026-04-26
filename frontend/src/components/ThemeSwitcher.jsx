import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Palette, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeSwitcher() {
  const { currentTheme, setCurrentTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="theme-switcher-panel">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="theme-options"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-main)' }}>
                Escolha o Estilo
              </span>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="theme-grid">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setCurrentTheme(theme.id)}
                  className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
                >
                  <div 
                    className="theme-bubble" 
                    style={{ background: theme.bg, borderColor: theme.primary }}
                  >
                    {currentTheme === theme.id && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Check size={14} color={theme.primary} />
                      </div>
                    )}
                  </div>
                  <span className="theme-label">{theme.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        className="theme-switcher-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Trocar tema"
      >
        {isOpen ? <X size={24} /> : <Palette size={24} />}
      </button>
    </div>
  );
}
