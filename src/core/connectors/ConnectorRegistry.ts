import type { IConnector } from '@/shared/interfaces';

/**
 * Registro central de conectores da plataforma (`src/core/connectors/*`),
 * indexado por `id` (IConnector).
 *
 * Responsabilidade: manter o cadastro dos conectores já carregados por
 * ConnectorLoader e permitir sua consulta genérica — o mesmo papel que
 * AgentRegistry cumpre para Agent, e ModuleRegistry para IModule.
 *
 * Objetivo (Sprint 0B): ser o destino do carregamento realizado por
 * InitializeRuntimeStep durante o boot da plataforma. Hoje sempre vazio,
 * já que nenhum conector concreto existe ainda — pronto para o primeiro
 * conector real, sem exigir nenhuma alteração de contrato.
 *
 * Dependências: IConnector (tipo, `@/shared/interfaces`).
 */
export class ConnectorRegistry {
  private connectors = new Map<string, IConnector>();

  /** Registra (ou substitui, se já existir o mesmo `id`) um conector. */
  register(connector: IConnector): void {
    this.connectors.set(connector.id, connector);
  }

  /** Remove o conector de `id` do registro, se existir. */
  unregister(id: string): void {
    this.connectors.delete(id);
  }

  /** Retorna o conector de `id`, ou `undefined` se não estiver registrado. */
  get(id: string): IConnector | undefined {
    return this.connectors.get(id);
  }

  /** Retorna todos os conectores já registrados. */
  getAll(): IConnector[] {
    return Array.from(this.connectors.values());
  }

  /** Remove todos os conectores do registro. */
  clear(): void {
    this.connectors.clear();
  }

  /** Quantidade total de conectores registrados. */
  count(): number {
    return this.connectors.size;
  }
}
