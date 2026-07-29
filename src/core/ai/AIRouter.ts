import { env } from "@/config/env";
import type { AIRequest } from "./AIRequest";
import type { AIProvider } from "./AIProvider";
import { aiProviderFactory } from "./AIProviderFactory";
import { AIError } from "./AIError";

/**
 * Decide qual AIProvider atende uma AIRequest (Tarefa 02).
 *
 * Responsabilidade: única fonte de decisão de roteamento — hoje uma
 * regra simples (prioridade a `request.providerId`; caso ausente, usa
 * `env.aiProvider`), mas é o único lugar que precisaria mudar para
 * introduzir uma regra mais sofisticada no futuro (ex.: rotear por
 * capacidade exigida, por custo, ou por fallback — ver
 * AIRequestOptions.ts, Tarefa 11), sem exigir alteração em AIGateway.
 *
 * Dependências: env (src/config/env.ts), AIProviderFactory, AIError.
 *
 * Consumida exclusivamente por AIGateway — nenhum outro componente deve
 * chamar `resolve()` diretamente.
 */
export class AIRouter {
  /**
   * Resolve o AIProvider para `request`.
   * @throws {AIError} código `PROVIDER_NOT_FOUND` se o provider pedido
   * explicitamente (`request.providerId`) não estiver registrado —
   * nunca cai silenciosamente para Mock nesse caso, para que um pedido
   * explícito incorreto seja visível ao chamador.
   */
  resolve(request: AIRequest): AIProvider {
    const providerId = request.providerId ?? env.aiProvider.toLowerCase();

    if (!aiProviderFactory.exists(providerId)) {
      throw new AIError({
        code: "PROVIDER_NOT_FOUND",
        message: `Provider "${providerId}" não está registrado em AIProviderFactory.`,
        provider: providerId,
      });
    }

    return aiProviderFactory.create(providerId);
  }
}

/** Instância única e compartilhada do AIRouter para toda a plataforma. */
export const aiRouter = new AIRouter();
