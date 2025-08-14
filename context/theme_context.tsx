import React, { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { type } from 'os';

type ThemeListType = {
  name: string;
  color: string;
  isDark: boolean;
};

type ThemeContextInitialState = {
  theme: string;
  isDark: boolean;
  themeName: string;
  changeMode: (mode: string) => void;
  changeTheme: (name: string) => void;
  themeNameList: Set<ThemeListType>;
  primaryColor: string;
};

// TODO: refactor code theme

const ThemeContext = React.createContext<ThemeContextInitialState | null>(null);

export default function ThemeProvider(props: { children: React.ReactNode }) {
  const defalutTheme = 'fiittoken_light';
  const { children } = props;

  const [theme, setTheme] = useState<string>('');

  const [themeName, setThemeName] = useState<string>('');
  const [isDark, setIsDark] = useState<boolean>(true);

  const [primaryColor, setPrimaryColor] = useState<string>('');

  const themeNameList = new Set([
    { name: 'sabuydee', color: '#90C8FF', isDark: true },
    { name: 'sabuydee', color: '#1D5D9B', isDark: false },
    { name: 'speedkub', color: '#E6564E', isDark: true },
    { name: 'speedkub', color: '#E11d48', isDark: false },
    { name: 'fiittoken', color: '#33A44D', isDark: true },
    { name: 'fiittoken', color: '#33A44D', isDark: false },
    { name: 'sabuymoney', color: '#117AEE', isDark: true },
    { name: 'sabuymoney', color: '#117AEE', isDark: false }
  ]);

  useEffect(() => {
    initTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getThemeNameAndMode = (currentTheme: string) => {
    const keyTheme = currentTheme.split('_');
    return { isDark: keyTheme[1] === 'dark', curentThemeName: keyTheme[0] };
  };

  const initTheme = () => {
    const mainDom = document!.getElementById('main-app');

    const currentTheme = Cookies.get('theme') ?? defalutTheme;

    mainDom?.setAttribute('data-theme', currentTheme);

    setTheme(currentTheme);

    const primary = getComputedStyle(mainDom as Element).getPropertyValue(
      '--main-color'
    );
    setPrimaryColor(primary);

    const keyTheme = getThemeNameAndMode(currentTheme);
    setThemeName(keyTheme.curentThemeName);
    setIsDark(keyTheme.isDark);
  };

  const changeMode = (mode: string) => {
    const currentTheme = `${themeName}_${mode}`;

    if (theme !== currentTheme) {
      const mainDom = document!.getElementById('main-app');
      mainDom?.setAttribute('data-theme', currentTheme);

      setTheme(currentTheme);
      const keyTheme = getThemeNameAndMode(currentTheme);
      setThemeName(keyTheme.curentThemeName);
      setIsDark(keyTheme.isDark);
      Cookies.set('theme', currentTheme);

      const primary = getComputedStyle(mainDom as Element).getPropertyValue(
        '--main-color'
      );
      setPrimaryColor(primary);
    }
  };

  const changeTheme = (name: string) => {
    const mode = isDark ? 'dark' : 'light';
    const currentTheme = `${name}_${mode}`;
    console.log('currentTheme', currentTheme);
    if (theme !== currentTheme) {
      const mainDom = document!.getElementById('main-app');
      mainDom?.setAttribute('data-theme', currentTheme);
      setTheme(currentTheme);
      const keyTheme = getThemeNameAndMode(currentTheme);
      setThemeName(keyTheme.curentThemeName);
      setIsDark(keyTheme.isDark);
      Cookies.set('theme', currentTheme);
      const primary = getComputedStyle(mainDom as Element).getPropertyValue(
        '--main-color'
      );
      setPrimaryColor(primary);
    }
  };

  const value: ThemeContextInitialState = {
    theme,
    isDark,
    themeName,
    changeMode,
    changeTheme,
    themeNameList,
    primaryColor
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const themeContext = React.useContext(ThemeContext);

  if (!themeContext)
    throw new Error("This hook must be called within 'ThemeContext'");

  return themeContext;
}
