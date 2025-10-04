import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Theme {
  background: string[];
  cardBackground: string[];
  textPrimary: string;
  textSecondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  surface: string;
  surfaceSecondary: string;
}

const lightTheme: Theme = {
  background: ['rgba(46, 125, 50, 0.98)', 'rgba(33, 150, 243, 0.96)', 'rgba(0, 0, 0, 0.85)'],
  cardBackground: ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)'],
  textPrimary: '#333333',
  textSecondary: '#666666',
  accent: '#4CAF50',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  surface: '#FFFFFF',
  surfaceSecondary: '#F5F5F5',
};

const darkTheme: Theme = {
  background: ['rgba(18, 32, 47, 0.98)', 'rgba(25, 39, 52, 0.96)', 'rgba(0, 0, 0, 0.95)'],
  cardBackground: ['rgba(40, 44, 52, 0.95)', 'rgba(35, 39, 47, 0.9)'],
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  accent: '#66BB6A',
  success: '#66BB6A',
  warning: '#FFB74D',
  error: '#EF5350',
  surface: '#2D3748',
  surfaceSecondary: '#1A202C',
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  backgroundAnimation: boolean;
  toggleBackgroundAnimation: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [backgroundAnimation, setBackgroundAnimation] = useState(true);

  useEffect(() => {
    loadThemeSettings();
  }, []);

  const loadThemeSettings = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      const savedAnimation = await AsyncStorage.getItem('backgroundAnimation');
      
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
      
      if (savedAnimation !== null) {
        setBackgroundAnimation(savedAnimation === 'true');
      }
    } catch (error) {
      console.log('Error loading theme settings:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const toggleBackgroundAnimation = async () => {
    const newAnimation = !backgroundAnimation;
    setBackgroundAnimation(newAnimation);
    try {
      await AsyncStorage.setItem('backgroundAnimation', newAnimation.toString());
    } catch (error) {
      console.log('Error saving animation setting:', error);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{
      theme,
      isDark,
      toggleTheme,
      backgroundAnimation,
      toggleBackgroundAnimation,
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