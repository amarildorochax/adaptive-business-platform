/**
 * Contrato mínimo para qualquer entidade registrável em um registry da
 * plataforma (ex.: ServiceRegistry, ModuleRegistry, ConnectorRegistry).
 *
 * Responsabilidade: garantir apenas que a entidade possua um
 * identificador estável (`id`) — a base sobre a qual IModule, IConnector
 * e IAutomation se compõem.
 *
 * Dependências: nenhuma.
 */
export interface IService {
  readonly id: string;
}
