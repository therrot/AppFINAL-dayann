import React, { createContext, useContext, useState } from 'react';

export interface Theme {
  background: string[];
  cardBackground: string[];
  textPrimary: string;
  textSecondary: string;
  accent: string;
}

const lightTheme: Theme = {
  background: ['rgba(46, 125, 50, 0.98)', 'rgba(33, 150, 243, 0.96)', 'rgba(0, 0, 0, 0.85)'],
  cardBackground: ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)'],
  textPrimary: '#333333',
  textSecondary: '#666666',
  accent: '#4CAF50',
};

const darkTheme: Theme = {
  background: ['rgba(18, 32, 47, 0.98)', 'rgba(25, 39, 52, 0.96)', 'rgba(0, 0, 0, 0.95)'],
  cardBackground: ['rgba(40, 44, 52, 0.95)', 'rgba(35, 39, 47, 0.9)'],
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  accent: '#66BB6A',
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{
      theme,
      isDark,
      toggleTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};