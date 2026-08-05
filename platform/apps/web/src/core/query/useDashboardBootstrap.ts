import { useQuery } from "@tanstack/react-query";
import { useManagers } from "../managers/useManagers";
import { seedDemoData, type DemoSnapshot } from "../managers/seedDemoData";

/**
 * Bootstrap único da sessão: popula os sete Managers conectados através de seus próprios Commands
 * (`seedDemoData`) e devolve a fotografia resultante. `staleTime: Infinity` — os Fakes em memória
 * nunca mudam por conta própria entre re-renders; refazer o bootstrap recriaria dado duplicado
 * dentro do mesmo Manager (ex.: um segundo Business Profile para o mesmo Tenant, rejeitado por
 * ADR-001).
 */
export function useDashboardBootstrap() {
  const managers = useManagers();

  return useQuery<DemoSnapshot>({
    queryKey: ["dashboard", "bootstrap"],
    queryFn: () => seedDemoData(managers),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });
}
