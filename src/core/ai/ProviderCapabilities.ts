import type { AIModel } from "./AIModel";

/**
 * Descreve o que um AIProvider suporta — consultado por AIRouter/
 * AIGateway antes de decidir encaminhar uma requisição que exija um
 * recurso específico (ex.: streaming).
 *
 * Nota (Sprint AI Gateway): nenhum consumidor ainda decide roteamento
 * com base nestes campos — são o contrato que torna essa decisão
 * possível numa Sprint futura, sem exigir nenhuma mudança estrutural.
 */
export interface ProviderCapabilities {
  streaming: boolean;
  functionCalling: boolean;
  maxTokens?: number;
  models: AIModel[];
}
