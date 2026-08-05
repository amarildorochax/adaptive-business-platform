/**
 * Create Connector Payload — conteúdo do Command "CreateConnector" (`COMMAND_CATALOG.md`: "configurar
 * novo Connector com Provider externo"), consumível pelo contrato genérico Command<TPayload> já
 * implementado em @abp/core, nunca redefinido aqui — mesma disciplina já aplicada a
 * `KnowledgeUpdatedPayload.ts` (IMP-015).
 */
import type { Protocol } from "./Protocol.js";

export interface CreateConnectorPayload {
  /** Nome do Connector — identifica o Provider associado (`EVENT_CATALOG.md`, "ConnectorCreated"). */
  readonly name: string;

  /** Protocolo utilizado por este Connector. */
  readonly protocol: Protocol;

  /** Capacidades declaradas deste Connector. */
  readonly capabilities: readonly string[];
}
