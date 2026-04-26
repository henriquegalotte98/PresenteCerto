import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = [
  { id: 'imperial', name: 'Imperial', primary: '#D4AF37', bg: '#FFFFFF' },
  { id: 'midnight', name: 'Noite', primary: '#E5E5E5', bg: '#0F0F0F' },
  { id: 'rose', name: 'Rose', primary: '#E27396', bg: '#FFF9FA' },
  { id: 'emerald', name: 'Esmeralda', primary: '#D4AF37', bg: '#062C21' },
  { id: 'ocean', name: 'Oceano', primary: '#0077B6', bg: '#011627' },
  { id: 'slate', name: 'Minimal', primary: '#334155', bg: '#F8FAFC' },
];

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'imperial';
  });

  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
    
    // Remove all theme classes
    const body = document.body;
    themes.forEach(t => body.classList.remove(`theme-${t.id}`));
    
    // Add current theme class
    if (currentTheme !== 'imperial') {
      body.classList.add(`theme-${currentTheme}`);
    }
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setCurrentTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
