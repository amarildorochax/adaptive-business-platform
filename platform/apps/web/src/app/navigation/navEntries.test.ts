import { describe, expect, it } from "vitest";
import { findNavEntry, NAV_ENTRIES } from "./navEntries";

describe("NAV_ENTRIES — fonte única de verdade da navegação", () => {
  it("não possui caminho duplicado", () => {
    const paths = NAV_ENTRIES.map((entry) => entry.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("lista exatamente quatorze módulos ativos (Dashboard + treze domínios conectados, Produção incluída desde a IMP-505) e oito planejados", () => {
    expect(NAV_ENTRIES.filter((entry) => entry.status === "active")).toHaveLength(14);
    expect(NAV_ENTRIES.filter((entry) => entry.status === "planned")).toHaveLength(8);
  });

  it("findNavEntry localiza o rótulo correto pela rota", () => {
    expect(findNavEntry("/crm")?.label).toBe("CRM");
    expect(findNavEntry("/rota-inexistente")).toBeUndefined();
  });

  it("toda entrada possui uma category (UX-002) — Dashboard é a única em 'Início'", () => {
    for (const entry of NAV_ENTRIES) {
      expect(entry.category).toBeTruthy();
    }
    expect(NAV_ENTRIES.filter((entry) => entry.category === "Início")).toEqual([expect.objectContaining({ path: "/" })]);
  });
});
