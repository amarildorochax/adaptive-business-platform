// ConnectorLoader.ts
//
// Responsabilidade:
// Infraestrutura para o futuro carregamento dos conectores externos
// (src/core/connectors/*, cada um implementando IConnector). O tipo de
// retorno usa IConnector apenas para documentar o contrato esperado.
//
// Nesta etapa, explicitamente:
// - nenhuma conexão real é aberta;
// - nenhum provider concreto é referenciado;
// - nenhum fetch/HTTP é realizado.
//
// load() retorna uma lista vazia — é apenas a assinatura futura.

import type { IConnector } from "@/shared/interfaces";

export class ConnectorLoader {
  load(): IConnector[] {
    return [];
  }
}
