import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ThemeContext } from "./themeContextInstance";
import { loadTheme, saveTheme, type ThemeName } from "./themeStorage";

/**
 * Único Provider de tema de toda a aplicação — aplica `data-theme` na raiz do documento
 * (`tokens.css` lê exclusivamente esse atributo, nunca uma classe). Estado inicial já resolvido de
 * forma síncrona (`useState(loadTheme)`), nunca um flash de tema errado no primeiro paint.
 */
export function ThemeProvider({ children }: { readonly children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>(loadTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}
