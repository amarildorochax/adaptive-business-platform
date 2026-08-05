import { createContext } from "react";
import type { ThemeName } from "./themeStorage";

export interface ThemeContextValue {
  readonly theme: ThemeName;
  readonly toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
