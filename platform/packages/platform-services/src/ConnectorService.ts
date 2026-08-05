import type { Connector } from "./Connector.js";
import type { ConnectorRepository } from "./ConnectorRepository.js";
import type { Protocol } from "./Protocol.js";

/**
 * Connector Service — implementa o "Connector Registry" (`INTEGRATION_HUB.md`, Capítulo 7): "o
 * catálogo central de todo Connector disponível na plataforma, sua versão vigente e suas capacidades
 * declaradas — nenhum Hub de domínio invoca uma integração sem que ela esteja previamente registrada
 * aqui." `version` inicia sempre em `"1"` — "Connector Versioning" (evolução para versões
 * subsequentes) é médio prazo, fora do escopo desta Sprint (ver relatório).
 */
export class ConnectorService {
  constructor(private readonly repository: ConnectorRepository) {}

  async register(name: string, protocol: Protocol, capabilities: readonly string[]): Promise<Connector> {
    const connector: Connector = { connectorId: crypto.randomUUID(), name, protocol, version: "1", capabilities };
    return this.repository.create(connector);
  }

  async find(connectorId: string): Promise<Connector | undefined> {
    return this.repository.find(connectorId);
  }

  async list(): Promise<readonly Connector[]> {
    return this.repository.list();
  }
}
