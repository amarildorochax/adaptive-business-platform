// ConnectorLoader.ts
//
// Responsabilidade:
// Carregamento dos conectores externos (src/core/connectors/*, cada um
// implementando IConnector).
//
// Sprint 0B — Integração do Runtime: `load()` agora participa
// efetivamente do ciclo de boot (chamado por InitializeRuntimeStep e
// registrado em ConnectorRegistry), mas continua retornando uma lista
// vazia — nenhum conector concreto existe ainda (apenas BaseConnector,
// abstrata). Nenhuma conexão real é aberta; nenhum provider concreto é
// referenciado; nenhum fetch/HTTP é realizado. Pronto para o primeiro
// conector real, sem exigir nenhuma alteração de contrato.

import type { IConnector } from "@/shared/interfaces";

export class ConnectorLoader {
  /** Instancia os conectores concretos já existentes — nenhum, nesta etapa. */
  load(): IConnector[] {
    return [];
  }
}
