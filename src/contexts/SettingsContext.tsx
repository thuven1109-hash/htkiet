import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark";
export type FontSize = "xs" | "sm" | "base" | "lg" | "xl";
export type FontType = "inter" | "playfair" | "be-vietnam" | "lora" | "montserrat";

interface Settings {
  theme: Theme;
  fontSize: FontSize;
  fontType: FontType;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const SETTINGS_STORAGE_KEY = "hoi_uc_nam_ky_settings";

const defaultSettings: Settings = {
  theme: "light",
  fontSize: "base",
  fontType: "inter",
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    
    // Apply theme
    if (settings.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Apply font family and size globally
    document.documentElement.style.fontFamily = getFontFamily(settings.fontType);
    document.documentElement.style.fontSize = getFontSizeValue(settings.fontSize);
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      <div className="min-h-screen transition-colors duration-300">
        {children}
      </div>
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

function getFontFamily(font: FontType): string {
  switch (font) {
    case "playfair": return "'Playfair Display', serif";
    case "be-vietnam": return "'Be Vietnam Pro', sans-serif";
    case "lora": return "'Lora', serif";
    case "montserrat": return "'Montserrat', sans-serif";
    default: return "'Inter', sans-serif";
  }
}

function getFontSizeValue(size: FontSize): string {
  switch (size) {
    case "xs": return "12px";
    case "sm": return "14px";
    case "lg": return "16px";
    case "xl": return "28px";
    default: return "15px";
  }
}
