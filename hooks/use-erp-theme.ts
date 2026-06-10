"use client";

import { useCallback, useEffect, useState } from "react";

export type ErpTheme = {
  accent: string;
  fontScale: number;
};

const STORAGE_KEY = "ayronex-theme-v1";

export const defaultErpTheme: ErpTheme = {
  accent: "#f5b900",
  fontScale: 1,
};

export function useErpTheme() {
  const [theme, setThemeState] = useState<ErpTheme>(() => {
    if (typeof window === "undefined") {
      return defaultErpTheme;
    }

    return readStoredTheme();
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const syncTheme = () => {
      const nextTheme = readStoredTheme();
      setThemeState(nextTheme);
      applyTheme(nextTheme);
    };

    window.addEventListener("storage", syncTheme);
    window.addEventListener("ayronex-theme-change", syncTheme);

    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("ayronex-theme-change", syncTheme);
    };
  }, []);

  const setTheme = useCallback((nextTheme: ErpTheme) => {
    setThemeState(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTheme));
    window.dispatchEvent(new CustomEvent("ayronex-theme-change"));
  }, []);

  const resetTheme = useCallback(() => {
    setTheme(defaultErpTheme);
  }, [setTheme]);

  return { theme, setTheme, resetTheme };
}

function readStoredTheme(): ErpTheme {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultErpTheme, ...JSON.parse(stored) } : defaultErpTheme;
  } catch {
    return defaultErpTheme;
  }
}

function applyTheme(theme: ErpTheme) {
  document.documentElement.style.setProperty("--erp-accent", theme.accent);
  document.documentElement.style.setProperty("--erp-font-scale", String(theme.fontScale));
}
