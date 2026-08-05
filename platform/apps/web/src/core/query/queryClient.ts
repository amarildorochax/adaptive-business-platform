import { QueryClient } from "@tanstack/react-query";

/**
 * Instância única do QueryClient para toda a aplicação — a "Query Layer" desta Sprint (nenhuma
 * outra biblioteca de estado é introduzida, per a instrução de nunca duplicar gerenciamento de
 * estado). `retry: 1` porque toda chamada envolvida nesta Sprint é local (Manager em memória, sem
 * rede) — uma falha aqui é sempre um erro de domínio (ex.: precondição de Command violada), nunca
 * uma falha transitória de rede que justifique múltiplas tentativas automáticas.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
