import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {Appearance} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'settings.darkMode';

const palette = {
  light: {
    background: '#F5F7FA',
    card: '#FFFFFF',
    text: '#0F172A',
    subtext: '#64748B',
    primary: '#0074E4',
    border: '#E2E8F0',
    tab: '#FFFFFF',
    success: '#16A34A',
  },
  dark: {
    // Softer blue-gray palette for comfortable night reading.
    background: '#1A2233',
    card: '#253149',
    text: '#F3F6FB',
    subtext: '#C3CDDA',
    primary: '#5AA7FF',
    border: '#34425D',
    tab: '#22304A',
    success: '#22C55E',
  },
};

const ThemeContext = createContext({
  isDark: false,
  themeMode: 'light',
  colors: palette.light,
  setThemeMode: () => {},
});

export const ThemeProvider = ({children}) => {
  const systemIsDark = Appearance.getColorScheme() === 'dark';
  const [themeMode, setThemeModeState] = useState(systemIsDark ? 'dark' : 'light');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_KEY);
        if (stored !== null) {
          setThemeModeState(JSON.parse(stored) ? 'dark' : 'light');
          return;
        }
      } catch (e) {
        // ignore parse/read issues and keep system default
      }
      setThemeModeState(systemIsDark ? 'dark' : 'light');
    };

    loadTheme();
  }, [systemIsDark]);

  const setThemeMode = async mode => {
    const normalized = mode === 'dark' ? 'dark' : 'light';
    setThemeModeState(normalized);
    await AsyncStorage.setItem(THEME_KEY, JSON.stringify(normalized === 'dark'));
  };

  const value = useMemo(() => {
    const isDark = themeMode === 'dark';
    return {
      isDark,
      themeMode,
      colors: isDark ? palette.dark : palette.light,
      setThemeMode,
    };
  }, [themeMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = () => useContext(ThemeContext);
