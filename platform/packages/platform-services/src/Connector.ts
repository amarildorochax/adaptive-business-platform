/**
 * Connector — implementação técnica registrada no Connector Registry, fonte oficial de o que a
 * plataforma sabe se comunicar com o mundo externo.
 * Estrutura, regras e invariantes definidas em INTEGRATION_CONCRETE_STRUCTURE.md.
 */
import type { Protocol } from "./Protocol.js";

export interface Connector {
  /** Identificador do Connector. */
  readonly connectorId: string;

  /** Nome do Connector. */
  readonly name: string;

  /** Protocolo utilizado por este Connector. */
  readonly protocol: Protocol;

  /** Versão vigente do Connector. */
  readonly version: string;

  /** Capacidades declaradas deste Connector. */
  readonly capabilities: readonly string[];
}
