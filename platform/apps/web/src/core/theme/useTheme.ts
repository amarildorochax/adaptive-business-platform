import { useContext } from "react";
import { ThemeContext } from "./themeContextInstance";

/** Único ponto de acesso ao tema a partir de um componente — nunca importar `ThemeContext` diretamente fora deste arquivo e de `ThemeProvider`. */
export function useTheme() {
  const theme = useContext(ThemeContext);

  if (theme === undefined) {
    throw new Error("useTheme() foi chamado fora de um ThemeProvider.");
  }

  return theme;
}
